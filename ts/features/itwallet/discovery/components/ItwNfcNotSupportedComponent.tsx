import { useMemo } from "react";
import I18n from "../../../../i18n";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useIOSelector } from "../../../../store/hooks";
import { itwIsWalletInstanceRemotelyActiveSelector } from "../../common/store/selectors/preferences";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwNfcNotSupportedComponent = () => {
  const navigation = useIONavigation();

  const isWalletInstanceRemotelyActive = useIOSelector(
    itwIsWalletInstanceRemotelyActiveSelector
  );

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const action: OperationResultScreenContentProps["action"] = useMemo(() => {
    if (isWalletInstanceRemotelyActive) {
      return {
        label: I18n.t(
          "features.itWallet.discovery.nfcNotSupported.actions.l3.continue"
        ),
        onPress: () => {
          // TODO: [SIW-2376] Open FAQ for devices that do not support NFC
        }
      };
    }

    return {
      label: I18n.t(
        "features.itWallet.discovery.nfcNotSupported.actions.continue"
      ),
      onPress: () =>
        navigation.replace(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.DISCOVERY.INFO,
          params: { isL3: false }
        })
    };
  }, [isWalletInstanceRemotelyActive, navigation]);

  const secondaryAction: OperationResultScreenContentProps["secondaryAction"] =
    useMemo(
      () => ({
        label: I18n.t(
          isWalletInstanceRemotelyActive
            ? "features.itWallet.discovery.nfcNotSupported.actions.l3.cancel"
            : "features.itWallet.discovery.nfcNotSupported.actions.cancel"
        ),
        onPress: () => navigation.goBack()
      }),
      [isWalletInstanceRemotelyActive, navigation]
    );

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
