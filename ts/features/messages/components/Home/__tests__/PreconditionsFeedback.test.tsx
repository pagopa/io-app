import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { PreconditionsFeedback } from "../PreconditionsFeedback";

describe("PreconditionsFeedback", () => {
  it("should match snapshot with title and no subtitle", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot with title and subtitle", () => {
    const component = renderComponent("The subtitle");
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (subtitle: string | undefined = undefined) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <PreconditionsFeedback
        pictogram="umbrellaNew"
        title="The title"
        subtitle={subtitle}
      />
    ),
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
