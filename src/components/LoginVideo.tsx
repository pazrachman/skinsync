"use client";

import { useEffect, useRef, useState } from "react";

const POSTER = "/media/drip-poster.jpg";
const PLAYBACK_RATE = 1.3;

type NetworkInfo = { saveData?: boolean };

// Plays only when motion is welcome and data isn't being saved. Until the
// client decides (and for anyone who opts out), only the poster renders —
// no <video> is in the markup, so the video bytes are never requested.
function useMotionAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: NetworkInfo })
      .connection;
    const update = () => setAllowed(!reduce.matches && !connection?.saveData);
    update();
    reduce.addEventListener("change", update);
    return () => reduce.removeEventListener("change", update);
  }, []);

  return allowed;
}

function applyRate(video: HTMLVideoElement) {
  video.defaultPlaybackRate = PLAYBACK_RATE;
  video.playbackRate = PLAYBACK_RATE;
}

export default function LoginVideo() {
  const allowed = useMotionAllowed();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!allowed || !video) return;

    applyRate(video);

    // Pause while the tab is hidden; resume when it comes back.
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else void video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [allowed]);

  return allowed ? (
    <video
      ref={videoRef}
      className="skn-auth-media"
      poster={POSTER}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      // Some browsers reset the rate when the source loads.
      onLoadedMetadata={(e) => applyRate(e.currentTarget)}
    >
      <source src="/media/drip.webm" type="video/webm" />
      <source src="/media/drip.mp4" type="video/mp4" />
    </video>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- static poster, same frame the video starts on
    <img src={POSTER} alt="" aria-hidden className="skn-auth-media" />
  );
}
