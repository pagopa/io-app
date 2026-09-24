import { AccessibilityInfo, Platform } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import {
  OneIdentityCieCardReaderProgressContent,
  OneIdentityCieCardReaderProgressContentProps
} from "../OneIdentityCieCardReaderProgressContent";

describe("OneIdentityCieCardReaderProgressContent", () => {
  const onPrimaryPress = jest.fn();
  const onSecondaryPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, "announceForAccessibility");
  });

  it("should render the title and, when provided, the subtitle", () => {
    const { getByText, queryByText } = renderComponent({
      pictogram: "nfcScanAndroid",
      status: "idle",
      subtitle: "a subtitle",
      title: "a title"
    });
    expect(getByText("a title")).toBeTruthy();
    expect(getByText("a subtitle")).toBeTruthy();
    expect(queryByText("a content")).toBeNull();
  });

  it("should not render a subtitle element when subtitle is undefined", () => {
    const { queryByText } = renderComponent({
      pictogram: "nfcScanAndroid",
      status: "idle",
      title: "a title"
    });
    expect(queryByText("undefined")).toBeNull();
  });

  it("should announce the content for accessibility when content is provided", () => {
    renderComponent({
      content: "content",
      pictogram: "nfcScanAndroid",
      status: "reading",
      title: "a title"
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      "content"
    );
  });

  it("should not announce anything for accessibility when content is not provided", () => {
    renderComponent({
      pictogram: "nfcScanAndroid",
      status: "idle",
      title: "a title"
    });

    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });

  describe("on Android", () => {
    beforeEach(() => {
      jest
        .spyOn(Platform, "select")
        .mockImplementation(
          (options: Record<string, unknown>) =>
            options.default ?? options.android
        );
    });

    it("should render only the primary action when both actions are provided", () => {
      const { getByText, queryByText } = renderComponent({
        pictogram: "nfcScanAndroid",
        primaryAction: { label: "Primary", onPress: onPrimaryPress },
        secondaryAction: { label: "Secondary", onPress: onSecondaryPress },
        status: "idle",
        title: "a title"
      });

      expect(getByText("Primary")).toBeTruthy();
      expect(queryByText("Secondary")).toBeNull();
    });

    it("should render nothing when no primary action is provided", () => {
      const { queryByText } = renderComponent({
        pictogram: "nfcScanAndroid",
        secondaryAction: { label: "Secondary", onPress: onSecondaryPress },
        status: "idle",
        title: "a title"
      });

      expect(queryByText("Secondary")).toBeNull();
    });
  });

  describe("on iOS", () => {
    beforeEach(() => {
      jest
        .spyOn(Platform, "select")
        .mockImplementation(
          (options: Record<string, unknown>) => options.ios ?? options.default
        );
    });

    it("should render both primary and secondary actions when provided", () => {
      const { getByText } = renderComponent({
        pictogram: "nfcScaniOS",
        primaryAction: { label: "Primary", onPress: onPrimaryPress },
        secondaryAction: { label: "Secondary", onPress: onSecondaryPress },
        status: "idle",
        title: "a title"
      });

      expect(getByText("Primary")).toBeTruthy();
      expect(getByText("Secondary")).toBeTruthy();
    });

    it("should render only the secondary action when the primary one is missing", () => {
      const { getByText, queryByText } = renderComponent({
        pictogram: "nfcScaniOS",
        secondaryAction: { label: "Secondary", onPress: onSecondaryPress },
        status: "idle",
        title: "a title"
      });

      expect(queryByText("Primary")).toBeNull();
      expect(getByText("Secondary")).toBeTruthy();
    });
  });
});

const renderComponent = (
  props: OneIdentityCieCardReaderProgressContentProps
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <OneIdentityCieCardReaderProgressContent {...props} />,
    "DUMMY",
    {},
    store
  );
};
