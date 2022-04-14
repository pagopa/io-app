import { Dimensions } from "react-native";
import * as React from "react";
import { useSelector } from "react-redux";
import { ListItem, View } from "native-base";
import { PaymentMethodRepresentationComponent } from "../paymentMethodActivationToggle/base/PaymentMethodRepresentationComponent";
import { getBPDMethodsSelector } from "../../../../../store/reducers/wallet/wallets";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { PaymentMethod } from "../../../../../types/pagopa";
import { Label } from "../../../../../components/core/typography/Label";
import { BlockButtonProps } from "../../../../../components/ui/BlockButtons";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";

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
    <View spacer={true} />
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
  const paymentMethods = useSelector(getBPDMethodsSelector);
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
      <View spacer={true} />
    </View>,
    snapPoint,
    () => {
      const deleteProps: BlockButtonProps = {
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
      };
      const cancelProps: BlockButtonProps = {
        testID: "cancelButtonTestID",
        bordered: true,
        onPressWithGestureHandler: true,
        onPress: () => dismiss(),
        title: I18n.t("global.buttons.cancel")
      };
      return (
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={deleteProps}
          rightButton={cancelProps}
        />
      );
    }
  );

  return {
    presentBottomSheet: present,
    bottomSheet
  };
};
