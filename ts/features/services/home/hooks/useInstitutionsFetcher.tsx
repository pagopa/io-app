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

const LIMIT: number = 20;

export const useInstitutionsFetcher = () => {
  const dispatch = useIODispatch();

  const paginatedInstitutions = useIOSelector(paginatedInstitutionsSelector);
  const currentPage = useIOSelector(paginatedInstitutionsCurrentPageSelector);
  const isLastPage = useIOSelector(paginatedInstitutionsLastPageSelector);
  const isLoading = useIOSelector(isLoadingPaginatedInstitutionsSelector);
  const isUpdating = useIOSelector(isUpdatingPaginatedInstitutionsSelector);
  const isError = useIOSelector(isErrorPaginatedInstitutionsSelector);

  const fetchPage = (page: number) => {
    if (!isLoading && !isUpdating) {
      dispatch(
        paginatedInstitutionsGet.request({
          offset: page * LIMIT,
          limit: LIMIT,
          scope: ScopeTypeEnum.NATIONAL
        })
      );
    }
  };

  const fetchInstitutions = (page: number) => {
    if (isLastPage) {
      return;
    }

    fetchPage(page);
  };

  const refreshInstitutions = () => fetchPage(0);

  return {
    currentPage,
    data: paginatedInstitutions,
    isError,
    isLoading,
    isUpdating,
    fetchInstitutions,
    refreshInstitutions
  };
};
