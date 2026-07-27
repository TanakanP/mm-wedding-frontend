import Image from "next/image";
import { getStoryPhotoSrc, type PhotoPlacement } from "./constants";

type StoryPhotoImageProps = {
  placement: PhotoPlacement;
  className?: string;
  sizes?: string;
};

export default function StoryPhotoImage({
  placement,
  className = "",
  sizes = "172px",
}: StoryPhotoImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={getStoryPhotoSrc(placement.id)}
        alt={placement.alt}
        fill
        unoptimized
        decoding="async"
        className="object-cover"
        sizes={sizes}
      />
    </div>
  );
}