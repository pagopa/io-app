import React from "react";
import { createStore } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MessageInfo } from "../MessageInfo";
import PN_ROUTES from "../../navigation/routes";

describe("MessageInfo", () => {
  it("should match snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const newDesignSystemState = appReducer(
    globalState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, newDesignSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => <MessageInfo iun={"YYYYMM-1-ABCD-EFGH-X"} />,
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
