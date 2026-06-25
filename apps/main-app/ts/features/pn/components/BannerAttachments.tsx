import { Banner, Body, IOButton, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";

import { useIOSelector } from "../../../store/hooks";
import { sendEstimateTimelinesUrlSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
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
          label={I18n.t(
            "features.pn.details.attachmentsSection.bottomSheet.action"
          )}
          onPress={openExternalUrl}
          testID="banner-attachment-bottomsheet-cta"
          variant="link"
        />
        <VSpacer size={32} />
      </View>
    ),
    title: I18n.t("features.pn.details.attachmentsSection.bottomSheet.title")
  });
  return (
    <>
      <Banner
        action={I18n.t("features.pn.details.attachmentsSection.banner.action")}
        color="neutral"
        content={I18n.t(
          "features.pn.details.attachmentsSection.banner.content"
        )}
        onPress={present}
        pictogramName="attachment"
        testID="banner-attachment-banner"
      />
      <VSpacer size={16} />
      {bottomSheet}
    </>
  );
};
