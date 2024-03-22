import * as React from "react";
import { createStore } from "redux";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { IdPayWalletCard } from "../IdPayWalletCard";

describe("IdPayWalletCard", () => {
  it("should match the snapshot", () => {
    const component = renderCard();
    expect(component).toMatchSnapshot();
  });
});

function renderCard() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <IdPayWalletCard
        name="18 app"
        amount={9999}
        avatarSource={{
          uri: "https://vtlogo.com/wp-content/uploads/2021/08/18app-vector-logo.png"
        }}
        expireDate={new Date(2023, 11, 2)}
      />
    ),
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
