import { withWalletCardBaseComponent } from "../../../wallet/components/WalletCardBaseComponent";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwShouldRenderNewItWalletSelector } from "../../common/store/selectors";
import { useIOSelector } from "../../../../store/hooks";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";

export type ItwCredentialWalletCardProps = ItwCredentialCard & {
  isPreview?: false; // Cards in wallet cannot be in preview mode
};

const WrappedItwCredentialCard = (props: ItwCredentialWalletCardProps) => {
  const { isItwCredential, credentialType } = props;
  const navigation = useIONavigation();
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewItWalletSelector);
  const needsItwUpgrade = isNewItwRenderable && !isItwCredential;

  const handleCredentialUpgrade = useOfflineToastGuard(() =>
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
      params: {
        credentialType,
        isUpgrade: true
      }
    })
  );

  const handleOnPress = () => {
    if (needsItwUpgrade) {
      handleCredentialUpgrade();
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
    <WalletCardPressableBase
      onPress={handleOnPress}
      testID="ItwCredentialWalletCardTestID"
    >
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
