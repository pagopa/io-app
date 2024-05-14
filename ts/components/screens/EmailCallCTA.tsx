import { ButtonOutline, HSpacer, IOStyles } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import I18n from "../../i18n";
import { handleItemOnPress } from "../../utils/url";

type Props = Readonly<{
  phone?: string;
  email?: string;
}>;

const EmailCallCTA: React.FunctionComponent<Props> = props => {
  const { phone, email } = props;

  const callButton = (
    <ButtonOutline
      fullWidth
      label={I18n.t("messageDetails.call")}
      accessibilityLabel={I18n.t("messageDetails.call")}
      onPress={handleItemOnPress(`tel:${phone}`)}
      icon="phone"
    />
  );

  const emailButton = (
    <ButtonOutline
      fullWidth
      label={I18n.t("messageDetails.write")}
      accessibilityLabel={I18n.t("messageDetails.write")}
      onPress={handleItemOnPress(`mailto:${email}`)}
      icon="email"
    />
  );

  if (phone === undefined || email === undefined) {
    return phone ? callButton : emailButton;
  }

  return (
    <View style={IOStyles.row}>
      <View style={IOStyles.flex}>{callButton}</View>
      <HSpacer />
      <View style={IOStyles.flex}>{emailButton}</View>
    </View>
  );
};

export default EmailCallCTA;
