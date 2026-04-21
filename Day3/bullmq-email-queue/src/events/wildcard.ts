export function matchesPattern(pattern: string, eventName: string) {
  if (pattern === "*") return true;
  if (pattern === eventName) return true;

  const p = pattern.split(".");
  const e = eventName.split(".");

  for (let i = 0; i < p.length; i++) {
    if (i >= e.length) return false;
    if (p[i] === "*") return true;
    if (p[i] !== e[i]) return false;
  }

  return p.length === e.length;
}

