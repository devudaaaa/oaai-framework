// Small display helpers. No em dashes anywhere.

export const signed = (n) => (n >= 0 ? '+' + n : '' + n);

export const mmss = (sec) => `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;

export const pct = (x) => `${Math.round((x || 0) * 100)}%`;
