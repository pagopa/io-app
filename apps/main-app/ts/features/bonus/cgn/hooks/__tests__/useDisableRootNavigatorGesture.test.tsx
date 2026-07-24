import { cleanup, render } from "@testing-library/react-native";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useDisableRootNavigatorGesture } from "../useDisableRootNavigatorGesture";

const setOptionsMock = jest.fn();
const getParentMock = jest.fn(() => ({
  setOptions: setOptionsMock
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: jest.fn(() => ({
    getParent: jest.fn(() => ({
      setOptions: jest.fn()
    }))
  }))
}));

const TestComponent = () => {
  useDisableRootNavigatorGesture();
  return null;
};

describe("useDisableRootNavigatorGesture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(cleanup);

  it("should disable gesture when mounted", () => {
    (useIONavigation as jest.Mock).mockReturnValue({
      getParent: getParentMock
    });

    render(<TestComponent />);

    expect(getParentMock).toHaveBeenCalled();
    expect(setOptionsMock).toHaveBeenCalledWith({ gestureEnabled: false });
  });

  it("should re-enable gesture when unmounted", () => {
    (useIONavigation as jest.Mock).mockReturnValue({
      getParent: getParentMock
    });

    const { unmount } = render(<TestComponent />);
    unmount();

    expect(setOptionsMock).toHaveBeenCalledWith({ gestureEnabled: true });
  });
});
