import {
  enableSecureView,
  disableSecureView
} from "react-native-screenshot-prevent";
import { createStore } from "redux";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../testWrapper";
import { usePreventScreenCapture } from "../usePreventScreenCapture";

jest.mock("react-native-screenshot-prevent", () => ({
  enableSecureView: jest.fn(),
  disableSecureView: jest.fn()
}));

describe("usePreventScreenCapture", () => {
  jest.useFakeTimers();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls native methods once if mounted & unmounted", async () => {
    const { unmount } = renderHook();
    expect(enableSecureView).toHaveBeenCalledTimes(1);
    unmount();
    jest.advanceTimersByTime(500);
    expect(disableSecureView).toHaveBeenCalledTimes(1);
  });

  it("does not re-allow screen capture when two hooks are active and one is unmounted", async () => {
    renderHook({ key: "A" });
    const hook2 = renderHook({ key: "B" });
    hook2.unmount();
    jest.advanceTimersByTime(500);
    expect(enableSecureView).toHaveBeenCalledTimes(2);
    expect(disableSecureView).toHaveBeenCalledTimes(0);
  });
});

type Params = { key?: string };

const renderHook = ({ key }: Params = {}) => {
  const Component = () => {
    usePreventScreenCapture(key);
    return null;
  };
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext(
    Component,
    "TEST",
    {},
    createStore(appReducer, globalState as any)
  );
};
