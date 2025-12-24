import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { withWalletCardBaseComponent } from "../../../wallet/components/WalletCardBaseComponent";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { itwCredentialsEidIssuedAtSelector } from "../../credentials/store/selectors";
import { isCredentialIssuedBeforePid } from "../../common/utils/itwCredentialUtils";

export type ItwCredentialWalletCardProps = ItwCredentialCard & {
  isPreview?: false; // Cards in wallet cannot be in preview mode
};

const WrappedItwCredentialCard = (props: ItwCredentialWalletCardProps) => {
  const { credentialType, issuedAt } = props;
  const navigation = useIONavigation();
  const isItwPid = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const pidIssuedAt = useIOSelector(itwCredentialsEidIssuedAtSelector);
  const needsItwUpgrade =
    isItwPid && isCredentialIssuedBeforePid(issuedAt, pidIssuedAt);

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
