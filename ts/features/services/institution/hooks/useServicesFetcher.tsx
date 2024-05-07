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

const LIMIT: number = 10;

export const useServicesFetcher = (institutionId: string) => {
  const dispatch = useIODispatch();

  const paginatedServices = useIOSelector(paginatedServicesSelector);
  const currentPage = useIOSelector(paginatedServicesCurrentPageSelector);
  const isLastPage = useIOSelector(paginatedServicesLastPageSelector);
  const isLoading = useIOSelector(isLoadingPaginatedServicesSelector);
  const isUpdating = useIOSelector(isUpdatingPaginatedServicesSelector);
  const isError = useIOSelector(isErrorPaginatedServicesSelector);

  const fetchPage = (page: number) => {
    if (!isLoading && !isUpdating) {
      dispatch(
        paginatedServicesGet.request({
          institutionId,
          offset: page * LIMIT,
          limit: LIMIT
        })
      );
    }
  };

  const fetchServices = (page: number) => {
    if (isLastPage) {
      return;
    }

    fetchPage(page);
  };

  const refreshServices = () => fetchPage(0);

  return {
    currentPage,
    data: paginatedServices,
    isError,
    isLoading,
    isUpdating,
    fetchServices,
    refreshServices
  };
};
