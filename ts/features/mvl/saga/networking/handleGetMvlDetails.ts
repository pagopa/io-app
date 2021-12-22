import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { mvlDetailsLoad } from "../../store/actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BackendMvlClient } from "../../api/backendMvl";
import { LegalMessageWithContent } from "../../../../../definitions/backend/LegalMessageWithContent";
import { Mvl, MvlAttachment, MvlAttachmentId } from "../../types/mvlData";
import { toUIMessageDetails } from "../../../../store/reducers/entities/messages/transformers";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { Attachment } from "../../../../../definitions/backend/Attachment";
import { Byte } from "../../../../types/digitalInformationUnit";
import { EmailAddress } from "../../../../../definitions/backend/EmailAddress";

/**
 * convert the remote legal message attachment into the relative local domain model
 * @param attachment
 */
const convertMvlAttachment = (attachment: Attachment): MvlAttachment =>
  // TODO some values are forced or mocked, specs should be improved https://pagopa.atlassian.net/browse/IAMVL-31
  ({
    id: attachment.id as MvlAttachmentId,
    name: attachment.name,
    contentType: attachment.content_type.toLowerCase().endsWith("pdf")
      ? "application/pdf"
      : "other",
    size: 12345 as Byte,
    resourceUrl: { href: attachment.url ?? "" }
  });

/**
 * convert the remote legal message model into the relative local domain model
 * @param legalMessageWithContent
 * @param id
 * @param valueNotAvailable
 */
const convertMvlDetail = (
  legalMessageWithContent: LegalMessageWithContent,
  id: UIMessageId,
  valueNotAvailable: string = "n/a"
): Mvl => {
  // TODO some values are forced or mocked, specs should be improved https://pagopa.atlassian.net/browse/IAMVL-31
  const eml = legalMessageWithContent.legal_message.eml;
  const certDataHeader = legalMessageWithContent.legal_message.cert_data.header;
  return {
    message: toUIMessageDetails(legalMessageWithContent),
    legalMessage: {
      body: {
        html: eml.html_content,
        plain: eml.plain_text_content
      },
      attachments: eml.attachments.map(convertMvlAttachment),
      metadata: {
        sender: EmailAddress.decode(certDataHeader.sender).getOrElse(
          valueNotAvailable as EmailAddress
        ),
        receiver: EmailAddress.decode(certDataHeader.recipients).getOrElse(
          valueNotAvailable as EmailAddress
        ),
        cc: [],
        certificates: [legalMessageWithContent.legal_message.cert_data.data],
        signature: undefined
      }
    },
    id
  };
};

/**
 * Handle the remote call to retrieve the MVL details
 * @param getUserLegalMessage
 * @param action
 */
export function* handleGetMvl(
  getUserLegalMessage: BackendMvlClient["getUserLegalMessage"],
  action: ActionType<typeof mvlDetailsLoad.request>
) {
  const messageId = action.payload;
  try {
    const getUserLegalMessageRequest: SagaCallReturnType<
      typeof getUserLegalMessage
    > = yield call(getUserLegalMessage, { id: messageId });
    if (getUserLegalMessageRequest.isRight()) {
      if (getUserLegalMessageRequest.value.status === 200) {
        yield put(
          mvlDetailsLoad.success(
            convertMvlDetail(getUserLegalMessageRequest.value.value, messageId)
          )
        );
        return;
      }
      // != 200
      yield put(
        mvlDetailsLoad.failure({
          ...getGenericError(
            new Error(
              `response status ${getUserLegalMessageRequest.value.status}`
            )
          ),
          id: action.payload
        })
      );
    } else {
      yield put(
        mvlDetailsLoad.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getUserLegalMessageRequest.value))
          ),
          id: action.payload
        })
      );
    }
  } catch (e) {
    yield put(mvlDetailsLoad.failure({ ...getNetworkError(e), id: messageId }));
  }
}
