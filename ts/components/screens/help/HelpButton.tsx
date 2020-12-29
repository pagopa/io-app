import React, { FC } from "react";
import I18n from "../../../i18n";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import IconFont from "../../ui/IconFont";

type Props = {
  onShowHelp: () => void;
};

const HelpButton: FC<Props> = ({ onShowHelp }) => (
  <ButtonDefaultOpacity
    onPress={onShowHelp}
    transparent={true}
    accessibilityLabel={I18n.t(
      "global.accessibility.contextualHelp.open.label"
    )}
    accessibilityHint={I18n.t("global.accessibility.contextualHelp.open.hint")}
  >
    <IconFont name={"io-question"} />
  </ButtonDefaultOpacity>
);

export default HelpButton;
