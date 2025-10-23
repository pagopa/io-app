import { View } from "react-native";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { BannerAttachments } from "../BannerAttachments";
import * as bottomSheet from "../../../../utils/hooks/bottomSheet";
import * as urlUtils from "../../../../utils/url";
import * as remoteConfigSelectors from "../../../../store/reducers/backendStatus/remoteConfig";

describe("BannerAttachments", () => {
  describe("BannerAttachments component", () => {
    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });
    it("should match snapshot", () => {
      const component = renderComponent();
      expect(component.toJSON()).toMatchSnapshot();
    });
    it("should present the bottom-sheet upon tap on the 'Find out more' link", () => {
      const mockedPresent = jest.fn();
      jest
        .spyOn(bottomSheet, "useIOBottomSheetModal")
        .mockImplementation(_input => ({
          bottomSheet: <View />,
          dismiss: () => undefined,
          present: mockedPresent
        }));
      const component = renderComponent();
      const link = component.getByTestId("banner-attachment-banner");
      fireEvent.press(link);
      expect(mockedPresent.mock.calls.length).toBe(1);
      expect(mockedPresent.mock.calls[0].length).toBe(0);
    });
    it("should open the external link upon tap on the 'How to estimates timelines' link", () => {
      const mockedUrl = "https://an.url/withPath";
      jest
        .spyOn(remoteConfigSelectors, "sendEstimateTimelinesUrlSelector")
        .mockImplementation(_state => mockedUrl);
      const spiedOnMockedOpenWebUrl = jest
        .spyOn(urlUtils, "openWebUrl")
        .mockImplementation();
      const component = renderComponent();

      const openSite = component.getByTestId(
        "banner-attachment-bottomsheet-cta"
      );
      fireEvent.press(openSite);

      expect(spiedOnMockedOpenWebUrl.mock.calls.length).toBe(1);
      expect(spiedOnMockedOpenWebUrl.mock.calls[0].length).toBe(1);
      expect(spiedOnMockedOpenWebUrl.mock.calls[0][0]).toBe(mockedUrl);
    });
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <BannerAttachments />,
    "DUMMY",
    {},
    store
  );
};
