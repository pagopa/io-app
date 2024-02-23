import React, { useEffect, useRef } from "react";
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import { PnParamsList } from "../navigation/params";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { pnMessageAttachmentSelector } from "../store/reducers";
import {
  trackPNAttachmentOpen,
  trackPNAttachmentOpeningSuccess,
  trackPNAttachmentSave,
  trackPNAttachmentSaveShare,
  trackPNAttachmentShare
} from "../analytics";
import { isIos } from "../../../utils/platform";
import { LegacyMessageAttachmentPreview } from "../../messages/components/MessageAttachment/LegacyMessageAttachmentPreview";

type LegacyAttachmentPreviewScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  "PN_ROUTES_MESSAGE_ATTACHMENT"
>;

export const LegacyAttachmentPreviewScreen = ({
  navigation,
  route
}: LegacyAttachmentPreviewScreenProps) => {
  const { messageId, attachmentId } = route.params;
  // This ref is needed otherwise the auto back on the useEffect will fire multiple
  // times, since its dependencies change during the back navigation
  const autoBackOnErrorHandled = useRef(false);
  const maybePnMessageAttachment = useIOSelector(state =>
    pnMessageAttachmentSelector(state)(messageId)(attachmentId)
  );

  useEffect(() => {
    // This condition happens only if this screen is shown without having
    // first retrieved the third party message (so it should never happen)
    if (!autoBackOnErrorHandled.current && O.isNone(maybePnMessageAttachment)) {
      // eslint-disable-next-line functional/immutable-data
      autoBackOnErrorHandled.current = true;
      navigation.goBack();
    }
  }, [maybePnMessageAttachment, navigation]);

  return O.isSome(maybePnMessageAttachment) ? (
    <LegacyMessageAttachmentPreview
      messageId={messageId}
      enableDownloadAttachment={false}
      attachment={maybePnMessageAttachment.value}
      onOpen={() =>
        trackPNAttachmentOpen(maybePnMessageAttachment.value.category)
      }
      onShare={() =>
        pipe(
          isIos,
          B.fold(
            () =>
              trackPNAttachmentShare(maybePnMessageAttachment.value.category),
            () =>
              trackPNAttachmentSaveShare(
                maybePnMessageAttachment.value.category
              )
          )
        )
      }
      onDownload={() =>
        trackPNAttachmentSave(maybePnMessageAttachment.value.category)
      }
      onLoadComplete={() =>
        trackPNAttachmentOpeningSuccess(
          "displayer",
          maybePnMessageAttachment.value.category
        )
      }
      onPDFError={() =>
        trackPNAttachmentOpeningSuccess(
          "error",
          maybePnMessageAttachment.value.category
        )
      }
    />
  ) : (
    <></>
  );
};
