import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import { euCovidCertificateEnabled } from "../config";

const blackListRoutes: ReadonlyArray<string> = [];

// the routes contained in this set won't be tracked in SCREEN_CHANGE_V2 event
export const noAnalyticsRoutes = new Set<string>(
  // eslint-disable-next-line sonarjs/no-empty-collection
  blackListRoutes.concat(
    euCovidCertificateEnabled ? Object.values(EUCOVIDCERT_ROUTES) : []
  )
);
