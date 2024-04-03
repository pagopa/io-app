import React from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { withWalletCardBaseComponent } from "../../../newWallet/components/WalletCardBaseComponent";
import { PaymentsMethodDetailsRoutes } from "../../details/navigation/routes";
import { PaymentCard, PaymentCardProps } from "./PaymentCard";
import { PaymentCardPressableBase } from "./PaymentCardPressableBase";

export type PaymentWalletCardProps = PaymentCardProps & {
  walletId: string;
};

const WrappedPaymentCard = (props: PaymentWalletCardProps) => {
  const navigation = useIONavigation();

  const { walletId, ...cardProps } = props;

  const handleOnPress = () => {
    navigation.navigate(
      PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_NAVIGATOR,
      {
        screen: PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN,
        params: {
          walletId
        }
      }
    );
  };

  return (
    <PaymentCardPressableBase onPress={handleOnPress}>
      <PaymentCard {...cardProps} />
    </PaymentCardPressableBase>
  );
};

/**
 * Wrapper component which adds wallet capabilites to the PaymentCard component
 */
export const PaymentWalletCard =
  withWalletCardBaseComponent(WrappedPaymentCard);
