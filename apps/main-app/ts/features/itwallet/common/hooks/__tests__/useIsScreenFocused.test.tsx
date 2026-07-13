import { NavigationContext } from "@react-navigation/native";
import { act, renderHook } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { useIsScreenFocused } from "../useIsScreenFocused";

type FocusListener = () => void;

const createNavigationStub = (initialFocused: boolean) => {
  const addListener = jest.fn().mockReturnValue(() => undefined);
  const navigation = {
    isFocused: () => initialFocused,
    addListener
  };
  const getListener = (event: "focus" | "blur"): FocusListener =>
    addListener.mock.calls.find(([e]) => e === event)?.[1];
  return { navigation, getListener };
};

const wrapWith =
  (navigation: unknown) =>
  ({ children }: PropsWithChildren) => (
    <NavigationContext.Provider value={navigation as never}>
      {children}
    </NavigationContext.Provider>
  );

describe("useIsScreenFocused", () => {
  it("returns true when rendered without a navigation context", () => {
    const { result } = renderHook(() => useIsScreenFocused());
    expect(result.current).toBe(true);
  });

  it("reflects the initial focus state from navigation", () => {
    const { navigation } = createNavigationStub(false);
    const { result } = renderHook(() => useIsScreenFocused(), {
      wrapper: wrapWith(navigation)
    });
    expect(result.current).toBe(false);
  });

  it("updates when the screen gains or loses focus", () => {
    const { navigation, getListener } = createNavigationStub(false);
    const { result } = renderHook(() => useIsScreenFocused(), {
      wrapper: wrapWith(navigation)
    });

    act(() => getListener("focus")());
    expect(result.current).toBe(true);

    act(() => getListener("blur")());
    expect(result.current).toBe(false);
  });
});
