import React from "react";
import { createStore, Store } from "redux";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import SuccessComponent from "../SuccessComponent";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import {
  SignatureRequestDetailView,
  StatusEnum as SignatureRequestDetailViewStatusEnum
} from "../../../../../definitions/fci/SignatureRequestDetailView";
import { GlobalState } from "../../../../store/reducers/types";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciStartRequest } from "../../store/actions";

type Props = {
  signatureRequest: SignatureRequestDetailView;
};

describe("Test SuccessComponent", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("with a signature request status WAIT_FOR_SIGNATURE should dispatch a fciStartingRequest correctly", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    const props = {
      signatureRequest: mockSignatureRequestDetailView
    };
    const component = renderComponent(props, store);
    expect(component).toBeTruthy();
    expect(store.getActions()).toEqual([fciStartRequest()]);
  });
  it("with a signature request EXPIRED and a signature status equal to WAIT_FOR_SIGNATURE should render the right Error component", () => {
    const now = new Date();
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const expiredSignatureRequest = {
      ...mockSignatureRequestDetailView,
      expires_at: new Date(now.setDate(now.getDate() - 30)),
      status: SignatureRequestDetailViewStatusEnum.WAIT_FOR_SIGNATURE
    };
    const props = {
      signatureRequest: expiredSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(component.getByTestId("ExpiredSignatureRequestTestID")).toBeTruthy();
  });
  it("with a signature request EXPIRED and a signature status equal to REJECTED should render the right Error component", () => {
    const now = new Date();
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const expiredSignatureRequest = {
      ...mockSignatureRequestDetailView,
      expires_at: new Date(now.setDate(now.getDate() - 30)),
      status: SignatureRequestDetailViewStatusEnum.REJECTED
    };
    const props = {
      signatureRequest: expiredSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(component.getByTestId("ExpiredSignatureRequestTestID")).toBeTruthy();
  });
  it("with a signature request status WAIT_FOR_QTSP should render the right Error component", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const waitQtspSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestDetailViewStatusEnum.WAIT_FOR_QTSP
    };
    const props = {
      signatureRequest: waitQtspSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(
      component.getByTestId("WaitQtspSignatureRequestTestID")
    ).toBeTruthy();
  });
  it("with a signature request status SIGNED should render a GenericErrorComponent", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    const signedSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestDetailViewStatusEnum.SIGNED
    };
    const props = {
      signatureRequest: signedSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(component.getByTestId("SignedSignatureRequestTestID")).toBeTruthy();
  });
  it("with a signature request status REJECTED should render a GenericErrorComponent", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    const signedSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestDetailViewStatusEnum.REJECTED
    };
    const props = {
      signatureRequest: signedSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(
      component.getByTestId("RejectedSignatureRequestTestID")
    ).toBeTruthy();
  });
});

function renderComponent(props: Props, store: Store<GlobalState>) {
  const Component = (
    <Provider store={store}>
      <SuccessComponent signatureRequest={props.signatureRequest} />
    </Provider>
  );
  return renderScreenFakeNavRedux<GlobalState>(
    () => Component,
    FCI_ROUTES.MAIN,
    { ...props },
    store
  );
}
