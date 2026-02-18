import { useIOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import RNFS from "react-native-fs";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { MESSAGES_ROUTES } from "../navigation/routes";
import {
  cancelPreviousAttachmentDownload,
  clearRequestedAttachmentDownload,
  downloadAttachment
} from "../store/actions";
import {
  downloadedMessageAttachmentSelector,
  requestedDownloadErrorSelector,
  isDownloadingMessageAttachmentSelector,
  isRequestedAttachmentDownloadSelector
} from "../store/reducers/downloads";
import { attachmentDisplayName } from "../utils/attachments";
import {
  trackPNAttachmentDownloadFailure,
  trackPNAttachmentOpening
} from "../../pn/analytics";
import { trackThirdPartyMessageAttachmentShowPreview } from "../analytics";
import PN_ROUTES from "../../pn/navigation/routes";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { isAarAttachmentTtlError } from "../../pn/aar/utils/aarErrorMappings";
import { useIONavigation } from "../../../navigation/params/AppParamsList";

export const useAttachmentDownload = (
  messageId: string,
  attachment: ThirdPartyAttachment,
  sendOpeningSource: SendOpeningSource,
  sendUserType: SendUserType,
  serviceId: ServiceId,
  onPreNavigate?: () => void
) => {
  const attachmentId = attachment.id;
  const isSendAttachment = sendOpeningSource !== "not_set";
  const navigation = useIONavigation();

  const dispatch = useIODispatch();
  const store = useIOStore();
  const toast = useIOToast();

  const download = useIOSelector(state =>
    downloadedMessageAttachmentSelector(state, messageId, attachmentId)
  );
  const maybeDownloadError = useIOSelector(state =>
    requestedDownloadErrorSelector(state, messageId, attachmentId)
  );
  const isFetching = useIOSelector(state =>
    isDownloadingMessageAttachmentSelector(state, messageId, attachmentId)
  );

  const attachmentCategory = attachment.category;
  const doNavigate = useCallback(() => {
    dispatch(clearRequestedAttachmentDownload());
    onPreNavigate?.();
    if (isSendAttachment) {
      trackPNAttachmentOpening(
        sendOpeningSource,
        sendUserType,
        attachmentCategory
      );
      navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.MESSAGE_ATTACHMENT,
          params: {
            attachmentId,
            messageId
          }
        }
      });
    } else {
      navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
        params: {
          messageId,
          serviceId,
          attachmentId
        }
      });
    }
  }, [
    attachmentCategory,
    attachmentId,
    dispatch,
    isSendAttachment,
    messageId,
    navigation,
    onPreNavigate,
    sendOpeningSource,
    sendUserType,
    serviceId
  ]);

  const handleAttachmentDownloadSuccess = useCallback(
    async (downloadPath: string) => {
      if (await RNFS.exists(downloadPath)) {
        doNavigate();
      } else {
        dispatch(clearRequestedAttachmentDownload());
      }
    },
    [dispatch, doNavigate]
  );

  const handleAttachmentDownloadFailure = useCallback(
    (downloadError: Error) => {
      dispatch(clearRequestedAttachmentDownload());
      if (isSendAttachment) {
        trackPNAttachmentDownloadFailure(attachmentCategory);
      }
      const isAarTtlError = isAarAttachmentTtlError(downloadError.message);
      if (isAarTtlError) {
        toast.error(I18n.t("messageDetails.attachments.failing.aarTtlError"));
      } else {
        toast.error(I18n.t("messageDetails.attachments.failing.details"));
      }
    },
    [dispatch, isSendAttachment, attachmentCategory, toast]
  );

  const onModuleAttachmentPress = useCallback(async () => {
    if (isFetching) {
      return;
    }

    if (!isSendAttachment) {
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
          skipMixpanelTrackingOnFailure: isSendAttachment,
          serviceId
        })
      );
    }
  }, [
    isFetching,
    isSendAttachment,
    dispatch,
    download,
    doNavigate,
    attachment,
    messageId,
    serviceId
  ]);

  useEffect(() => {
    const state = store.getState();
    const isDownloadRequested = isRequestedAttachmentDownloadSelector(
      state,
      messageId,
      attachmentId
    );
    if (download != null && isDownloadRequested) {
      void handleAttachmentDownloadSuccess(download.path);
    } else if (maybeDownloadError !== undefined) {
      handleAttachmentDownloadFailure(maybeDownloadError);
    }
  }, [
    attachmentId,
    download,
    handleAttachmentDownloadFailure,
    handleAttachmentDownloadSuccess,
    maybeDownloadError,
    messageId,
    store
  ]);

  const displayName = attachmentDisplayName(attachment);
  return { displayName, isFetching, onModuleAttachmentPress };
};
