import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  IOStackNavigationProp,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { itwCredentialsEidStatusSelector } from "../../credentials/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

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

  // eID/PID valid: no reissuance needed
  if (hasValidEid) {
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

  // Tell the user IT-Wallet is available when:
  // - The eID is expiring/expired
  // - The user is whitelisted
  // - IT-Wallet is not yet active
  if (canActivateItWallet && !isItWalletValid) {
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
              params: { level: "l3" }
            })
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.notNow"),
          onPress: () => navigation.goBack()
        }}
      />
    );
  }

  // Go directly to one of the issuance routes:
  // - If the user has an active Wallet -> reissuance
  // - Else -> Documenti su IO issuance
  return <NavigateToEidIssuanceMachine eidReissuing={isAnyWalletValid} />;
};

type Props = {
  eidReissuing: boolean;
};

/**
 * Navigate to the issuance machine. The entry point depends on
 * whether the user has a valid Wallet and only needs to reissue the eID/PID
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
      animationEnabled: false
    });
  }, [navigation, eidReissuing]);

  useOnFirstRender(handleNavigation);

  return null;
};
