import { createStore, Store } from "redux";
import configureMockStore from "redux-mock-store";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { getNetworkError } from "../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import {
  fciSignatureRequestFromId,
  fciStartRequest
} from "../../store/actions";
import FciRouterScreen from "../FciRouterScreen";
import {
  mockedError,
  mockSignatureRequestDetailView
} from "../../types/__mocks__/SignatureRequestDetailView.mock";
import mockedProfile from "../../../../__mocks__/initializedProfile";
import { SignatureRequestStatusEnum } from "../../../../../definitions/fci/SignatureRequestStatus";

const now = new Date();

describe("Test FciRouterScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("With the default store state, the loading screen should be rendered", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, {
      ...globalState,
      profile: pot.some(mockedProfile)
    } as any);
    const render = renderComponent(store);

    expect(
      render.component.queryByTestId("FciRouterLoadingScreenTestID")
    ).not.toBeNull();
  });
  it("With a generic failure, the loading screen should be rendered GenericErrorComponentTestID", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, {
      ...globalState,
      profile: pot.some(mockedProfile)
    } as any);

    const render = renderComponent(store);

    expect(
      render.component.queryByTestId("FciRouterLoadingScreenTestID")
    ).not.toBeNull();

    render.store.dispatch(
      fciSignatureRequestFromId.failure(
        getNetworkError(
          new Error(JSON.stringify({ ...mockedError, status: 500 }))
        )
      )
    );

    expect(
      render.component.queryByTestId("GenericErrorComponentTestID")
    ).not.toBeNull();
  });
  it("With a generic failure and a response status equal to 404, the loading screen should be rendered WrongUserErrorComponentTestID", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, {
      ...globalState,
      profile: pot.some(mockedProfile)
    } as any);

    const render = renderComponent(store);

    expect(
      render.component.queryByTestId("FciRouterLoadingScreenTestID")
    ).not.toBeNull();

    render.store.dispatch(
      fciSignatureRequestFromId.failure(
        getNetworkError(new Error(JSON.stringify(mockedError)))
      )
    );

    expect(
      render.component.queryByTestId("WrongUserErrorComponentTestID")
    ).not.toBeNull();
  });
  it("With a right and expired signature request, the success component should be rendered an error", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, {
      ...globalState,
      profile: pot.some(mockedProfile)
    } as any);

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
    const store = createStore(appReducer, {
      ...globalState,
      profile: pot.some(mockedProfile)
    } as any);

    const render = renderComponent(store);

    expect(
      render.component.queryByTestId("FciRouterLoadingScreenTestID")
    ).not.toBeNull();

    const qtspSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestStatusEnum.WAIT_FOR_QTSP
    };
    render.store.dispatch(
      fciSignatureRequestFromId.success(qtspSignatureRequest)
    );

    expect(
      render.component.queryByTestId("WaitQtspSignatureRequestTestID")
    ).not.toBeNull();
  });
  it("With a right signature request with status WAIT_FOR_SIGNATURE, the fciStartingRequest should be dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore({
      ...globalState,
      profile: pot.some(mockedProfile)
    });

    const render = renderComponent(store);

    expect(
      render.component.queryByTestId("FciRouterLoadingScreenTestID")
    ).not.toBeNull();

    const qtspSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE
    };
    render.store.dispatch(
      fciSignatureRequestFromId.success(qtspSignatureRequest)
    );
    render.store.dispatch(fciStartRequest());
    expect(store.getActions()).toContainEqual(fciStartRequest());
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
