import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import {
  remoteError,
  remoteLoading
} from "../../../../../../../common/model/RemoteValue";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { getTimeoutError } from "../../../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../../navigation/routes";
import EycaActivationLoading from "../EycaActivationLoading";

const renderComponent = (enrichedState: GlobalState) => {
  const store = createStore(appReducer, enrichedState as any);

  return {
    component: renderScreenWithNavigationStoreContext(
      EycaActivationLoading,
      CGN_ROUTES.EYCA.ACTIVATION.LOADING,
      {},
      store
    ),
    store
  };
};
const globalState = appReducer(undefined, applicationChangeState("active"));

describe("EycaActivationLoading", () => {
  it("should render correctly loading state", () => {
    const enrichedState = {
      ...globalState,
      bonus: {
        ...globalState.bonus,
        cgn: {
          ...globalState.bonus.cgn,
          eyca: {
            ...globalState.bonus.cgn.eyca,
            activation: remoteLoading
          }
        }
      }
    };

    const { component } = renderComponent(enrichedState);
    expect(component.getByTestId("eyca-activation-loading")).toBeTruthy();
  });

  it("should render correctly error state", () => {
    const enrichedState = {
      ...globalState,
      bonus: {
        ...globalState.bonus,
        cgn: {
          ...globalState.bonus.cgn,
          eyca: {
            ...globalState.bonus.cgn.eyca,
            activation: remoteError(getTimeoutError())
          }
        }
      }
    };

    const { component, store } = renderComponent(enrichedState);
    const retryButton = component.getByTestId("eyca-activation-retry-button");
    const cancelButton = component.getByTestId("eyca-activation-cancel-button");
    fireEvent.press(retryButton);
    expect(store.getState().bonus.cgn.eyca.activation).toEqual(remoteLoading);
    fireEvent.press(cancelButton);
    expect(store.getState().bonus.cgn.eyca.activation).toEqual(remoteLoading);
  });
});
