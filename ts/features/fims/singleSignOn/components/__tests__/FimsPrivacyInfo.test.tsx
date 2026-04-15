import { render } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { FimsPrivacyInfo } from "../FimsPrivacyInfo";

const privacyUrl = "https://example.com/privacy";

describe("FimsPrivacyInfo component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders a properly formatted markdown link with privacyUrl", () => {
    const markdownLinkPattern = new RegExp(
      `\\[.+\\]\\(${privacyUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`
    );
    const { toJSON, getByText } = renderComponent({ privacyUrl });
    expect(getByText(markdownLinkPattern)).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it("render LoadingSkeleton when privacyUrl is undefined", () => {
    const { toJSON, getByTestId } = renderComponent({});
    expect(getByTestId("skeleton")).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (props: ComponentProps<typeof FimsPrivacyInfo>) =>
  render(<FimsPrivacyInfo {...props} />);
