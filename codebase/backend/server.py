"""
An — Triage HTTP server
========================
Cầu nối giữa frontend React và logic agent trong chat.py.

- POST /triage   body: { "history": [{role:"user"|"ai", text}], "message": "..." }
                 trả về: { "events": [...], "profile": {...} }
- GET  /health   kiểm tra server

Chạy:
    cd codebase/backend
    python3 server.py                   # mặc định http://localhost:8787

Rồi ở frontend (codebase/.env):  VITE_TRIAGE_API_URL=http://localhost:8787/triage
"""
from __future__ import annotations

import json
import os
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from env_loader import load_lab_env
from providers import make_provider
from tools import load_tool_declarations, to_openai_tools

# Import the core agent loop and helpers from chat.py
from chat import run_model_tool_loop, trim_history

# ---------------------------------------------------------------------------
# Bootstrap — mirrors what chat.py does in main()
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent
ARTIFACTS_DIR = ROOT / "artifacts"
load_lab_env(ROOT)

PROVIDER_NAME = os.getenv("TRIAGE_PROVIDER", "gemini")
MODEL = os.getenv("TRIAGE_MODEL", None)          # None → provider's default_model
HISTORY_WINDOW = int(os.getenv("TRIAGE_HISTORY_WINDOW", "5"))
MAX_TOOL_ROUNDS = int(os.getenv("TRIAGE_MAX_TOOL_ROUNDS", "4"))
PORT = int(os.getenv("TRIAGE_PORT", "8787"))

SYSTEM_PROMPT = (ARTIFACTS_DIR / "system_prompt.md").read_text(encoding="utf-8")
TOOL_DECLARATIONS = load_tool_declarations(ARTIFACTS_DIR / "tools.yaml")
OPENAI_TOOLS = to_openai_tools(TOOL_DECLARATIONS)
PROVIDER = make_provider(PROVIDER_NAME)
SELECTED_MODEL = MODEL or getattr(PROVIDER, "default_model", None)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_json(text: str) -> dict | None:
    """Try to pull a JSON object out of a freeform string."""
    if not text:
        return None
    cleaned = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except Exception:
        pass
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(cleaned[start: end + 1])
        except Exception:
            return None
    return None


def _build_messages(history: list[dict], message: str) -> list[dict]:
    """
    Convert frontend history  [{role:"user"|"ai", text}]
    into the [{role, content}] format chat.py / providers expect,
    then append the new user message.
    History is trimmed to HISTORY_WINDOW pairs via chat.trim_history.
    """
    flat: list[dict[str, str]] = []
    for turn in history or []:
        role = turn.get("role")
        text = (turn.get("text") or "").strip()
        if not text:
            continue
        flat.append({
            "role": "assistant" if role == "ai" else "user",
            "content": text,
        })

    trimmed = trim_history(flat, HISTORY_WINDOW)

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        *trimmed,
        {"role": "user", "content": (message or "").strip()},
    ]


def _normalize_profile(profile: dict) -> dict:
    """Ensure minimum profile keys so the frontend never crashes."""
    profile.setdefault("stage", "questioning")
    profile.setdefault("symptoms", [])
    profile.setdefault("confidence", 0)
    profile.setdefault("confTier", "none")
    profile.setdefault("missing", [])
    profile.setdefault("facts", {})
    return profile


def _agent_result_to_response(result: dict) -> dict:
    """
    Convert run_model_tool_loop output → { events, profile } that the frontend expects.

    run_model_tool_loop returns:
        {
            "status": "answered" | "waiting_for_user" | "max_tool_rounds",
            "assistant_text": str,
            "rounds": [...],
            "tool_events": [...],
        }

    The assistant is prompted (via system_prompt.md) to reply with a JSON object
    that matches the { events, profile } schema.  We try to parse that first.
    If parsing fails we fall back to a plain message event.
    """
    assistant_text = result.get("assistant_text", "")
    status = result.get("status", "answered")

    # ── Happy path: LLM returned valid JSON in assistant_text ──────────────
    parsed = _extract_json(assistant_text)
    if parsed and "events" in parsed:
        events = parsed["events"] if isinstance(parsed["events"], list) else []
        profile = _normalize_profile(
            parsed.get("profile") if isinstance(parsed.get("profile"), dict) else {}
        )
        return {"events": events, "profile": profile}

    # ── Fallback: wrap raw text in a message event ──────────────────────────
    # Determine stage from status
    stage_map = {
        "waiting_for_user": "questioning",
        "max_tool_rounds": "done",
        "answered": "done",
    }
    stage = stage_map.get(status, "questioning")

    events: list[dict] = [{"type": "message", "text": assistant_text, "confirm": False}]
    profile = _normalize_profile({"stage": stage})
    return {"events": events, "profile": profile}


# ---------------------------------------------------------------------------
# Core triage function — called by the HTTP handler
# ---------------------------------------------------------------------------

def triage(payload: dict) -> dict:
    messages = _build_messages(payload.get("history", []), payload.get("message", ""))

    result = run_model_tool_loop(
        provider=PROVIDER,
        messages=messages,
        tools=OPENAI_TOOLS,
        model=SELECTED_MODEL,
        max_tool_rounds=MAX_TOOL_ROUNDS,
    )

    return _agent_result_to_response(result)


# ---------------------------------------------------------------------------
# HTTP server
# ---------------------------------------------------------------------------

class Handler(BaseHTTPRequestHandler):

    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code: int, body: dict) -> None:
        raw = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self._cors()
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        if self.path.rstrip("/") == "/health":
            self._json(200, {
                "ok": True,
                "provider": PROVIDER_NAME,
                "model": SELECTED_MODEL,
                "port": PORT,
            })
        else:
            self._json(404, {"error": "not_found"})

    def do_POST(self) -> None:  # noqa: N802
        if self.path.rstrip("/") != "/triage":
            self._json(404, {"error": "not_found"})
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length) or b"{}")
        except Exception as exc:
            self._json(400, {"error": "bad_request", "message": str(exc)})
            return

        try:
            self._json(200, triage(payload))
        except Exception as exc:
            # Frontend can fallback to rule-based engine on 500.
            self._json(500, {"error": type(exc).__name__, "message": str(exc)})

    def log_message(self, fmt: str, *args) -> None:
        print(f"[triage] {self.address_string()} {fmt % args}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    print(f"An triage server → http://localhost:{PORT}")
    print(f"  provider={PROVIDER_NAME}  model={SELECTED_MODEL}")
    print(f"  history_window={HISTORY_WINDOW}  max_tool_rounds={MAX_TOOL_ROUNDS}")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()