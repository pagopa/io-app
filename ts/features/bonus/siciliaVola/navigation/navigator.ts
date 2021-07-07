import { createStackNavigator } from "react-navigation";
import CheckStatusRouterScreen from "../screens/voucherGeneration/CheckStatusRouterScreen";
import SV_ROUTES from "./routes";
import SelectBeneficiaryCategoryScreen from "../screens/voucherGeneration/SelectBeneficiaryCategoryScreen";
import StudentSelectDestinationScreen from "../screens/voucherGeneration/StudentSelectDestinationScreen";
import DisableAdditionalInfoScreen from "../screens/voucherGeneration/DisableAdditionalInfoScreen";
import WorkerCheckIncomeScreen from "../screens/voucherGeneration/WorkerCheckIncomeScreen";
import SickCheckIncomeScreen from "../screens/voucherGeneration/SickCheckIncomeScreen";
import WorkerSelectDestinationScreen from "../screens/voucherGeneration/WorkerSelectDestinationScreen";
import SickSelectDestinationScreen from "../screens/voucherGeneration/SickSelectDestinationScreen";

const SvNavigator = createStackNavigator(
  {
    [SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS]: {
      screen: CheckStatusRouterScreen
    },
    [SV_ROUTES.VOUCHER_GENERATION.SELECT_BENEFICIARY_CATEGORY]: {
      screen: SelectBeneficiaryCategoryScreen
    },
    [SV_ROUTES.VOUCHER_GENERATION.STUDENT_SELECT_DESTINATION]: {
      screen: StudentSelectDestinationScreen
    },
    [SV_ROUTES.VOUCHER_GENERATION.DISABLE_ADDITIONAL_INFO]: {
      screen: DisableAdditionalInfoScreen
    },
    [SV_ROUTES.VOUCHER_GENERATION.WORKER_CHECK_INCOME_THRESHOLD]: {
      screen: WorkerCheckIncomeScreen
    },
    [SV_ROUTES.VOUCHER_GENERATION.WORKER_SELECT_DESTINATION]: {
      screen: WorkerSelectDestinationScreen
    },
    [SV_ROUTES.VOUCHER_GENERATION.SICK_CHECK_INCOME_THRESHOLD]: {
      screen: SickCheckIncomeScreen
    },
    [SV_ROUTES.VOUCHER_GENERATION.SICK_SELECT_DESTINATION]: {
      screen: SickSelectDestinationScreen
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

export default SvNavigator;
