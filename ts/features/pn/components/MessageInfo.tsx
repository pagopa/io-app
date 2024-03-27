import React from "react";
import {
  ListItemHeader,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";

type MessageInfoProps = {
  iun: string;
};

export const MessageInfo = ({ iun }: MessageInfoProps) => (
  <>
    <ListItemHeader
      iconName="info"
      label={I18n.t("features.pn.details.infoSection.title")}
    />
    <ListItemInfoCopy
      accessibilityLabel={I18n.t("features.pn.details.infoSection.iun")}
      label={I18n.t("features.pn.details.infoSection.iun")}
      value={iun}
      onPress={() => clipboardSetStringWithFeedback(iun)}
    />
  </>
);
