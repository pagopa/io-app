import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SecuritySuggestions } from "../SecuritySuggestions";
import { MESSAGES_ROUTES } from "../../../navigation/routes";

describe("SecuritySuggestions", () => {
  it("should match snapshot", () => {
    const securitySuggestions = renderComponent();
    expect(securitySuggestions.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => <SecuritySuggestions />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
