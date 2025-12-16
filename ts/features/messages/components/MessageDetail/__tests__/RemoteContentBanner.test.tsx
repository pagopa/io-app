import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { RemoteContentBanner } from "../RemoteContentBanner";
import { MESSAGES_ROUTES } from "../../../navigation/routes";

describe("RemoteContentBanner", () => {
  it("Should match snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <RemoteContentBanner />,
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
