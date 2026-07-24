import { waitFor } from "@testing-library/react-native";
import { createStore, Store } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import {
  fciDownloadPreview,
  fciSignatureRequestFromId
} from "../../store/actions";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import { FciNetworkError } from "../../utils/errors";
import FciDocumentsScreen from "../valid/FciDocumentsScreen";

const mockReplace = jest.fn();
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
          return mockShouldNeverCall;
        }
      })
  };
});

const createTestStore = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store: Store<GlobalState> = createStore(appReducer, globalState as any);
  store.dispatch(
    fciSignatureRequestFromId.success({ ...mockSignatureRequestDetailView })
  );
  return store;
};

describe("Test FciDocuments screen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("it should render the FciDocuments screen", () => {
    const store = createTestStore();
    const component = renderComponent(store);
    expect(component).toBeTruthy();
  });

  it("it should render the content and footer", async () => {
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
