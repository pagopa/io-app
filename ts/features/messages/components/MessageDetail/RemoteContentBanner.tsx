import React, { useMemo } from "react";
import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { trackRemoteContentInfo } from "../../analytics";
import {
  BodyProps,
  ComposedBodyFromArray
} from "../../../../components/core/typography/ComposedBodyFromArray";

export const RemoteContentBanner = () => {
  const bodyPropsArray = useMemo(
    () =>
      [
        {
          key: "RCB_T0",
          text: I18n.t("messageDetails.bottomSheet.bodyPt1"),
          weight: "Regular"
        },
        {
          key: "RCB_T1",
          text: I18n.t("messageDetails.bottomSheet.bodyPt2"),
          weight: "SemiBold"
        },
        {
          key: "RCB_T2",
          text: I18n.t("messageDetails.bottomSheet.bodyPt3"),
          weight: "Regular"
        },
        {
          key: "RCB_T3",
          text: I18n.t("messageDetails.bottomSheet.bodyPt4"),
          weight: "SemiBold"
        },
        {
          key: "RCB_T4",
          text: I18n.t("messageDetails.bottomSheet.bodyPt5"),
          weight: "Regular"
        }
      ] as Array<BodyProps>,
    []
  );

  const content = useMemo(
    () =>
      `${I18n.t("messageDetails.banner.content1")} ${I18n.t(
        "messageDetails.banner.content2"
      )} ${I18n.t("messageDetails.banner.content3")}`,
    []
  );

  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <ComposedBodyFromArray
          body={bodyPropsArray}
          key={"Otopiteco"}
          textAlign="left"
        />
      ),
      title: I18n.t("messageDetails.bottomSheet.title")
    },
    100
  );

  return (
    <>
      <VSpacer size={16} />
      <Banner
        color={"neutral"}
        size="big"
        pictogramName="message"
        content={content}
        action={`${I18n.t("messageDetails.banner.action")}`}
        onPress={() => {
          trackRemoteContentInfo();
          present();
        }}
      />
      {bottomSheet}
    </>
  );
};
