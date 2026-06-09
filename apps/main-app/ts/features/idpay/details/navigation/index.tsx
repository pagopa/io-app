import { createStackNavigator } from "@react-navigation/stack";
import {
  IdPayBeneficiaryDetailsScreen,
  IdPayBeneficiaryDetailsScreenParams
} from "../screens/IdPayBeneficiaryDetailsScreen";
import { isGestureEnabled } from "../../../../utils/navigation";
import {
  IdPayInitiativeDetailsScreen,
  IdPayInitiativeDetailsScreenParams
} from "../screens/IdPayInitiativeDetailsScreen";
import {
  IdPayOperationsListScreenParams,
  IdPayOperationsListScreen
} from "../screens/IdPayOperationsListScreen";
import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";

export const IDPayDetailsRoutes = {
  IDPAY_DETAILS_MAIN: "IDPAY_DETAILS_MAIN",
  IDPAY_DETAILS_MONITORING: "IDPAY_DETAILS_MONITORING",
  IDPAY_DETAILS_TIMELINE: "IDPAY_DETAILS_TIMELINE",
  IDPAY_DETAILS_BENEFICIARY: "IDPAY_DETAILS_BENEFICIARY"
} as const;

export type IDPayDetailsParamsList = {
  [IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING]: IdPayInitiativeDetailsScreenParams;
  [IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE]: IdPayOperationsListScreenParams;
  [IDPayDetailsRoutes.IDPAY_DETAILS_BENEFICIARY]: IdPayBeneficiaryDetailsScreenParams;
};

const Stack = createStackNavigator<IDPayDetailsParamsList>();

export const IDpayDetailsNavigator = () => (
  <IdPayFeatureFlagGuard>
    <Stack.Navigator
      initialRouteName={IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
    >
      <Stack.Screen
        name={IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING}
        component={IdPayInitiativeDetailsScreen}
      />
      <Stack.Screen
        name={IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE}
        component={IdPayOperationsListScreen}
      />
      <Stack.Screen
        name={IDPayDetailsRoutes.IDPAY_DETAILS_BENEFICIARY}
        component={IdPayBeneficiaryDetailsScreen}
      />
    </Stack.Navigator>
  </IdPayFeatureFlagGuard>
);
