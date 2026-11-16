import { StackActions } from "@react-navigation/native";
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore, Store } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as analytics from "../../analytics";
import { FCI_ROUTES } from "../../navigation/routes";
import {
  fciDownloadPreview,
  fciSignatureRequestFromId
} from "../../store/actions";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import { FciNetworkError } from "../../utils/errors";
import FciDocumentsScreen from "../valid/FciDocumentsScreen";

const mockReplace = jest.fn();
const mockDispatch = jest.fn();
const mockPresentNoSignatureFieldsBs = jest.fn();

jest.mock("../../hooks/useFciNoSignatureFields", () => ({
  useFciNoSignatureFields: () => ({
    present: mockPresentNoSignatureFieldsBs,
    bottomSheet: null
  })
}));
const mockShouldNeverCall = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () =>
      new Proxy(actualNav.useNavigation?.(), {
        get: (_target, prop) => {
          if (prop === "replace") {
            return mockReplace;
          }
          if (prop === "dispatch") {
            return mockDispatch;
          }
          return mockShouldNeverCall;
        }
      })
  };
});

const createTestStore = (signatureRequest = mockSignatureRequestDetailView) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store: Store<GlobalState> = createStore(appReducer, globalState as any);
  store.dispatch(fciSignatureRequestFromId.success({ ...signatureRequest }));
  return store;
};

const signatureRequestWithoutSignatureFields = {
  ...mockSignatureRequestDetailView,
  documents: mockSignatureRequestDetailView.documents.map(document => ({
    ...document,
    metadata: { ...document.metadata, signature_fields: [] }
  }))
};

// The screen requests the preview on mount, so the download completes after
const renderWithDownloadedDocument = (store: Store<GlobalState>) => {
  const component = renderComponent(store);
  act(() => {
    store.dispatch(
      fciDownloadPreview.success({
        path: mockSignatureRequestDetailView.documents[0].url
      })
    );
  });
  return component;
};

describe("Test FciDocuments screen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the FciDocuments screen", () => {
    const store = createTestStore();
    const component = renderComponent(store);
    expect(component).toBeTruthy();
  });

  it("should render the content and footer", async () => {
    const store = createTestStore();
    const testComponent = renderComponent(store);
    await waitFor(() => {
      store.dispatch(
        fciDownloadPreview.success({
          path: mockSignatureRequestDetailView.documents[0].url
        })
      );
      expect(testComponent).toBeTruthy();
      expect(
        testComponent.getByTestId("FciDocumentsScreenTestID")
      ).not.toBeNull();
    });
  });

  it("should track the event and show the bottom sheet on continue when the document has no signature fields", () => {
    const trackSpy = jest.spyOn(
      analytics,
      "trackFciNoSignatureBottomsheetOpen"
    );
    const store = createTestStore(signatureRequestWithoutSignatureFields);
    const { getByText } = renderWithDownloadedDocument(store);

    fireEvent.press(
      getByText(I18n.t("features.fci.documents.footer.continue"))
    );

    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(mockPresentNoSignatureFieldsBs).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should navigate to the signature fields without tracking the bottom sheet event when the document has signature fields", () => {
    const trackSpy = jest.spyOn(
      analytics,
      "trackFciNoSignatureBottomsheetOpen"
    );
    const store = createTestStore();
    const { getByText } = renderWithDownloadedDocument(store);

    fireEvent.press(
      getByText(I18n.t("features.fci.documents.footer.continue"))
    );

    expect(trackSpy).not.toHaveBeenCalled();
    expect(mockPresentNoSignatureFieldsBs).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      StackActions.push(FCI_ROUTES.SIGNATURE_FIELDS, {
        documentId: mockSignatureRequestDetailView.documents[0].id,
        currentDoc: 0
      })
    );
  });

  type ErrorKindScenario = {
    expectedKind: FciNetworkError["kind"];
    failure: FciNetworkError;
    name: string;
  };

  const errorKindScenarios: ReadonlyArray<ErrorKindScenario> = [
    {
      name: "generic error",
      failure: { kind: "generic", value: new Error("network error") },
      expectedKind: "generic"
    },
    {
      name: "expired error",
      failure: { kind: "expired" },
      expectedKind: "expired"
    }
  ];

  test.each(errorKindScenarios)(
    "should redirect to FciDocumentUnavailableScreen on $name",
    async ({ failure, expectedKind }) => {
      const store = createTestStore();
      store.dispatch(fciDownloadPreview.failure(failure));
      renderComponent(store);
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(FCI_ROUTES.MAIN, {
          screen: FCI_ROUTES.DOCUMENT_UNAVAILABLE,
          params: { errorKind: expectedKind }
        });
      });
    }
  );
});

const renderComponent = (store: Store) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    () => <FciDocumentsScreen />,
    FCI_ROUTES.DOCUMENTS,
    {},
    store
  );
