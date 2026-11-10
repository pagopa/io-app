import { AccessibilityInfo } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import {
  OneIdentityCieCardReaderProgressContent,
  OneIdentityCieCardReaderProgressContentProps
} from "../OneIdentityCieCardReaderProgressContent";

describe("OneIdentityCieCardReaderProgressContent", () => {
  const onPrimaryActionPress = jest.fn();
  const onSecondaryActionPress = jest.fn();

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

  it("should render both primary and secondary actions when provided", () => {
    const { getByText } = renderComponent({
      pictogram: "nfcScanAndroid",
      primaryAction: { label: "Primary", onPress: onPrimaryActionPress },
      secondaryAction: { label: "Secondary", onPress: onSecondaryActionPress },
      status: "idle",
      title: "a title"
    });

    expect(getByText("Primary")).toBeTruthy();
    expect(getByText("Secondary")).toBeTruthy();
  });

  it("should render only the primary action when the secondary one is missing", () => {
    const { getByText, queryByText } = renderComponent({
      pictogram: "nfcScanAndroid",
      primaryAction: { label: "Primary", onPress: onPrimaryActionPress },
      status: "idle",
      title: "a title"
    });

    expect(getByText("Primary")).toBeTruthy();
    expect(queryByText("Secondary")).toBeNull();
  });

  it("should render only the secondary action when the primary one is missing", () => {
    const { getByText, queryByText } = renderComponent({
      pictogram: "nfcScanAndroid",
      secondaryAction: { label: "Secondary", onPress: onSecondaryActionPress },
      status: "idle",
      title: "a title"
    });

    expect(queryByText("Primary")).toBeNull();
    expect(getByText("Secondary")).toBeTruthy();
  });

  it("should not render any action when neither is provided", () => {
    const { queryByText } = renderComponent({
      pictogram: "nfcScanAndroid",
      status: "idle",
      title: "a title"
    });

    expect(queryByText("Primary")).toBeNull();
    expect(queryByText("Secondary")).toBeNull();
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
