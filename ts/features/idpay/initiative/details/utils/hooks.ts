import * as pot from "@pagopa/ts-commons/lib/pot";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import {
  idpayIsLastTimelinePageSelector,
  idpayMergedTimelineSelector,
  idpayTimelineLastPageSelector,
  idpayTimelineSelector
} from "../store";
import { idpayTimelinePageGet } from "../store/actions";

export const useInitiativeTimelineFetcher = (
  initiativeId: string,
  pageSize: number,
  showErrorToast: () => void
) => {
  const dispatch = useIODispatch();
  const timelineFromSelector = useIOSelector(idpayTimelineSelector);

  const isLoading = pot.isLoading(timelineFromSelector);

  const isLastPage = useIOSelector(idpayIsLastTimelinePageSelector);
  const mergedTimeline = useIOSelector(idpayMergedTimelineSelector);
  const currentPage = useIOSelector(idpayTimelineLastPageSelector);

  const resetTimeline = () => {
    dispatch(
      idpayTimelinePageGet.request({
        initiativeId,
        page: 0,
        pageSize
      })
    );
  };

  const fetchGivenPage = (page: number) =>
    dispatch(idpayTimelinePageGet.request({ initiativeId, page, pageSize }));

  const fetchNextPage = () => {
    if (isLastPage || isLoading) {
      return;
    }
    if (pot.isError(timelineFromSelector)) {
      showErrorToast();
    } else {
      fetchGivenPage(currentPage + 1);
    }
  };

  const retryFetchLastPage = () => {
    fetchGivenPage(currentPage);
  };

  return {
    isLoading,
    timeline: mergedTimeline,
    fetchPage: fetchGivenPage,
    resetTimeline,
    fetchNextPage,
    retryFetchLastPage,
    currentPage
  } as const;
};
