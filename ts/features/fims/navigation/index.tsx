import { Route, useRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { useDispatch } from "react-redux";
import { isGestureEnabled } from "../../../utils/navigation";
import { fimsGetConsentsListAction } from "../store/actions";

export const FIMS_ROUTES = {
  MAIN: "FIMS_MAIN",
  CONSENTS: "FIMS_CONSENTS"
} as const;

export type FimsParamsList = {
  [FIMS_ROUTES.MAIN]: undefined;
  [FIMS_ROUTES.CONSENTS]: { ctaUrl: string };
};

const Stack = createStackNavigator<FimsParamsList>();

export const FimsNavigator = () => (
  <Stack.Navigator
    initialRouteName={FIMS_ROUTES.MAIN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen name={FIMS_ROUTES.CONSENTS} component={TestingFimsScreen} />
  </Stack.Navigator>
);

const TestingFimsScreen = () => {
  const routeProps = useRoute<Route<"FIMS_CONSENTS", { ctaUrl: string }>>();
  const { ctaUrl } = routeProps.params;
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (ctaUrl) {
      dispatch(fimsGetConsentsListAction.request({ ctaUrl }));
    }
  }, [ctaUrl, dispatch]);
  return <></>;
};
