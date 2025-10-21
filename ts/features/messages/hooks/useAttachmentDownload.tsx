import { useCallback, useEffect } from "react";
import RNFS from "react-native-fs";
import I18n from "i18next";
import { useIOToast } from "@pagopa/io-app-design-system";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import {
  downloadedMessageAttachmentSelector,
  hasErrorOccourredOnRequestedDownloadSelector,
  isDownloadingMessageAttachmentSelector,
  isRequestedAttachmentDownloadSelector
} from "../store/reducers/downloads";
import {
  cancelPreviousAttachmentDownload,
  clearRequestedAttachmentDownload,
  downloadAttachment
} from "../store/actions";
import { MESSAGES_ROUTES } from "../navigation/routes";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { attachmentDisplayName } from "../utils/attachments";
import {
  trackPNAttachmentDownloadFailure,
  trackPNAttachmentOpening
} from "../../pn/analytics";
import { trackThirdPartyMessageAttachmentShowPreview } from "../analytics";
import PN_ROUTES from "../../pn/navigation/routes";
import NavigationService from "../../../navigation/NavigationService";

export const useAttachmentDownload = (
  messageId: string,
  attachment: ThirdPartyAttachment,
  isPN: boolean,
  serviceId: ServiceId,
  onPreNavigate?: () => void
) => {
  const attachmentId = attachment.id;

  const dispatch = useIODispatch();
  const store = useIOStore();
  const toast = useIOToast();

  const download = useIOSelector(state =>
    downloadedMessageAttachmentSelector(state, messageId, attachmentId)
  );
  const isFetching = useIOSelector(state =>
    isDownloadingMessageAttachmentSelector(state, messageId, attachmentId)
  );

  const attachmentCategory = attachment.category;
  const doNavigate = useCallback(() => {
    dispatch(clearRequestedAttachmentDownload());
    onPreNavigate?.();
    if (isPN) {
      trackPNAttachmentOpening(attachmentCategory);
      NavigationService.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
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
      NavigationService.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
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
    isPN,
    messageId,
    onPreNavigate,
    serviceId
  ]);
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
          skipMixpanelTrackingOnFailure: isPN,
          serviceId
        })
      );
    }
  }, [
    attachment,
    dispatch,
    download,
    doNavigate,
    isFetching,
    isPN,
    messageId,
    serviceId
  ]);

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
      toast.error(I18n.t("messageDetails.attachments.failing.details"));
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
    store,
    toast
  ]);

  const displayName = attachmentDisplayName(attachment);
  return { displayName, isFetching, onModuleAttachmentPress };
};
