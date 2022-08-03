import { PathConfigMap } from "@react-navigation/core";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import CheckStatusRouterScreen from "../screens/voucherGeneration/CheckStatusRouterScreen";
import DisabledAdditionalInfoScreen from "../screens/voucherGeneration/DisabledAdditionalInfoScreen";
import SvCheckIncomeKoScreen from "../screens/voucherGeneration/ko/SvCheckIncomeKoScreen";
import SvCheckResidenceKoScreen from "../screens/voucherGeneration/ko/SvCheckResidenceKoScreen";
import SvGeneratedVoucherTimeoutScreen from "../screens/voucherGeneration/ko/SvGeneratedVoucherTimeoutScreen";
import SvSelectBeneficiaryCategoryKoScreen from "../screens/voucherGeneration/ko/SvSelectBeneficiaryCategoryKoScreen";
import SelectBeneficiaryCategoryScreen from "../screens/voucherGeneration/SelectBeneficiaryCategoryScreen";
import SelectFlightsDateScreen from "../screens/voucherGeneration/SelectFlightsDateScreen";
import SickCheckIncomeScreen from "../screens/voucherGeneration/SickCheckIncomeScreen";
import SickSelectDestinationScreen from "../screens/voucherGeneration/SickSelectDestinationScreen";
import StudentSelectDestinationScreen from "../screens/voucherGeneration/StudentSelectDestinationScreen";
import SummaryScreen from "../screens/voucherGeneration/SummaryScreen";
import VoucherGeneratedScreen from "../screens/voucherGeneration/VoucherGeneratedScreen";
import WorkerCheckIncomeScreen from "../screens/voucherGeneration/WorkerCheckIncomeScreen";
import WorkerSelectDestinationScreen from "../screens/voucherGeneration/WorkerSelectDestinationScreen";
import VoucherDetailsScreen from "../screens/voucherList/VoucherDetailsScreen";
import VoucherListScreen from "../screens/voucherList/VoucherListScreen";
import SV_ROUTES from "./routes";

export const svLinkingOptions: PathConfigMap = {
  [SV_ROUTES.VOUCHER_GENERATION.MAIN]: {
    path: "sv-generation",
    screens: {
      [SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS]: "check-status"
    }
  },
  [SV_ROUTES.VOUCHER_LIST.MAIN]: {
    path: "sv-vouchers",
    screens: {
      [SV_ROUTES.VOUCHER_LIST.LIST]: "list"
    }
  }
};

const ListStack = createStackNavigator();

export const SvVoucherListNavigator = () => (
  <ListStack.Navigator
    initialRouteName={SV_ROUTES.VOUCHER_LIST.LIST}
    headerMode="none"
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <ListStack.Screen
      name={SV_ROUTES.VOUCHER_LIST.LIST}
      component={VoucherListScreen}
    />
    <ListStack.Screen
      name={SV_ROUTES.VOUCHER_LIST.DETAILS}
      component={VoucherDetailsScreen}
    />
  </ListStack.Navigator>
);

const GenerationStack = createStackNavigator();

export const SvVoucherGenerationNavigator = () => (
  <GenerationStack.Navigator
    initialRouteName={SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS}
    headerMode="none"
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS}
      component={CheckStatusRouterScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.SELECT_BENEFICIARY_CATEGORY}
      component={SelectBeneficiaryCategoryScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.STUDENT_SELECT_DESTINATION}
      component={StudentSelectDestinationScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.DISABLED_ADDITIONAL_INFO}
      component={DisabledAdditionalInfoScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.WORKER_CHECK_INCOME_THRESHOLD}
      component={WorkerCheckIncomeScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.WORKER_SELECT_DESTINATION}
      component={WorkerSelectDestinationScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.SICK_CHECK_INCOME_THRESHOLD}
      component={SickCheckIncomeScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.SICK_SELECT_DESTINATION}
      component={SickSelectDestinationScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.SELECT_FLIGHTS_DATA}
      component={SelectFlightsDateScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.SUMMARY}
      component={SummaryScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.VOUCHER_GENERATED}
      component={VoucherGeneratedScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.KO_CHECK_RESIDENCE}
      component={SvCheckResidenceKoScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.KO_SELECT_BENEFICIARY_CATEGORY}
      component={SvSelectBeneficiaryCategoryKoScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.KO_CHECK_INCOME_THRESHOLD}
      component={SvCheckIncomeKoScreen}
    />
    <GenerationStack.Screen
      name={SV_ROUTES.VOUCHER_GENERATION.TIMEOUT_GENERATED_VOUCHER}
      component={SvGeneratedVoucherTimeoutScreen}
    />
  </GenerationStack.Navigator>
);
