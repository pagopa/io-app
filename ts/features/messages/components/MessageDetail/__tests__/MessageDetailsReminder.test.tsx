import React from "react";
import { createStore } from "redux";
import { MessageDetailsReminder } from "../MessageDetailsReminder";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { UIMessageId } from "../../../types";

describe("MessageDetailsReminder", () => {
  it("should match snapshot", () => {
    const component = renderScreen();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsReminder
        dueDate={new Date(2024, 2, 21, 10, 33, 42)}
        messageId={"01HSG6H6M4KK36CV6QWP2VJW3S" as UIMessageId}
        title="The title"
      />
    ),
    "DUMMY",
    {},
    store
  );
};
