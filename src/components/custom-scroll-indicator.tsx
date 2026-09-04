import { useEffect, useRef, useState } from "react";

/**
 * Custom slim vertical scroll indicator:
 * - 3.5px wide, fixed to the right edge of the viewport.
 * - Track background matches the app's current theme background via `var(--background)`.
 * - Thumb uses subtle primary accent color (`var(--primary)` at low opacity).
 * - Thumb height proportional to viewport height vs content height.
 * - Thumb position updates smoothly via requestAnimationFrame on scroll.
 * - Fades in on scroll, fades out after 800ms of inactivity.
 * - Completely non-blocking (pointer-events: none) so tap targets on mobile and clicks on desktop are unaffected.
 */
export function CustomScrollIndicator() {
  const [mounted, setMounted] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let rafId: number | null = null;
    let fadeTimeout: number | null = null;
    let isScrollable = false;

    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const updateIndicator = () => {
      const clientHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll <= 4) {
        // Content fits on screen; hide indicator
        isScrollable = false;
        track.style.display = "none";
        return;
      }

      isScrollable = true;
      track.style.display = "block";

      // Proportional thumb height (clamped between 28px and clientHeight - 20px)
      const ratio = clientHeight / scrollHeight;
      const thumbHeight = Math.max(
        28,
        Math.min(clientHeight - 20, Math.round(clientHeight * ratio)),
      );
      const availableTrack = clientHeight - thumbHeight;
      const scrollProgress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      const thumbTop = Math.round(scrollProgress * availableTrack);

      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translate3d(0, ${thumbTop}px, 0)`;
    };

    const showAndScheduleFade = () => {
      if (!isScrollable) return;
      track.classList.add("is-active");

      if (fadeTimeout !== null) {
        window.clearTimeout(fadeTimeout);
      }

      fadeTimeout = window.setTimeout(() => {
        track.classList.remove("is-active");
      }, 800);
    };

    const handleScroll = () => {
      showAndScheduleFade();
      if (rafId === null) {
        rafId = window.requestAnimationFrame(() => {
          updateIndicator();
          rafId = null;
        });
      }
    };

    const handleResize = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(() => {
          updateIndicator();
          rafId = null;
        });
      }
    };

    // Initial measurement
    updateIndicator();

    // Listeners for window scroll, touchmove, and window resize
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });

    // Observe DOM mutations to recalculate when views or content expand
    const mutationObserver = new MutationObserver(() => {
      handleResize();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // Also observe document height changes via ResizeObserver
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(document.documentElement);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("touchmove", handleScroll);
      mutationObserver.disconnect();
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (fadeTimeout !== null) {
        window.clearTimeout(fadeTimeout);
      }
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={trackRef}
      className="custom-scroll-track"
      aria-hidden="true"
      style={{ display: "none" }}
    >
      <div ref={thumbRef} className="custom-scroll-thumb" />
    </div>
  );
}
