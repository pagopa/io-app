import React from "react";
import { View } from "react-native";
import {
  Body,
  ButtonLink,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { trackPNShowF24 } from "../analytics";
import { useF24BottomSheet } from "../hooks/useF24BottomSheet";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { UIMessageId } from "../../messages/types";
import { MessageAttachments } from "./MessageAttachments";
import { MessageDetailsSection } from "./MessageDetailsSection";

type Props = {
  attachments: ReadonlyArray<ThirdPartyAttachment>;
  messageId: UIMessageId;
  openPreview: (attachment: ThirdPartyAttachment) => void;
};

const MessageF24Content = ({ attachments, messageId, openPreview }: Props) => {
  const { present, bottomSheet } = useF24BottomSheet(
    attachments,
    messageId,
    openPreview
  );

  if (attachments.length === 1) {
    return (
      <MessageAttachments
        testID="f24-list-container"
        attachments={attachments.slice(0, 1)}
        downloadAttachmentBeforePreview={true}
        messageId={messageId}
        openPreview={openPreview}
      />
    );
  }

  const showAllLabel = I18n.t("features.pn.details.f24Section.showAll");

  return (
    <>
      <View style={IOStyles.selfCenter}>
        <ButtonLink
          accessibilityLabel={showAllLabel}
          label={showAllLabel}
          onPress={() => {
            trackPNShowF24();
            present();
          }}
        />
      </View>
      {bottomSheet}
    </>
  );
};

export const LegacyMessageF24 = (props: Props) => (
  <MessageDetailsSection
    title={I18n.t("features.pn.details.f24Section.title")}
    testID={"pn-f24-section"}
  >
    <VSpacer />
    <Body color="bluegreyDark">
      {I18n.t("features.pn.details.f24Section.description")}
    </Body>
    <VSpacer />
    <MessageF24Content {...props} />
  </MessageDetailsSection>
);
