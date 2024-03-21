import React from "react";
import { Pressable } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  WalletCardComponentBaseProps,
  withWalletCardBaseComponent
} from "../../../newWallet/components/WalletCardBaseComponent";
import { WalletDetailsRoutes } from "../../details/navigation/navigator";
import {
  PaymentCard as BasePaymentCard,
  PaymentCardProps as BasePaymentCardProps
} from "./PaymentCard";

export type PaymentWalletCardProps = BasePaymentCardProps &
  WalletCardComponentBaseProps;

const WrappedPaymentCard = (props: PaymentWalletCardProps) => {
  const navigation = useIONavigation();

  const handleOnPress = () => {
    navigation.navigate(WalletDetailsRoutes.WALLET_DETAILS_MAIN, {
      screen: WalletDetailsRoutes.WALLET_DETAILS_SCREEN,
      params: {
        walletId: props.walletId
      }
    });
  };

  return (
    <Pressable onPress={handleOnPress}>
      <BasePaymentCard {...props} />
    </Pressable>
  );
};

export const PaymentWalletCard =
  withWalletCardBaseComponent(WrappedPaymentCard);
