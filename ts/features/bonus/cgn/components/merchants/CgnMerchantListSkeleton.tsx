import React from "react";
import { Divider, IOVisualCostants } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import Placeholder from "rn-placeholder";

export function CgnMerchantListSkeleton() {
  return (
    <View>
      {new Array(6).fill(null).map((_, index) => (
        <View key={index}>
          <View
            style={{
              paddingHorizontal: IOVisualCostants.appMarginDefault
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
            />
          </View>
          <Divider />
        </View>
      ))}
    </View>
  );
}
