import React from "react";
import { View } from "react-native";
import { Body, ButtonLink, VSpacer } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import I18n from "../../../i18n";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { MessageAttachments } from "../../messages/components/MessageAttachments";
import { PnMessageDetailsSection } from "./PnMessageDetailsSection";

type Props = {
  attachments: ReadonlyArray<UIAttachment>;
};

export const MessageF24 = ({ attachments }: Props) => {
  const renderContent = () => {
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

    return (
      <View style={{ alignSelf: "center" }}>
        <ButtonLink
          accessibilityLabel={I18n.t("features.pn.details.f24Section.showAll")}
          label={I18n.t("features.pn.details.f24Section.showAll")}
          // TODO: open bottom-sheet
          // https://pagopa.atlassian.net/browse/IOCOM-455
          onPress={constNull}
        />
      </View>
    );
  };

  return (
    <PnMessageDetailsSection
      title={I18n.t("features.pn.details.f24Section.title")}
      testID={"pn-f24-section"}
    >
      <VSpacer />
      <Body color="bluegreyDark">
        {I18n.t("features.pn.details.f24Section.description")}
      </Body>
      <VSpacer />
      {renderContent()}
    </PnMessageDetailsSection>
  );
};
