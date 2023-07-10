import { View, Image, StyleSheet } from "react-native";
import * as React from "react";
import { Label } from "../../../components/core/typography/Label";
import I18n from "../../../i18n";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Body as BodyText } from "../../../components/core/typography/Body";
import brokenLinkImage from "../../../../img/broken-link.png";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { IOStyles } from "../../../components/core/variables/IOStyles";

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center"
  },
  errorTitle: {
    marginTop: 10
  },
  errorButtonsContainer: {
    position: "absolute",
    bottom: 0,
    flex: 1,
    flexDirection: "row"
  },
  cancelButtonStyle: {
    flex: 1,
    marginEnd: 10
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

    <View style={styles.errorButtonsContainer}>
      <ButtonDefaultOpacity
        onPress={onWebviewClose}
        style={styles.cancelButtonStyle}
        block={true}
        light={true}
        bordered={true}
      >
        <BodyText>{I18n.t("global.buttons.cancel")}</BodyText>
      </ButtonDefaultOpacity>
      <ButtonDefaultOpacity
        onPress={handleReload}
        style={{ flex: 2 }}
        block={true}
        primary={true}
      >
        <Label color={"white"}>{I18n.t("global.buttons.retry")}</Label>
      </ButtonDefaultOpacity>
    </View>
  </View>
);

export default WebviewErrorComponent;
