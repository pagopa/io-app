import "react-native";
import { Provider } from "react-redux";
import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { fireEvent } from "@testing-library/react-native";
import { Store, createStore } from "redux";
import I18n from "../../../../i18n";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import DocumentWithSignature, {
  SignatureFieldAttrType
} from "../DocumentWithSignature";
import { fciSignatureRequestFromId } from "../../store/actions";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";

type Props = {
  attrs: SignatureFieldAttrType;
  currentDoc: number;
  onClose: () => void;
};

describe("Test DocumentWithSignature", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("with all props should render a DocumentWithSignature correctly", () => {
    const props: Props = {
      attrs: { unique_name: "Signature1" as NonEmptyString },
      currentDoc: 0,
      onClose: jest.fn()
    };
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      fciSignatureRequestFromId.success(mockSignatureRequestDetailView)
    );
    expect(store.getState().features.fci.signatureRequest).toStrictEqual(
      pot.some(mockSignatureRequestDetailView)
    );
    const component = renderComponent({ ...props }, store);
    expect(component).toBeTruthy();
  });
  it("with all props should render a FooterWithButtons correctly", () => {
    const props = {
      attrs: { unique_name: "Signature1" as NonEmptyString },
      currentDoc: 0,
      onClose: jest.fn()
    };
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      fciSignatureRequestFromId.success(mockSignatureRequestDetailView)
    );
    const component = renderComponent({ ...props }, store);
    expect(component).toBeTruthy();
    const leftButton = component.queryByText(
      I18n.t("features.fci.documents.footer.cancel")
    );
    expect(leftButton).not.toBeNull();
    const rightButton = component.queryByText(
      I18n.t("features.fci.documents.footer.continue")
    );
    expect(rightButton).not.toBeNull();
  });
  it("with all props the left button should be render correctly", () => {
    const onPress = jest.fn();
    const props = {
      attrs: { unique_name: "Signature1" as NonEmptyString },
      currentDoc: 0,
      onClose: onPress
    };
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      fciSignatureRequestFromId.success(mockSignatureRequestDetailView)
    );
    const component = renderComponent({ ...props }, store);
    expect(component).toBeTruthy();
    const leftButton = component.getByTestId(
      "FciDocumentWithSignatureTopLeftButtonTestID"
    );
    expect(leftButton).not.toBeNull();
    fireEvent.press(leftButton);
    fireEvent.press(leftButton);
    expect(onPress).toHaveBeenCalledTimes(2);
  });
});

const renderComponent = (props: Props, store: Store<GlobalState>) => {
  const Component = (
    <Provider store={store}>
      <DocumentWithSignature {...props} />
    </Provider>
  );

  return renderScreenFakeNavRedux<GlobalState>(
    () => Component,
    FCI_ROUTES.ROUTER,
    {},
    store
  );
};
