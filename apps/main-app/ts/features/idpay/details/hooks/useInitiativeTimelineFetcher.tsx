import * as pot from "@pagopa/ts-commons/lib/pot";
import { useEffect, useRef, useState } from "react";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  idpayOperationListSelector,
  idpayPaginatedTimelineSelector,
  idpayTimelineCurrentPageSelector,
  idpayTimelineIsLastPageSelector,
  idpayTimelineLastUpdateSelector
} from "../store";
import { idpayTimelinePageGet } from "../store/actions";

export const useInitiativeTimelineFetcher = (
  initiativeId: string,
  pageSize: number
) => {
  const dispatch = useIODispatch();

  const paginatedTimelinePot = useIOSelector(idpayPaginatedTimelineSelector);
  const isLastPage = useIOSelector(idpayTimelineIsLastPageSelector);
  const currentPage = useIOSelector(idpayTimelineCurrentPageSelector);
  const lastUpdate = useIOSelector(idpayTimelineLastUpdateSelector);

  const timeline = useIOSelector(idpayOperationListSelector);

  const isLoading = pot.isLoading(paginatedTimelinePot);
  const isUpdating = pot.isUpdating(paginatedTimelinePot);
  const isError = pot.isError(paginatedTimelinePot);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestPending = useRef(false);
  const lastRequest = useRef<undefined | { isRefresh: boolean; page: number }>(
    undefined
  );

  useEffect(() => {
    if (!isLoading && !isUpdating) {
      requestPending.current = false;
      setIsRefreshing(false);
    }
  }, [isLoading, isUpdating]);

  const fetchPage = (page: number, isRefresh = false) => {
    if (isUpdating || isLoading || requestPending.current) {
      return;
    }
    requestPending.current = true;
    lastRequest.current = { page, isRefresh };
    if (isRefresh) {
      setIsRefreshing(true);
    }
    dispatch(
      idpayTimelinePageGet.request({
        initiativeId,
        page,
        pageSize,
        ...(isRefresh ? { isRefresh } : {})
      })
    );
  };

  const refresh = () => fetchPage(0, true);

  const fetchNextPage = () => {
    if (isLastPage || isLoading || isUpdating || isError) {
      return;
    }
    fetchPage(currentPage + 1);
  };

  const retryFetchLastPage = () => {
    fetchPage(
      lastRequest.current?.page ?? currentPage + 1,
      lastRequest.current?.isRefresh
    );
  };

  return {
    isLoading,
    isUpdating,
    isRefreshing,
    isError,
    timeline,
    fetchPage,
    refresh,
    fetchNextPage,
    retryFetchLastPage,
    currentPage,
    lastUpdate
  } as const;
};
