import * as React from "react";
import { Image } from "react-native";
import Placeholder from "rn-placeholder";
import { IOColors } from "../../../core/variables/IOColors";
import { getBankLogosCdnUri } from "../strings";
type BankLogoOrSkeletonProps = {
  abiCode: string;
  dimensions: { height: number; width: number };
  placeHolderColor?: IOColors;
};

/**
 *component that renders a bank logo based on the abiCode,
 * and displays a loader while the image is loading
 * @param abiCode
 * @param dimensions - height and width of the image and placeholder
 * @param placeHolderColor - color of the placeholder
 */
export const BankLogoOrSkeleton = ({
  abiCode,
  dimensions,
  placeHolderColor = "grey-200"
}: BankLogoOrSkeletonProps) => {
  const [imageUrl, setImageUrl] = React.useState<string>("");
  const { height, width: maxWidth } = dimensions;
  const [width, setWidth] = React.useState<number>(maxWidth);
  React.useEffect(() => {
    // we pre-fetch the image to avoid having to render both items
    // at the same time, which looks like an untidy hack
    fetchBlob(getBankLogosCdnUri(abiCode))
      .then(blob => {
        const url = URL.createObjectURL(blob);
        // to make sure the ratio is correct, we
        // calculate it ourselves, else we risk misalignments
        Image.getSize(url, (width, imgHeight) => {
          const ratio = width / imgHeight;
          setWidth(ratio * height);
        });
        setImageUrl(url);
      })
      .catch(_ => null);
  }, [abiCode, height]);

  return imageUrl !== "" ? (
    <Image
      source={{ uri: imageUrl }}
      style={{
        height,
        width,
        resizeMode: "contain"
      }}
    />
  ) : (
    <Placeholder.Box
      color={IOColors[placeHolderColor]}
      animate="fade"
      radius={8}
      height={height}
      width={width}
    />
  );
};
async function fetchBlob(url: string) {
  const response = await fetch(url);
  if (response.status === 200) {
    return response.blob();
  } else {
    throw new Error();
    // error is caught and irrelevant
  }
}
