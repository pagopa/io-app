import { View } from "native-base";
import * as React from "react";
import { BottomSheetContent } from "../../../../../../components/bottomSheet/BottomSheetContent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { PaymentMethodRepresentation } from "../base/PaymentMethodRepresentation";

export type ConfirmationType = "Activation" | "Deactivation";

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
  type: ConfirmationType;
  representation: Omit<
    React.ComponentProps<typeof PaymentMethodRepresentation>,
    "children"
  >;
};

const getText = (confirmationType: ConfirmationType) => ({
  cta:
    confirmationType === "Activation"
      ? I18n.t("global.buttons.activate")
      : I18n.t("global.buttons.deactivate"),
  body:
    confirmationType === "Activation"
      ? I18n.t("bonus.bpd.details.paymentMethods.activate.body")
      : I18n.t("bonus.bpd.details.paymentMethods.deactivate.body")
});

/**
 * Confirmation bottom sheet that informs the user about the consequences about the activation / deactivation
 * @param props
 * @constructor
 */
export const BpdChangeActivationConfirmationScreen: React.FunctionComponent<Props> = props => {
  const { cta, body } = getText(props.type);

  return (
    <BottomSheetContent
      footer={
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(props.onCancel)}
          rightButton={confirmButtonProps(props.onConfirm, cta)}
        />
      }
    >
      <View>
        <View spacer={true} />
        <PaymentMethodRepresentation {...props.representation} />
        <View spacer={true} />
        <Markdown>{body}</Markdown>
      </View>
    </BottomSheetContent>
  );
};
