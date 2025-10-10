import { Banner, Body, IOButton, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { sendEstimateTimelinesUrlSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { useIOSelector } from "../../../store/hooks";
import { openWebUrl } from "../../../utils/url";

export const BannerAttachments = () => {
  const externalLink = useIOSelector(sendEstimateTimelinesUrlSelector);
  const openExternalUrl = () => {
    openWebUrl(externalLink);
  };
  const { bottomSheet, present } = useIOBottomSheetModal({
    component: (
      <View>
        <Body>
          {I18n.t("features.pn.details.attachmentsSection.bottomSheet.content")}
        </Body>
        <VSpacer size={16} />
        <IOButton
          icon="calendar"
          variant="link"
          label={I18n.t(
            "features.pn.details.attachmentsSection.bottomSheet.action"
          )}
          onPress={openExternalUrl}
        />
        <VSpacer size={32} />
      </View>
    ),
    title: I18n.t("features.pn.details.attachmentsSection.bottomSheet.title")
  });
  return (
    <>
      <Banner
        color="neutral"
        pictogramName="doc"
        content={I18n.t(
          "features.pn.details.attachmentsSection.banner.content"
        )}
        action={I18n.t("features.pn.details.attachmentsSection.banner.action")}
        onPress={present}
      />
      <VSpacer size={16} />
      {bottomSheet}
    </>
  );
};
