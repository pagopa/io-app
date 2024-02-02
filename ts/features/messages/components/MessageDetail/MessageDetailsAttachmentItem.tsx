import React, { useCallback, useEffect } from "react";
import RNFS from "react-native-fs";
import { VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import {
  cancelPreviousAttachmentDownload,
  clearRequestedAttachmentDownload,
  downloadAttachment
} from "../../store/actions";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { attachmentFromThirdPartyMessage } from "../../store/reducers/transformers";
import { UIMessageId } from "../../types";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import {
  downloadedMessageAttachmentSelector,
  isDownloadingMessageAttachmentSelector,
  isRequestedAttachmentDownloadSelector
} from "../../store/reducers/downloads";
import { ModuleAttachment } from "./ModuleAttachment";

type MessageDetailsAttachmentItemProps = {
  attachment: ThirdPartyAttachment;
  bottomSpacer?: boolean;
  messageId: UIMessageId;
  serviceId?: ServiceId;
};

export const MessageDetailsAttachmentItem = ({
  attachment,
  bottomSpacer,
  messageId,
  serviceId
}: MessageDetailsAttachmentItemProps) => {
  const attachmentId = attachment.id;
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const store = useIOStore();
  const download = useIOSelector(state =>
    downloadedMessageAttachmentSelector(state, messageId, attachmentId)
  );
  const isFetching = useIOSelector(state =>
    isDownloadingMessageAttachmentSelector(state, messageId, attachmentId)
  );
  const uiAttachment = attachmentFromThirdPartyMessage(messageId, attachment);
  const doNavigate = useCallback(() => {
    dispatch(clearRequestedAttachmentDownload());
    navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
      params: {
        messageId,
        serviceId,
        attachmentId,
        isPN: false
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
    if (download && (await RNFS.exists(download.path))) {
      doNavigate();
    } else {
      dispatch(cancelPreviousAttachmentDownload());
      dispatch(
        downloadAttachment.request({
          ...uiAttachment,
          skipMixpanelTrackingOnFailure: false
        })
      );
    }
  }, [dispatch, isFetching, download, doNavigate, uiAttachment]);
  useEffect(() => {
    const state = store.getState();
    if (
      download &&
      isRequestedAttachmentDownloadSelector(state, messageId, attachmentId)
    ) {
      void checkPathAndNavigate(download.path);
    }
  }, [
    attachmentId,
    checkPathAndNavigate,
    dispatch,
    doNavigate,
    download,
    messageId,
    store
  ]);
  // TODO fetching accessibility label
  return (
    <>
      <ModuleAttachment
        title={uiAttachment.displayName}
        isFetching={isFetching}
        format={"pdf"}
        onPress={onModuleAttachmentPress}
      />
      {bottomSpacer && <VSpacer size={8} />}
    </>
  );
};
