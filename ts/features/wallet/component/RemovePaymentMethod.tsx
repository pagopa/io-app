import { View } from "native-base";
import * as React from "react";
import { BottomSheetContent } from "../../../components/bottomSheet/BottomSheetContent";
import { Body } from "../../../components/core/typography/Body";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { PaymentMethodRepresentation } from "../../../types/pagopa";
import { useIOBottomSheetRaw } from "../../../utils/bottomSheet";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { PaymentMethodRepresentationComponent } from "../../bonus/bpd/components/paymentMethodActivationToggle/base/PaymentMethodRepresentationComponent";

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
  representation: PaymentMethodRepresentation;
};

/**
 * Confirmation bottom sheet displayed when the user choose to remove a payment method
 * @param props
 * @constructor
 */
export const RemovePaymentMethod: React.FunctionComponent<Props> = props => (
  <BottomSheetContent
    footer={
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={{
          ...cancelButtonProps(props.onCancel),
          onPressWithGestureHandler: true
        }}
        rightButton={{
          ...confirmButtonProps(
            props.onConfirm,
            I18n.t("global.buttons.delete")
          ),
          onPressWithGestureHandler: true
        }}
      />
    }
  >
    <View>
      <View spacer={true} />
      <PaymentMethodRepresentationComponent {...props.representation} />
      <View spacer={true} />
      <Body>{I18n.t("wallet.newRemove.body")}</Body>
    </View>
  </BottomSheetContent>
);

export const useRemovePaymentMethodBottomSheet = (
  representation: PaymentMethodRepresentation
) => {
  const { present, dismiss } = useIOBottomSheetRaw(
    I18n.t("wallet.newRemove.title"),
    350
  );

  const openModalBox = (onConfirm: () => void) =>
    present(
      <RemovePaymentMethod
        onCancel={dismiss}
        onConfirm={() => {
          dismiss();
          onConfirm();
        }}
        representation={{
          caption: representation.caption,
          icon: representation.icon
        }}
      />
    );
  return { present: openModalBox, dismiss };
};
