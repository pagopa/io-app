import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { searchPaginatedInstitutionsGet } from "../store/actions";
import {
  isErrorPaginatedInstitutionsSelector,
  isLoadingPaginatedInstitutionsSelector,
  isUpdatingPaginatedInstitutionsSelector,
  paginatedInstitutionsCurrentPageSelector,
  paginatedInstitutionsLastPageSelector,
  paginatedInstitutionsSelector
} from "../store/selectors";

const LIMIT: number = 20;

export const useInstitutionsFetcher = () => {
  const dispatch = useIODispatch();

  const sessionId = useRef<string | undefined>(undefined);

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
      // If this is the first page, start a new search session
      // by generating a new uuid
      if (page === 0) {
        // eslint-disable-next-line functional/immutable-data
        sessionId.current = uuid();
      }

      dispatch(
        searchPaginatedInstitutionsGet.request({
          offset: page * LIMIT,
          limit: LIMIT,
          search,
          sessionId: sessionId.current
        })
      );
    },
    [dispatch]
  );

  const fetchNextPage = useCallback(
    (search: string) => {
      if (isLastPage || isLoading || isUpdating) {
        return;
      }

      fetchPage(currentPage + 1, search);
    },
    [currentPage, fetchPage, isLastPage, isLoading, isUpdating]
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
    fetchNextPage,
    refresh
  };
};
