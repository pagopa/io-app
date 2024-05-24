import { useCallback, useEffect, useState } from "react";
import { ScopeTypeEnum } from "../../../../../definitions/services/ScopeType";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { paginatedInstitutionsGet } from "../store/actions";
import {
  isErrorPaginatedInstitutionsSelector,
  isLoadingPaginatedInstitutionsSelector,
  isUpdatingPaginatedInstitutionsSelector,
  paginatedInstitutionsCurrentPageSelector,
  paginatedInstitutionsLastPageSelector,
  paginatedInstitutionsSelector
} from "../store/reducers";

const LIMIT: number = 10;

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
    if (isRefreshing && !isUpdating) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, isUpdating]);

  const fetchPage = useCallback(
    (page: number) => {
      if (!isLoading && !isUpdating) {
        dispatch(
          paginatedInstitutionsGet.request({
            offset: page * LIMIT,
            limit: LIMIT,
            scope: ScopeTypeEnum.NATIONAL
          })
        );
      }
    },
    [dispatch, isLoading, isUpdating]
  );

  const fetchInstitutions = useCallback(
    (page: number) => {
      if (isLastPage) {
        return;
      }

      fetchPage(page);
    },
    [isLastPage, fetchPage]
  );

  const refreshInstitutions = useCallback(() => {
    setIsRefreshing(true);
    fetchPage(0);
  }, [fetchPage]);

  return {
    currentPage,
    data: paginatedInstitutions,
    isError,
    isLoading,
    isUpdating,
    isRefreshing,
    fetchInstitutions,
    refreshInstitutions
  };
};
