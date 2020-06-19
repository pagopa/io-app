import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../i18n";
import themeVariables from "../theme/variables";
import IconFont from "./ui/IconFont";
const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  icon: {
    marginTop: 4
  },
  text: {
    marginLeft: 8,
    paddingRight: 18,
    fontSize: themeVariables.fontSizeBase
  }
});

const iconSize = 18;
/**
 * This component displays a box with an icon and some text to inform about assistance work days/hours
 * @param props
 * @constructor
 */
const AssistanceAdviceComponent: React.FunctionComponent<{}> = () => {
  return (
    <View style={styles.container}>
      <IconFont
        style={styles.icon}
        name={"io-notice"}
        size={iconSize}
        color={themeVariables.brandPrimary}
      />
      <Text style={styles.text}>
        {I18n.t("instabug.contextualHelp.assistanceWorkHours")}
      </Text>
    </View>
  );
};

export default React.memo(AssistanceAdviceComponent);
