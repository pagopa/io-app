import { act, fireEventAsync } from "@testing-library/react-native";
import I18n from "i18next";
import { FlatList, Text as MockText, RefreshControl } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { Action } from "../../../../../store/actions/types";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContextAsync } from "../../../../../utils/testWrapper";
import { TimelineDTO } from "../../../common/api/timeline";
import { IDPayDetailsRoutes } from "../../navigation";
import { idpayTimelinePageGet } from "../../store/actions";
import { IdPayOperationsListScreen } from "../IdPayOperationsListScreen";

jest.mock(
  "../../../timeline/components/IdPayTimelineDetailsBottomSheet",
  () => ({
    useIdPayTimelineDetailsBottomSheet: () => ({
      present: jest.fn(),
      bottomSheet: <MockText testID="operation-bottom-sheet">Details</MockText>
    })
  })
);

const initiativeId = "initiative";
const pageSize = 10;
const error = { kind: "timeout" } as const;
const retryLabel = () =>
  I18n.t("features.payments.methods.error.banner.retryButton");
const errorLabel = () =>
  I18n.t("features.wallet.home.otherMethods.error.banner.label");

const page = (pageNo: number) => {
  const decoded = TimelineDTO.decode({
    lastUpdate: "2026-10-21T11:57:09.192Z",
    operationList: [
      {
        operationId: `refund-${pageNo}`,
        eventId: `event-${pageNo}`,
        operationType: "PAID_REFUND",
        operationDate: "2026-10-21T10:34:50.294Z",
        amountCents: 7878
      }
    ],
    pageNo,
    pageSize,
    totalElements: 16,
    totalPages: 2
  });
  if (decoded._tag === "Left") {
    throw new Error("Invalid timeline fixture");
  }
  return decoded.right;
};

const setup = async (previewLoading = false) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    (state: GlobalState = initialState, action: Action) =>
      appReducer(state, action)
  );
  if (previewLoading) {
    store.dispatch(
      idpayTimelinePageGet.request({ initiativeId, page: 0, pageSize: 5 })
    );
  }
  const dispatch = jest.spyOn(store, "dispatch");
  const component = await renderScreenWithNavigationStoreContextAsync(
    IdPayOperationsListScreen,
    IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE,
    { initiativeId },
    store
  );
  const succeed = (pageNo: number) =>
    act(async () => {
      store.dispatch(
        idpayTimelinePageGet.success({
          page: pageNo,
          timeline: page(pageNo)
        })
      );
    });
  return { component, store, dispatch, succeed };
};

describe("IdPayOperationsListScreen loading", () => {
  it("waits for an in-flight preview before loading page zero with the list page size", async () => {
    const { dispatch, succeed } = await setup(true);
    expect(dispatch).not.toHaveBeenCalled();
    await succeed(0);
    expect(dispatch).toHaveBeenLastCalledWith(
      idpayTimelinePageGet.request({ initiativeId, page: 0, pageSize })
    );
  });

  it("forwards pagination and refresh to the native list and mounts operation details", async () => {
    const { component, dispatch, succeed } = await setup();
    expect(component.getByTestId("operation-bottom-sheet")).toBeTruthy();
    expect(dispatch).toHaveBeenCalledWith(
      idpayTimelinePageGet.request({ initiativeId, page: 0, pageSize })
    );
    await succeed(0);
    const list = component.UNSAFE_getByType(FlatList);
    expect(list.props.onEndReachedThreshold).toBe(0.5);
    await fireEventAsync(list, "endReached", { distanceFromEnd: 0 });
    expect(dispatch).toHaveBeenLastCalledWith(
      idpayTimelinePageGet.request({ initiativeId, page: 1, pageSize })
    );
    await succeed(1);
    dispatch.mockClear();
    await fireEventAsync(list, "endReached", { distanceFromEnd: 0 });
    expect(dispatch).not.toHaveBeenCalled();
    await fireEventAsync(component.UNSAFE_getByType(RefreshControl), "refresh");
    expect(dispatch).toHaveBeenLastCalledWith(
      idpayTimelinePageGet.request({
        initiativeId,
        page: 0,
        pageSize,
        isRefresh: true
      })
    );
    expect(component.UNSAFE_getByType(RefreshControl).props.refreshing).toBe(
      true
    );
    await succeed(0);
    expect(component.UNSAFE_getByType(RefreshControl).props.refreshing).toBe(
      false
    );
  });

  it("shows an initial error and retries page zero without a stuck refresh", async () => {
    const { component, store, dispatch, succeed } = await setup();
    await act(async () => {
      store.dispatch(idpayTimelinePageGet.failure(error));
    });
    expect(component.getByText(errorLabel())).toBeTruthy();
    expect(
      component.queryByText(
        I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.lastUpdated"
        )
      )
    ).toBeNull();
    await fireEventAsync.press(component.getByText(retryLabel()));
    expect(dispatch).toHaveBeenLastCalledWith(
      idpayTimelinePageGet.request({ initiativeId, page: 0, pageSize })
    );
    await succeed(0);
    await fireEventAsync(component.UNSAFE_getByType(RefreshControl), "refresh");
    await act(async () => {
      store.dispatch(idpayTimelinePageGet.failure(error));
    });
    expect(component.UNSAFE_getByType(RefreshControl).props.refreshing).toBe(
      false
    );
    expect(component.getByText(errorLabel())).toBeTruthy();
  });

  it("keeps cached operations after a failed refresh and replaces them after retry", async () => {
    const { component, store, dispatch, succeed } = await setup();
    await succeed(0);
    await fireEventAsync(component.UNSAFE_getByType(FlatList), "endReached", {
      distanceFromEnd: 0
    });
    await succeed(1);
    const cachedOperations = component.UNSAFE_getByType(FlatList).props.data;
    expect(cachedOperations).toHaveLength(2);
    await fireEventAsync(component.UNSAFE_getByType(RefreshControl), "refresh");
    expect(component.UNSAFE_getByType(FlatList).props.data).toEqual(
      cachedOperations
    );
    await act(async () => {
      store.dispatch(idpayTimelinePageGet.failure(error));
    });
    expect(component.UNSAFE_getByType(FlatList).props.data).toEqual(
      cachedOperations
    );
    expect(component.UNSAFE_getByType(RefreshControl).props.refreshing).toBe(
      false
    );
    expect(component.getByText(errorLabel())).toBeTruthy();
    await fireEventAsync.press(component.getByText(retryLabel()));
    expect(dispatch).toHaveBeenLastCalledWith(
      idpayTimelinePageGet.request({
        initiativeId,
        page: 0,
        pageSize,
        isRefresh: true
      })
    );
    await succeed(0);
    expect(component.UNSAFE_getByType(FlatList).props.data).toEqual(
      page(0).operationList
    );
    expect(component.queryByText(errorLabel())).toBeNull();
    await fireEventAsync(component.UNSAFE_getByType(FlatList), "endReached", {
      distanceFromEnd: 0
    });
    expect(dispatch).toHaveBeenLastCalledWith(
      idpayTimelinePageGet.request({ initiativeId, page: 1, pageSize })
    );
  });

  it("keeps loaded operations on pagination failure and retries the missing page", async () => {
    const { component, store, dispatch, succeed } = await setup();
    await succeed(0);
    await fireEventAsync(component.UNSAFE_getByType(FlatList), "endReached", {
      distanceFromEnd: 0
    });
    await act(async () => {
      store.dispatch(idpayTimelinePageGet.failure(error));
    });
    expect(component.UNSAFE_getByType(FlatList).props.data).toHaveLength(1);
    expect(component.getByText(errorLabel())).toBeTruthy();
    await fireEventAsync.press(component.getByText(retryLabel()));
    expect(dispatch).toHaveBeenLastCalledWith(
      idpayTimelinePageGet.request({ initiativeId, page: 1, pageSize })
    );
    await succeed(1);
    expect(component.UNSAFE_getByType(FlatList).props.data).toHaveLength(2);
    expect(component.queryByText(errorLabel())).toBeNull();
  });
});
