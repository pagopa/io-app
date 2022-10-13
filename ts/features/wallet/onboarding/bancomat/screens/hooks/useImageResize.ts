import { useEffect, useState } from "react";
import { Image } from "react-native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

/**
 * To keep the image bounded in the predefined maximum dimensions (40x160) we use the resizeMode "contain"
 * and always calculate the resize width keeping fixed the height to 40, in this way all images will have an height of 40
 * and a variable width until the limit of 160.
 * Calculating the new image height based on its width may cause an over boundary dimension in some case.
 * @param width
 * @param height
 * @param maxW
 * @param maxH
 */
const handleImageDimensionSuccess = (
  width: number,
  height: number,
  maxW: number,
  maxH: number
): [number, number] | undefined => {
  if (width > 0 && height > 0) {
    const ratio = Math.min(maxW / width, maxH / height);
    return [width * ratio, height * ratio];
  }
  return undefined;
};
type FutureSize = O.Option<[number, number]>;
export const useImageResize = (
  maxWidth: number,
  maxHeight: number,
  imageUrl?: string
): FutureSize => {
  const [size, setSize] = useState<FutureSize>(O.none);

  useEffect(() => {
    pipe(
      imageUrl,
      O.fromNullable,
      O.map(url =>
        Image.getSize(url, (w, h) =>
          setSize(
            O.fromNullable(
              handleImageDimensionSuccess(w, h, maxWidth, maxHeight)
            )
          )
        )
      )
    );
  }, [imageUrl, maxHeight, maxWidth]);
  return size;
};
