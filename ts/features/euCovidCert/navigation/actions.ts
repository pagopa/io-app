import { NavigationActions } from "react-navigation";
import { EUCovidCertificateAuthCode } from "../types/EUCovidCertificate";
import EUCOVIDCERT_ROUTES from "./routes";

export const navigateToEuCovidCertificateDetailScreen = (
  authCode: EUCovidCertificateAuthCode,
  messageId: string
) =>
  NavigationActions.navigate({
    routeName: EUCOVIDCERT_ROUTES.DETAILS,
    params: { authCode, messageId }
  });
