import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import * as USEIO from "../../../../../navigation/params/AppParamsList";
import PN_ROUTES from "../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PNActivationReminderBanner } from "../PNActivationReminderBanner";
import * as MIXPANEL from "../../../analytics/activationReminderBanner";
import * as STORE_HOOKS from "../../../../../store/hooks";
import { dismissPnActivationReminderBanner } from "../../../store/actions";

describe("pnActivationBanner", () => {
  it("should match snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it('should call "navigate" with the correct args on click', () => {
    const mockNavigate = jest.fn();
    jest
      .spyOn(USEIO, "useIONavigation")
      .mockImplementation(() => ({ navigate: mockNavigate } as any));
    const component = renderComponent();
    const banner = component.getByTestId("pn-banner");
    fireEvent.press(banner);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
      {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.ACTIVATION_BANNER_FLOW
        }
      }
    );
  });

  it("should call a tracking function on first render", () => {
    const mixpanelSpy = jest.spyOn(
      MIXPANEL.sendBannerMixpanelEvents,
      "bannerShown"
    );
    renderComponent();
    expect(mixpanelSpy).toHaveBeenCalledWith();
    expect(mixpanelSpy).toHaveBeenCalledTimes(1);
  });
  it('should track, call a dismiss action and "handleOnClose" on x tap', () => {
    const mixpanelSpy = jest.spyOn(
      MIXPANEL.sendBannerMixpanelEvents,
      "bannerClose"
    );
    const mockHandleOnClose = jest.fn();
    const dispatchSpy = jest.fn();
    jest
      .spyOn(STORE_HOOKS, "useIODispatch")
      .mockImplementation(() => dispatchSpy);

    const component = renderComponent(mockHandleOnClose);
    const banner = component.getByTestId("pn-banner");
    fireEvent(banner, "onClose");

    [mockHandleOnClose, dispatchSpy, mixpanelSpy].forEach(spy => {
      expect(spy).toHaveBeenCalledTimes(1);
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      dismissPnActivationReminderBanner()
    );
  });
});
const renderComponent = (closeHandler: () => void = () => null) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    () => <PNActivationReminderBanner handleOnClose={closeHandler} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
