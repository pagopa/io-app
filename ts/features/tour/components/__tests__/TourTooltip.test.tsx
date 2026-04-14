import { IOThemeContextProvider } from "@pagopa/io-app-design-system";
import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { useSharedValue } from "react-native-reanimated";
import { TourTooltip } from "../TourTooltip";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ width: 375, height: 812, x: 0, y: 0 })
}));

type Props = {
  stepIndex?: number;
  totalSteps?: number;
  title?: string;
  description?: string;
  onNext?: jest.Mock;
  onBack?: jest.Mock;
  onSkip?: jest.Mock;
};

const TestWrapper = ({
  stepIndex = 0,
  totalSteps = 3,
  title = "Test Title",
  description = "Test description",
  onNext = jest.fn(),
  onBack = jest.fn(),
  onSkip = jest.fn()
}: Props) => {
  const cutoutX = useSharedValue(100);
  const cutoutY = useSharedValue(200);
  const cutoutW = useSharedValue(150);
  const cutoutH = useSharedValue(50);
  const opacity = useSharedValue(1);

  return (
    <IOThemeContextProvider theme="light">
      <TourTooltip
        cutoutX={cutoutX}
        cutoutY={cutoutY}
        cutoutW={cutoutW}
        cutoutH={cutoutH}
        title={title}
        description={description}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        opacity={opacity}
        onNext={onNext}
        onBack={onBack}
        onSkip={onSkip}
      />
    </IOThemeContextProvider>
  );
};

const renderTooltip = (props: Props = {}) => render(<TestWrapper {...props} />);

type TestInstance = ReturnType<ReturnType<typeof render>["getByLabelText"]>;

/** Recursively walks ancestors looking for a View with `opacity: 0`. */
const ancestorHasOpacityZero = (element: TestInstance, depth = 6): boolean => {
  if (depth === 0 || !element.parent) {
    return false;
  }
  const style = element.parent.props?.style as { opacity?: number } | undefined;
  if (style && !Array.isArray(style) && style.opacity === 0) {
    return true;
  }
  return ancestorHasOpacityZero(element.parent, depth - 1);
};

describe("TourTooltip", () => {
  describe("content rendering", () => {
    it("shows the title", () => {
      const { getByText } = renderTooltip({ title: "Step Title" });
      expect(getByText("Step Title")).toBeTruthy();
    });

    it("shows the description", () => {
      const { getByText } = renderTooltip({
        description: "Step description text"
      });
      expect(getByText("Step description text")).toBeTruthy();
    });
  });

  describe("navigation buttons label", () => {
    it('shows "next" label when not on the last step', () => {
      const { getByText } = renderTooltip({ stepIndex: 0, totalSteps: 3 });
      expect(getByText(I18n.t("features.tour.next"))).toBeTruthy();
    });

    it('shows "done" label on the last step', () => {
      const { getByText } = renderTooltip({ stepIndex: 2, totalSteps: 3 });
      expect(getByText(I18n.t("features.tour.done"))).toBeTruthy();
    });
  });

  describe("interactions", () => {
    it("calls onNext when the next button is pressed", () => {
      const onNext = jest.fn();
      const { getByText } = renderTooltip({
        stepIndex: 0,
        totalSteps: 3,
        onNext
      });
      fireEvent.press(getByText(I18n.t("features.tour.next")));
      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it("calls onBack when the back button is pressed", () => {
      const onBack = jest.fn();
      const { getByLabelText } = renderTooltip({
        stepIndex: 1,
        totalSteps: 3,
        onBack
      });
      fireEvent.press(getByLabelText(I18n.t("features.tour.back")));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("calls onSkip when the close button is pressed", () => {
      const onSkip = jest.fn();
      const { getByLabelText } = renderTooltip({ onSkip });
      fireEvent.press(getByLabelText(I18n.t("features.tour.skip")));
      expect(onSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe("back button visibility", () => {
    it("has the back button hidden (opacity 0) on the first step", () => {
      const { getByLabelText } = renderTooltip({ stepIndex: 0, totalSteps: 3 });
      expect(
        ancestorHasOpacityZero(getByLabelText(I18n.t("features.tour.back")))
      ).toBe(true);
    });

    it("has the back button visible on steps after the first", () => {
      const { getByLabelText } = renderTooltip({ stepIndex: 1, totalSteps: 3 });
      expect(
        ancestorHasOpacityZero(getByLabelText(I18n.t("features.tour.back")))
      ).toBe(false);
    });
  });

  describe("snapshot", () => {
    it("matches snapshot for first step", () => {
      const { toJSON } = renderTooltip({
        stepIndex: 0,
        totalSteps: 3,
        title: "Title",
        description: "Description"
      });
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot for last step", () => {
      const { toJSON } = renderTooltip({
        stepIndex: 2,
        totalSteps: 3,
        title: "Last Step",
        description: "Final description"
      });
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
