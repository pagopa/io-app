jest.mock("../../hooks/useFimsHistoryResultToasts.tsx");
jest.mock("../FimsHistoryLoaders.tsx");
jest.mock("../FimsHistoryListItemPicker.tsx");

import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { AccessHistoryPage } from "../../../../../../definitions/fims_history/AccessHistoryPage";
import {
  remoteLoading,
  remoteReady
} from "../../../../../common/model/RemoteValue";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { FIMS_ROUTES } from "../../../common/navigation";
import {
  FimsHistoryNonEmptyContent,
  FimsHistoryNonEmptyContentProps
} from "../FimsHistoryNonEmptyContent";
import * as HOOK from "../../hooks/useFimsHistoryResultToasts";

const mockAccess = {
  id: "TESTING",
  redirect: { display_name: "TESTING", uri: "TESTING" },
  service_id: "TESTING_SID",
  timestamp: new Date(0)
};

const mockAccesses: AccessHistoryPage = {
  data: [mockAccess]
};
const mockEmptyAccesses: AccessHistoryPage = {
  data: []
};

// ------------------- UTILS

const generateMockStoreForSelectors = (
  isHistoryLoading: boolean,
  isHistoryExporting: boolean
) =>
  ({
    features: {
      fims: {
        history: {
          historyExportState: isHistoryExporting
            ? remoteLoading
            : remoteReady("SUCCESS"),
          consentsList: isHistoryLoading ? pot.someLoading({}) : pot.none
        }
      }
    }
  } as GlobalState);
const renderComponent = (
  props: FimsHistoryNonEmptyContentProps,
  mockState: GlobalState
) => {
  const globalState = appReducer(mockState, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext(
    () => <FimsHistoryNonEmptyContent {...props} />,
    FIMS_ROUTES.HISTORY,
    {},
    createStore(appReducer, globalState as any)
  );
};

// --------------- END UTILS

// eslint-disable-next-line sonarjs/cognitive-complexity
describe("fimsHistoryNonEmptyContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  for (const historyLoading of [true, false]) {
    for (const historyExporting of [true, false]) {
      for (const hasAccesses of [true, false]) {
        const fetchMore = jest.fn();
        const shouldShowLoadingListFooter = historyLoading;
        const shouldRenderPageFooter = !historyLoading || hasAccesses; // component logic is !( hLoading && !accesses )
        const store = generateMockStoreForSelectors(
          historyLoading,
          historyExporting
        );

        const testString = `${+hasAccesses} accesses, historyLoading = ${historyLoading} and historyExporting = ${historyExporting}`;

        it(`should ${
          hasAccesses ? "" : "not "
        }fetch automatically to try and fill the list, and match snapshot for ${testString} `, () => {
          const component = renderComponent(
            {
              accesses: hasAccesses ? mockAccesses : mockEmptyAccesses,
              fetchMore
            },
            store
          );
          expect(component).toBeTruthy();
          expect(component).toMatchSnapshot();
          expect(fetchMore).toHaveBeenCalledTimes(hasAccesses ? 1 : 0);
        });

        it(`should ${
          shouldShowLoadingListFooter ? "" : "not"
        } render list loading footer in case of ${testString} `, () => {
          const component = renderComponent(
            {
              accesses: hasAccesses ? mockAccesses : mockEmptyAccesses,
              fetchMore
            },
            store
          );
          if (shouldShowLoadingListFooter) {
            expect(component.queryByTestId("testing-footer")).toBeTruthy();
          } else {
            expect(component.queryByTestId("testing-footer")).toBeNull();
          }
        });
        it(`should
            ${shouldRenderPageFooter ? "" : "not"}
            render export footer in case of ${testString} `, () => {
          const component = renderComponent(
            {
              accesses: hasAccesses ? mockAccesses : mockEmptyAccesses,
              fetchMore
            },
            store
          );
          if (shouldRenderPageFooter) {
            expect(component.queryByTestId("export-footer")).toBeTruthy();
          } else {
            expect(component.queryByTestId("export-footer")).toBeNull();
          }
        });

        if (shouldRenderPageFooter) {
          const isPageFooterLoading = historyExporting;
          it(`should ${
            isPageFooterLoading ? "not" : ""
          } dispatch the onPress if the user taps the primary action in case of ${testString}`, () => {
            const mockHandleExportOnPress = jest.fn();
            jest.spyOn(HOOK, "useFimsHistoryExport").mockReturnValue({
              handleExportOnPress: mockHandleExportOnPress
            });

            const component = renderComponent(
              {
                accesses: hasAccesses ? mockAccesses : mockEmptyAccesses,
                fetchMore
              },
              store
            );

            const renderedComponent = component.getByTestId("export-button");
            expect(renderedComponent).toBeTruthy();

            fireEvent.press(renderedComponent);

            expect(mockHandleExportOnPress).toHaveBeenCalledTimes(
              isPageFooterLoading ? 0 : 1
            );
          });
        }
      }
    }
  }
});
