import * as pot from "@pagopa/ts-commons/lib/pot";
import { useEffect } from "react";
import I18n from "../../../i18n";
import { maximumItemsFromAPI, pageSize } from "../../../config";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../../store/actions/messages";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { Collection } from "../../../store/reducers/entities/messages/allPaginated";
import { GlobalState } from "../../../store/reducers/types";
import { showToast } from "../../../utils/showToast";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";

export const useMessagesFetcher = (
  archived: boolean,
  messagesSelector: (state: GlobalState) => Collection["data"],
  isLoadingNextPageSelector: (state: GlobalState) => boolean,
  isLoadingPreviousPageSelector: (state: GlobalState) => boolean,
  isReloadingAllSelector: (state: GlobalState) => boolean
) => {
  const dispatch = useIODispatch();
  const messagesPot = useIOSelector(messagesSelector);
  const isError = pot.isError(messagesPot);
  const isSome = pot.isSome(messagesPot);

  const { messages, nextCursor, previousCursor } = pot.getOrElse(
    pot.map(messagesPot, mp => ({
      messages: mp.page,
      nextCursor: mp.next,
      previousCursor: mp.previous
    })),
    {
      messages: [],
      nextCursor: undefined,
      previousCursor: undefined
    }
  );

  const isLoadingNextPage = useIOSelector(isLoadingNextPageSelector);
  const isLoadingPreviousPage = useIOSelector(isLoadingPreviousPageSelector);
  const isReloadingAll = useIOSelector(isReloadingAllSelector);

  // the footer spinner is shown only if loading the
  // next message page or if there are no messages
  // in the list and the loading was triggered automatically
  const isLoading =
    isLoadingNextPage ||
    (messages.length === 0 && (isLoadingPreviousPage || isReloadingAll));

  // the top spinner is shown only if the user request a loading
  // by swiping-down-to-refresh or, when the loading was system initiated
  const isRefreshing =
    messages.length > 0 && (isLoadingPreviousPage || isReloadingAll);

  useOnFirstRender(
    () => {
      refresh();
    },
    () => !isSome
  );

  useEffect(() => {
    if (isError) {
      showToast(I18n.t("global.genericError"), "warning");
    }
  }, [isError]);

  const refresh = () => {
    dispatch(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: archived }
      })
    );
  };

  const fetchNextPage = () => {
    if (!nextCursor || isLoadingNextPage) {
      return;
    }

    dispatch(
      loadNextPageMessages.request({
        pageSize,
        cursor: nextCursor,
        filter: { getArchived: archived }
      })
    );
  };

  const fetchPreviousPage = () => {
    dispatch(
      loadPreviousPageMessages.request({
        pageSize: maximumItemsFromAPI,
        cursor: previousCursor,
        filter: { getArchived: archived }
      })
    );
  };

  return {
    isSome,
    isError,
    isLoading,
    isRefreshing,
    messages,
    nextCursor,
    previousCursor,
    refresh,
    fetchNextPage,
    fetchPreviousPage
  };
};
