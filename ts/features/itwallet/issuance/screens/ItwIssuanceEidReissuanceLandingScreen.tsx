import { useCallback } from "react";
import { Text } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { itwCredentialsEidStatusSelector } from "../../credentials/store/selectors";

/**
 * Landing screen for the eID reissuing flow started from a message.
 * Since this flow is started from outside the Wallet screen,
 * it it necessary to make some preliminary checks before proceeding.
 */
export const ItwIssuanceEidReissuanceLandingScreen = () => {
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  if (!isWalletValid) {
    return <Text>Documenti su IO non è attivo</Text>;
  }

  if (eidStatus === "valid") {
    return <Text>EID non è in scadenza</Text>;
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
