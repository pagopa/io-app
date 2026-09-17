import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application.ts";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types.ts";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper.tsx";
import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils.ts";
import { ITW_ROUTES } from "../../../../navigation/routes.ts";
import { ItwPresentationPidDetail } from "../ItwPresentationPidDetail.tsx";

describe("ItwPresentationPidDetail", () => {
  it("should read the claim values visibility from the persisted preference", () => {
    const { component } = renderComponentWithStore(true);

    expect(component.getAllByText("******").length).toBeGreaterThan(0);
  });

  it("should persist the toggled visibility in the redux store instead of local state", () => {
    const { component, store } = renderComponentWithStore(false);

    const toggleButton = component.getByTestId("toggle-pid-claim-visibility");

    fireEvent(toggleButton, "onPress");

    expect(
      store.getState().features.itWallet.preferences.claimValuesHidden
    ).toBe(true);
  });
});

function renderComponentWithStore(claimValuesHidden: boolean) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const state: GlobalState = {
    ...globalState,
    features: {
      ...globalState.features,
      itWallet: {
        ...globalState.features.itWallet,
        preferences: {
          ...globalState.features.itWallet.preferences,
          claimValuesHidden
        }
      }
    }
  };
  const store = createStore(appReducer, state as any);

  const component = renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwPresentationPidDetail
        credential={{
          ...ItwStoredCredentialsMocks.eid,
          jwt: { expiration: "2100-01-01T00:00:00Z" }
        }}
      />
    ),
    ITW_ROUTES.PRESENTATION.PID_DETAIL,
    {},
    store
  );

  return { component, store };
}
