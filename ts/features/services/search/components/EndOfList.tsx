import React from "react";
import { View } from "react-native";
import { Icon, IOStyles, Label, VSpacer } from "@pagopa/io-app-design-system";

type EndOfListProps = {
  description: string;
};

export const EndOfList = ({ description }: EndOfListProps) => (
  <>
    <VSpacer size={24} />
    <View style={IOStyles.alignCenter}>
      <Icon name="search" color="grey-300" />
    </View>
    <VSpacer size={8} />
    <Label
      weight="Regular"
      fontSize="small"
      color="grey-700"
      style={{ textAlign: "center" }}
    >
      {description}
    </Label>
    <VSpacer size={24} />
  </>
);
