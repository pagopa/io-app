import { useCallback } from "react";
import I18n from "i18next";
import { useNavigation } from "@react-navigation/native";
import {
  IOStackNavigationProp,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import ROUTES from "../../../../navigation/routes";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { itwCredentialsEidStatusSelector } from "../../credentials/store/selectors";

/**
 * Landing screen for the eID reissuing flow started from a message.
 * Since this flow is started from outside the Wallet screen,
 * it it necessary to make some preliminary checks before proceeding.
 */
export const ItwIssuanceEidReissuanceLandingScreen = () => {
  const navigation = useIONavigation();

  const isAnyWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItWalletValid = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const canActivateItWallet = useIOSelector(itwIsL3EnabledSelector);
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const hasValidEid = eidStatus && eidStatus === "valid";

  // The user has already activated IT-Wallet or there is no need to reissue the eID
  if (isItWalletValid || hasValidEid) {
    return (
      <OperationResultScreenContent
        title={I18n.t(
          "features.itWallet.reissuanceLandingScreen.notNecessary.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.reissuanceLandingScreen.notNecessary.subtitle"
        )}
        pictogram="success"
        action={{
          label: I18n.t(
            "features.itWallet.reissuanceLandingScreen.notNecessary.primaryAction"
          ),
          onPress: () =>
            navigation.navigate(ROUTES.MAIN, {
              screen: ROUTES.WALLET_HOME,
              params: { newMethodAdded: false }
            })
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.cancel"),
          onPress: () => navigation.goBack()
        }}
      />
    );
  }

  // The user has no wallet active but can activate IT-Wallet
  if (!isAnyWalletValid && canActivateItWallet) {
    return (
      <OperationResultScreenContent
        title={I18n.t(
          "features.itWallet.reissuanceLandingScreen.itWalletActivation.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.reissuanceLandingScreen.itWalletActivation.subtitle"
        )}
        pictogram="itWallet"
        action={{
          label: I18n.t(
            "features.itWallet.reissuanceLandingScreen.itWalletActivation.primaryAction"
          ),
          onPress: () =>
            navigation.replace(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.DISCOVERY.INFO,
              params: { isL3: true }
            })
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.notNow"),
          onPress: () => navigation.goBack()
        }}
      />
    );
  }

  return <NavigateToEidIssuanceMachine eidReissuing={isAnyWalletValid} />;
};

type Props = {
  eidReissuing: boolean;
};

/**
 * Navigate to the issuance machine. The entry point depends on
 * whether the user has Documenti su IO and only needs to reissue the eID
 * or does not have an active Wallet and needs to activate it first.
 */
const NavigateToEidIssuanceMachine = ({ eidReissuing }: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();

  const handleNavigation = useCallback(() => {
    if (eidReissuing) {
      return navigation.replace(ITW_ROUTES.IDENTIFICATION.MODE_SELECTION, {
        eidReissuing: true,
        animationEnabled: false
      });
    }
    navigation.replace(ITW_ROUTES.DISCOVERY.INFO, {
      isL3: false,
      animationEnabled: false
    });
  }, [navigation, eidReissuing]);

  useOnFirstRender(handleNavigation);

  return null;
};
