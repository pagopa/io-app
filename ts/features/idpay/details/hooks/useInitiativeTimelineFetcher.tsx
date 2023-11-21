import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
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
  pageSize: number,
  onError: () => void
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

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (currentPage >= 0 && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [currentPage, isRefreshing]);

  const refresh = () => {
    if (!isLoading) {
      setIsRefreshing(true);
      fetchPage(0);
    }
  };

  const fetchPage = (page: number) =>
    !isUpdating &&
    !isLoading &&
    dispatch(
      idpayTimelinePageGet.request({
        initiativeId,
        page,
        pageSize
      })
    );

  const fetchNextPage = () => {
    if (isLastPage || isLoading) {
      return;
    }
    if (isError) {
      onError();
    } else {
      fetchPage(currentPage + 1);
    }
  };

  const retryFetchLastPage = () => {
    fetchPage(currentPage);
  };

  return {
    isLoading,
    isUpdating,
    isRefreshing,
    timeline,
    fetchPage,
    refresh,
    fetchNextPage,
    retryFetchLastPage,
    currentPage,
    lastUpdate
  } as const;
};
