import { IOButton } from "@pagopa/io-app-design-system";
import { ThirdPartyAttachment } from "../../../../definitions/communications/ThirdPartyAttachment";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";
import { MessageDetailsAttachmentItem } from "../../messages/components/MessageDetail/MessageDetailsAttachmentItem";
import { UIMessageId } from "../../messages/types";
import { trackPNShowF24 } from "../analytics";
import { useIODispatch } from "../../../store/hooks";
import { cancelPreviousAttachmentDownload } from "../../messages/store/actions";

type F24ListBottomSheetLinkProps = {
  f24List: ReadonlyArray<ThirdPartyAttachment>;
  messageId: UIMessageId;
};

export const F24ListBottomSheetLink = ({
  f24List,
  messageId
}: F24ListBottomSheetLinkProps) => {
  // The empty footer is needed in order for the internal scroll view to properly compute
  // its bottom space when the bottom sheet opens filling the entire view. Without it, the
  // scroll bottom stops at the device bottom border, not respecting any safe area margins
  const dispatch = useIODispatch();
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    component: (
      <>
        {f24List.map((f24Attachment, index) => (
          <MessageDetailsAttachmentItem
            attachment={f24Attachment}
            bottomSpacer={index + 1 < f24List.length}
            isPN
            key={`MessageF24_${index}`}
            messageId={messageId}
            onPreNavigate={() => {
              dismiss();
            }}
          />
        ))}
      </>
    ),
    title: I18n.t("features.pn.details.f24Section.bottomSheet.title"),
    onDismiss: () => dispatch(cancelPreviousAttachmentDownload())
  });
  return (
    <>
      <IOButton
        variant="link"
        label={I18n.t("features.pn.details.f24Section.showAll")}
        onPress={() => {
          trackPNShowF24();
          present();
        }}
      />
      {bottomSheet}
    </>
  );
};
