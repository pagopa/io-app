import { fireEvent, render } from "@testing-library/react-native";

import { LandingSessionExpiredComponent } from "../components/LandingSessionExpiredComponent";

const pictogramName = "identityCheck";
const title = "Session Expired";
const content = "Your session has expired. Please log in again.";
const buttonLinkLabel = "Log In";

describe("LandingSessionExpiredComponent", () => {
  it("renders correctly with required props", () => {
    const { getByText, queryByRole } = render(
      <LandingSessionExpiredComponent
        content={content}
        pictogramName={pictogramName}
        title={title}
      />
    );

    expect(getByText(title)).toBeTruthy();
    expect(getByText(content)).toBeTruthy();
    expect(queryByRole("button")).toBeNull();
  });

  it("renders correctly with optional props", () => {
    const { getByText, getByRole } = render(
      <LandingSessionExpiredComponent
        buttonLink={{
          label: buttonLinkLabel,
          onPress: jest.fn(),
          testID: "login-button"
        }}
        content={content}
        pictogramName={pictogramName}
        title={title}
      />
    );

    expect(getByText(title)).toBeTruthy();
    expect(getByText(content)).toBeTruthy();
    expect(getByRole("button")).toBeTruthy();
  });

  it("calls onPress when button link is clicked", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <LandingSessionExpiredComponent
        buttonLink={{
          label: buttonLinkLabel,
          onPress: onPressMock,
          testID: "login-button"
        }}
        content={content}
        pictogramName={pictogramName}
        title={title}
      />
    );

    const button = getByTestId("login-button");
    fireEvent.press(button);

    expect(onPressMock).toHaveBeenCalled();
  });
});
