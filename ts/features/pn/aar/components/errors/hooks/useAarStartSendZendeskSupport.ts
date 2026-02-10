import { useCallback } from "react";
import { useIODispatch } from "../../../../../../store/hooks";
import {
  addTicketCustomField,
  appendLog,
  resetCustomFields,
  resetLog,
  zendeskCategoryId,
  zendeskSendCategory
} from "../../../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../../../zendesk/store/actions";

export const AAR_SUB_CATEGORY_ID = "39752564743313";

export const enum SendAarZendeskSecondLevelTag {
  IO_PROBLEMA_NOTIFICA_SEND_QR = "io_problema_notifica_send_qr",
  IO_PROBLEMA_NOTIFICA_SEND_QR_ALTRA_PERSONA = "io_problema_notifica_send_qr_altra_persona"
}

/**
 * Returns a callback that starts a Zendesk support flow for the AAR "send" assistance.
 *
 * The returned function:
 * - resets Zendesk custom fields and logs
 * - sets the main category and the AAR sub-category based on the provided second-level tag
 * - optionally appends an error code to the log (if provided and non-empty)
 * - dispatches the actions required to start the Zendesk support flow
 */
export const useAarStartSendZendeskSupport = (
  secondLevelTag: SendAarZendeskSecondLevelTag
) => {
  const dispatch = useIODispatch();

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const startZendeskSupport = useCallback(
    (errorCode: string | undefined) => {
      resetCustomFields();
      resetLog();

      addTicketCustomField(zendeskCategoryId, zendeskSendCategory.value);
      addTicketCustomField(AAR_SUB_CATEGORY_ID, secondLevelTag);
      if (errorCode != null && errorCode.trim().length > 0) {
        appendLog(errorCode);
      }

      dispatch(
        zendeskSupportStart({
          startingRoute: "n/a",
          assistanceType: {
            send: true
          }
        })
      );
      dispatch(zendeskSelectedCategory(zendeskSendCategory));
    },
    [dispatch, secondLevelTag]
  );

  return startZendeskSupport;
};
