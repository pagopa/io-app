import React from "react";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { WalletEmptyScreenContent } from "../WalletEmptyScreenContent";

describe("WalletEmptyScreenContent", () => {
  it("should match the snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <WalletEmptyScreenContent />,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
