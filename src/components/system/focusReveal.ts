// Reveal only the focused control's ancestor chain. The animation can keep
// running, but cannot fade or clip the current keyboard target out of view.
export function clearFocusReveal(root: HTMLElement) {
  root.querySelectorAll("[data-focus-reveal]").forEach(node => node.removeAttribute("data-focus-reveal"));
}

export function revealFocusPath(target: HTMLElement, root: HTMLElement) {
  clearFocusReveal(root);
  for (let node: HTMLElement | null = target; node && node !== root; node = node.parentElement) {
    node.setAttribute("data-focus-reveal", "");
  }
}

export function keepFocusInView(target: HTMLElement) {
  const bounds = target.getBoundingClientRect();
  const header = document.querySelector("[data-site-header]")?.getBoundingClientRect().bottom ?? 0;
  if (bounds.top < header + 12 || bounds.bottom > window.innerHeight - 12) {
    target.scrollIntoView({ behavior: "instant", block: "center" });
  }
}
