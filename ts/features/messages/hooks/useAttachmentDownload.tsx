import { useCallback, useEffect } from "react";
import RNFS from "react-native-fs";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import {
  downloadedMessageAttachmentSelector,
  hasErrorOccourredOnRequestedDownloadSelector,
  isDownloadingMessageAttachmentSelector,
  isRequestedAttachmentDownloadSelector
} from "../store/reducers/downloads";
import { UIMessageId } from "../types";
import {
  cancelPreviousAttachmentDownload,
  clearRequestedAttachmentDownload,
  downloadAttachment
} from "../store/actions";
import { MESSAGES_ROUTES } from "../navigation/routes";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { attachmentDisplayName } from "../store/reducers/transformers";
import I18n from "../../../i18n";
import { IOToast } from "../../../components/Toast";
import { trackPNAttachmentDownloadFailure } from "../../pn/analytics";
import { trackThirdPartyMessageAttachmentShowPreview } from "../analytics";

export const useAttachmentDownload = (
  messageId: UIMessageId,
  attachment: ThirdPartyAttachment,
  isPN: boolean,
  serviceId?: ServiceId
) => {
  const attachmentId = attachment.id;

  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const store = useIOStore();

  const download = useIOSelector(state =>
    downloadedMessageAttachmentSelector(state, messageId, attachmentId)
  );
  const isFetching = useIOSelector(state =>
    isDownloadingMessageAttachmentSelector(state, messageId, attachmentId)
  );

  const doNavigate = useCallback(() => {
    dispatch(clearRequestedAttachmentDownload());
    navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
      params: {
        messageId,
        serviceId,
        attachmentId
      }
    });
  }, [attachmentId, dispatch, messageId, navigation, serviceId]);
  const checkPathAndNavigate = useCallback(
    async (downloadPath: string) => {
      if (await RNFS.exists(downloadPath)) {
        doNavigate();
      } else {
        dispatch(clearRequestedAttachmentDownload());
      }
    },
    [dispatch, doNavigate]
  );
  const onModuleAttachmentPress = useCallback(async () => {
    if (isFetching) {
      return;
    }

    if (!isPN) {
      trackThirdPartyMessageAttachmentShowPreview();
    }

    // Make sure to cancel whatever download may already be running
    dispatch(cancelPreviousAttachmentDownload());

    if (download && (await RNFS.exists(download.path))) {
      doNavigate();
    } else {
      dispatch(
        downloadAttachment.request({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: isPN
        })
      );
    }
  }, [attachment, dispatch, download, doNavigate, isFetching, isPN, messageId]);

  const attachmentCategory = attachment.category;
  useEffect(() => {
    const state = store.getState();
    if (
      download &&
      isRequestedAttachmentDownloadSelector(state, messageId, attachmentId)
    ) {
      void checkPathAndNavigate(download.path);
    } else if (
      hasErrorOccourredOnRequestedDownloadSelector(
        state,
        messageId,
        attachmentId
      )
    ) {
      dispatch(clearRequestedAttachmentDownload());
      if (isPN) {
        trackPNAttachmentDownloadFailure(attachmentCategory);
      }
      IOToast.error(I18n.t("messageDetails.attachments.failing.details"));
    }
  }, [
    attachmentCategory,
    attachmentId,
    checkPathAndNavigate,
    dispatch,
    doNavigate,
    download,
    isPN,
    messageId,
    store
  ]);

  const displayName = attachmentDisplayName(attachment);
  return { displayName, isFetching, onModuleAttachmentPress };
};
