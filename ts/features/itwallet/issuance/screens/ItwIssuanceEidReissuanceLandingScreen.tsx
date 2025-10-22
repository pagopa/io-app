import { useCallback } from "react";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";

/**
 * Landing screen for the eID reissuing flow started from a message.
 * Since this flow is started from outside the Wallet screen,
 * it it necessary to make some preliminary checks before proceeding.
 */
export const ItwIssuanceEidReissuanceLandingScreen = () => {
  const navigation = useIONavigation();

  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);

  // TODO: use more specific messages - see SIW-3233
  if (!isWalletValid) {
    return (
      <OperationResultScreenContent
        title={I18n.t("features.itWallet.issuance.genericError.title")}
        pictogram="fatalError"
        action={{
          label: I18n.t("global.buttons.back"),
          onPress: () => navigation.goBack()
        }}
      />
    );
  }

  return <NavigateToIdentificationModeSelection />;
};

const NavigateToIdentificationModeSelection = () => {
  const navigation = useIONavigation();

  const startEidReissuing = useCallback(() => {
    navigation.replace(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: {
        eidReissuing: true
      }
    });
  }, [navigation]);

  useOnFirstRender(startEidReissuing);

  return null;
};
