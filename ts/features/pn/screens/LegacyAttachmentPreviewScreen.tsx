import React, { useEffect, useRef } from "react";
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
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
  const pnMessageAttachmentOrUndefined = useIOSelector(state =>
    pnMessageAttachmentSelector(state)(messageId)(attachmentId)
  );

  useEffect(() => {
    // This condition happens only if this screen is shown without having
    // first retrieved the third party message (so it should never happen)
    if (!autoBackOnErrorHandled.current && !pnMessageAttachmentOrUndefined) {
      // eslint-disable-next-line functional/immutable-data
      autoBackOnErrorHandled.current = true;
      navigation.goBack();
    }
  }, [pnMessageAttachmentOrUndefined, navigation]);

  return pnMessageAttachmentOrUndefined ? (
    <LegacyMessageAttachmentPreview
      messageId={messageId}
      enableDownloadAttachment={false}
      attachment={pnMessageAttachmentOrUndefined}
      onOpen={() =>
        trackPNAttachmentOpen(pnMessageAttachmentOrUndefined.category)
      }
      onShare={() =>
        pipe(
          isIos,
          B.fold(
            () =>
              trackPNAttachmentShare(pnMessageAttachmentOrUndefined.category),
            () =>
              trackPNAttachmentSaveShare(
                pnMessageAttachmentOrUndefined.category
              )
          )
        )
      }
      onDownload={() =>
        trackPNAttachmentSave(pnMessageAttachmentOrUndefined.category)
      }
      onLoadComplete={() =>
        trackPNAttachmentOpeningSuccess(
          "displayer",
          pnMessageAttachmentOrUndefined.category
        )
      }
      onPDFError={() =>
        trackPNAttachmentOpeningSuccess(
          "error",
          pnMessageAttachmentOrUndefined.category
        )
      }
    />
  ) : (
    <></>
  );
};
