import { CommonActions, StackActions } from "@react-navigation/native";

import { isBackNavigationAction } from "../navigation";

describe("isBackNavigationAction", () => {
  test.each([
    { name: "goBack", action: CommonActions.goBack(), expected: true },
    { name: "pop", action: StackActions.pop(), expected: true },
    { name: "popTo", action: StackActions.popTo("ROUTE"), expected: false },
    { name: "popToTop", action: StackActions.popToTop(), expected: false },
    {
      name: "replace",
      action: StackActions.replace("ROUTE"),
      expected: false
    },
    {
      name: "reset",
      action: CommonActions.reset({ index: 0, routes: [{ name: "ROUTE" }] }),
      expected: false
    },
    {
      name: "navigate with pop",
      action: CommonActions.navigate({ name: "ROUTE", pop: true }),
      expected: false
    }
  ])("returns $expected for $name", ({ action, expected }) => {
    expect(isBackNavigationAction(action)).toBe(expected);
  });
});
