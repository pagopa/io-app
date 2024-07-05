import {
  call,
  cancelled,
  put,
  race,
  take,
  select
} from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { MessageStatusArchivingChange } from "../../../../definitions/backend/MessageStatusArchivingChange";
import { MessageStatusBulkChange } from "../../../../definitions/backend/MessageStatusBulkChange";
import { MessageStatusChange } from "../../../../definitions/backend/MessageStatusChange";
import { MessageStatusReadingChange } from "../../../../definitions/backend/MessageStatusReadingChange";
import { BackendClient } from "../../../api/backend";
import {
  upsertMessageStatusAttributes,
  UpsertMessageStatusAttributesPayload
} from "../store/actions";
import { SagaCallReturnType } from "../../../types/utils";
import { getError } from "../../../utils/errors";
import { withRefreshApiCall } from "../../fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import { trackUpsertMessageStatusAttributesFailure } from "../analytics";
import { handleResponse } from "../utils/responseHandling";
import {
  resetMessageArchivingAction,
  interruptMessageArchivingProcessingAction,
  removeScheduledMessageArchivingAction,
  startProcessingMessageArchivingAction
} from "../store/actions/archiving";
import { nextQueuedMessageDataUncachedSelector } from "../store/reducers/archiving";
import { paginatedMessageFromIdForCategorySelector } from "../store/reducers/allPaginated";
import { MessageListCategory } from "../types/messageListCategory";

/**
 * @throws invalid payload
 * @param payload
 */
function validatePayload(
  payload: UpsertMessageStatusAttributesPayload
): MessageStatusChange {
  switch (payload.update.tag) {
    case "archiving":
      return {
        change_type: "archiving",
        is_archived: payload.update.isArchived
      } as MessageStatusArchivingChange;
    case "reading":
      return {
        change_type: "reading",
        is_read: true
      } as MessageStatusReadingChange;
    case "bulk":
      return {
        change_type: "bulk",
        is_read: true,
        is_archived: payload.update.isArchived
      } as MessageStatusBulkChange;
    default:
      throw new TypeError("invalid payload");
  }
}

/*
  Ricevi l'azione totalmente anonima che ti dice di iniziare a processare

  do {
    Estrai il primo id dalle code, ottenendo anche il flag di archiviazione
    Se è undefined -> Dispatcha l'azione che porti lo stato da progress a disabled (ACTION 1), break per uscire dal while e termina
    Se è defined   ->
      A partire dall'id, estrai il messaggio dal relativo pot
      Se non c'è -> allora dispatcha un'azione che rimuove l'id (ACTION 3), passa alla prossima iterazione del ciclo while
      Se c'è     -> richiama manualmente la saga che fa l'archiviazione
                    Rimani in attesa per un'action di success o failure o cancel (ACTION 1) da parte di quella saga
                    Se azione di failure oppure di cancel -> Dispatcha un action che porti lo stato da progress ad enabled (ACTION 2), break per uscire dal while e termina
                    Se azione di success                  -> allora dispatcha un'azione che rimuove l'id (ACTION 3), passa alla prossima iterazione del ciclo while
  } while (true) 

*/

export function* handleMessageArchivingRestoring(
  _: ActionType<typeof startProcessingMessageArchivingAction>
) {
  do {
    const currentEntryToProcess = yield* select(
      nextQueuedMessageDataUncachedSelector
    );
    console.log(`=== next interaction loop`);
    if (!currentEntryToProcess) {
      console.log(`=== no entry to process, stop`);
      yield* put(resetMessageArchivingAction());
      return;
    }

    const category: MessageListCategory = currentEntryToProcess.archiving
      ? "INBOX"
      : "ARCHIVE";
    const message = yield* select(
      paginatedMessageFromIdForCategorySelector,
      currentEntryToProcess.messageId,
      category
    );
    if (!message) {
      console.log(`=== no message found for entry`);
      yield* put(
        removeScheduledMessageArchivingAction({
          fromInboxToArchive: currentEntryToProcess.archiving,
          messageId: currentEntryToProcess.messageId
        })
      );
      continue;
    }

    const upsertMessageStatusAttributesAction =
      upsertMessageStatusAttributes.request({
        message,
        update: {
          isArchived: currentEntryToProcess.archiving,
          tag: "archiving"
        }
      });
    yield* put(upsertMessageStatusAttributesAction);

    const outputAction = yield* take([
      upsertMessageStatusAttributes.success,
      upsertMessageStatusAttributes.failure,
      resetMessageArchivingAction
    ]);

    if (isActionOf(upsertMessageStatusAttributes.success, outputAction)) {
      console.log(`=== message moved`);
      yield* put(
        removeScheduledMessageArchivingAction({
          fromInboxToArchive: currentEntryToProcess.archiving,
          messageId: currentEntryToProcess.messageId
        })
      );
    } else {
      console.log(`=== message FAILED`);
      if (isActionOf(upsertMessageStatusAttributes.failure, outputAction)) {
        yield* put(interruptMessageArchivingProcessingAction());
      }
      return;
    }
  } while (true);
}

export function* raceUpsertMessageStatusAttributes(
  putMessage: BackendClient["upsertMessageStatusAttributes"],
  action: ActionType<typeof upsertMessageStatusAttributes.request>
) {
  console.log(`=== starting the race`);
  yield* race({
    task: call(handleUpsertMessageStatusAttributes, putMessage, action),
    cancel: take(resetMessageArchivingAction)
  });
}

export function* handleUpsertMessageStatusAttributes(
  putMessage: BackendClient["upsertMessageStatusAttributes"],
  action: ActionType<typeof upsertMessageStatusAttributes.request>
) {
  try {
    const body = validatePayload(action.payload);
    console.log(`=== UPSERT making web request`);
    const response = (yield* call(
      withRefreshApiCall,
      putMessage({ id: action.payload.message.id, body }),
      action
    )) as unknown as SagaCallReturnType<typeof putMessage>;

    const nextAction = handleResponse<unknown>(
      response,
      _ => upsertMessageStatusAttributes.success(action.payload),
      error => {
        const reason = errorToReason(error);
        trackUpsertMessageStatusAttributesFailure(reason);
        return upsertMessageStatusAttributes.failure({
          error: getError(error),
          payload: action.payload
        });
      }
    );

    console.log(`=== UPSERT checking next action`);
    if (nextAction) {
      console.log(`=== UPSERT sending next action`);
      yield* put(nextAction);
    }
  } catch (error) {
    console.log(`=== UPSERT error`);
    const reason = unknownToReason(error);
    trackUpsertMessageStatusAttributesFailure(reason);
    yield* put(
      upsertMessageStatusAttributes.failure({
        error: getError(error),
        payload: action.payload
      })
    );
  } finally {
    if (yield* cancelled()) {
      console.log(`=== UPSERT was cancelled`);
      yield* put(
        upsertMessageStatusAttributes.failure({
          error: getError("Cancelled"),
          payload: action.payload
        })
      );
    }
  }
}
