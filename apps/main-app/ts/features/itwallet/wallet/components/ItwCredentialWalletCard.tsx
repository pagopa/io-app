import I18n from "i18next";

import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { withWalletCardBaseComponent } from "../../../wallet/components/WalletCardBaseComponent";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import {
  ItwCredentialCard,
  ItwCredentialCardLegacy
} from "../../common/components/ItwCredentialCard";
import { useItwCredentialName } from "../../common/hooks/useItwCredentialName";
import { itwShouldUpgradeCredentialSelector } from "../../common/store/selectors";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";

export type ItwCredentialWalletCardProps = ItwCredentialCard & {
  /* Optional onPress to override press functionality */
  onPress?: () => void;
  /* Optional override to force the use of the new Itw design, used for testing purposes */
  withItwDesign?: boolean;
};

const WrappedItwCredentialCard = (props: ItwCredentialWalletCardProps) => {
  const { credentialType, issuedAt, onPress } = props;
  const navigation = useIONavigation();
  const credentialName = useItwCredentialName(credentialType);
  const needsItwUpgrade = useIOSelector(
    itwShouldUpgradeCredentialSelector(credentialType, issuedAt)
  );
  const withItwDesign =
    useIOSelector(itwLifecycleIsITWalletValidSelector) || props.withItwDesign;

  // The PID card displays the IT-Wallet ID logo instead of a textual title,
  // so its name must be exposed explicitly to screen readers
  const accessibilityLabel =
    withItwDesign && credentialType === CredentialType.PID
      ? I18n.t("features.itWallet.credentialName.pid")
      : credentialName;

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
    if (onPress) {
      onPress();
    } else if (needsItwUpgrade) {
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
      accessibilityLabel={accessibilityLabel}
      onPress={handleOnPress}
      testID="ItwCredentialWalletCardTestID"
    >
      {withItwDesign ? (
        <ItwCredentialCard {...props} />
      ) : (
        <ItwCredentialCardLegacy {...props} />
      )}
    </WalletCardPressableBase>
  );
};

/**
 * Wrapper component which adds wallet capabilites to the ItwCredentialCard
 * component
 */
export const ItwCredentialWalletCard = withWalletCardBaseComponent(
  WrappedItwCredentialCard
);
