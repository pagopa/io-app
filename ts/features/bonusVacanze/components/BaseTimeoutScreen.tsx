import * as React from "react";
import { SafeAreaView } from "react-native";
import I18n from "../../../i18n";
import { cancelButtonProps } from "./buttons/ButtonConfigurations";
import { FooterStackButton } from "./buttons/FooterStackButtons";
import { renderRasterImage } from "./infoScreen/imageRendering";
import { InfoScreenComponent } from "./infoScreen/InfoScreenComponent";
import { bonusVacanzaStyle } from "./Styles";

type Props = {
  title: string;
  body: string | React.ReactNode;
  onExit: () => void;
};

const image = require("../../../../img/wallet/errors/payment-expired-icon.png");

/**
 * This screen informs the user that the request takes longer than necessary to be completed
 * and will receive a notification with the outcome of the operation.
 * @param props
 * @constructor
 */

export const BaseTimeoutScreen: React.FunctionComponent<Props> = props => {
  const confirmText = I18n.t("global.buttons.exit");
  return (
    <SafeAreaView style={bonusVacanzaStyle.flex}>
      <InfoScreenComponent
        image={renderRasterImage(image)}
        title={props.title}
        body={props.body}
      />
      <FooterStackButton
        buttons={[cancelButtonProps(props.onExit, confirmText)]}
      />
    </SafeAreaView>
  );
};
