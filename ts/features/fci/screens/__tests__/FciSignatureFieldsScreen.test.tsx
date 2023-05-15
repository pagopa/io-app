import { createStore, Store } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { FCI_ROUTES } from "../../navigation/routes";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { DocumentDetailView } from "../../../../../definitions/fci/DocumentDetailView";
import FciSignatureFieldsScreen from "../valid/FciSignatureFieldsScreen";
import { fciSignatureRequestFromId } from "../../store/actions";
import {
  getSectionListData,
  orderSignatureFields
} from "../../utils/signatureFields";

type Props = {
  documentId: DocumentDetailView["id"];
  currentDoc: number;
};

describe("Test FciSignatureFields screen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("should render the FciSignatureFields screen", () => {
    const props = {
      documentId: mockSignatureRequestDetailView.id,
      currentDoc: 0
    };
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(props, store);
    expect(component).toBeTruthy();
  });
  it("should render the FciSignatureFields screen with the section list", () => {
    const props = {
      documentId: mockSignatureRequestDetailView.id,
      currentDoc: 0
    };
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(props, store);
    expect(component).toBeTruthy();
    expect(
      component.queryByTestId("FciSignatureFieldsSectionListTestID")
    ).toBeTruthy();
  });
  it("should render the FciSignatureFields screen and a section list with right DATA", () => {
    const props = {
      documentId: mockSignatureRequestDetailView.documents[0].id,
      currentDoc: 0
    };
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(
      fciSignatureRequestFromId.success(mockSignatureRequestDetailView)
    );
    const component = renderComponent(props, store);
    expect(component).toBeTruthy();
    expect(
      component.queryByTestId("FciSignatureFieldsSectionListTestID")
    ).toBeTruthy();
    const dataList = component.getByTestId(
      "FciSignatureFieldsSectionListTestID"
    ).props.data;
    const expectedList = getSectionListData(
      orderSignatureFields(
        mockSignatureRequestDetailView.documents[0].metadata.signature_fields ??
          []
      )
    );
    expect(dataList).toEqual(expectedList);
  });
});

const renderComponent = (props: Props, store: Store<GlobalState>) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    FciSignatureFieldsScreen,
    FCI_ROUTES.SIGNATURE_FIELDS,
    {
      ...props
    },
    store
  );
