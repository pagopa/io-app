import React from "react";
import { Pressable } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  WalletCardComponentBaseProps,
  withWalletCardBaseComponent
} from "../../../newWallet/components/WalletCardBaseComponent";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayCard, IdPayCardProps } from "./IdPayCard";

export type IdPayWalletCardProps = {
  initiativeId: string;
} & IdPayCardProps;

const WrappedIdPayCard = (
  props: WalletCardComponentBaseProps<IdPayWalletCardProps>
) => {
  const navigation = useIONavigation();

  const { initiativeId, ...cardProps } = props;

  const handleOnPress = () => {
    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: {
        initiativeId: ""
      }
    });
  };

  return (
    <Pressable onPress={handleOnPress}>
      <IdPayCard {...cardProps} />
    </Pressable>
  );
};

/**
 * Wrapper component which adds wallet capabilites to the IdPayCard component
 */
export const IdPayWalletCard = withWalletCardBaseComponent(WrappedIdPayCard);
