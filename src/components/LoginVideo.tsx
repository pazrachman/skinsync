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

    // `autoPlay` alone isn't always honored on phones (the element is
    // inserted after hydration), so start it explicitly. Muted inline
    // playback is allowed everywhere; if the OS still refuses (e.g. iOS
    // Low Power Mode) the poster simply stays up.
    video.muted = true;
    void video.play().catch(() => {});

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
      {/* Both files must stay 4:2:0 (yuv420p): phone hardware decoders
          can't play 4:4:4, which desktop browsers decode in software.
          The codec strings let a browser skip a file it can't decode. */}
      <source src="/media/drip.webm" type='video/webm; codecs="vp9"' />
      <source src="/media/drip.mp4" type='video/mp4; codecs="avc1.4D401F"' />
    </video>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- static poster, same frame the video starts on
    <img src={POSTER} alt="" aria-hidden className="skn-auth-media" />
  );
}
