import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { SecuritySuggestions } from "../SecuritySuggestions";

describe("SecuritySuggestions", () => {
  it("should match snapshot", () => {
    const securitySuggestions = renderComponent();
    expect(securitySuggestions.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <SecuritySuggestions />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
