import { View } from "react-native";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { NeedHelp } from "../NeedHelp";
import PN_ROUTES from "../../navigation/routes";
import * as bottomSheet from "../../../../utils/hooks/bottomSheet";
import * as remoteConfigSelectors from "../../../../store/reducers/backendStatus/remoteConfig";
import * as urlUtils from "../../../../utils/url";

describe("NeedHelp", () => {
  describe("NeedHelp Component", () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it("Should match snapshot", () => {
      const component = renderComponent();
      expect(component.toJSON()).toMatchSnapshot();
    });
    it("Should open bottom sheet upon tap on the ListItemAction component", () => {
      const mockPresent = jest.fn();
      jest
        .spyOn(bottomSheet, "useIOBottomSheetModal")
        .mockImplementation(_input => ({
          bottomSheet: <View />,
          dismiss: () => undefined,
          present: mockPresent
        }));
      const component = renderComponent();
      const listItemAction = component.getByTestId("needHelp-listitem");
      fireEvent.press(listItemAction);

      expect(mockPresent.mock.calls.length).toBe(1);
      expect(mockPresent.mock.calls[0].length).toBe(0);
    });
    it("Should open the external url upon tap on the bottom-sheet action", () => {
      const customerServiceUrl = "https://an.url/toCustomService";
      jest
        .spyOn(remoteConfigSelectors, "sendCustomServiceCenterUrlSelector")
        .mockImplementation(_state => customerServiceUrl);
      const spiedOnMockedOpenWebUrl = jest
        .spyOn(urlUtils, "openWebUrl")
        .mockImplementation();

      const component = renderComponent();
      const bottomSheetAction = component.getByTestId(
        "needHelp-bottomsheet-action"
      );
      fireEvent.press(bottomSheetAction);

      expect(spiedOnMockedOpenWebUrl.mock.calls.length).toBe(1);
      expect(spiedOnMockedOpenWebUrl.mock.calls[0].length).toBe(1);
      expect(spiedOnMockedOpenWebUrl.mock.calls[0][0]).toBe(customerServiceUrl);
    });
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <NeedHelp />,
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
