export const openBot = (prompt) => window.dispatchEvent(new CustomEvent('acad:open', { detail: { prompt } }));
