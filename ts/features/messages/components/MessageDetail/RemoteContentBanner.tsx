import { Banner, IOMarkdownLite, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { trackRemoteContentInfo } from "../../analytics";

export const RemoteContentBanner = () => {
  const { present, bottomSheet } = useIOBottomSheetModal({
    component: (
      <IOMarkdownLite content={I18n.t("messageDetails.bottomSheet.body")} />
    ),
    title: I18n.t("messageDetails.bottomSheet.title")
  });

  return (
    <>
      <VSpacer size={16} />
      <Banner
        color={"neutral"}
        pictogramName="message"
        content={I18n.t("messageDetails.banner.content")}
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
