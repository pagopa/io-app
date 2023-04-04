import React from "react";
import { StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Label } from "../../../components/core/typography/Label";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { Icon } from "../../../components/core/icons";
import { HSpacer } from "../../../components/core/spacer/Spacer";

type Props = {
  onPress?: () => void;
};

const styles = StyleSheet.create({
  label: {
    marginLeft: 2,
    marginBottom: 4,
    height: 21
  }
});

// "View" button with qrCode icon
export const ViewEUCovidButton = (props: Props) => (
  <ButtonDefaultOpacity
    onPress={props.onPress}
    xsmall={true}
    bordered={false}
    style={IOStyles.flex}
  >
    <Icon name="legQrCode" color="white" size={16} />
    <HSpacer size={4} />
    <Label color={"white"} style={styles.label}>
      {I18n.t("features.euCovidCertificate.listItem.cta")}
    </Label>
  </ButtonDefaultOpacity>
);
