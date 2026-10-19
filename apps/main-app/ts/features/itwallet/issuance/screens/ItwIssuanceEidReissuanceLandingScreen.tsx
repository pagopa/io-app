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
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../store/reducers/startup";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { itwCredentialsEidStatusSelector } from "../../credentials/store/selectors";
import {
  isItWalletAvailable,
  isWalletActive,
  ItwLifecycleState,
  itwLifecycleStateSelector
} from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

/**
 * Landing screen for the eID reissuing flow started from a message. Since this
 * flow is started from outside the Wallet screen, it it necessary to make some
 * preliminary checks before proceeding.
 */
export const ItwIssuanceEidReissuanceLandingScreen = () => {
  const navigation = useIONavigation();

  const lifecycle = useIOSelector(itwLifecycleStateSelector);
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const hasValidEid = eidStatus && eidStatus === "valid";

  // eID/PID valid: no reissuance needed
  if (hasValidEid) {
    return (
      <OperationResultScreenContent
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
        pictogram="success"
        secondaryAction={{
          label: I18n.t("global.buttons.cancel"),
          onPress: () => navigation.goBack()
        }}
        subtitle={I18n.t(
          "features.itWallet.reissuanceLandingScreen.notNecessary.subtitle"
        )}
        title={I18n.t(
          "features.itWallet.reissuanceLandingScreen.notNecessary.title"
        )}
      />
    );
  }

  // Tell the user IT-Wallet is available when the eID is expiring/expired and
  // IT-Wallet is not yet active
  if (
    isItWalletAvailable(lifecycle) &&
    lifecycle !== ItwLifecycleState.IT_WALLET
  ) {
    return (
      <OperationResultScreenContent
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
        pictogram="itWallet"
        secondaryAction={{
          label: I18n.t("global.buttons.cancel"),
          onPress: () => navigation.goBack()
        }}
        subtitle={I18n.t(
          "features.itWallet.reissuanceLandingScreen.itWalletActivation.subtitle"
        )}
        title={I18n.t(
          "features.itWallet.reissuanceLandingScreen.itWalletActivation.title"
        )}
      />
    );
  }

  // Go directly to one of the issuance routes:
  // - If the user has an active Wallet -> reissuance
  // - Else -> Documenti su IO issuance
  return <NavigateToEidIssuanceMachine lifecycle={lifecycle} />;
};

type Props = {
  lifecycle: ItwLifecycleState;
};

/**
 * Navigate to the issuance machine. The entry point depends on whether the user
 * has a valid Wallet and only needs to reissue the eID/PID or does not have an
 * active Wallet and needs to activate it first.
 */
const NavigateToEidIssuanceMachine = ({ lifecycle }: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const startupStatus = useIOSelector(isStartupLoaded);

  const handleNavigation = useCallback(() => {
    if (startupStatus !== StartupStatusEnum.AUTHENTICATED) {
      // Skip navigation until the startup process is completed and the user is authenticated
      return;
    }

    if (isWalletActive(lifecycle)) {
      return navigation.replace(ITW_ROUTES.IDENTIFICATION.MODE_SELECTION, {
        eidReissuing: true,
        level: lifecycle === ItwLifecycleState.IT_WALLET ? "l3" : "l2",
        animationEnabled: false
      });
    }
    navigation.replace(ITW_ROUTES.DISCOVERY.INFO, {
      animationEnabled: false
    });
  }, [startupStatus, navigation, lifecycle]);

  useOnFirstRender(handleNavigation);

  return null;
};
