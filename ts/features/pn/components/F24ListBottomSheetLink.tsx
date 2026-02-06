import { IOButton } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { MessageDetailsAttachmentItem } from "../../messages/components/MessageDetail/MessageDetailsAttachmentItem";
import { trackPNShowF24 } from "../analytics";
import { useIODispatch } from "../../../store/hooks";
import { cancelPreviousAttachmentDownload } from "../../messages/store/actions";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { ServiceId } from "../../../../definitions/services/ServiceId";
import { ThirdPartyAttachment } from "../../../../definitions/backend/communication/ThirdPartyAttachment";

export type F24ListBottomSheetLinkProps = {
  f24List: ReadonlyArray<ThirdPartyAttachment>;
  messageId: string;
  serviceId: ServiceId;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
};

export const F24ListBottomSheetLink = ({
  f24List,
  messageId,
  serviceId,
  sendOpeningSource,
  sendUserType
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
            sendOpeningSource={sendOpeningSource}
            sendUserType={sendUserType}
            key={`MessageF24_${index}`}
            messageId={messageId}
            onPreNavigate={() => {
              dismiss();
            }}
            serviceId={serviceId}
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
          trackPNShowF24(sendOpeningSource, sendUserType);
          present();
        }}
        testID="f24_list_bottomsheet_link_button"
      />
      {bottomSheet}
    </>
  );
};
