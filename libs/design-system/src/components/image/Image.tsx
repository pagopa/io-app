import { useMemo } from "react";
import { FlexStyle, Image, ImageProps, StyleSheet } from "react-native";

type IOAspectRatioScale = "1:1" | "4:3" | "16:9" | "3:4" | "21:9";

const IOAspectRatioScaleMap: Record<IOAspectRatioScale, number> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "3:4": 3 / 4,
  "21:9": 21 / 9
};

type IOImageProps = {
  imageProps: Omit<ImageProps, "alt" | "style">;
  alt: string;
  aspectRatio?: IOAspectRatioScale;
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: undefined,
    resizeMode: "cover"
  }
});

/**
 * Image component that supports specific aspect ratio scales and sets alt text as mandatory.
 * @param imageProps
 * @param alt
 * @param aspectRatio
 */
export const IOImage = ({
  imageProps,
  alt,
  aspectRatio = "1:1"
}: IOImageProps) => {
  const aspectRatioStyle: Pick<FlexStyle, "aspectRatio"> = useMemo(
    () => ({
      aspectRatio: IOAspectRatioScaleMap[aspectRatio]
    }),
    [aspectRatio]
  );

  return (
    <Image
      accessibilityIgnoresInvertColors
      {...imageProps}
      style={[styles.image, aspectRatioStyle]}
      alt={alt}
    />
  );
};
