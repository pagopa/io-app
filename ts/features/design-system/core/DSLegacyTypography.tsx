import { HStack, IOColors, VStack } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { LabelSmall as LegacyLabelSmall } from "../../../components/core/typography/LabelSmall";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSLegacyTypography = () => (
  <DesignSystemScreen title={"Legacy typography"}>
    <VStack space={40}>
      <LegacyLabelSmallRow />
    </VStack>
  </DesignSystemScreen>
);

const LegacyLabelSmallRow = () => (
  <HStack space={16}>
    <LegacyLabelSmall>Label small</LegacyLabelSmall>
    <LegacyLabelSmall color={"bluegrey"}>Label small</LegacyLabelSmall>
    <LegacyLabelSmall color={"red"}>Label small</LegacyLabelSmall>
    <View style={{ backgroundColor: IOColors.bluegrey }}>
      <LegacyLabelSmall color={"white"}>Label small</LegacyLabelSmall>
    </View>
  </HStack>
);
