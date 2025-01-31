import { withWalletCardBaseComponent } from "../../../wallet/components/WalletCardBaseComponent";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard/ItwCredentialCard";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export type ItwCredentialWalletCardProps = ItwCredentialCard & {
  isPreview?: false; // Cards in wallet cannot be in preview mode
};

const WrappedItwCredentialCard = (props: ItwCredentialWalletCardProps) => {
  const navigation = useIONavigation();

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
      params: {
        credentialType: props.credentialType
      }
    });
  };
  return (
    <WalletCardPressableBase onPress={handleOnPress}>
      <ItwCredentialCard {...props} />
    </WalletCardPressableBase>
  );
};

/**
 * Wrapper component which adds wallet capabilites to the ItwCredentialCard component
 */
export const ItwCredentialWalletCard = withWalletCardBaseComponent(
  WrappedItwCredentialCard
);
