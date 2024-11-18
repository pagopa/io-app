import { useCallback } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { isCieIdAvailable } from "@pagopa/io-react-native-cieid";
import { useIONavigation } from "../navigation/params/AppParamsList";
import {
  trackCieIDLoginSelected,
  trackCiePinLoginSelected,
  trackSpidLoginSelected
} from "../screens/authentication/analytics";
import ROUTES from "../navigation/routes";
import { useIODispatch, useIOSelector, useIOStore } from "../store/hooks";
import { fastLoginOptInFFEnabled } from "../features/fastLogin/store/selectors";
import { isCieSupportedSelector } from "../store/reducers/cie";
import {
  cieFlowForDevServerEnabled,
  SpidLevel
} from "../features/cieLogin/utils";
import { idpSelected } from "../store/actions/authentication";
import { SpidIdp } from "../../definitions/content/SpidIdp";
import { isCieLoginUatEnabledSelector } from "../features/cieLogin/store/selectors";
import {
  ChosenIdentifier,
  Identifier
} from "../screens/authentication/OptInScreen";

export const IdpCIE: SpidIdp = {
  id: "cie",
  name: "CIE",
  logo: "",
  profileUrl: ""
};
export const IdpCIE_ID: SpidIdp = {
  id: "cieid",
  name: "CIE_ID",
  logo: "",
  profileUrl: ""
};

const useNavigateToLoginMethod = () => {
  const dispatch = useIODispatch();
  const isFastLoginOptInFFEnabled = useIOSelector(fastLoginOptInFFEnabled);
  const store = useIOStore();
  const { navigate } = useIONavigation();
  const isCIEAuthenticationSupported = useIOSelector(isCieSupportedSelector);
  const isCieUatEnabled = useIOSelector(isCieLoginUatEnabledSelector);

  const isCieSupported =
    cieFlowForDevServerEnabled ||
    pot.getOrElse(isCIEAuthenticationSupported, false);

  const withIsFastLoginOptInCheck = useCallback(
    (
      navigateToTheChosenLoginMethod: () => void,
      optInScreenParams: ChosenIdentifier
    ) => {
      if (isFastLoginOptInFFEnabled) {
        navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.AUTHENTICATION_OPT_IN,
          params: optInScreenParams
        });
      } else {
        navigateToTheChosenLoginMethod();
      }
    },
    [isFastLoginOptInFFEnabled, navigate]
  );

  const navigateToIdpSelection = useCallback(() => {
    trackSpidLoginSelected();
    withIsFastLoginOptInCheck(
      () => {
        navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.AUTHENTICATION_IDP_SELECTION
        });
      },
      { identifier: Identifier.SPID }
    );
  }, [withIsFastLoginOptInCheck, navigate]);

  const navigateToCiePinInsertion = useCallback(() => {
    dispatch(idpSelected(IdpCIE));
    void trackCiePinLoginSelected(store.getState());

    withIsFastLoginOptInCheck(
      () => {
        navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.CIE_PIN_SCREEN
        });
      },
      { identifier: Identifier.CIE }
    );
  }, [withIsFastLoginOptInCheck, navigate, store, dispatch]);

  const navigateToCieIdLoginScreen = useCallback(
    (spidLevel: SpidLevel = "SpidL2") => {
      dispatch(idpSelected(IdpCIE_ID));
      void trackCieIDLoginSelected(store.getState(), spidLevel);

      if (isCieIdAvailable(isCieUatEnabled) || cieFlowForDevServerEnabled) {
        const params = {
          spidLevel,
          isUat: isCieUatEnabled
        };

        withIsFastLoginOptInCheck(
          () => {
            navigate(ROUTES.AUTHENTICATION, {
              screen: ROUTES.AUTHENTICATION_CIE_ID_LOGIN,
              params
            });
          },
          { identifier: Identifier.CIE_ID, params }
        );
      } else {
        navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.CIE_NOT_INSTALLED,
          params: {
            isUat: isCieUatEnabled
          }
        });
      }
    },
    [isCieUatEnabled, store, withIsFastLoginOptInCheck, navigate, dispatch]
  );

  return {
    navigateToCiePinInsertion,
    navigateToIdpSelection,
    navigateToCieIdLoginScreen,
    isCieSupported
  };
};

export default useNavigateToLoginMethod;
