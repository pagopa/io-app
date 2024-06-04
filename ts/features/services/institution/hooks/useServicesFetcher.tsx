import { useCallback, useEffect, useState } from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { paginatedServicesGet } from "../store/actions";
import {
  isErrorPaginatedServicesSelector,
  isLoadingPaginatedServicesSelector,
  isUpdatingPaginatedServicesSelector,
  paginatedServicesCurrentPageSelector,
  paginatedServicesLastPageSelector,
  paginatedServicesSelector
} from "../store/reducers";

const LIMIT: number = 20;

export const useServicesFetcher = (institutionId: string) => {
  const dispatch = useIODispatch();

  const paginatedServices = useIOSelector(paginatedServicesSelector);
  const currentPage = useIOSelector(paginatedServicesCurrentPageSelector);
  const isLastPage = useIOSelector(paginatedServicesLastPageSelector);
  const isLoading = useIOSelector(isLoadingPaginatedServicesSelector);
  const isUpdating = useIOSelector(isUpdatingPaginatedServicesSelector);
  const isError = useIOSelector(isErrorPaginatedServicesSelector);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (isRefreshing && !isUpdating) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, isUpdating]);

  const fetchPage = useCallback(
    (page: number) => {
      if (!isLoading && !isUpdating) {
        dispatch(
          paginatedServicesGet.request({
            institutionId,
            offset: page * LIMIT,
            limit: LIMIT
          })
        );
      }
    },
    [dispatch, institutionId, isLoading, isUpdating]
  );

  const fetchNextPage = useCallback(
    (page: number) => {
      if (isLastPage) {
        return;
      }

      fetchPage(page);
    },
    [isLastPage, fetchPage]
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPage(0);
  }, [fetchPage]);

  return {
    currentPage,
    data: paginatedServices,
    fetchPage,
    fetchNextPage,
    isError,
    isLoading,
    isUpdating,
    isRefreshing,
    refresh
  };
};
