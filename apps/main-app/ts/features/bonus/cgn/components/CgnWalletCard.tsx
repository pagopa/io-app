import * as pot from "@pagopa/ts-commons/lib/pot";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { profileSelector } from "../../../settings/common/store/selectors";
import { withWalletCardBaseComponent } from "../../../wallet/components/WalletCardBaseComponent";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import CGN_ROUTES from "../navigation/routes";
import { CgnCard, CgnCardProps } from "./CgnCard";

export type CgnWalletCardProps = CgnCardProps;

const WrappedCgnCard = (props: CgnWalletCardProps) => {
  const navigation = useIONavigation();
  const profilePot = useIOSelector(profileSelector);

  const birthDate = pot.toUndefined(profilePot)?.date_of_birth;
  const isUnder31 =
    birthDate !== undefined
      ? new Date().getFullYear() - birthDate.getFullYear() < 31
      : false;

  const handleCardPress = () => {
    navigation.navigate(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.DETAILS
    });
  };

  return (
    <WalletCardPressableBase onPress={handleCardPress}>
      <CgnCard {...props} withEycaLogo={isUnder31} />
    </WalletCardPressableBase>
  );
};

export const CgnWalletCard = withWalletCardBaseComponent(WrappedCgnCard);
