import * as React from "react";
import { Pressable } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { withWalletCardBaseComponent } from "../../../newWallet/components/WalletCardBaseComponent";
import CGN_ROUTES from "../navigation/routes";
import { CgnCard } from "./CgnCard";

export type CgnWalletCardProps = {
  expireDate: Date;
};

const WrappedCgnCard = (props: CgnWalletCardProps) => {
  const navigation = useIONavigation();

  const handleCardPress = () => {
    navigation.navigate(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.DETAILS
    });
  };

  return (
    <Pressable onPress={handleCardPress}>
      <CgnCard {...props} />
    </Pressable>
  );
};

export const CgnWalletCard = withWalletCardBaseComponent(WrappedCgnCard);
