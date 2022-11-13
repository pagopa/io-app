import { createStore, Store } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { getTimeoutError } from "../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciSignatureRequestFromId } from "../../store/actions";
import FciRouterScreen from "../FciRouterScreen";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import { StatusEnum as SignatureRequestDetailViewStatusEnum } from "../../../../../definitions/fci/SignatureRequestDetailView";

const genericError = getTimeoutError();
const now = new Date();

describe("Test FciRouterScreen", () => {
  jest.useFakeTimers();
  it("With the default store state, the loading screen should be rendered", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const render = renderComponent(store);

    expect(
      render.component.queryByTestId("FciRouterLoadingScreenTestID")
    ).not.toBeNull();
  });
  it("With a failure, the loading screen should be rendered GenericErrorComponent", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const render = renderComponent(store);

    expect(
      render.component.queryByTestId("FciRouterLoadingScreenTestID")
    ).not.toBeNull();

    render.store.dispatch(fciSignatureRequestFromId.failure(genericError));

    expect(
      render.component.queryByTestId("GenericErrorComponentTestID")
    ).not.toBeNull();
  });
  it("With a right and expired signature request, the success component should be rendered an error", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const render = renderComponent(store);

    const expiredSignatureRequest = {
      ...mockSignatureRequestDetailView,
      expires_at: new Date(now.setDate(now.getDate() - 30))
    };

    expect(
      render.component.queryByTestId("FciRouterLoadingScreenTestID")
    ).not.toBeNull();

    render.store.dispatch(
      fciSignatureRequestFromId.success(expiredSignatureRequest)
    );

    expect(
      render.component.queryByTestId("ExpiredSignatureRequestTestID")
    ).not.toBeNull();
  });
  it("With a right signature request with status WAIT_FOR_QTSP, the success component should be rendered an error", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const render = renderComponent(store);

    expect(
      render.component.queryByTestId("FciRouterLoadingScreenTestID")
    ).not.toBeNull();

    const qtspSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestDetailViewStatusEnum.WAIT_FOR_QTSP
    };
    render.store.dispatch(
      fciSignatureRequestFromId.success(qtspSignatureRequest)
    );

    expect(
      render.component.queryByTestId("WaitQtspSignatureRequestTestID")
    ).not.toBeNull();
  });
  it("With a right signature request with status WAIT_FOR_SIGNATURE, the success component should be rendered an FciDocumentsScreen", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const render = renderComponent(store);

    expect(
      render.component.queryByTestId("FciRouterLoadingScreenTestID")
    ).not.toBeNull();

    const qtspSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestDetailViewStatusEnum.WAIT_FOR_SIGNATURE
    };
    render.store.dispatch(
      fciSignatureRequestFromId.success(qtspSignatureRequest)
    );

    expect(
      render.component.queryByTestId("FciDocumentsScreenTestID")
    ).not.toBeNull();
  });
});

const renderComponent = (store: Store) => ({
  component: renderScreenWithNavigationStoreContext<GlobalState>(
    FciRouterScreen,
    FCI_ROUTES.ROUTER,
    { signatureRequestId: "signatureRequestId" },
    store
  ),
  store
});
