import * as React from "react";
import { View, Image } from "react-native";
import Placeholder from "rn-placeholder";
import { getBankLogosCdnUri } from "../helperFunctions/payment/strings";
import { IOColors } from "../../../core/variables/IOColors";
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
  const [isLoading, setIsLoading] = React.useState<boolean | undefined>(
    undefined
  );
  const { width, height } = dimensions;
  return (
    <>
      <Image
        source={{ uri: getBankLogosCdnUri(abiCode) }}
        style={{
          height,
          width,
          resizeMode: "contain"
        }}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
      />
      {isLoading && (
        <View style={{ marginTop: -height }}>
          <Placeholder.Box
            color={IOColors[placeHolderColor]}
            animate="fade"
            radius={8}
            height={33}
            width={213}
          />
        </View>
      )}
    </>
  );
};
