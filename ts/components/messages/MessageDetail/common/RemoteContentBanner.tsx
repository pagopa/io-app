import React from "react";
import { Body, LabelLink, LabelSmall } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import StatusContent from "../../../SectionStatus/StatusContent";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { trackRemoteContentInfo } from "../../../../features/messages/analytics";

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
        fontSize="small"
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
        <LabelLink
          fontSize="small"
          onPress={() => {
            trackRemoteContentInfo();
            present();
          }}
        >
          {I18n.t("messageDetails.banner.action")}
        </LabelLink>
      </StatusContent>
      {bottomSheet}
    </>
  );
};
