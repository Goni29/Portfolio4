export const TABLET_UP_MEDIA_QUERY =
  "(min-width: 768px) and (pointer: fine), (min-width: 768px) and (min-height: 600px)";

export const DESKTOP_UP_MEDIA_QUERY =
  "(min-width: 1024px) and (pointer: fine), (min-width: 1024px) and (min-height: 600px)";

export function isTabletUpViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(TABLET_UP_MEDIA_QUERY).matches;
}

export function isDesktopUpViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(DESKTOP_UP_MEDIA_QUERY).matches;
}
