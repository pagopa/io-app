import { Banner, IOMarkdownLite, VSpacer } from "@io-app/design-system";
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
      <Banner
        action={`${I18n.t("messageDetails.banner.action")}`}
        color="turquoise"
        content={I18n.t("messageDetails.banner.content")}
        onPress={() => {
          trackRemoteContentInfo();
          present();
        }}
        pictogramName="message"
        testID="remote-content-banner"
      />
      <VSpacer size={24} />
      {bottomSheet}
    </>
  );
};
