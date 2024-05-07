import React from "react";
import { View } from "react-native";
import { IOListItemStyles, IOStyles } from "@pagopa/io-app-design-system";
import Placeholder from "rn-placeholder";

export const ServiceListItemSkeleton = () => (
  <View style={IOListItemStyles.listItem} accessible={false}>
    <View style={IOListItemStyles.listItemInner}>
      <View style={IOStyles.flex}>
        <Placeholder.Box animate="fade" radius={8} width={"60%"} height={16} />
      </View>
    </View>
  </View>
);
