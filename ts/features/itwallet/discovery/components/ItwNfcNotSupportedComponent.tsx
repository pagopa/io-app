import { IOToast } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { openWebUrl } from "../../../../utils/url";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { trackItwNfcNotSupported } from "../../analytics";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";

const NFC_NOT_SUPPORTED_FAQ_URL =
  "https://assistenza.ioapp.it/hc/it/articles/35541811236113-Cosa-serve-per-usare-IT-Wallet";

export const ItwNfcNotSupportedComponent = () => {
  const navigation = useIONavigation();

  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  useFocusEffect(trackItwNfcNotSupported);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleOpenFaq = () =>
    openWebUrl(NFC_NOT_SUPPORTED_FAQ_URL, () =>
      IOToast.error(I18n.t("genericError"))
    );

  const navigateToDiscoveryInfoScreen = useCallback(
    () =>
      navigation.replace(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: {}
      }),
    [navigation]
  );

  const action: OperationResultScreenContentProps["action"] = isWalletValid
    ? {
        label: I18n.t(
          "features.itWallet.discovery.nfcNotSupported.actions.l3.continue"
        ),
        onPress: handleOpenFaq
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
