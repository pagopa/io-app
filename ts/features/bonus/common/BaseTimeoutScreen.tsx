import I18n from "i18n-js";
import * as React from "react";
import { SafeAreaView } from "react-native";
import image from "../../../../img/wallet/errors/payment-expired-icon.png";
import { FooterStackButton } from "../../../components/buttons/FooterStackButtons";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";

type Props = {
  title: string;
  body: string | React.ReactNode;
  onExit: () => void;
};

/**
 * This screen informs the user that the request takes longer than necessary to be completed
 * and will receive a notification with the outcome of the operation.
 * @deprecated Use `OperationResultScreen` instead
 * @param props
 * @constructor
 */

export const BaseTimeoutScreen: React.FunctionComponent<Props> = props => (
  <SafeAreaView style={IOStyles.flex}>
    <InfoScreenComponent
      image={renderInfoRasterImage(image)}
      title={props.title}
      body={props.body}
    />
    <FooterStackButton
      primaryActionProps={{
        label: I18n.t("global.buttons.exit"),
        accessibilityLabel: I18n.t("global.buttons.exit"),
        onPress: props.onExit
      }}
    />
  </SafeAreaView>
);
