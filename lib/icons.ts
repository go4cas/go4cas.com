// Inline SVG icons (decorative: aria-hidden, labelled by their link or badge).

const svg = (attrs: string, body: string) => `<svg viewBox="0 0 24 24" ${attrs} aria-hidden="true">${body}</svg>`;
const stroke = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const ICONS = {
  github: svg('width="18" height="18" fill="currentColor"', `<path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.78.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />`),
  x: svg('width="16" height="16" fill="currentColor"', `<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />`),
  instagram: svg(`width="17" height="17" ${stroke}`, `<rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />`),
  email: svg(`width="18" height="18" ${stroke}`, `<rect x="2" y="4" width="20" height="16" rx="2.5" /><path d="M3 6.5l9 6 9-6" />`),
  code: svg(`width="18" height="18" ${stroke}`, `<path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />`),
  globe: svg(`width="18" height="18" ${stroke}`, `<circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />`),
  grid: svg(stroke, `<rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />`),
  pen: svg(stroke, `<path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />`),
  compass: svg(stroke, `<circle cx="12" cy="12" r="9" /><path d="m15 9-2 6-4 2 2-6 4-2z" />`),
};
