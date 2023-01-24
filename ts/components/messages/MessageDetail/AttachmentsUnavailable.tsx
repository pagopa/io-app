import I18n from "i18n-js";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import variables from "../../../theme/variables";
import { IOColors } from "../../core/variables/IOColors";
import IconFont from "../../ui/IconFont";

const styles = StyleSheet.create({
  container: {
    padding: variables.contentPadding,
    backgroundColor: IOColors.orange,
    flexDirection: "row",
    alignItems: "center"
  },
  message: {
    paddingStart: variables.spacerWidth,
    color: IOColors.white,
    font: "TitilliumWeb",
    fontSize: variables.headerBodyFontSize
  },
  messageBold: {
    fontWeight: "bold"
  }
});

const AttachmentsUnavailableComponent = () => (
  <View style={styles.container}>
    <IconFont name={"io-notice"} color={IOColors.white} size={24} />
    <Text style={styles.message}>
      {I18n.t("messageDetails.attachments.unavailable.firstPart")}
      <Text style={styles.messageBold}>
        {I18n.t("messageDetails.attachments.unavailable.secondPart")}
      </Text>
      {I18n.t("messageDetails.attachments.unavailable.thirdPart")}
    </Text>
  </View>
);

export default AttachmentsUnavailableComponent;
