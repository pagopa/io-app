import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../utils/navigation";
import PaymentsMethodDetailsScreen from "../screens/PaymentsMethodDetailsScreen";
import { PaymentsMethodDetailsParamsList } from "./params";
import { PaymentsMethodDetailsRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsMethodDetailsParamsList>();

export const PaymentsMethodDetailsNavigator = () => (
  <Stack.Navigator
    initialRouteName={PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN}
      component={PaymentsMethodDetailsScreen}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />
  </Stack.Navigator>
);

export type PaymentsMethodDetailsStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<PaymentsMethodDetailsParamsList & ParamList, RouteName>;

export type PaymentsMethodDetailsStackNavigation =
  PaymentsMethodDetailsStackNavigationProp<
    PaymentsMethodDetailsParamsList,
    keyof PaymentsMethodDetailsParamsList
  >;
