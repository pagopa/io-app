import { ListItem } from "native-base";
import * as React from "react";
import { View, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../../components/core/typography/H3";
import { Label } from "../../../../../components/core/typography/Label";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { getBPDMethodsVisibleInWalletSelector } from "../../../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../../../types/pagopa";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { PaymentMethodRepresentationComponent } from "../paymentMethodActivationToggle/base/PaymentMethodRepresentationComponent";

type Props = {
  paymentMethods: ReadonlyArray<PaymentMethod>;
};

export const BottomSheetMethodsToDelete = (props: Props) => (
  <View testID={"BottomSheetMethodsToDeleteTestID"}>
    <Label color={"bluegrey"} weight={"Regular"}>
      {I18n.t(
        "bonus.bpd.optInPaymentMethods.deletePaymentMethodsBottomSheet.subtitle"
      )}
    </Label>
    <VSpacer size={16} />
    {props.paymentMethods.map(pm => (
      <ListItem
        key={`payment_method_${pm.idWallet}`}
        testID={`payment_method_${pm.idWallet}`}
      >
        <PaymentMethodRepresentationComponent {...pm} />
      </ListItem>
    ))}
  </View>
);

type BottomSheetReturnType = {
  presentBottomSheet: () => void;
  bottomSheet: React.ReactNode;
};

/**
 * return an hook that exposes presentBottomSheet function to imperative show a bottomsheet
 * containing the list of those payment methods that have BPD as function enabled
 * @param props
 */
export const useBottomSheetMethodsToDelete = (props: {
  onDeletePress: () => void;
}): BottomSheetReturnType => {
  const paymentMethods = useSelector(getBPDMethodsVisibleInWalletSelector);
  const snapPoint = Math.min(
    Dimensions.get("window").height * 0.8,
    // (subtitle + footer) + items
    280 + paymentMethods.length * 58
  );
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <BottomSheetMethodsToDelete paymentMethods={paymentMethods} />,
    <View style={IOStyles.flex}>
      <H3>
        {I18n.t(
          "bonus.bpd.optInPaymentMethods.deletePaymentMethodsBottomSheet.title"
        )}
      </H3>
      <VSpacer size={16} />
    </View>,
    snapPoint,
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        testID: "deleteButtonTestID",
        style: {
          flex: 1,
          borderColor: IOColors.red
        },
        onPressWithGestureHandler: true,
        labelColor: IOColors.red,
        bordered: true,
        onPress: () => {
          props.onDeletePress();
          dismiss();
        },
        title: I18n.t("global.buttons.delete")
      }}
      rightButton={{
        testID: "cancelButtonTestID",
        bordered: true,
        onPressWithGestureHandler: true,
        onPress: () => dismiss(),
        title: I18n.t("global.buttons.cancel")
      }}
    />
  );

  return {
    presentBottomSheet: present,
    bottomSheet
  };
};
