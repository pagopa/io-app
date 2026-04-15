import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
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
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <PreconditionsFeedback
        pictogram="umbrella"
        title="The title"
        subtitle={subtitle}
      />
    ),
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
