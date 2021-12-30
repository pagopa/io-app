import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { Attachment } from "../../../../../definitions/backend/Attachment";
import { EmailAddress } from "../../../../../definitions/backend/EmailAddress";
import { LegalMessageWithContent } from "../../../../../definitions/backend/LegalMessageWithContent";
import { apiUrlPrefix } from "../../../../config";
import { toUIMessageDetails } from "../../../../store/reducers/entities/messages/transformers";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BackendMvlClient } from "../../api/backendMvl";
import { mvlDetailsLoad } from "../../store/actions";
import {
  Mvl,
  MvlAttachment,
  MvlAttachmentId,
  MvlId
} from "../../types/mvlData";

const generateAttachmentUrl = (
  messageId: string,
  attachmentId: MvlAttachmentId
) =>
  `${apiUrlPrefix}/api/v1/legal-messages/${messageId}/attachments/${attachmentId}`;

/**
 * convert the remote legal message attachment into the relative local domain model
 * @param attachment
 * @param id
 */
const convertMvlAttachment = (
  attachment: Attachment,
  id: string
): MvlAttachment =>
  // TODO some values are forced or mocked, specs should be improved https://pagopa.atlassian.net/browse/IAMVL-31
  ({
    id: attachment.id as MvlAttachmentId,
    displayName: attachment.name,
    contentType: attachment.content_type.toLowerCase(),
    resourceUrl: {
      href: generateAttachmentUrl(id, attachment.id as MvlAttachmentId)
    }
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
  const certData = legalMessageWithContent.legal_message.cert_data;
  const certDataHeader = certData.header;
  const msgId = certData.data.msg_id as string;
  return {
    message: toUIMessageDetails(legalMessageWithContent),
    legalMessage: {
      body: {
        html: eml.html_content,
        plain: eml.plain_text_content
      },
      attachments: eml.attachments.map(attachment =>
        convertMvlAttachment(attachment, certData.data.envelope_id)
      ),
      metadata: {
        id: msgId as MvlId,
        timestamp: certData.data.timestamp,
        subject: eml.subject,
        sender: EmailAddress.decode(certDataHeader.sender).getOrElse(
          valueNotAvailable as EmailAddress
        ),
        receiver: EmailAddress.decode(certDataHeader.recipients).getOrElse(
          valueNotAvailable as EmailAddress
        ),
        // missing field in remote payload
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
