import { Image, ImageSourcePropType, useWindowDimensions } from "react-native";

const infoImageSize = 102;
const maxHeightFullSize = 650;

/**
 * A generic component to render an image with all the settings for a {@link InfoScreenComponent}
 * @param image
 * @deprecated It's part of deprecated `InfoScreenComponent`. It's only used in `WorkunitGenericFailure` and should be removed asap.
 */
export const InfoRasterImage = ({ image }: { image: ImageSourcePropType }) => {
  const { height } = useWindowDimensions();
  const defautlHeight = height * 0.11;

  return (
    <Image
      accessibilityIgnoresInvertColors
      source={image}
      resizeMode={"contain"}
      style={{
        // On device with screen size < 650, the image size is reduced
        width: height >= maxHeightFullSize ? infoImageSize : defautlHeight,
        height: height >= maxHeightFullSize ? infoImageSize : defautlHeight
      }}
      testID={"rasterImage"}
    />
  );
};
