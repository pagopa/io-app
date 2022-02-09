import { Dimensions } from "react-native";
import * as React from "react";
import { useSelector } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import { ListItem } from "native-base";
import { PaymentMethodRepresentationComponent } from "../paymentMethodActivationToggle/base/PaymentMethodRepresentationComponent";
import { paymentMethodsSelector } from "../../../../../store/reducers/wallet/wallets";
import { useIOBottomSheetRaw } from "../../../../../utils/bottomSheet";
import { BottomSheetContent } from "../../../../../components/bottomSheet/BottomSheetContent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { PaymentMethod } from "../../../../../types/pagopa";

type Props = {
  onDeletePress: () => void;
  onCancelPress: () => void;
  paymentMethods: ReadonlyArray<PaymentMethod>;
};
export const BottomSheetMethodsToDelete = (props: Props) => {
  const deleteProps = {
    style: {
      flex: 1,
      borderColor: IOColors.red
    },
    labelColor: IOColors.red,
    bordered: true,
    onPress: props.onDeletePress,
    title: I18n.t("global.buttons.delete")
  };
  const cancelProps = {
    bordered: true,
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
      {props.paymentMethods.map(pm => (
        <ListItem key={`payment_method_${pm.idWallet}`}>
          <PaymentMethodRepresentationComponent {...pm} />
        </ListItem>
      ))}
    </BottomSheetContent>
  );
};

export const useBottomSheetMethodsToDelete = (
  props: Omit<Props, "paymentMethods">
) => {
  const paymentMethods = pot.getOrElse(useSelector(paymentMethodsSelector), []);
  const snapPoint = Math.min(
    Dimensions.get("window").height * 0.6,
    // footer + items
    200 + paymentMethods.length * 58
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
        "test title"
      );
    }
  };
};
