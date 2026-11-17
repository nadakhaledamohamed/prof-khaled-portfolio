/**
 * Fixed, decorative page backdrop: drifting gradient orbs over a faint grid.
 * Pure CSS animation, so it costs no JavaScript and pauses for reduced-motion users.
 */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]" />
      <div className="animate-drift-a absolute -left-[12%] -top-[18%] size-[52vmax] rounded-full bg-[radial-gradient(circle,var(--grad-from),transparent_62%)] opacity-[0.16] blur-3xl dark:opacity-[0.2]" />
      <div className="animate-drift-b absolute -right-[14%] top-[8%] size-[46vmax] rounded-full bg-[radial-gradient(circle,var(--grad-to),transparent_62%)] opacity-[0.13] blur-3xl dark:opacity-[0.14]" />
      <div className="animate-drift-a absolute -bottom-[26%] left-[22%] size-[48vmax] rounded-full bg-[radial-gradient(circle,var(--grad-via),transparent_62%)] opacity-[0.1] blur-3xl dark:opacity-[0.13]" />
    </div>
  );
}
