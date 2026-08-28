import { Image, ImageProps, ImageSourcePropType } from "react-native";

export type GifImageProps = Omit<ImageProps, "source"> & {
  isPlaying?: boolean;
  /** Animated GIF displayed during playback. */
  source: ImageSourcePropType;
  /** Still frame displayed while playback is paused, when available. */
  staticSource?: ImageSourcePropType;
};

/** Displays a GIF or its optional externally controlled static state. */
export const GifImage = ({
  accessibilityIgnoresInvertColors = false,
  isPlaying = true,
  source,
  staticSource,
  ...imageProps
}: GifImageProps) => (
  <Image
    {...imageProps}
    accessibilityIgnoresInvertColors={accessibilityIgnoresInvertColors}
    source={!isPlaying && staticSource ? staticSource : source}
  />
);
