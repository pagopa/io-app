import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch } from "../../../../store/hooks";
import { guardedNavigationAction } from "../../../../xstate/helpers/guardedNavigationAction";
import { IDPayConfigurationRoutes } from "../navigation/navigator";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { refreshSessionToken } from "../../../fastLogin/store/actions/tokenRefreshActions";
import { Context } from "./context";
import { Events } from "./events";
import { InitiativeFailure, InitiativeFailureType } from "./failure";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const handleSessionExpired = () => {
    dispatch(
      refreshSessionToken.request({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
  };

  const navigateToConfigurationIntro = guardedNavigationAction(
    (context: Context) => {
      if (context.initiativeId === undefined) {
        throw new Error("initiativeId is undefined");
      }

      navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
        screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
        params: {
          initiativeId: context.initiativeId
        }
      });
    }
  );

  const navigateToIbanLandingScreen = guardedNavigationAction(() =>
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING
    })
  );

  const navigateToIbanOnboardingScreen = guardedNavigationAction(() =>
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING
    })
  );

  const navigateToIbanEnrollmentScreen = guardedNavigationAction(() =>
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
      params: {}
    })
  );

  const navigateToAddPaymentMethodScreen = guardedNavigationAction(() =>
    navigation.replace(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_ADD_PAYMENT_METHOD,
      params: { inPayment: O.none }
    })
  );

  const navigateToInstrumentsEnrollmentScreen = guardedNavigationAction(() =>
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen:
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
      params: {}
    })
  );

  const navigateToConfigurationSuccessScreen = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS
    });
  };

  const navigateToInitiativeDetailScreen = (context: Context) => {
    if (context.initiativeId === undefined) {
      throw new Error("initiativeId is undefined");
    }

    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: { initiativeId: context.initiativeId }
    });
  };

  const showFailureToast = (context: Context) => {
    pipe(
      context.failure,
      InitiativeFailure.decode,
      O.fromEither,
      O.chain(failure => {
        if (failure !== InitiativeFailureType.SESSION_EXPIRED) {
          return O.some(I18n.t(`idpay.configuration.failureStates.${failure}`));
        }
        return O.none;
      }),
      O.map(IOToast.error)
    );
  };

  const showUpdateIbanToast = () => {
    IOToast.success(I18n.t(`idpay.configuration.iban.updateToast`));
  };

  const showInstrumentFailureToast = (_: Context, event: Events) => {
    switch (event.type) {
      case "ENROLL_INSTRUMENT_FAILURE":
        IOToast.error(
          I18n.t(
            `idpay.configuration.failureStates.${InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE}`
          )
        );
        break;
      case "DELETE_INSTRUMENT_FAILURE":
        IOToast.error(
          I18n.t(
            `idpay.configuration.failureStates.${InitiativeFailureType.INSTRUMENT_DELETE_FAILURE}`
          )
        );
        break;
    }
  };

  const exitConfiguration = () => {
    navigation.pop();
  };

  return {
    handleSessionExpired,
    navigateToConfigurationIntro,
    navigateToIbanLandingScreen,
    navigateToIbanOnboardingScreen,
    navigateToIbanEnrollmentScreen,
    navigateToInstrumentsEnrollmentScreen,
    navigateToAddPaymentMethodScreen,
    navigateToInitiativeDetailScreen,
    navigateToConfigurationSuccessScreen,
    showFailureToast,
    showUpdateIbanToast,
    showInstrumentFailureToast,
    exitConfiguration
  };
};

export { createActionsImplementation };
