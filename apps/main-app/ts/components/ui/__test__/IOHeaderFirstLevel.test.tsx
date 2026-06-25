import { IOThemeContextProvider } from "@pagopa/io-app-design-system";
import { fireEvent, render } from "@testing-library/react-native";
import { View as MockView } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GuidedTour } from "../../../features/tour/components/GuidedTour";
import { IOHeaderFirstLevel } from "../IOHeaderFirstLevel";

jest.mock("../../../features/tour/components/GuidedTour", () => ({
  GuidedTour: jest.fn(({ children }) => (
    <MockView testID="guided-tour-wrapper">{children}</MockView>
  ))
}));

const mockGuidedTour = GuidedTour as jest.Mock;

describe("IOHeaderFirstLevel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("wraps only actions with tourGuideProps in GuidedTour", () => {
    const onPress = jest.fn();

    const { getByLabelText, getByTestId } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 320, height: 640 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 }
        }}
      >
        <IOThemeContextProvider theme="light">
          <IOHeaderFirstLevel
            title="Wallet"
            actions={[
              {
                icon: "add",
                accessibilityLabel: "Add",
                onPress,
                tourGuideProps: {
                  groupId: "itw",
                  index: 2,
                  title: "Add a credential",
                  description: "Use add"
                }
              },
              {
                icon: "help",
                accessibilityLabel: "Help",
                onPress: jest.fn()
              }
            ]}
          />
        </IOThemeContextProvider>
      </SafeAreaProvider>
    );

    expect(getByTestId("guided-tour-wrapper")).toBeTruthy();
    expect(mockGuidedTour).toHaveBeenCalledTimes(1);
    expect(mockGuidedTour).toHaveBeenCalledWith(
      expect.objectContaining({
        groupId: "itw",
        index: 2,
        title: "Add a credential",
        description: "Use add"
      }),
      undefined
    );

    fireEvent.press(getByLabelText("Add"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
