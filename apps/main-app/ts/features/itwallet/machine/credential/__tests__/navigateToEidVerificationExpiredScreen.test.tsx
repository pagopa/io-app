import {
  createNavigationContainerRef,
  createNavigatorFactory,
  NavigationContainer,
  StackRouter,
  useNavigation,
  useNavigationBuilder
} from "@react-navigation/native";
import { act, render } from "@testing-library/react-native";
import { ReactNode, useEffect } from "react";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";
import { testCredentialIssuanceDeps } from "../../utils/testDeps";
import { navigateToEidVerificationExpiredScreenAction } from "../actions";
import { InitialContext } from "../context";

type ActionArgs = Parameters<
  typeof navigateToEidVerificationExpiredScreenAction
>[0];

const TestStack = createNavigatorFactory(
  ({
    children,
    initialRouteName
  }: {
    children: ReactNode;
    initialRouteName: string;
  }) => {
    const { state, descriptors, NavigationContent } = useNavigationBuilder(
      StackRouter,
      { children, initialRouteName }
    );
    return (
      <NavigationContent>
        {descriptors[state.routes[state.index].key].render()}
      </NavigationContent>
    );
  }
);

describe("navigateToEidVerificationExpiredScreenAction", () => {
  it("resets the ITW stack without remounting the ITW navigator", () => {
    const Root = TestStack();
    const Itw = TestStack();
    const onItwNavigatorMount = jest.fn();
    const rootNavigationRef = createNavigationContainerRef();
    const onItwRouteNavigation = jest.fn();

    const ItwNavigator = () => {
      onItwRouteNavigation(useNavigation());
      useEffect(onItwNavigatorMount, []);
      return (
        <Itw.Navigator initialRouteName={ITW_ROUTES.ONBOARDING}>
          {[
            ITW_ROUTES.ONBOARDING,
            ITW_ROUTES.L2_ONBOARDING,
            ITW_ROUTES.PRESENTATION.EID_VERIFICATION_EXPIRED
          ].map(name => (
            <Itw.Screen component={() => null} key={name} name={name} />
          ))}
        </Itw.Navigator>
      );
    };

    render(
      <NavigationContainer ref={rootNavigationRef}>
        <Root.Navigator initialRouteName={ITW_ROUTES.MAIN}>
          <Root.Screen component={ItwNavigator} name={ITW_ROUTES.MAIN} />
        </Root.Navigator>
      </NavigationContainer>
    );

    const itwRouteNavigation: ReturnType<typeof useIONavigation> =
      onItwRouteNavigation.mock.lastCall[0];

    act(() =>
      itwRouteNavigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.L2_ONBOARDING
      })
    );
    act(() =>
      navigateToEidVerificationExpiredScreenAction({
        context: {
          ...InitialContext,
          deps: testCredentialIssuanceDeps({ navigation: itwRouteNavigation })
        }
      } as unknown as ActionArgs)
    );

    expect(onItwNavigatorMount).toHaveBeenCalledTimes(1);
    expect(
      rootNavigationRef
        .getRootState()
        .routes[0].state?.routes.map(({ name }) => name)
    ).toEqual([ITW_ROUTES.PRESENTATION.EID_VERIFICATION_EXPIRED]);
  });
});
