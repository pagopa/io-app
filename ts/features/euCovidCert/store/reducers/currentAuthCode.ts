import { NavigationActions } from "react-navigation";
import { Action } from "../../../../store/actions/types";
import EUCOVIDCERT_ROUTES from "../../navigation/routes";
import { EUCovidCertificateAuthCode } from "../../types/EUCovidCertificate";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";

export const currentAuthCodeReducer = (
  state: EUCovidCertificateAuthCode | null = null,
  action: Action
): EUCovidCertificateAuthCode | null => {
  switch (action.type) {
    case NavigationActions.NAVIGATE:
      if (action.routeName === EUCOVIDCERT_ROUTES.DETAILS) {
        return action.params?.authCode ?? null;
      }
  }

  return state;
};

/**
 * currentAuthCode selector
 */
export const currentAuthCodeSelector = createSelector(
  [(state: GlobalState) => state.features.euCovidCert.currentAuthCode],
  (currentAuthCode): EUCovidCertificateAuthCode | null => currentAuthCode
);
