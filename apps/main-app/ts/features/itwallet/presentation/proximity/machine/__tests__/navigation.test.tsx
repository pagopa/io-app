import {
  createNavigationContainerRef,
  NavigationContainer,
  NavigationState
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { act, render } from "@testing-library/react-native";
import { AccessibilityInfo, View } from "react-native";

import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import {
  navigateToBluetoothPermissionsScreenAction,
  navigateToNfcActivationScreenAction,
  navigateToPresentmentScreenAction
} from "../actions";

const RootStack = createStackNavigator();
const ProximityStack = createStackNavigator();
const EmptyScreen = () => <View />;
const screenOptions = { animation: "none", headerShown: false } as const;

const renderProximityNavigator = () => {
  const navigationRef = createNavigationContainerRef();
  const deps = { navigation: undefined as unknown };

  const ProximityNavigator = ({ navigation }: { navigation: unknown }) => {
    // eslint-disable-next-line functional/immutable-data
    deps.navigation = navigation;
    return (
      <ProximityStack.Navigator screenOptions={screenOptions}>
        <ProximityStack.Screen
          component={EmptyScreen}
          initialParams={{ source: "wallet" }}
          name={ITW_PROXIMITY_ROUTES.PRESENTMENT}
        />
        <ProximityStack.Screen
          component={EmptyScreen}
          name={ITW_PROXIMITY_ROUTES.BLUETOOTH_PERMISSIONS}
        />
        <ProximityStack.Screen
          component={EmptyScreen}
          name={ITW_PROXIMITY_ROUTES.NFC_ACTIVATION}
        />
      </ProximityStack.Navigator>
    );
  };

  render(
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={screenOptions}>
        <RootStack.Screen
          component={ProximityNavigator}
          name={ITW_PROXIMITY_ROUTES.MAIN}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );

  const dispatch = (action: (args: any) => void) =>
    act(() => action({ context: { deps } }));

  const proximityRoutes = () =>
    (navigationRef.getRootState().routes[0].state as NavigationState).routes;

  return { dispatch, proximityRoutes };
};

describe("navigateToPresentmentScreenAction", () => {
  beforeEach(() => {
    jest
      .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
      .mockResolvedValue(false);
  });

  it.each([
    {
      name: "bluetooth permissions",
      action: navigateToBluetoothPermissionsScreenAction
    },
    { name: "NFC activation", action: navigateToNfcActivationScreenAction }
  ])(
    "pops back to the existing presentment screen from $name",
    ({ action }) => {
      const { dispatch, proximityRoutes } = renderProximityNavigator();

      dispatch(action);
      expect(proximityRoutes()).toHaveLength(2);

      dispatch(navigateToPresentmentScreenAction);
      expect(proximityRoutes()).toEqual([
        expect.objectContaining({
          name: ITW_PROXIMITY_ROUTES.PRESENTMENT,
          params: { source: "wallet" }
        })
      ]);
    }
  );
});
