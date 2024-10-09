import { useCallback, useMemo } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { isCieIdAvailable } from "@pagopa/io-react-native-cieid";
import { useIONavigation } from "../navigation/params/AppParamsList";
import {
  trackCieLoginSelected,
  trackSpidLoginSelected
} from "../screens/authentication/analytics";
import ROUTES from "../navigation/routes";
import { useIODispatch, useIOSelector, useIOStore } from "../store/hooks";
import { fastLoginOptInFFEnabled } from "../features/fastLogin/store/selectors";
import { isCieSupportedSelector } from "../store/reducers/cie";
import { cieFlowForDevServerEnabled } from "../features/cieLogin/utils";
import { idpSelected } from "../store/actions/authentication";
import { SpidIdp } from "../../definitions/content/SpidIdp";
import { SpidLevel } from "../features/cieLogin/components/CieIdLoginWebView";
import { isCieLoginUatEnabledSelector } from "../features/cieLogin/store/selectors";
import { ChosenIdentifier } from "../screens/authentication/OptInScreen";

export const IdpCIE: SpidIdp = {
  id: "cie",
  name: "CIE",
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

  const isCieSupported = useMemo(
    () =>
      cieFlowForDevServerEnabled ||
      pot.getOrElse(isCIEAuthenticationSupported, false),
    [isCIEAuthenticationSupported]
  );

  const withIsFastLoginOptInCheck = useCallback(
    (cb: () => void, optInScreenParams: ChosenIdentifier) => {
      if (isFastLoginOptInFFEnabled) {
        navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.AUTHENTICATION_OPT_IN,
          params: optInScreenParams
        });
      } else {
        cb();
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
      { identifier: "SPID" }
    );
  }, [withIsFastLoginOptInCheck, navigate]);

  const navigateToCiePinInsertion = useCallback(() => {
    dispatch(idpSelected(IdpCIE));
    void trackCieLoginSelected(store.getState());

    withIsFastLoginOptInCheck(
      () => {
        navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.CIE_PIN_SCREEN
        });
      },
      { identifier: "CIE" }
    );
  }, [withIsFastLoginOptInCheck, navigate, store, dispatch]);

  const navigateToCieIdLoginScreen = useCallback(
    (spidLevel: SpidLevel = "SpidL2") => {
      if (isCieIdAvailable(isCieUatEnabled)) {
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
          { identifier: "CIE_ID", params }
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
    [isCieUatEnabled, withIsFastLoginOptInCheck, navigate]
  );

  return {
    navigateToCiePinInsertion,
    navigateToIdpSelection,
    navigateToCieIdLoginScreen,
    isCieSupported
  };
};

export default useNavigateToLoginMethod;
