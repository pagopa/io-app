import { View, Image, StyleSheet } from "react-native";
import * as React from "react";
import { FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import { Label } from "../../../components/core/typography/Label";
import I18n from "../../../i18n";
import brokenLinkImage from "../../../../img/broken-link.png";
import { IOStyles } from "../../../components/core/variables/IOStyles";

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center"
  },
  errorTitle: {
    marginTop: 10
  }
});

type Props = {
  onWebviewClose: () => void;
  handleReload: () => void;
};

const WebviewErrorComponent = ({ onWebviewClose, handleReload }: Props) => (
  <View style={[styles.errorContainer, IOStyles.horizontalContentPadding]}>
    <VSpacer size={40} />
    <VSpacer size={40} />
    <Image source={brokenLinkImage} resizeMode="contain" />
    <Label style={styles.errorTitle} weight={"Bold"}>
      {I18n.t("authentication.errors.network.title")}
    </Label>

    <FooterWithButtons
      type="TwoButtonsInlineThird"
      primary={{
        type: "Outline",
        buttonProps: {
          onPress: onWebviewClose,
          label: I18n.t("global.buttons.cancel")
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          onPress: handleReload,
          label: I18n.t("global.buttons.retry")
        }
      }}
    />
  </View>
);

export default WebviewErrorComponent;
