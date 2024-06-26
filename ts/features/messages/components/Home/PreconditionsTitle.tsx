import * as React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { IOColors } from "@pagopa/io-app-design-system";
import HeaderImage from "../../../../../img/features/messages/alert_header.svg";
import customVariables from "../../../../theme/variables";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H3 } from "../../../../components/core/typography/H3";
import { useIOSelector } from "../../../../store/hooks";
import { preconditionTitleContentSelector } from "../../store/reducers/messagePrecondition";

const styles = StyleSheet.create({
  preconditionTitle: {
    flex: 1,
    flexWrap: "wrap"
  }
});

export const PreconditionTitle = () => {
  const titleContent = useIOSelector(preconditionTitleContentSelector);
  switch (titleContent) {
    case "empty":
      return <View />;
    case "loading":
      return <PreconditionHeaderSkeleton />;
    case "title":
      return <PreconditionHeader />;
  }
  return null;
};

const PreconditionHeader = () => (
  <View style={[IOStyles.flex, IOStyles.row, IOStyles.alignCenter]}>
    <HeaderImage
      width={32}
      height={32}
      fill={IOColors.blue}
      style={{ marginRight: customVariables.spacerWidth }}
    />
    <H3 style={styles.preconditionTitle}>{title}</H3>
  </View>
);

const PreconditionHeaderSkeleton = () => (
  <View
    style={[IOStyles.flex, IOStyles.row, IOStyles.alignCenter]}
    accessible={false}
  >
    <View style={{ marginRight: customVariables.spacerWidth }}>
      <Placeholder.Box animate={"fade"} width={32} height={32} radius={32} />
    </View>
    <Placeholder.Box animate="fade" width={150} height={21} radius={4} />
  </View>
);
