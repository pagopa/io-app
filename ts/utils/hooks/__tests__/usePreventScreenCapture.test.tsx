import React from "react";
import { render } from "@testing-library/react-native";
import {
  enableSecureView,
  disableSecureView
} from "react-native-screenshot-prevent";
import { usePreventScreenCapture } from "../usePreventScreenCapture";

jest.mock("react-native-screenshot-prevent", () => ({
  enableSecureView: jest.fn(),
  disableSecureView: jest.fn()
}));

type Params = {
  key?: string;
};

const renderHook = ({ key }: Params = {}) => {
  const Component = () => {
    usePreventScreenCapture(key);
    return null;
  };
  return render(<Component />);
};

describe("usePreventScreenCapture", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls native methods once if mounted & unmounted", async () => {
    const { unmount } = renderHook();
    expect(enableSecureView).toHaveBeenCalledTimes(1);
    unmount();
    expect(disableSecureView).toHaveBeenCalledTimes(1);
  });

  it("does not re-allow screen capture when two hooks are active and one is unmounted", async () => {
    renderHook({ key: "A" });
    const hook2 = renderHook({ key: "B" });
    hook2.unmount();
    expect(enableSecureView).toHaveBeenCalledTimes(2);
    expect(disableSecureView).toHaveBeenCalledTimes(0);
  });
});
