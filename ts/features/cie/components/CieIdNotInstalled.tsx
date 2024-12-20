import React from "react";
import { Platform } from "react-native";
import { useIOToast } from "@pagopa/io-app-design-system";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import I18n from "../../../i18n";
import { trackCieIdNotInstalledDownloadAction } from "../analytics";
import { openWebUrl } from "../../../utils/url";

export const CIE_ID_IOS_LINK =
  "https://apps.apple.com/it/app/cieid/id1504644677";
export const CIE_ID_ANDROID_LINK =
  "https://play.google.com/store/apps/details?id=it.ipzs.cieid";
export const CIE_ID_ANDROID_COLL_LINK = CIE_ID_ANDROID_LINK + ".coll";

export type CieIdNotInstalledProps = {
  isUat: boolean;
};

const CieIdNotInstalled = ({ isUat }: CieIdNotInstalledProps) => {
  const { popToTop } = useIONavigation();
  const { error } = useIOToast();

  return (
    <OperationResultScreenContent
      pictogram="attention"
      title={I18n.t("authentication.cie_id.cie_not_installed.title")}
      subtitle={I18n.t("authentication.cie_id.cie_not_installed.description")}
      action={{
        testID: "cie-id-not-installed-open-store",
        label: I18n.t(
          "authentication.cie_id.cie_not_installed.primary_action_label"
        ),
        onPress: () => {
          void trackCieIdNotInstalledDownloadAction();
          openWebUrl(
            Platform.select({
              ios: CIE_ID_IOS_LINK,
              android: isUat ? CIE_ID_ANDROID_COLL_LINK : CIE_ID_ANDROID_LINK,
              default: ""
            }),
            () => {
              error(
                I18n.t("authentication.cie_id.cie_not_installed.link_error")
              );
            }
          );
        }
      }}
      secondaryAction={{
        testID: "cie-id-not-installed-pop-to-top",
        label: I18n.t("global.buttons.close"),
        onPress: popToTop
      }}
    />
  );
};

export default CieIdNotInstalled;
