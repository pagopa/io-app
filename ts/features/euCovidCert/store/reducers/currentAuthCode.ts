import { NavigationActions } from "react-navigation";
import { Action } from "../../../../store/actions/types";
import EUCOVIDCERT_ROUTES from "../../navigation/routes";
import { EUCovidCertificateAuthCode } from "../../types/EUCovidCertificate";

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
