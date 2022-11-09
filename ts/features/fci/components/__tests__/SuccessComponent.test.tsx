import "react-native";
import React from "react";
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

type Props = {
  signatureRequest: SignatureRequestDetailView;
};

describe("Test SuccessComponent", () => {
  const now = new Date();
  jest.useFakeTimers();
  it("with a signature request status WAIT_FOR_SIGNATURE should render a FciDocuments Container correctly", () => {
    const props = {
      signatureRequest: mockSignatureRequestDetailView
    };
    const component = renderComponent({ ...props });
    expect(component.getByTestId("FciDocumentsScreenTestID")).toBeTruthy();
  });
  it("with a signature request EXPIRED should render the right Error component", () => {
    const expiredSignatureRequest = {
      ...mockSignatureRequestDetailView,
      expires_at: new Date(now.setDate(now.getDate() - 30))
    };
    const props = {
      signatureRequest: expiredSignatureRequest
    };
    const component = renderComponent({ ...props });
    expect(component.getByTestId("ExpiredSignatureRequestTestID")).toBeTruthy();
  });
  it("with a signature request status WAIT_FOR_QTSP should render the right Error component", () => {
    const waitQtspSignatureRequest = {
      ...mockSignatureRequestDetailView,
      status: SignatureRequestDetailViewStatusEnum.WAIT_FOR_QTSP
    };
    const props = {
      signatureRequest: waitQtspSignatureRequest
    };
    const component = renderComponent({ ...props });
    expect(
      component.getByTestId("WaitQtspSignatureRequestTestID")
    ).toBeTruthy();
  });
});

const renderComponent = ({ signatureRequest }: Props) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const Component = (
    <Provider store={store}>
      <SuccessComponent signatureRequest={signatureRequest} />
    </Provider>
  );

  return renderScreenFakeNavRedux<GlobalState>(
    () => Component,
    FCI_ROUTES.SIGNATURE,
    {},
    store
  );
};
