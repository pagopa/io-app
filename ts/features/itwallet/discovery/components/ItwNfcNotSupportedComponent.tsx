import { useCallback } from "react";
import I18n from "../../../../i18n";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwNfcNotSupportedComponent = () => {
  const navigation = useIONavigation();

  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const navigateToDiscoveryInfoScreen = useCallback(
    () =>
      navigation.replace(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: { isL3: false }
      }),
    [navigation]
  );

  const action: OperationResultScreenContentProps["action"] = isWalletValid
    ? {
        label: I18n.t(
          "features.itWallet.discovery.nfcNotSupported.actions.l3.continue"
        ),
        onPress: () => {
          // TODO: [SIW-2376] Open FAQ for devices that do not support NFC
        }
      }
    : {
        label: I18n.t(
          "features.itWallet.discovery.nfcNotSupported.actions.continue"
        ),
        onPress: navigateToDiscoveryInfoScreen
      };

  const secondaryAction: OperationResultScreenContentProps["secondaryAction"] =
    {
      label: I18n.t(
        isWalletValid
          ? "features.itWallet.discovery.nfcNotSupported.actions.l3.cancel"
          : "features.itWallet.discovery.nfcNotSupported.actions.cancel"
      ),
      onPress: goBack
    };

  return (
    <OperationResultScreenContent
      title={I18n.t("features.itWallet.discovery.nfcNotSupported.title")}
      subtitle={I18n.t("features.itWallet.discovery.nfcNotSupported.subtitle")}
      pictogram="attention"
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};
