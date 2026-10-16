import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../utils/navigation";
import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
import {
  IdPayBeneficiaryDetailsScreen,
  IdPayBeneficiaryDetailsScreenParams
} from "../screens/IdPayBeneficiaryDetailsScreen";
import {
  IdPayInitiativeDetailsScreen,
  IdPayInitiativeDetailsScreenParams
} from "../screens/IdPayInitiativeDetailsScreen";
import {
  IdPayOperationsListScreen,
  IdPayOperationsListScreenParams
} from "../screens/IdPayOperationsListScreen";

export const IDPayDetailsRoutes = {
  IDPAY_DETAILS_MAIN: "IDPAY_DETAILS_MAIN",
  IDPAY_DETAILS_MONITORING: "IDPAY_DETAILS_MONITORING",
  IDPAY_DETAILS_TIMELINE: "IDPAY_DETAILS_TIMELINE",
  IDPAY_DETAILS_BENEFICIARY: "IDPAY_DETAILS_BENEFICIARY"
} as const;

export type IDPayDetailsParamsList = {
  [IDPayDetailsRoutes.IDPAY_DETAILS_BENEFICIARY]: IdPayBeneficiaryDetailsScreenParams;
  [IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING]: IdPayInitiativeDetailsScreenParams;
  [IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE]: IdPayOperationsListScreenParams;
};

const Stack = createStackNavigator<IDPayDetailsParamsList>();

export const IDpayDetailsNavigator = () => (
  <IdPayFeatureFlagGuard>
    <Stack.Navigator
      initialRouteName={IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
    >
      <Stack.Screen
        component={IdPayInitiativeDetailsScreen}
        name={IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING}
      />
      <Stack.Screen
        component={IdPayOperationsListScreen}
        name={IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE}
      />
      <Stack.Screen
        component={IdPayBeneficiaryDetailsScreen}
        name={IDPayDetailsRoutes.IDPAY_DETAILS_BENEFICIARY}
      />
    </Stack.Navigator>
  </IdPayFeatureFlagGuard>
);
