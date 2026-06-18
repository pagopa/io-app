import { fireEvent, render } from "@testing-library/react-native";
import { Body } from "@pagopa/io-app-design-system";
import {
  WhatsNewScreenContent,
  WhatsNewScreenContentProps
} from "../WhatsNewScreenContent";

const mockPrimaryAction = jest.fn();
const mockSecondaryAction = jest.fn();

const defaultProps: WhatsNewScreenContentProps = {
  title: "title",
  pictogram: "message",
  badge: {
    text: "badge",
    variant: "highlight"
  },
  action: {
    label: "click me",
    testID: "primaryActionID",
    onPress: mockPrimaryAction
  },
  secondaryAction: {
    label: "click me",
    testID: "secondaryActionID",
    onPress: mockSecondaryAction
  }
};

describe("WhatsNewScreenContent", () => {
  beforeEach(jest.clearAllMocks);

  it("should match the snapshots", () => {
    expect(renderComponent()).toMatchSnapshot();
  });

  it("should properly call the primary action", () => {
    const { getByTestId } = renderComponent();

    const primaryAction = getByTestId("primaryActionID");
    fireEvent.press(primaryAction);

    expect(mockPrimaryAction).toHaveBeenCalledTimes(1);
    expect(mockSecondaryAction).not.toHaveBeenCalled();
  });
  it("should properly call the secondary action", () => {
    const { getByTestId } = renderComponent();

    const secondaryAction = getByTestId("secondaryActionID");
    fireEvent.press(secondaryAction);

    expect(mockSecondaryAction).toHaveBeenCalledTimes(1);
    expect(mockPrimaryAction).not.toHaveBeenCalled();
  });
});

function renderComponent(customProps?: Partial<WhatsNewScreenContentProps>) {
  return render(
    <WhatsNewScreenContent {...Object.assign({}, defaultProps, customProps)}>
      <Body>content</Body>
    </WhatsNewScreenContent>
  );
}
