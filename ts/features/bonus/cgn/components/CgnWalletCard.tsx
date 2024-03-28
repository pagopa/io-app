import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Pressable } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { profileSelector } from "../../../../store/reducers/profile";
import { withWalletCardBaseComponent } from "../../../newWallet/components/WalletCardBaseComponent";
import CGN_ROUTES from "../navigation/routes";
import { CgnCard, CgnCardProps } from "./CgnCard";

export type CgnWalletCardProps = CgnCardProps;

const WrappedCgnCard = (props: CgnWalletCardProps) => {
  const navigation = useIONavigation();
  const profilePot = useIOSelector(profileSelector);

  const isUnder31 = pipe(
    pot.toOption(profilePot),
    O.chainNullableK(({ date_of_birth }) => date_of_birth),
    O.map(birthDate => new Date().getFullYear() - birthDate.getFullYear()),
    O.map(years => years < 31),
    O.getOrElse(() => false)
  );

  const handleCardPress = () => {
    navigation.navigate(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.DETAILS
    });
  };

  return (
    <Pressable accessibilityRole="button" onPress={handleCardPress}>
      <CgnCard {...props} withEycaLogo={isUnder31} />
    </Pressable>
  );
};

export const CgnWalletCard = withWalletCardBaseComponent(WrappedCgnCard);
