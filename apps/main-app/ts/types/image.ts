import { ImageSourcePropType, ImageURISource } from "react-native";

// ImageSourcePropType type guards
/**
 * Typeguard for handle backward compatibility of icon type
 * @param image
 */
export const isImageURISource = (
  image: ImageSourcePropType
): image is ImageURISource =>
  typeof image !== "number" && (image as ImageURISource).uri !== undefined;
