import { createStore } from "redux";
import { MessageDetailsReminder } from "../MessageDetailsReminder";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";

describe("MessageDetailsReminder", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mockAccessibilityInfo(false);
  });
  it("should match snapshot when the due date is missing", () => {
    const component = renderScreen();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when the reminder is visible an expiring", () => {
    const component = renderScreen(new Date(2002, 1, 1, 1, 1, 1));
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when the reminder is visible and expired", () => {
    const component = renderScreen(new Date(2099, 1, 1, 1, 1, 1));
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (dueDateOrUndefined?: Date) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsReminder
        dueDate={dueDateOrUndefined}
        messageId={"01HSG6H6M4KK36CV6QWP2VJW3S"}
        title="The title"
      />
    ),
    "DUMMY",
    {},
    store
  );
};
