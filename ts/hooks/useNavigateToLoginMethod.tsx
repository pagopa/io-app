import { useCallback, useMemo } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
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

  const isCieSupported = useMemo(
    () =>
      cieFlowForDevServerEnabled ||
      pot.getOrElse(isCIEAuthenticationSupported, false),
    [isCIEAuthenticationSupported]
  );

  const navigateToIdpSelection = useCallback(() => {
    trackSpidLoginSelected();
    if (isFastLoginOptInFFEnabled) {
      navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_OPT_IN,
        params: { identifier: "SPID" }
      });
    } else {
      navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_IDP_SELECTION
      });
    }
  }, [isFastLoginOptInFFEnabled, navigate]);

  const navigateToCiePinInsertion = useCallback(() => {
    if (isCieSupported) {
      void trackCieLoginSelected(store.getState());
      dispatch(idpSelected(IdpCIE));

      if (isFastLoginOptInFFEnabled) {
        navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.AUTHENTICATION_OPT_IN,
          params: { identifier: "CIE" }
        });
      } else {
        navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.CIE_PIN_SCREEN
        });
      }
    } else {
      navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.CIE_NOT_SUPPORTED
      });
    }
  }, [isFastLoginOptInFFEnabled, navigate, store, isCieSupported, dispatch]);

  return { navigateToCiePinInsertion, navigateToIdpSelection, isCieSupported };
};

export default useNavigateToLoginMethod;
