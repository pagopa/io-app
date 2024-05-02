import { FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import brokenLinkImage from "../../../../img/broken-link.png";
import { Label } from "../../../components/core/typography/Label";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";

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
    <Image
      accessibilityIgnoresInvertColors
      source={brokenLinkImage}
      resizeMode="contain"
    />
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
