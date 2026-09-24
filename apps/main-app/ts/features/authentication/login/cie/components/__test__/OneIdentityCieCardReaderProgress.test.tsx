import { render } from "@testing-library/react-native";
import I18n from "i18next";

import { OneIdentityCieCardReaderProgress } from "../OneIdentityCieCardReaderProgress";
import { OneIdentityCieCardReaderProgressContentProps } from "../OneIdentityCieCardReaderProgressContent";

// eslint-disable-next-line functional/no-let
let mockIsIos = false;
jest.mock("../../../../../../utils/platform", () => ({
  get isIos() {
    return mockIsIos;
  }
}));

jest.mock("../OneIdentityCieCardReaderProgressContent", () => ({
  OneIdentityCieCardReaderProgressContent: (props: Record<string, unknown>) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, {
      testID: "ProgressContent",
      ...props
    });
  }
}));

describe("OneIdentityCieCardReaderProgress", () => {
  const mockCancel = jest.fn();
  const mockRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsIos = false;
  });

  describe.each([
    ["Android", false],
    ["iOS", true]
  ] as const)("on %s", (_platformName, isIos) => {
    beforeEach(() => {
      mockIsIos = isIos;
    });

    it("should render idle status with the localized idle content", () => {
      const { getByTestId } = render(
        <OneIdentityCieCardReaderProgress
          onCancel={mockCancel}
          onRetry={mockRetry}
          state={{ status: "idle" }}
        />
      );
      const props = getByTestId("ProgressContent")
        .props as OneIdentityCieCardReaderProgressContentProps;

      expect(props.status).toBe("idle");
      expect(props.title).toBe(
        I18n.t(
          isIos
            ? "authentication.cie.card.titleiOS"
            : "authentication.cie.card.title"
        )
      );
    });

    it("should render reading status with the localized reading content", () => {
      const { getByTestId } = render(
        <OneIdentityCieCardReaderProgress
          onCancel={mockCancel}
          onRetry={mockRetry}
          state={{ status: "reading" }}
        />
      );

      const props = getByTestId("ProgressContent")
        .props as OneIdentityCieCardReaderProgressContentProps;

      expect(props.status).toBe("reading");
      expect(props.title).toBe(
        I18n.t("authentication.cie.card.readerCardTitle")
      );
    });

    it("should render error status with the localized message as content on Android only", () => {
      const { getByTestId } = render(
        <OneIdentityCieCardReaderProgress
          onCancel={mockCancel}
          onRetry={mockRetry}
          state={{ status: "reading-failure", failure: "boom" }}
        />
      );

      const props = getByTestId("ProgressContent")
        .props as OneIdentityCieCardReaderProgressContentProps;

      expect(props.status).toBe("error");
      expect(props.content).toBe(
        isIos ? undefined : I18n.t("authentication.cie.card.error.generic")
      );
    });

    it("should render success status without actions", () => {
      const { getByTestId } = render(
        <OneIdentityCieCardReaderProgress
          onCancel={mockCancel}
          onRetry={mockRetry}
          state={{ status: "success" }}
        />
      );

      const props = getByTestId("ProgressContent")
        .props as OneIdentityCieCardReaderProgressContentProps;

      expect(props.status).toBe("success");
      expect(props.primaryAction).toBeUndefined();
      expect(props.secondaryAction).toBeUndefined();
    });

    it(`should ${isIos ? "include" : "omit"} the primary retry action for non-success statuses`, () => {
      const { getByTestId } = render(
        <OneIdentityCieCardReaderProgress
          onCancel={mockCancel}
          onRetry={mockRetry}
          state={{ status: "idle" }}
        />
      );

      const props = getByTestId("ProgressContent")
        .props as OneIdentityCieCardReaderProgressContentProps;

      if (isIos) {
        expect(props?.primaryAction?.label).toBe(
          I18n.t("authentication.cie.nfc.retry")
        );
      } else {
        expect(props?.primaryAction).toBeUndefined();
      }
      expect(props?.secondaryAction?.label).toBe(
        I18n.t("global.buttons.close")
      );
    });
  });
});
