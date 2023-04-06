import * as React from "react";
import { SafeAreaView } from "react-native";
import image from "../../../../img/wallet/errors/payment-expired-icon.png";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../i18n";
import { cancelButtonProps } from "../bonusVacanze/components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../bonusVacanze/components/buttons/FooterStackButtons";

type Props = {
  title: string;
  body: string | React.ReactNode;
  onExit: () => void;
};

/**
 * This screen informs the user that the request takes longer than necessary to be completed
 * and will receive a notification with the outcome of the operation.
 * @param props
 * @constructor
 */

export const BaseTimeoutScreen: React.FunctionComponent<Props> = props => {
  const confirmText = I18n.t("global.buttons.exit");
  return (
    <SafeAreaView style={IOStyles.flex}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={props.title}
        body={props.body}
      />
      <FooterStackButton
        buttons={[cancelButtonProps(props.onExit, confirmText)]}
      />
    </SafeAreaView>
  );
};
