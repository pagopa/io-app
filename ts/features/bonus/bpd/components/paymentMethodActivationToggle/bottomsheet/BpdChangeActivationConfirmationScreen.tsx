import { View } from "native-base";
import * as React from "react";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../components/core/typography/Body";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import { PaymentMethodRepresentation } from "../../../../../../types/pagopa";
import { useIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { PaymentMethodRepresentationComponent } from "../base/PaymentMethodRepresentationComponent";

export type ConfirmationType = "Activation" | "Deactivation";

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
  type: ConfirmationType;
  representation: PaymentMethodRepresentation;
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
export const BpdChangeActivationConfirmationScreen: React.FunctionComponent<Props> =
  props => {
    const { body } = getText(props.type);

    return (
      <View>
        <View spacer={true} />
        <PaymentMethodRepresentationComponent {...props.representation} />
        <View spacer={true} />
        <Markdown>{body}</Markdown>
        {props.type === "Activation" && (
          <>
            <View spacer={true} large={true} />
            <InfoBox>
              <Body>
                {I18n.t(
                  "bonus.bpd.details.paymentMethods.activate.disclaimer",
                  { activate: I18n.t("global.buttons.activate") }
                )}
              </Body>
            </InfoBox>
          </>
        )}
      </View>
    );
  };

export const useChangeActivationConfirmationBottomSheet = (
  representation: PaymentMethodRepresentation,
  newVal: boolean,
  onConfirm: () => void
) => {
  const { cta } = getText(newVal ? "Activation" : "Deactivation");

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <BpdChangeActivationConfirmationScreen
      onCancel={() => dismiss()}
      onConfirm={() => {
        dismiss();
        onConfirm();
      }}
      type={newVal ? "Activation" : "Deactivation"}
      representation={{
        caption: representation.caption,
        icon: representation.icon
      }}
    />,
    newVal
      ? I18n.t("bonus.bpd.details.paymentMethods.activate.title")
      : I18n.t("bonus.bpd.details.paymentMethods.deactivate.title"),
    466,
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={{
          ...cancelButtonProps(() => dismiss()),
          onPressWithGestureHandler: true
        }}
        rightButton={{
          ...confirmButtonProps(() => {
            dismiss();
            onConfirm();
          }, cta),
          onPressWithGestureHandler: true
        }}
      />
  );

  return { present, bottomSheet, dismiss };
};
