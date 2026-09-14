import * as t from "io-ts";

import { AllowRandomValue } from "../../../types/allowRandomValue";
import { HttpResponseCode } from "../../../types/httpResponseCode";
import { LiveModeMessages } from "./liveModeMessages";
import { MessageTemplateWrapper } from "./messageTemplateWrapper";

export const MessagesConfig = t.intersection([
  t.type({
    // configure some API response error code
    response: t.type({
      // 200 success with payload
      getMessagesResponseCode: HttpResponseCode,
      // 200 success with payload
      getMessageResponseCode: HttpResponseCode,
      // 200 success with payload
      getThirdPartyMessageResponseCode: HttpResponseCode
    }),
    paymentsCount: t.number,
    // number of message - invalid after due date - containing a payment and a valid (not expired) due date
    paymentInvalidAfterDueDateWithValidDueDateCount: t.number,
    // number of message - invalid after due date -  containing a payment and a not valid (expired) due date
    paymentInvalidAfterDueDateWithExpiredDueDateCount: t.number,
    // number of message containing a payment and a valid (not expired) due date
    paymentWithValidDueDateCount: t.number,
    // number of message containing a payment and a not valid (expired) due date
    paymentWithExpiredDueDateCount: t.number,
    // number of fci messages
    fci: t.type({
      waitForSignatureCount: t.number,
      rejectedCount: t.number,
      expiredCount: t.number,
      expired90Count: t.number,
      waitForQtspCount: t.number,
      signedCount: t.number,
      canceledCount: t.number,
      noSignatureFieldsCount: t.number,
      response: t.type({
        // 200 success with payload
        getFciResponseCode: HttpResponseCode,
        // qtsp nonce duration in seconds
        nonceDurationSeconds: t.number,
        documentExpirationDurationSeconds: t.number
      })
    }),
    // if true, messages (all available) with nested CTA will be included
    withCTA: t.boolean,
    // if true, messages (all available) with legacy Green Pass will be included
    generateLegacyGreenPassMessage: t.boolean,
    // with valid due date
    withValidDueDateCount: t.number,
    // with invalid (expired) due date
    withInValidDueDateCount: t.number,
    standardMessageCount: t.number,
    archivedMessageCount: t.number,
    useMessagesSavedUnderConfig: t.boolean
  }),
  AllowRandomValue,
  t.partial({
    liveMode: LiveModeMessages,
    // number of messages with remote content
    messageTemplateWrappers: t.readonlyArray(MessageTemplateWrapper)
  })
]);

export type MessagesConfig = t.TypeOf<typeof MessagesConfig>;
