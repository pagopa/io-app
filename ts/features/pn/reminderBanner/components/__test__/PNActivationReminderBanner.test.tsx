import { NavigationContext } from "@react-navigation/native";
import { fireEvent, render } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import * as USEIO from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as STORE_HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import * as MIXPANEL from "../../../analytics/activationReminderBanner";
import PN_ROUTES from "../../../navigation/routes";
import { dismissPnActivationReminderBanner } from "../../../store/actions";
import { PNActivationReminderBanner } from "../PNActivationReminderBanner";

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

describe("dispatch mixpanel event on first render", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it("should dispatch a BANNER_SHOWN event on first render, if focused", () => {
    const mixpanelSpy = jest.spyOn(
      MIXPANEL.sendBannerMixpanelEvents,
      "bannerShown"
    );
    renderForFocus(true);

    expect(mixpanelSpy).toHaveBeenCalledTimes(1);
  });
  it("should not dispatch a BANNER_SHOWN event on first render if it is not focused", () => {
    const mixpanelSpy = jest.spyOn(
      MIXPANEL.sendBannerMixpanelEvents,
      "bannerShown"
    );
    renderForFocus(false);

    expect(mixpanelSpy).toHaveBeenCalledTimes(0);
  });
  it("should not dispatch a second event when rerendered", () => {
    const mixpanelSpy = jest.spyOn(
      MIXPANEL.sendBannerMixpanelEvents,
      "bannerShown"
    );
    const component = renderForFocus(true);
    component.rerender(
      <PNActivationReminderBanner handleOnClose={() => null} />
    );
    component.rerender(
      <PNActivationReminderBanner handleOnClose={() => null} />
    );
    component.rerender(
      <PNActivationReminderBanner handleOnClose={() => null} />
    );

    expect(mixpanelSpy).toHaveBeenCalledTimes(1);
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

const renderForFocus = (isFocused: boolean) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  const actualNav = jest.requireActual("@react-navigation/native");
  const navContext = {
    ...actualNav.navigation,
    navigate: () => null,
    dangerouslyGetState: () => null,
    setOptions: () => null,
    addListener: () => () => null,
    isFocused: () => isFocused
  };
  const Wrapper = ({ children }: PropsWithChildren<any>) => (
    <Provider store={store}>
      <NavigationContext.Provider
        value={{
          ...navContext
        }}
      >
        {children}
      </NavigationContext.Provider>
    </Provider>
  );

  return render(<PNActivationReminderBanner handleOnClose={() => null} />, {
    wrapper: Wrapper
  });
};
