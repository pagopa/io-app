import React from "react";
import { View } from "react-native";
import { Body, ButtonLink, VSpacer } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import I18n from "../../../i18n";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { useF24BottomSheet } from "../hooks/useF24BottomSheet";
import { MessageAttachments } from "../../messages/components/MessageAttachments";
import { PnMessageDetailsSection } from "./PnMessageDetailsSection";

type Props = {
  attachments: ReadonlyArray<UIAttachment>;
};

const MessageF24Content = ({ attachments }: Props) => {
  const { present, bottomSheet } = useF24BottomSheet(attachments);

  if (attachments.length === 1) {
    return (
      <MessageAttachments
        testID="f24-list-container"
        attachments={attachments.slice(0, 1)}
        downloadAttachmentBeforePreview={true}
        // TODO: navigate to preview
        // https://pagopa.atlassian.net/browse/IOCOM-457
        openPreview={constNull}
      />
    );
  }

  const showAllLabel = I18n.t("features.pn.details.f24Section.showAll");

  return (
    <>
      <View style={{ alignSelf: "center" }}>
        <ButtonLink
          accessibilityLabel={showAllLabel}
          label={showAllLabel}
          onPress={present}
        />
      </View>
      {bottomSheet}
    </>
  );
};

export const MessageF24 = (props: Props) => (
  <PnMessageDetailsSection
    title={I18n.t("features.pn.details.f24Section.title")}
    testID={"pn-f24-section"}
  >
    <VSpacer />
    <Body color="bluegreyDark">
      {I18n.t("features.pn.details.f24Section.description")}
    </Body>
    <VSpacer />
    <MessageF24Content {...props} />
  </PnMessageDetailsSection>
);
