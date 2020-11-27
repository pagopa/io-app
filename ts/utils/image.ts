import { ImageSourcePropType, ImageURISource } from "react-native";
import * as t from "io-ts";

const ImageURISourceCodec = t.interface({
  uri: t.string
});

// type guard to check if the given imageSource is an ImageURISource
export const isImageURISource = (
  imageSource: ImageSourcePropType
): imageSource is ImageURISource =>
  ImageURISourceCodec.decode(imageSource).isRight();
