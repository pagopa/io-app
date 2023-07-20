import * as React from "react";
import { View } from "react-native";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Body } from "../../../components/core/typography/Body";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { PaymentMethodRepresentation } from "../../../types/pagopa";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import {
  cancelButtonProps,
  errorButtonProps
} from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { PaymentMethodRepresentationComponent } from "../../bonus/bpd/components/paymentMethodActivationToggle/base/PaymentMethodRepresentationComponent";

type Props = {
  representation: PaymentMethodRepresentation;
};

/**
 * Confirmation bottom sheet displayed when the user choose to remove a payment method
 * @param props
 * @constructor
 */
const RemovePaymentMethod: React.FunctionComponent<Props> = props => (
  <View>
    <VSpacer size={16} />
    <PaymentMethodRepresentationComponent {...props.representation} />
    <VSpacer size={16} />
    <Body>{I18n.t("wallet.newRemove.body")}</Body>
    <VSpacer size={16} />
  </View>
);

export const useRemovePaymentMethodBottomSheet = (
  representation: PaymentMethodRepresentation,
  onConfirm: () => void
) => {
  const {
    present,
    bottomSheet: removePaymentMethodBottomSheet,
    dismiss
  } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t("wallet.newRemove.title"),
      component: (
        <RemovePaymentMethod
          representation={{
            caption: representation.caption,
            icon: representation.icon
          }}
        />
      ),
      footer: (
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            ...cancelButtonProps(() => dismiss()),
            onPressWithGestureHandler: true
          }}
          rightButton={{
            ...errorButtonProps(() => {
              dismiss();
              onConfirm();
            }, I18n.t("global.buttons.delete")),
            onPressWithGestureHandler: true
          }}
        />
      )
    },
    172
  );

  return { present, removePaymentMethodBottomSheet, dismiss };
};
