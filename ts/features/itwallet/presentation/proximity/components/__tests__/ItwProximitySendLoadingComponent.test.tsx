import { act, screen } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import { ItwProximitySendLoadingComponent } from "../ItwProximitySendLoadingComponent";

const i18nKey = (step: 0 | 1 | 2, field: "title" | "subtitle") =>
  I18n.t(
    `features.itWallet.presentation.proximity.sendDocumentsLoading.${step}.${field}`
  );

describe("ItwProximitySendLoadingComponent", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Cancel remaining fake timers between tests to prevent state leaks
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should display step 0 copy on initial render", () => {
    renderComponent();

    expect(screen.getByText(i18nKey(0, "title"))).toBeTruthy();
    expect(screen.getByText(i18nKey(0, "subtitle"))).toBeTruthy();
  });

  it("should display step 1 copy after 5 seconds", () => {
    renderComponent();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText(i18nKey(1, "title"))).toBeTruthy();
    expect(screen.getByText(i18nKey(1, "subtitle"))).toBeTruthy();
  });

  it("should display step 2 copy after 10 seconds", () => {
    renderComponent();

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByText(i18nKey(2, "title"))).toBeTruthy();
    expect(screen.getByText(i18nKey(2, "subtitle"))).toBeTruthy();
  });

  it("should not display step 1 or step 2 copy on initial render", () => {
    renderComponent();

    expect(screen.queryByText(i18nKey(1, "title"))).toBeNull();
    expect(screen.queryByText(i18nKey(2, "title"))).toBeNull();
  });

  it("should clear both timers on unmount", () => {
    const { unmount } = renderComponent();

    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    unmount();

    // Both timers (5s and 10s) must be cleared — verify their IDs appear in the calls
    const clearedIds = clearTimeoutSpy.mock.calls.map(([id]) => id);
    // clearTimeout must have been called at least twice with non-null timer IDs
    expect(clearedIds.filter(id => id != null).length).toBeGreaterThanOrEqual(
      2
    );
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwProximitySendLoadingComponent,
    ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE,
    {},
    store
  );
};
