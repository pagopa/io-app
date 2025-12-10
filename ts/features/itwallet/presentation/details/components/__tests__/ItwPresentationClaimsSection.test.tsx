import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application.ts";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types.ts";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper.tsx";
import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils.ts";
import { ITW_ROUTES } from "../../../../navigation/routes.ts";
import { ItwPresentationClaimsSection } from "../ItwPresentationClaimsSection.tsx";

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
      <ItwPresentationClaimsSection
        credential={{
          ...ItwStoredCredentialsMocks.ts,
          jwt: { expiration: "2100-01-01T00:00:00Z" }
        }}
      />
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    {},
    createStore(appReducer, globalState as any)
  );
}
