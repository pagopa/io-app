/* eslint-disable functional/no-let */
import { BackHandler } from "react-native";
import { renderHook, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { PropsWithChildren } from "react";
import { useHardwareBackButtonWhenFocused } from "../useHardwareBackButton";

const Wrapper = ({ children }: PropsWithChildren) => (
  <NavigationContainer>{children}</NavigationContainer>
);

describe("useHardwareBackButtonWhenFocused", () => {
  let cleanupFunction = jest.fn();
  const mockSubscription = { remove: cleanupFunction };

  beforeEach(() => {
    jest.clearAllMocks();
    cleanupFunction = jest.fn();
  });

  it("should add listener only on first render", async () => {
    const spyOnBackHandlerListener = jest
      .spyOn(BackHandler, "addEventListener")
      .mockReturnValue(mockSubscription);

    const { rerender } = renderHook(useHardwareBackButtonWhenFocused, {
      initialProps: jest.fn(() => true),
      wrapper: Wrapper
    });

    await waitFor(async () => {
      expect(spyOnBackHandlerListener).toHaveBeenCalled();
      expect(spyOnBackHandlerListener).toHaveBeenCalledWith(
        "hardwareBackPress",
        expect.any(Function)
      );
    });

    spyOnBackHandlerListener.mockClear();

    rerender(jest.fn(() => false));

    expect(spyOnBackHandlerListener).not.toHaveBeenCalled();
  });
  it("should invoke the latest handler even if the listener is not re-registered", () => {
    const spyOnBackHandlerListener = jest.spyOn(
      BackHandler,
      "addEventListener"
    );
    const handler1 = jest.fn(() => true);
    const handler2 = jest.fn(() => false);

    const { rerender } = renderHook(useHardwareBackButtonWhenFocused, {
      initialProps: handler1,
      wrapper: Wrapper
    });

    // Neither handler1 nor handler2 should be called
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();

    const listenerCallsBeforeReRender = spyOnBackHandlerListener.mock.calls;
    const registeredCallbackBeforeReRender =
      spyOnBackHandlerListener.mock.calls[0][1];
    const result1 = registeredCallbackBeforeReRender();

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();
    expect(result1).toBe(true);

    // Cleared handler1 post-test success
    handler1.mockClear();

    rerender(handler2);

    const listenerCallsAfterReRender = spyOnBackHandlerListener.mock.calls;

    const registeredCallbackAfterReRender =
      spyOnBackHandlerListener.mock.calls[0][1];
    const result2 = registeredCallbackAfterReRender();

    expect(listenerCallsBeforeReRender).toBe(listenerCallsAfterReRender);
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(result2).toBe(false);
  });
});
