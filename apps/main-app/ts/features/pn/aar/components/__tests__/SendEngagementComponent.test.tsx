import { IOMaxFontSizeMultiplier } from "@io-app/design-system";
import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import { Dimensions } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import { SendEngagementComponent } from "../SendEngagementComponent";

const testPrivacyUrl = "https://a.privacy.url";
const testTOSUrl = "https://a.tos.url";

describe("SendEngagmentComponent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  [false, true].forEach(loading =>
    it(`should match snapshot when ${loading ? "" : "not "}loading`, () => {
      const component = renderComponent(
        loading,
        () => undefined,
        () => undefined
      );
      expect(component.toJSON()).toMatchSnapshot();
    })
  );
  [false, true].forEach(loading =>
    it(`should call input onClose method when the close header is pressed and is ${
      loading ? "" : "not "
    }loading`, () => {
      const onClose = jest.fn();
      const onPrimaryAction = jest.fn();

      const component = renderComponent(loading, onClose, onPrimaryAction);

      const closeIconButton = component.getByTestId("close-button");
      fireEvent.press(closeIconButton);

      expect(onClose.mock.calls.length).toBe(1);
      expect(onClose.mock.calls[0].length).toBe(0);
      expect(onPrimaryAction.mock.calls.length).toBe(0);
    })
  );
  [false, true].forEach(loading =>
    it(`should ${
      loading ? "" : "not "
    }call input onPrimaryAction method when the primary action is pressed while ${
      loading ? "" : "not "
    }loading`, () => {
      const onClose = jest.fn();
      const onPrimaryAction = jest.fn();

      const component = renderComponent(loading, onClose, onPrimaryAction);

      const primaryAction = component.getByTestId("primary-action");
      fireEvent.press(primaryAction);

      if (loading) {
        expect(onPrimaryAction.mock.calls.length).toBe(0);
      } else {
        expect(onPrimaryAction.mock.calls.length).toBe(1);
        expect(onPrimaryAction.mock.calls[0].length).toBe(1);
      }
      expect(onClose.mock.calls.length).toBe(0);
    })
  );
  it("should contain properly formatted markdown links in the footer", () => {
    const component = renderComponent(
      false,
      () => undefined,
      () => undefined
    );
    const markdownLinkPattern = (url: string) =>
      new RegExp(`\\[.+\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`);
    expect(
      component.getByText(markdownLinkPattern(testPrivacyUrl))
    ).toBeTruthy();
    expect(component.getByText(markdownLinkPattern(testTOSUrl))).toBeTruthy();
  });

  describe("Pictogram visibility based on screen size and font scale", () => {
    // IOMaxFontSizeMultiplier = 1.5
    // MIN_HEIGHT_TO_SHOW_FULL_RENDER = 800
    // Pictogram should be visible when: height >= 800 AND fontScale <= IOMaxFontSizeMultiplier

    it("should SHOW pictogram on large screen with max allowed font scale (height >= MIN_HEIGHT_TO_SHOW_FULL_RENDER, fontScale <= IOMaxFontSizeMultiplier)", () => {
      jest.spyOn(Dimensions, "get").mockReturnValue({
        width: 414,
        height: 896,
        scale: 1,
        fontScale: IOMaxFontSizeMultiplier
      });

      const component = renderComponent(
        false,
        () => undefined,
        () => undefined
      );

      expect(component.queryByTestId("pictogram-test")).toBeTruthy();
    });

    it("should HIDE pictogram on small screen even with default font (height < MIN_HEIGHT_TO_SHOW_FULL_RENDER, fontScale <= IOMaxFontSizeMultiplier)", () => {
      jest.spyOn(Dimensions, "get").mockReturnValue({
        width: 375,
        height: 667,
        scale: 1,
        fontScale: IOMaxFontSizeMultiplier
      });

      const component = renderComponent(
        false,
        () => undefined,
        () => undefined
      );

      expect(component.queryByTestId("pictogram-test")).toBeNull();
    });

    it("should HIDE pictogram on large screen with too large font (height >= MIN_HEIGHT_TO_SHOW_FULL_RENDER, fontScale > IOMaxFontSizeMultiplier)", () => {
      jest.spyOn(Dimensions, "get").mockReturnValue({
        width: 414,
        height: 896,
        scale: 2,
        fontScale: IOMaxFontSizeMultiplier + 0.01
      });

      const component = renderComponent(
        false,
        () => undefined,
        () => undefined
      );

      expect(component.queryByTestId("pictogram-test")).toBeNull();
    });
  });
});

const renderComponent = (
  isLoading: boolean,
  onClose: () => void,
  onPrimaryAction: () => void
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const testState = {
    ...initialState,
    remoteConfig: O.some({
      cgn: {
        enabled: false
      },
      pn: {
        privacy_url: testPrivacyUrl,
        tos_url: testTOSUrl
      }
    })
  } as GlobalState;
  const store = createStore(appReducer, testState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <SendEngagementComponent
        isLoading={isLoading}
        onClose={onClose}
        onPrimaryAction={onPrimaryAction}
      />
    ),
    PN_ROUTES.ENGAGEMENT_SCREEN,
    {},
    store
  );
};
