import React from "react";
import { Divider, IOVisualCostants } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import Placeholder from "rn-placeholder";

type Props = {
  hasIcons?: boolean;
};

export function CgnMerchantListSkeleton(props: Props) {
  const { hasIcons = false } = props;

  return (
    <View testID="CgnMerchantListSkeleton">
      {new Array(6).fill(null).map((_, index) => (
        <View key={index} testID={`CgnMerchantListSkeleton-Item-${index}`}>
          <View
            style={{
              paddingHorizontal: hasIcons
                ? 0
                : IOVisualCostants.appMarginDefault
            }}
          >
            <Placeholder.Box
              animate="fade"
              height={24}
              radius={8}
              width="100%"
              style={{
                marginVertical: 13
              }}
              testID={`CgnMerchantListSkeleton-Placeholder-${index}`}
            />
          </View>
          <Divider />
        </View>
      ))}
    </View>
  );
}
