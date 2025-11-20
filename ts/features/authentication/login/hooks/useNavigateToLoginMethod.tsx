import { isCieIdAvailable } from "@pagopa/io-react-native-cieid";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useCallback } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { SpidIdp } from "../../../../utils/idps";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { idpSelected } from "../../common/store/actions";
import { fastLoginOptInFFEnabled } from "../../fastLogin/store/selectors";
import {
  isCieLoginUatEnabledSelector,
  isCieSupportedSelector
} from "../../login/cie/store/selectors";
import { cieFlowForDevServerEnabled, SpidLevel } from "../../login/cie/utils";
import {
  ChosenIdentifier,
  Identifier
} from "../../login/optIn/screens/OptInScreen";
import { cieIDSetSelectedSecurityLevel } from "../cie/store/actions";
import { isActiveSessionLoginSelector } from "../../activeSessionLogin/store/selectors";
import {
  setIdpSelectedActiveSessionLogin,
  setCieIDSelectedSecurityLevelActiveSessionLogin
} from "../../activeSessionLogin/store/actions";

export const IdpCIE: SpidIdp = {
  id: "cie",
  name: "CIE",
  logo: {
    light: { uri: "" }
  },
  profileUrl: ""
};
export const IdpCIE_ID: SpidIdp = {
  id: "cieid",
  name: "CIE_ID",
  logo: {
    light: { uri: "" }
  },
  profileUrl: ""
};

const useNavigateToLoginMethod = () => {
  const dispatch = useIODispatch();
  const isFastLoginOptInFFEnabled = useIOSelector(fastLoginOptInFFEnabled);
  const { navigate } = useIONavigation();
  const isCIEAuthenticationSupported = useIOSelector(isCieSupportedSelector);
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

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
        navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.OPT_IN,
          params: optInScreenParams
        });
      } else {
        navigateToTheChosenLoginMethod();
      }
    },
    [isFastLoginOptInFFEnabled, navigate]
  );

  const navigateToIdpSelection = useCallback(() => {
    withIsFastLoginOptInCheck(
      () => {
        navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.IDP_SELECTION
        });
      },
      { identifier: Identifier.SPID }
    );
  }, [withIsFastLoginOptInCheck, navigate]);

  const navigateToCiePinInsertion = useCallback(() => {
    if (isActiveSessionLogin) {
      dispatch(setIdpSelectedActiveSessionLogin(IdpCIE));
    } else {
      dispatch(idpSelected(IdpCIE));
    }

    withIsFastLoginOptInCheck(
      () => {
        navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
        });
      },
      { identifier: Identifier.CIE }
    );
  }, [dispatch, isActiveSessionLogin, withIsFastLoginOptInCheck, navigate]);

  const navigateToCieIdLoginScreen = useCallback(
    (spidLevel: SpidLevel = "SpidL2") => {
      if (isActiveSessionLogin) {
        // Set the security level for Active Session Login to enable mismatch tracking
        dispatch(setCieIDSelectedSecurityLevelActiveSessionLogin(spidLevel));
        dispatch(setIdpSelectedActiveSessionLogin(IdpCIE_ID));
      } else {
        dispatch(idpSelected(IdpCIE_ID));
        dispatch(cieIDSetSelectedSecurityLevel(spidLevel));
      }

      if (isCieIdAvailable(isCieUatEnabled) || cieFlowForDevServerEnabled) {
        const params = {
          spidLevel,
          isUat: isCieUatEnabled
        };

        withIsFastLoginOptInCheck(
          () => {
            navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: isActiveSessionLogin
                ? AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN
                : AUTHENTICATION_ROUTES.CIE_ID_LOGIN,
              params
            });
          },
          { identifier: Identifier.CIE_ID, params }
        );
      } else {
        navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.CIE_NOT_INSTALLED,
          params: {
            isUat: isCieUatEnabled
          }
        });
      }
    },
    [
      dispatch,
      isCieUatEnabled,
      withIsFastLoginOptInCheck,
      navigate,
      isActiveSessionLogin
    ]
  );

  return {
    navigateToCiePinInsertion,
    navigateToIdpSelection,
    navigateToCieIdLoginScreen,
    isCieSupported
  };
};

export default useNavigateToLoginMethod;
