import { fireEvent, render } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import * as UTILS_URL from "../../../../../utils/url";
import { FimsPrivacyInfo } from "../FimsPrivacyInfo";

const privacyUrl = "https://example.com/privacy";
const mockOpenUrl = jest.spyOn(UTILS_URL, "openWebUrl");

describe("FimsPrivacyInfo component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with privacyUrl defined", () => {
    const { toJSON, getByTestId } = renderComponent({ privacyUrl });
    expect(getByTestId("body-primary-action")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("render LoadingSkeleton when privacyUrl is undefined", () => {
    const { toJSON, getByTestId } = renderComponent({});
    expect(getByTestId("skeleton")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("calls openWebUrl with correct URL on press", () => {
    const { getByTestId } = renderComponent({ privacyUrl });
    expect(mockOpenUrl).toHaveBeenCalledTimes(0);

    const link = getByTestId("body-primary-action");
    fireEvent.press(link);

    expect(mockOpenUrl).toHaveBeenCalledWith(privacyUrl);
    expect(mockOpenUrl).toHaveBeenCalledTimes(1);
  });
});

const renderComponent = (props: ComponentProps<typeof FimsPrivacyInfo>) =>
  render(<FimsPrivacyInfo {...props} />);
