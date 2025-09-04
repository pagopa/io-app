import { withWalletCardBaseComponent } from "../../../wallet/components/WalletCardBaseComponent";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwShouldRenderNewItWalletSelector } from "../../common/store/selectors";
import { useIOSelector } from "../../../../store/hooks";

export type ItwCredentialWalletCardProps = ItwCredentialCard & {
  isPreview?: false; // Cards in wallet cannot be in preview mode
};

const WrappedItwCredentialCard = (props: ItwCredentialWalletCardProps) => {
  const { isItwCredential, credentialType } = props;
  const navigation = useIONavigation();
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewItWalletSelector);
  const needsItwUpgrade = isNewItwRenderable && !isItwCredential;

  const handleOnPress = () => {
    if (needsItwUpgrade) {
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
        params: {
          credentialType,
          isUpgrade: true
        }
      });
    } else {
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
        params: {
          credentialType
        }
      });
    }
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
