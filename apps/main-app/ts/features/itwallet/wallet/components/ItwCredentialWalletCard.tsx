import { Body, VStack } from "@io-app/design-system";
import I18n from "i18next";
import { memo } from "react";
import { View } from "react-native";

import { renderActionButtons } from "../../../../components/ui/IOScrollView";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
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

type PressableCredentialCardProps = ItwCredentialCard & {
  accessibilityLabel: string;
  onPress: () => void;
  withItwDesign: boolean;
};

const PressableCredentialCard = ({
  accessibilityLabel,
  onPress,
  withItwDesign,
  ...cardProps
}: PressableCredentialCardProps) => (
  <WalletCardPressableBase
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    testID="ItwCredentialWalletCardTestID"
  >
    {withItwDesign ? (
      <ItwCredentialCard {...cardProps} />
    ) : (
      <ItwCredentialCardLegacy {...cardProps} />
    )}
  </WalletCardPressableBase>
);

/**
 * Card of a credential that must be upgraded to IT-Wallet: pressing it opens
 * the upgrade bottom sheet, mounted only for these cards.
 */
const UpgradeRequiredCredentialCard = (
  props: Omit<PressableCredentialCardProps, "onPress">
) => {
  const { credentialType } = props;
  const navigation = useIONavigation();

  const handleCredentialUpgrade = useOfflineToastGuard(() =>
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
      params: {
        credentialType,
        isUpgrade: true
      }
    })
  );

  const upgradeModal = useIOBottomSheetModal({
    title: I18n.t("features.itWallet.modal.credentialUpgrade.title"),
    component: (
      <VStack space={24}>
        <Body>
          {I18n.t("features.itWallet.modal.credentialUpgrade.content")}
        </Body>
        <View>
          {renderActionButtons(
            {
              type: "TwoButtons",
              primary: {
                label: I18n.t(
                  "features.itWallet.modal.credentialUpgrade.primaryButton"
                ),
                onPress: () => {
                  upgradeModal.dismiss();
                  handleCredentialUpgrade();
                }
              },
              secondary: {
                label: I18n.t(
                  "features.itWallet.modal.credentialUpgrade.secondaryButton"
                ),
                onPress: () => {
                  upgradeModal.dismiss();
                  navigation.navigate(ITW_ROUTES.MAIN, {
                    screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
                    params: {
                      credentialType
                    }
                  });
                }
              }
            },
            16
          )}
        </View>
      </VStack>
    )
  });

  return (
    <>
      <PressableCredentialCard {...props} onPress={upgradeModal.present} />
      {upgradeModal.bottomSheet}
    </>
  );
};

const WrappedItwCredentialCard = ({
  onPress,
  withItwDesign: forceItwDesign,
  ...cardProps
}: ItwCredentialWalletCardProps) => {
  const { credentialType, issuedAt } = cardProps;
  const navigation = useIONavigation();
  const credentialName = useItwCredentialName(credentialType);
  const needsItwUpgrade = useIOSelector(
    itwShouldUpgradeCredentialSelector(credentialType, issuedAt)
  );
  const withItwDesign =
    useIOSelector(itwLifecycleIsITWalletValidSelector) || !!forceItwDesign;

  // The PID card displays the IT-Wallet ID logo instead of a textual title,
  // so its name must be exposed explicitly to screen readers
  const accessibilityLabel =
    withItwDesign && credentialType === CredentialType.PID
      ? I18n.t("features.itWallet.credentialName.pid")
      : credentialName;

  if (!onPress && needsItwUpgrade) {
    return (
      <UpgradeRequiredCredentialCard
        {...cardProps}
        accessibilityLabel={accessibilityLabel}
        withItwDesign={withItwDesign}
      />
    );
  }

  const navigateToDetails = () =>
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
      params: {
        credentialType
      }
    });

  return (
    <PressableCredentialCard
      {...cardProps}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress ?? navigateToDetails}
      withItwDesign={withItwDesign}
    />
  );
};

/**
 * Wrapper component which adds wallet capabilites to the ItwCredentialCard
 * component
 */
export const ItwCredentialWalletCard = withWalletCardBaseComponent(
  // Wallet lists render cards with new but shallowly equal props on every render
  memo(WrappedItwCredentialCard)
);
