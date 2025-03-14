import { fireEvent, render } from "@testing-library/react-native";
import {
  BTN_CLOSE_TEST_ID,
  BTN_UPDATE_TEST_ID,
  PageNotFound
} from "../screens";
import * as url from "../../../utils/url";

const mockPopToTop = jest.fn();
const mockOpenAppStoreUrl = jest.fn();

jest.mock("../../../navigation/params/AppParamsList", () => ({
  useIONavigation() {
    return {
      popToTop: mockPopToTop
    };
  }
}));

jest.spyOn(url, "openAppStoreUrl").mockImplementation(mockOpenAppStoreUrl);

describe(PageNotFound, () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(<PageNotFound />);

    expect(component).toMatchSnapshot();
  });
  it("Should call openAppStoreUrl", () => {
    const { getByTestId } = render(<PageNotFound />);

    const btnUpdate = getByTestId(BTN_UPDATE_TEST_ID);
    fireEvent.press(btnUpdate);

    expect(mockOpenAppStoreUrl).toHaveBeenCalledTimes(1);
    expect(mockPopToTop).not.toHaveBeenCalled();
  });
  it("Should call popToTop", () => {
    const { getByTestId } = render(<PageNotFound />);

    const btnClose = getByTestId(BTN_CLOSE_TEST_ID);
    fireEvent.press(btnClose);

    expect(mockPopToTop).toHaveBeenCalledTimes(1);
    expect(mockOpenAppStoreUrl).not.toHaveBeenCalled();
  });
});
