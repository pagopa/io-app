import * as pot from "@pagopa/ts-commons/lib/pot";
import { useCallback, useEffect, useState } from "react";
import { ScopeTypeEnum } from "../../../../../definitions/services/ScopeType";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { paginatedInstitutionsGet } from "../store/actions";
import {
  paginatedInstitutionsCurrentPageSelector,
  paginatedInstitutionsLastPageSelector,
  paginatedInstitutionsPotSelector
} from "../store/selectors";

const LIMIT: number = 10;
const NEXT_PAGE_LOADING_WAIT_MILLISECONDS: number = 1000;

export const useInstitutionsFetcher = () => {
  const dispatch = useIODispatch();

  const paginatedInstitutionsPot = useIOSelector(
    paginatedInstitutionsPotSelector
  );
  const currentPage = useIOSelector(paginatedInstitutionsCurrentPageSelector);
  const isLastPage = useIOSelector(paginatedInstitutionsLastPageSelector);

  const paginatedInstitutions = pot.toUndefined(paginatedInstitutionsPot);
  const isError = pot.isError(paginatedInstitutionsPot);
  const isLoading = pot.isLoading(paginatedInstitutionsPot);
  const isUpdating = pot.isUpdating(paginatedInstitutionsPot);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useOnFirstRender(() => fetchPage(0));

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

  const fetchNextPage = useCallback(() => {
    if (isLastPage) {
      return;
    }
    // If there was an error in the last page-loading, we prevent
    // the page from reloading continuosly when the server endpoint keeps
    // replying with an error. In such case we block the call and wait for
    // a little bit before the request can be sent again
    if (isError) {
      const millisecondsAfterLastError =
        new Date().getTime() - paginatedInstitutionsPot.error.time.getTime();

      if (millisecondsAfterLastError < NEXT_PAGE_LOADING_WAIT_MILLISECONDS) {
        return;
      }
    }

    fetchPage(currentPage + 1);
  }, [currentPage, isError, isLastPage, paginatedInstitutionsPot, fetchPage]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPage(0);
  }, [fetchPage]);

  return {
    currentPage,
    data: paginatedInstitutions,
    fetchNextPage,
    isError,
    isLastPage,
    isLoading,
    isUpdating,
    isRefreshing,
    refresh
  };
};
