import * as React from "react";
import { StyleSheet, View } from "react-native";

import { IOIcons, Icon, HSpacer } from "@pagopa/io-app-design-system";
import { TranslationKeys } from "../../../locales/locales";
import I18n from "../../i18n";

import { H3 } from "../core/typography/H3";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingVertical: 8,
    alignItems: "center"
  }
});

type Props = {
  iconName: IOIcons;
  title: TranslationKeys;
};

/**
 * Renders a header for any section in the service's details page
 */
const sectionHeader: React.FC<Props> = ({ iconName, title }) => (
  <View style={styles.header}>
    <Icon name={iconName} color="bluegrey" size={20} />
    <HSpacer size={8} />
    <H3 weight={"SemiBold"} color={"bluegrey"} accessibilityRole={"header"}>
      {I18n.t(title)}
    </H3>
  </View>
);

export default sectionHeader;
