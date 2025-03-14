import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import * as USEIO from "../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
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
});
const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    () => <PNActivationReminderBanner handleOnClose={() => null} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
