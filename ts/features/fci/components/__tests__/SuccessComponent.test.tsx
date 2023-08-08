import React from "react";
import * as O from "fp-ts/lib/Option";
import { createStore, Store } from "redux";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import SuccessComponent from "../SuccessComponent";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import { SignatureRequestDetailView } from "../../../../../definitions/fci/SignatureRequestDetailView";
import { GlobalState } from "../../../../store/reducers/types";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciStartRequest } from "../../store/actions";
import { SignatureRequestStatusEnum } from "../../../../../definitions/fci/SignatureRequestStatus";

type Props = {
  signatureRequest: SignatureRequestDetailView;
};

const someKeyTag = "a12e9221-c056-4bbc-8623-ca92df29361e";
const somePublicKey = {
  crv: "P-256",
  x: "dyLTwacs5ej/nnXIvCMexUBkmdh6ArJ4GPKjHob61mE=",
  kty: "EC",
  y: "Tz0xNv++cOeLVapU/BhBS0FJydIcNcV25/ALb1HVu+s="
};

describe("Test SuccessComponent", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it("with an empty lollipop state, and with a signature request status WAIT_FOR_SIGNATURE (or other existent status), the unsupported device banner is show", () => {
    const now = new Date();
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const expiredSignatureRequest = {
      ...mockSignatureRequestDetailView,
      expires_at: new Date(now.setDate(now.getDate() - 30)),
      status: SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE
    };
    const props = {
      signatureRequest: expiredSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(component.getByTestId("UnsupportedDeviceBannerID")).toBeTruthy();
  });

  it("with a signature request status WAIT_FOR_SIGNATURE should dispatch a fciStartRequest correctly", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore({
      ...globalState,
      lollipop: {
        ...globalState.lollipop,
        keyTag: O.some(someKeyTag),
        publicKey: O.some(somePublicKey)
      }
    } as GlobalState);

    const props = {
      signatureRequest: mockSignatureRequestDetailView
    };

    const component = renderComponent(props, store);
    expect(component).toBeTruthy();
    expect(store.getActions()).toEqual([fciStartRequest()]);
  });
  it("with a signature request EXPIRED and a signature status equal to WAIT_FOR_SIGNATURE should render the right Error component", () => {
    const now = new Date();
    const store: Store<GlobalState> = createStore(appReducer, {
      ...globalState,
      lollipop: {
        ...globalState.lollipop,
        keyTag: O.some(someKeyTag),
        publicKey: O.some(somePublicKey)
      }
    } as any);
    const expiredSignatureRequest = {
      ...mockSignatureRequestDetailView,
      expires_at: new Date(now.setDate(now.getDate() - 30)),
      status: SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE
    };
    const props = {
      signatureRequest: expiredSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(component.getByTestId("ExpiredSignatureRequestTestID")).toBeTruthy();
  });
  it("with a signature request EXPIRED and a signature status equal to REJECTED should render the right Error component", () => {
    const now = new Date();
    const store: Store<GlobalState> = createStore(appReducer, {
      ...globalState,
      lollipop: {
        ...globalState.lollipop,
        keyTag: O.some(someKeyTag),
        publicKey: O.some(somePublicKey)
      }
    } as any);
    const expiredSignatureRequest = {
      ...mockSignatureRequestDetailView,
      expires_at: new Date(now.setDate(now.getDate() - 30)),
      status: SignatureRequestStatusEnum.REJECTED
    };
    const props = {
      signatureRequest: expiredSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(component.getByTestId("ExpiredSignatureRequestTestID")).toBeTruthy();
  });
  it("with a signature request status WAIT_FOR_QTSP should render the right Error component", () => {
    const store: Store<GlobalState> = createStore(appReducer, {
      ...globalState,
      lollipop: {
        ...globalState.lollipop,
        keyTag: O.some(someKeyTag),
        publicKey: O.some(somePublicKey)
      }
    } as any);
    const waitQtspSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestStatusEnum.WAIT_FOR_QTSP
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
    const store: ReturnType<typeof mockStore> = mockStore({
      ...globalState,
      lollipop: {
        ...globalState.lollipop,
        keyTag: O.some(someKeyTag),
        publicKey: O.some(somePublicKey)
      }
    } as GlobalState);

    const signedSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestStatusEnum.SIGNED
    };
    const props = {
      signatureRequest: signedSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(component.getByTestId("SignedSignatureRequestTestID")).toBeTruthy();
  });
  it("with a signature request status REJECTED should render a GenericErrorComponent", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore({
      ...globalState,
      lollipop: {
        ...globalState.lollipop,
        keyTag: O.some(someKeyTag),
        publicKey: O.some(somePublicKey)
      }
    } as GlobalState);

    const signedSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestStatusEnum.REJECTED
    };
    const props = {
      signatureRequest: signedSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(
      component.getByTestId("RejectedSignatureRequestTestID")
    ).toBeTruthy();
  });
  it("with a signature request status CANCELLED should render a GenericErrorComponent", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore({
      ...globalState,
      lollipop: {
        ...globalState.lollipop,
        keyTag: O.some(someKeyTag),
        publicKey: O.some(somePublicKey)
      }
    } as GlobalState);

    const signedSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestStatusEnum.CANCELLED
    };
    const props = {
      signatureRequest: signedSignatureRequest
    };
    const component = renderComponent(props, store);
    expect(
      component.getByTestId("CancelledSignatureRequestTestID")
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
