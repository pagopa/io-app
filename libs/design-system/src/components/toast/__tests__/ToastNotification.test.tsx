import { render } from "@testing-library/react-native";

import { renderWithExperimentalEnabledContextProvider } from "../../../utils/testing";
import { ToastNotification } from "../ToastNotification";
import { Toast } from "../types";

describe("Test ToastNotification component", () => {
  it.each([
    { name: "error", variant: "error" },
    { name: "info", variant: "info" },
    { name: "success", variant: "success" },
    { name: "warning", variant: "warning" }
  ] as const)(
    "keeps $name feedback visible but outside the accessibility tree",
    ({ variant }) => {
      const message = "Action feedback";
      const { getByText, queryByText, toJSON } = render(
        <ToastNotification
          icon="checkTick"
          message={message}
          variant={variant}
        />
      );

      expect(getByText(message, { includeHiddenElements: true })).toBeTruthy();
      expect(queryByText(message)).toBeNull();
      expect(toJSON()).toMatchObject({
        props: {
          accessibilityElementsHidden: true,
          accessible: false,
          importantForAccessibility: "no-hide-descendants"
        }
      });
    }
  );

  it.each<Toast>([
    { message: "Hello", icon: "checkTick", variant: "info" },
    { message: "Hello", variant: "error" },
    { message: "Hello", variant: "info" },
    { message: "Hello", variant: "success" },
    { message: "Hello", variant: "warning" }
  ])("should match snapshot for props (%s)", toast => {
    const { toJSON } = render(<ToastNotification {...toast} />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe("Test ToastNotification component - Experimental Enabled", () => {
  it.each<Toast>([
    { message: "Hello", icon: "checkTick", variant: "info" },
    { message: "Hello", variant: "error" },
    { message: "Hello", variant: "info" },
    { message: "Hello", variant: "success" },
    { message: "Hello", variant: "warning" }
  ])("should match snapshot for props (%s)", toast => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ToastNotification {...toast} />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
