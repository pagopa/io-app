import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwPresentationClaimsSection } from "../ItwPresentationClaimsSection";

describe("ItwPresentationClaimsSection", () => {
  it("should match the snapshot when claims are visible", () => {
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when claims are hidden", () => {
    const component = renderComponent();
    const toggleButton = component.queryByTestId("toggle-claim-visibility");

    if (!toggleButton) {
      fail("Toggle button not found");
    }

    fireEvent(toggleButton, "onPress");
    expect(component).toMatchSnapshot();
  });
});

function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwPresentationClaimsSection credential={ItwStoredCredentialsMocks.ts} />
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    {},
    createStore(appReducer, globalState as any)
  );
}
