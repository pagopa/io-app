import { act, renderHook } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { Action } from "../../../../../store/actions/types";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { TimelineDTO } from "../../../common/api/timeline";
import { idpayTimelinePageGet } from "../../store/actions";
import { useInitiativeTimelineFetcher } from "../useInitiativeTimelineFetcher";

const initiativeId = "initiative";
const pageSize = 10;
const error = { kind: "timeout" } as const;

const page = (pageNo: number, totalPages = 3) => {
  const decoded = TimelineDTO.decode({
    lastUpdate: "2026-10-21T11:57:09.192Z",
    operationList: [],
    pageNo,
    pageSize,
    totalElements: 25,
    totalPages
  });
  if (decoded._tag === "Left") {
    throw new Error("Invalid timeline fixture");
  }
  return decoded.right;
};

const setup = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    (state: GlobalState = initialState, action: Action) =>
      appReducer(state, action)
  );
  const dispatch = jest.spyOn(store, "dispatch");
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(
    () => useInitiativeTimelineFetcher(initiativeId, pageSize),
    { wrapper }
  );
  const succeed = (pageNo: number, totalPages?: number) =>
    act(() => {
      store.dispatch(
        idpayTimelinePageGet.success({
          page: pageNo,
          timeline: page(pageNo, totalPages)
        })
      );
    });
  return { ...hook, store, dispatch, succeed };
};

describe("useInitiativeTimelineFetcher", () => {
  it.each([
    { name: "success", fails: false },
    { name: "failure", fails: true }
  ])("stops refreshing after $name", ({ fails }) => {
    const { result, store, succeed } = setup();
    succeed(0);
    act(() => result.current.refresh());
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.isLoading).toBe(true);

    if (fails) {
      act(() => {
        store.dispatch(idpayTimelinePageGet.failure(error));
      });
    } else {
      succeed(0);
    }

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(fails);
  });

  it("loads successive pages without duplicate requests in the same render", () => {
    const { result, dispatch, succeed } = setup();
    succeed(0);
    dispatch.mockClear();
    act(() => {
      result.current.fetchNextPage();
      result.current.fetchNextPage();
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      idpayTimelinePageGet.request({ initiativeId, page: 1, pageSize })
    );
    expect(result.current.isUpdating).toBe(true);
    succeed(1);
    act(() => result.current.fetchNextPage());
    expect(dispatch).toHaveBeenLastCalledWith(
      idpayTimelinePageGet.request({ initiativeId, page: 2, pageSize })
    );
    succeed(2);
    dispatch.mockClear();
    act(() => result.current.fetchNextPage());
    expect(dispatch).not.toHaveBeenCalled();
  });

  it.each([
    { name: "initial load", loadedPage: -1, retryPage: 0 },
    { name: "pagination", loadedPage: 0, retryPage: 1 }
  ])(
    "explicitly retries the failed $name page",
    ({ loadedPage, retryPage }) => {
      const { result, store, dispatch, succeed } = setup();
      if (loadedPage >= 0) {
        succeed(loadedPage);
      }
      act(() => result.current.fetchNextPage());
      act(() => {
        store.dispatch(idpayTimelinePageGet.failure(error));
      });
      expect(result.current.isError).toBe(true);
      dispatch.mockClear();
      act(() => result.current.fetchNextPage());
      expect(dispatch).not.toHaveBeenCalled();
      act(() => result.current.retryFetchLastPage());
      expect(dispatch).toHaveBeenCalledWith(
        idpayTimelinePageGet.request({
          initiativeId,
          page: retryPage,
          pageSize
        })
      );
    }
  );

  it("does not start a refresh while a page is being loaded", () => {
    const { result, dispatch, succeed } = setup();
    succeed(0);
    act(() => result.current.fetchNextPage());
    dispatch.mockClear();
    act(() => result.current.refresh());
    expect(dispatch).not.toHaveBeenCalled();
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isUpdating).toBe(true);
  });

  it("retries a failed refresh from page zero and restarts pagination after success", () => {
    const { result, store, dispatch, succeed } = setup();
    succeed(0);
    succeed(1);
    act(() => result.current.refresh());
    expect(result.current.currentPage).toBe(1);
    act(() => {
      store.dispatch(idpayTimelinePageGet.failure(error));
    });
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.currentPage).toBe(1);
    act(() => result.current.retryFetchLastPage());
    expect(dispatch).toHaveBeenLastCalledWith(
      idpayTimelinePageGet.request({
        initiativeId,
        page: 0,
        pageSize,
        isRefresh: true
      })
    );
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.currentPage).toBe(1);
    succeed(0);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.currentPage).toBe(0);
    act(() => result.current.fetchNextPage());
    expect(dispatch).toHaveBeenLastCalledWith(
      idpayTimelinePageGet.request({ initiativeId, page: 1, pageSize })
    );
  });
});
