import { IOThemeContextProvider } from "@io-app/design-system";
import { render } from "@testing-library/react-native";
import I18n from "i18next";

import { TourStepIndicator } from "../TourStepIndicator";

const renderIndicator = (stepIndex: number, totalSteps: number) =>
  render(
    <IOThemeContextProvider theme="light">
      <TourStepIndicator stepIndex={stepIndex} totalSteps={totalSteps} />
    </IOThemeContextProvider>
  );

describe("TourStepIndicator", () => {
  describe("accessibility", () => {
    it("sets the correct accessibilityLabel for the first step", () => {
      const { getByLabelText } = renderIndicator(0, 3);
      const expectedLabel = I18n.t("features.tour.stepIndicator", {
        current: 1,
        total: 3
      });
      expect(getByLabelText(expectedLabel)).toBeTruthy();
    });

    it("sets the correct accessibilityLabel for a middle step", () => {
      const { getByLabelText } = renderIndicator(1, 5);
      const expectedLabel = I18n.t("features.tour.stepIndicator", {
        current: 2,
        total: 5
      });
      expect(getByLabelText(expectedLabel)).toBeTruthy();
    });

    it("sets the correct accessibilityLabel for the last step", () => {
      const { getByLabelText } = renderIndicator(2, 3);
      const expectedLabel = I18n.t("features.tour.stepIndicator", {
        current: 3,
        total: 3
      });
      expect(getByLabelText(expectedLabel)).toBeTruthy();
    });
  });

  describe("rendering dots", () => {
    it("matches snapshot for 3 steps at index 0", () => {
      const { toJSON } = renderIndicator(0, 3);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot for 3 steps at index 2 (last)", () => {
      const { toJSON } = renderIndicator(2, 3);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe("edge cases", () => {
    it("renders correctly with a single step", () => {
      const { getByLabelText } = renderIndicator(0, 1);
      const label = I18n.t("features.tour.stepIndicator", {
        current: 1,
        total: 1
      });
      expect(getByLabelText(label)).toBeTruthy();
    });
  });
});
