import { none, some } from "fp-ts/lib/Option";
import { NavigationRoute } from "react-navigation";
import { getRouteName } from "../navigation";

describe("Test navigation utils", () => {
  const navRouteOK = {
    index: 0,
    isTransitioning: false,
    key: "StackRouterRoot",
    routes: [
      {
        index: 0,
        isTransitioning: false,
        key: "MESSAGES_NAVIGATOR",
        params: undefined,
        routeName: "MESSAGES_NAVIGATOR",
        routes: [
          {
            key: "id-1588000867273-1",
            routeName: "MESSAGES_HOME"
          } as NavigationRoute
        ]
      }
    ]
  } as NavigationRoute;

  const navRouteKO = {
    index: 0,
    isTransitioning: false,
    key: "StackRouterRoot",
    routes: [
      {
        isTransitioning: false,
        key: "MESSAGES_NAVIGATOR",
        params: undefined
      }
    ]
  } as NavigationRoute;

  it("getRouteName return the name of the route", () => {
    expect(getRouteName(navRouteOK)).toStrictEqual(some("MESSAGES_HOME"));
  });

  it("getRouteName return none if navigation route bad formatted", () => {
    expect(getRouteName(navRouteKO)).toBe(none);
  });
});
