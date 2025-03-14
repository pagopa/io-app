import { useCallback, useEffect, useState } from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { searchPaginatedInstitutionsGet } from "../store/actions";
import {
  isErrorPaginatedInstitutionsSelector,
  isLoadingPaginatedInstitutionsSelector,
  isUpdatingPaginatedInstitutionsSelector,
  paginatedInstitutionsCurrentPageSelector,
  paginatedInstitutionsLastPageSelector,
  paginatedInstitutionsSelector
} from "../store/reducers";

const LIMIT: number = 20;

export const useInstitutionsFetcher = () => {
  const dispatch = useIODispatch();

  const paginatedInstitutions = useIOSelector(paginatedInstitutionsSelector);
  const currentPage = useIOSelector(paginatedInstitutionsCurrentPageSelector);
  const isLastPage = useIOSelector(paginatedInstitutionsLastPageSelector);
  const isLoading = useIOSelector(isLoadingPaginatedInstitutionsSelector);
  const isUpdating = useIOSelector(isUpdatingPaginatedInstitutionsSelector);
  const isError = useIOSelector(isErrorPaginatedInstitutionsSelector);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (isRefreshing && !isLoading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, isLoading]);

  const fetchPage = useCallback(
    (page: number, search?: string) => {
      dispatch(
        searchPaginatedInstitutionsGet.request({
          offset: page * LIMIT,
          limit: LIMIT,
          search
        })
      );
    },
    [dispatch]
  );

  const fetchNextPage = useCallback(
    (page: number, search: string) => {
      if (isLastPage) {
        return;
      }

      if (isLoading || isUpdating) {
        return;
      }

      fetchPage(page, search);
    },
    [fetchPage, isLastPage, isLoading, isUpdating]
  );

  const refresh = useCallback(
    (search?: string) => {
      setIsRefreshing(true);
      fetchPage(0, search);
    },
    [fetchPage]
  );

  return {
    currentPage,
    data: paginatedInstitutions,
    isError,
    isLoading,
    isUpdating,
    isRefreshing,
    fetchPage,
    fetchNextPage,
    refresh
  };
};
