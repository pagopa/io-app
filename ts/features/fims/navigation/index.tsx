import * as pot from "@pagopa/ts-commons/lib/pot";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { isGestureEnabled } from "../../../utils/navigation";
import {
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenBrowserAction
} from "../store/actions";
import { fimsConsentsSelector } from "../store/selectors";

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

  const consents = pot.getOrElse(useSelector(fimsConsentsSelector), undefined);
  const navigation = useNavigation();

  React.useEffect(() => {
    if (ctaUrl) {
      dispatch(fimsGetConsentsListAction.request({ ctaUrl }));
    }
  }, [ctaUrl, dispatch]);
  if (consents === undefined) {
    return <LoadingScreenContent contentTitle="loading..." />;
  } else {
    const parsedGrants: Array<string> = JSON.parse(consents.body).grants;
    return (
      <OperationResultScreenContent
        title={`grant ${parsedGrants.join(",")} ?`}
        action={{
          label: "accept",
          onPress: () =>
            dispatch(
              fimsGetRedirectUrlAndOpenBrowserAction.request({
                acceptUrl: consents.headers["confirm-url"]
              })
            )
        }}
        secondaryAction={{
          label: "deny",
          onPress: () => navigation.goBack() // TODO::: clear store on back nav
        }}
      />
    );
  }
};
