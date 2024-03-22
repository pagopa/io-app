import React from "react";
import { Pressable } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  WalletCardComponentBaseProps,
  withWalletCardBaseComponent
} from "../../../newWallet/components/WalletCardBaseComponent";
import { WalletDetailsRoutes } from "../../details/navigation/navigator";
import { PaymentCard, PaymentCardProps } from "./PaymentCard";

export type PaymentWalletCardProps = {
  walletId: string;
} & PaymentCardProps;

const WrappedPaymentCard = (
  props: WalletCardComponentBaseProps<PaymentWalletCardProps>
) => {
  const navigation = useIONavigation();

  const { walletId, ...cardProps } = props;

  const handleOnPress = () => {
    navigation.navigate(WalletDetailsRoutes.WALLET_DETAILS_MAIN, {
      screen: WalletDetailsRoutes.WALLET_DETAILS_SCREEN,
      params: {
        walletId
      }
    });
  };

  return (
    <Pressable onPress={handleOnPress}>
      <PaymentCard {...cardProps} />
    </Pressable>
  );
};

/**
 * Wrapper component which adds wallet capabilites to the PaymentCard component
 */
export const PaymentWalletCard =
  withWalletCardBaseComponent(WrappedPaymentCard);
