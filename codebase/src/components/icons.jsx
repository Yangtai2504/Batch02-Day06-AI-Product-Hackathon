/* Minimal stroke icons — 1.6 weight, rounded, drawn to match the calm aesthetic. */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const Cross = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...S} d="M12 5v14M5 12h14" /></svg>
)
export const Send = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...S} d="M5 12l14-7-6 14-2.5-5.5L5 12z" /></svg>
)
export const Restart = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...S} d="M4 12a8 8 0 1 0 2.5-5.8M4 4v3.5H7.5" /></svg>
)
export const Info = (p) => (
  <svg viewBox="0 0 24 24" {...p}><circle {...S} cx="12" cy="12" r="9" /><path {...S} d="M12 11v5M12 7.6v.2" /></svg>
)
export const Shield = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...S} d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path {...S} d="M9 12l2 2 4-4" /></svg>
)
export const Phone = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...S} d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 13l4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z" /></svg>
)
export const Alert = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...S} d="M12 4l9 16H3l9-16z" /><path {...S} d="M12 10v4M12 17.4v.2" /></svg>
)
export const Pulse = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...S} d="M3 12h4l2-5 3 10 2.5-7 1.5 2h5" /></svg>
)
export const Stethoscope = (p) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path {...S} d="M6 3v5a4 4 0 0 0 8 0V3" />
    <path {...S} d="M10 12v3a5 5 0 0 0 10 0v-2" />
    <circle {...S} cx="20" cy="11" r="2" />
  </svg>
)
export const Sit = (p) => (
  <svg viewBox="0 0 24 24" {...p}><circle {...S} cx="12" cy="5.5" r="2.2" /><path {...S} d="M8 21l1.5-7L7 11M16 21l-1.5-7L17 11M9.5 13.5h5" /></svg>
)
export const NoCar = (p) => (
  <svg viewBox="0 0 24 24" {...p}><circle {...S} cx="12" cy="12" r="9" /><path {...S} d="M5.6 5.6l12.8 12.8" /></svg>
)
export const Wind = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...S} d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5M3 12h15a2.5 2.5 0 1 1-2.5 2.5M3 16h9a2 2 0 1 1-2 2" /></svg>
)
export const ArrowRight = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...S} d="M5 12h13M13 6l6 6-6 6" /></svg>
)
