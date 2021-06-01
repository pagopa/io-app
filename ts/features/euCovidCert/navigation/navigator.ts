import { createStackNavigator } from "react-navigation";
import LoadBpdActivationStatus from "../../bonus/bpd/screens/onboarding/LoadBpdActivationStatus";
import EUCOVIDCERT_ROUTES from "./routes";

const EuCovidCertNavigator = createStackNavigator(
  {
    [EUCOVIDCERT_ROUTES.DETAILS]: {
      screen: LoadBpdActivationStatus
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default EuCovidCertNavigator;
