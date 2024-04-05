import React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import { MessageBottomMenu } from "../MessageBottomMenu";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

describe("MessageBottomMenu", () => {
  it("should match snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
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
    () => (
      <MessageBottomMenu
        serviceId={"01HT25YR72A8N42AJ0TEKAB2V7" as ServiceId}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
