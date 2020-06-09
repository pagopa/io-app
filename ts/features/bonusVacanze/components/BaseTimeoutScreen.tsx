import * as React from "react";
import { NavigationScreenProps, withNavigation } from "react-navigation";
import I18n from "../../../i18n";
import { cancelButtonProps } from "./buttons/ButtonConfigurations";
import { FooterStackButton } from "./buttons/FooterStackButtons";
import { renderRasterImage } from "./infoScreen/imageRendering";
import { InfoScreenComponent } from "./infoScreen/InfoScreenComponent";

type MyProps = {
  title: string;
  body: string;
  onExit: () => void;
};

type Props = NavigationScreenProps & MyProps;

const image = require("../../../../img/wallet/errors/payment-expired-icon.png");

/**
 * This screen informs the user that the request takes longer than necessary to be completed
 * and will receive a notification with the outcome of the operation.
 * @param props
 * @constructor
 */

const InnerBaseTimeoutScreen: React.FunctionComponent<Props> = props => {
  const confirmText = I18n.t("global.buttons.exit");
  return (
    <>
      <InfoScreenComponent
        image={renderRasterImage(image)}
        title={props.title}
        body={props.body}
      />
      <FooterStackButton
        buttons={[cancelButtonProps(props.onExit, confirmText)]}
      />
    </>
  );
};

export const BaseTimeoutScreen = withNavigation(InnerBaseTimeoutScreen);
