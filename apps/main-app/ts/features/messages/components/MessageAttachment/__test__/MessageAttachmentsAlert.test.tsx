import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { MessageAttachmentsAlert } from "../MessageAttachmentsAlert";

describe("MessageAttachmentsAlert", () => {
  it("should match the snapshot", () => {
    const { toJSON, getByTestId } = renderComponent();
    const byTestId = getByTestId("message-attachments-alert");
    const snapshot = toJSON();
    expect(byTestId).toBeTruthy();
    expect(snapshot).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <MessageAttachmentsAlert />,
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
