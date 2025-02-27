import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { PNActivationReminderBanner } from "../PNActivationReminderBanner";

describe("pnActivationBanner", () => {
  it("should match snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
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
