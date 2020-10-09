import { useEffect } from "react";
import { Image } from "react-native";
import { fromNullable } from "fp-ts/lib/Option";

export type ImageDimensions = {
  w: number;
  h: number;
};

/**
 * To keep the image bounded in the predefined maximum dimensions (40x160) we use the resizeMode "contain"
 * and always calculate the resize width keeping fixed the height to 40, in this way all images will have an height of 40
 * and a variable width until the limit of 160.
 * Calculating the new image height based on its width may cause an over boundary dimension in some case.
 * @param width
 * @param height
 * @param maxW
 * @param maxH
 * @param callback
 */
const handleImageDimensionSuccess = (
  width: number,
  height: number,
  maxW: number,
  maxH: number,
  callback: (dim: ImageDimensions) => void
) => {
  if (width > 0 && height > 0) {
    const ratio = Math.min(maxW / width, maxH / height);
    callback({ w: width * ratio, h: height * ratio });
  }
};

export const useImageResize = (
  maxWidth: number,
  maxHeight: number,
  handler: (dimensions: ImageDimensions) => void,
  imageUrl?: string
) =>
  useEffect(() => {
    fromNullable(imageUrl).map(url =>
      Image.getSize(url, (w, h) =>
        handleImageDimensionSuccess(w, h, maxWidth, maxHeight, handler)
      )
    );
  }, []);
