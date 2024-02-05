import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../store/reducers";
import { downloadAttachment } from "../../../store/actions";
import { UIAttachment, UIMessageId } from "../../../types";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";

const renderScreen = (
  attachment: ThirdPartyAttachment,
  messageId: UIMessageId,
  serviceId?: ServiceId,
  bottomSpacer?: boolean
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const withDownloadState = appReducer(
    designSystemState,
    downloadAttachment.success(
      {
        attachment: attachmentFromThirdPartyMessage
      },
      { id: attachment.id, messageId } as UIAttachment,
      path,
      "file:///fileName.pdf"
    )
  );
};
