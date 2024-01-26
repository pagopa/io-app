import React from "react";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { MessageDetails } from "../MessageDetails";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { PNMessage } from "../../store/types/types";
import { messageId, pnMessage } from "../../__mocks__/message";

describe("MessageDetails component", () => {
  it("should match the snapshot", () => {
    const { component } = renderComponent(
      generateComponentProperties(pnMessage)
    );
    expect(component).toMatchSnapshot();
  });
});

const generateComponentProperties = (message: PNMessage) => ({
  messageId,
  message,
  payments: undefined,
  service: undefined
});

const renderComponent = (
  props: React.ComponentProps<typeof MessageDetails>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <MessageDetails {...props} />,
      "DUMMY_ROUTE",
      {},
      store
    ),
    store
  };
};
