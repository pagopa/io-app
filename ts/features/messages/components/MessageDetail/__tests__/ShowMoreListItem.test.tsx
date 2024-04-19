import React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ShowMoreListItem } from "../ShowMoreListItem";
import { UIMessageId } from "../../../types";
import { MESSAGES_ROUTES } from "../../../navigation/routes";

describe("ShowMoreListItem", () => {
  it("should match snapshot with default parameters", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, with notice number, no payee fiscal code", () => {
    const component = renderComponent("111122223333444455");
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no notice number, with payee fiscal code", () => {
    const component = renderComponent(undefined, "01234567890");
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, with notice number, with payee fiscal code", () => {
    const component = renderComponent("111122223333444455", "01234567890");
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (noticeNumber?: string, payeeFiscalCode?: string) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <ShowMoreListItem
        messageId={"01HVK3XP1Q2NFNYF8P2CT6XMAY" as UIMessageId}
        noticeNumber={noticeNumber}
        payeeFiscalCode={payeeFiscalCode}
      />
    ),
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
