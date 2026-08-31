"use client";

import { useEffect } from "react";

export function WidgetDogfood() {
  useEffect(() => {
    let destroyed = false;
    let instance: { destroy: () => void } | null = null;

    import("@instafix/widget").then(({ initInstaFix }) => {
      if (destroyed) return;
      instance = initInstaFix({
        endpoint: "/api/instafix",
        projectName: "landing",
        forceShow: true,
        accentColor: "#173CFF",
        locale: "en",
        position: "bottom-right",
        // "Open on page" links from /demo/inbox (?instafix=<id>) focus the annotation.
        deepLink: true,
      });
    });

    return () => {
      destroyed = true;
      instance?.destroy();
    };
  }, []);

  return null;
}
