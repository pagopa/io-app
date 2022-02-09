import { Dimensions } from "react-native";
import * as React from "react";
import { useSelector } from "react-redux";
import { ListItem, View } from "native-base";
import { PaymentMethodRepresentationComponent } from "../paymentMethodActivationToggle/base/PaymentMethodRepresentationComponent";
import { getBPDMethodsSelector } from "../../../../../store/reducers/wallet/wallets";
import { useIOBottomSheetRaw } from "../../../../../utils/bottomSheet";
import { BottomSheetContent } from "../../../../../components/bottomSheet/BottomSheetContent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { PaymentMethod } from "../../../../../types/pagopa";
import { Label } from "../../../../../components/core/typography/Label";
import { BlockButtonProps } from "../../../../../components/ui/BlockButtons";

type Props = {
  onDeletePress: () => void;
  onCancelPress?: () => void;
  paymentMethods: ReadonlyArray<PaymentMethod>;
};
export const BottomSheetMethodsToDelete = (props: Props) => {
  const deleteProps: BlockButtonProps = {
    style: {
      flex: 1,
      borderColor: IOColors.red
    },
    onPressWithGestureHandler: true,
    labelColor: IOColors.red,
    bordered: true,
    onPress: props.onDeletePress,
    title: I18n.t("global.buttons.delete")
  };
  const cancelProps: BlockButtonProps = {
    bordered: true,
    onPressWithGestureHandler: true,
    onPress: props.onCancelPress,
    title: I18n.t("global.buttons.cancel")
  };
  return (
    <BottomSheetContent
      footer={
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={deleteProps}
          rightButton={cancelProps}
        />
      }
    >
      <Label color={"bluegrey"} weight={"Regular"}>
        {I18n.t(
          "bonus.bpd.optInPaymentMethods.deletePaymentMethodsBottomSheet.subtitle"
        )}
      </Label>
      <View spacer={true} />
      {props.paymentMethods.map(pm => (
        <ListItem key={`payment_method_${pm.idWallet}`}>
          <PaymentMethodRepresentationComponent {...pm} />
        </ListItem>
      ))}
    </BottomSheetContent>
  );
};

type BottomSheetReturnType = {
  presentBottomSheet: () => void;
};

/**
 * return an hook that exposes presentBottomSheet function to imperative show a bottomsheet
 * containing the list of those payment methods that have BPD as function enabled
 * @param props
 */
export const useBottomSheetMethodsToDelete = (
  props: Omit<Props, "paymentMethods">
): BottomSheetReturnType => {
  const paymentMethods = useSelector(getBPDMethodsSelector);
  const snapPoint = Math.min(
    Dimensions.get("window").height * 0.7,
    // (subtitle + footer) + items
    280 + paymentMethods.length * 58
  );
  const { present } = useIOBottomSheetRaw(snapPoint);
  return {
    presentBottomSheet: () => {
      void present(
        <BottomSheetMethodsToDelete
          paymentMethods={paymentMethods}
          onDeletePress={props.onDeletePress}
          onCancelPress={props.onCancelPress}
        />,
        I18n.t(
          "bonus.bpd.optInPaymentMethods.deletePaymentMethodsBottomSheet.title"
        )
      );
    }
  };
};
