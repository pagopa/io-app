import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { View } from "native-base";
import * as React from "react";
import { BottomSheetContent } from "../../../../../../components/bottomSheet/BottomSheetContent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import { PaymentMethodRepresentation } from "../../../../../../types/pagopa";
import { bottomSheetRawConfig } from "../../../../../../utils/bottomSheet";
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
export const BpdChangeActivationConfirmationScreen: React.FunctionComponent<Props> = props => {
  const { cta, body } = getText(props.type);

  return (
    <BottomSheetContent
      footer={
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            ...cancelButtonProps(props.onCancel),
            onPressWithGestureHandler: true
          }}
          rightButton={{
            ...confirmButtonProps(props.onConfirm, cta),
            onPressWithGestureHandler: true
          }}
        />
      }
    >
      <View>
        <View spacer={true} />
        <PaymentMethodRepresentationComponent {...props.representation} />
        <View spacer={true} />
        <Markdown>{body}</Markdown>
      </View>
    </BottomSheetContent>
  );
};

export const useChangeActivationConfirmationBottomSheet = (
  representation: PaymentMethodRepresentation
) => {
  const { present, dismiss } = useBottomSheetModal();

  const openModalBox = (newVal: boolean, onConfirm: () => void) => {
    const bottomSheetProps = bottomSheetRawConfig(
      <BpdChangeActivationConfirmationScreen
        onCancel={dismiss}
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
      dismiss
    );
    present(bottomSheetProps.content, {
      ...bottomSheetProps.config
    });
  };
  return { present: openModalBox, dismiss };
};
