import { createStore } from "redux";
import { MessageDetailsReminderExpiring } from "../MessageDetailsReminderExpiring";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { UIMessageId } from "../../../types";

describe("MessageDetailsReminderExpiring", () => {
  it("should match snapshot", () => {
    const component = renderScreen();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsReminderExpiring
        dueDate={new Date(2024, 2, 21, 10, 33, 42)}
        messageId={"01HSG6GR1JT2E23AJ5RBTAMZZP" as UIMessageId}
        title="The title"
      />
    ),
    "DUMMY",
    {},
    store
  );
};
