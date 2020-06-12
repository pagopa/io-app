import I18n from "i18n-js";
import * as React from "react";
import { handleItemOnPress } from "../../utils/url";
import BlockButtons, { BlockButtonProps } from "../ui/BlockButtons";

type Props = Readonly<{
  phone?: string;
  email?: string;
}>;

const EmailCallCTA: React.FunctionComponent<Props> = props => {
  const { phone, email } = props;

  const callButton: BlockButtonProps = {
    bordered: true,
    small: true,
    lightText: true,
    title: I18n.t("messageDetails.call"),
    iconName: "io-phone",
    onPress: handleItemOnPress(`tel:${phone}`)
  };

  const emailButton: BlockButtonProps = {
    bordered: true,
    small: true,
    lightText: true,
    title: I18n.t("messageDetails.write"),
    iconName: "io-envelope",
    onPress: handleItemOnPress(`mailto:${email}`)
  };

  if (phone === undefined || email === undefined) {
    return (
      <BlockButtons
        type={"SingleButton"}
        leftButton={phone ? callButton : emailButton}
      />
    );
  }

  return (
    <BlockButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={callButton}
      rightButton={emailButton}
    />
  );
};

export default EmailCallCTA;
