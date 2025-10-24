import { CaptureProtection } from "react-native-capture-protection";
import { createStore } from "redux";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../testWrapper";
import { usePreventScreenCapture } from "../usePreventScreenCapture";

jest.mock("../../environment", () => ({
  ...jest.requireActual("../../environment"),
  isDevEnv: false
}));

jest.mock("react-native-capture-protection", () => ({
  CaptureProtection: {
    prevent: jest.fn(),
    allow: jest.fn()
  }
}));

describe("usePreventScreenCapture", () => {
  jest.useFakeTimers();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls native methods once if mounted & unmounted", async () => {
    const { unmount } = renderHook();
    expect(CaptureProtection.prevent).toHaveBeenCalledTimes(1);
    unmount();
    jest.advanceTimersByTime(500);
    expect(CaptureProtection.allow).toHaveBeenCalledTimes(1);
  });

  it("does not re-allow screen capture when two hooks are active and one is unmounted", async () => {
    renderHook({ key: "A" });
    const hook2 = renderHook({ key: "B" });
    hook2.unmount();
    jest.advanceTimersByTime(500);
    expect(CaptureProtection.prevent).toHaveBeenCalledTimes(2);
    expect(CaptureProtection.allow).toHaveBeenCalledTimes(0);
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
