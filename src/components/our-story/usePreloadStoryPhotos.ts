import { useEffect } from "react";
import { getStoryPhotoSrc, PHOTO_PLACEMENTS } from "./constants";

export function usePreloadStoryPhotos(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    PHOTO_PLACEMENTS.forEach((placement) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = getStoryPhotoSrc(placement.id);
    });
  }, [enabled]);
}