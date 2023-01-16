import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { idpayTimelineSelector } from "../store";
import { idpayTimelinePageGet } from "../store/actions";

export const useInitiativeTimelineFetcher = (
  initiativeId: string,
  pageSize: number
) => {
  const dispatch = useIODispatch();
  const timelineFromSelector = useIOSelector(idpayTimelineSelector);

  const isLoading = pot.isLoading(timelineFromSelector);
  const isError = pot.isError(timelineFromSelector);

  const pageRef = React.useRef(-1);
  const isFirstLoading = pageRef.current <= 0 && isLoading;

  const timeline = pot.getOrElse(timelineFromSelector, {
    lastUpdate: new Date(),
    operationList: []
  });

  const fetchNextPage = () => {
    if (!isError && !isLoading) {
      // eslint-disable-next-line functional/immutable-data
      pageRef.current = pageRef.current + 1;

      dispatch(
        idpayTimelinePageGet.request({
          initiativeId,
          page: pageRef.current,
          pageSize
        })
      );
    }
  };

  return {
    isLoading,
    isFirstLoading,
    timeline,
    fetchNextPage,
    currentPage: pageRef.current
  } as const;
};
