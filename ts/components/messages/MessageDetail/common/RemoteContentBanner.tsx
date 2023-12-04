import React from "react";
import { constNull } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import StatusContent from "../../../SectionStatus/StatusContent";
import { Link } from "../../../core/typography/Link";
import { Label } from "../../../core/typography/Label";

export const RemoteContentBanner = () => (
  <StatusContent
    backgroundColor={"white"}
    foregroundColor={"bluegrey"}
    iconName={"notice"}
    labelPaddingVertical={6}
  >
    {`${I18n.t("messageDetails.banner.content1")} `}
    <Label weight="Bold" color="bluegrey">
      {`${I18n.t("messageDetails.banner.content2")} `}
    </Label>
    {I18n.t("messageDetails.banner.content3")}
    {"\n"}
    {/* TODO IOCOM-698 */}
    <Link onPress={constNull} weight={"SemiBold"}>
      {I18n.t("messageDetails.banner.action")}
    </Link>
  </StatusContent>
);
