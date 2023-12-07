import React from "react";
import { LabelLink, LabelSmall } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import StatusContent from "../../../SectionStatus/StatusContent";

export const RemoteContentBanner = () => (
  <StatusContent
    backgroundColor={"white"}
    foregroundColor={"bluegrey"}
    iconName={"notice"}
    labelPaddingVertical={6}
  >
    {`${I18n.t("messageDetails.banner.content1")} `}
    <LabelSmall weight="Bold" color="bluegrey">
      {`${I18n.t("messageDetails.banner.content2")} `}
    </LabelSmall>
    {I18n.t("messageDetails.banner.content3")}
    {"\n"}
    {/* TODO IOCOM-698 */}
    <LabelLink fontSize="small" onPress={constNull}>
      {I18n.t("messageDetails.banner.action")}
    </LabelLink>
  </StatusContent>
);
