import React from "react";
import { Body } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import StatusContent from "../../../SectionStatus/StatusContent";
import { Link } from "../../../core/typography/Link";
import { Label } from "../../../core/typography/Label";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";

export const RemoteContentBanner = () => {
  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal(
    {
      component: <Body>{I18n.t("messageDetails.bottomSheet.body")}</Body>,
      title: I18n.t("messageDetails.bottomSheet.title")
    },
    100
  );

  return (
    <>
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
        <Link onPress={present} weight={"SemiBold"}>
          {I18n.t("messageDetails.banner.action")}
        </Link>
      </StatusContent>
      {bottomSheet}
    </>
  );
};
