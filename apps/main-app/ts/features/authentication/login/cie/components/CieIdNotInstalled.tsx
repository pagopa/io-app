import { useIOToast } from "@io-app/design-system";
import I18n from "i18next";
import { Platform } from "react-native";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { openWebUrl } from "../../../../../utils/url";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import { trackCieIdNotInstalledDownloadAction } from "../analytics";
import { CieEnv } from "../utils";

export const CIE_ID_IOS_LINK =
  "https://apps.apple.com/it/app/cieid/id1504644677";
export const CIE_ID_ANDROID_LINK =
  "https://play.google.com/store/apps/details?id=it.ipzs.cieid";

const CIE_ID_ANDROID_LINK_MAP: Record<CieEnv, string> = {
  production: CIE_ID_ANDROID_LINK,
  preprod: `${CIE_ID_ANDROID_LINK}.coll`
};

const getAppStoreUrl = (env: CieEnv) =>
  Platform.select({
    ios: CIE_ID_IOS_LINK,
    android: CIE_ID_ANDROID_LINK_MAP[env],
    default: ""
  });

export type CieIdNotInstalledProps = {
  cieEnv: CieEnv;
};

const CieIdNotInstalled = ({ cieEnv }: CieIdNotInstalledProps) => {
  const navigation = useIONavigation();
  const toast = useIOToast();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  const handleOpenStore = () => {
    void trackCieIdNotInstalledDownloadAction(
      isActiveSessionLogin ? "reauth" : "auth"
    );

    openWebUrl(getAppStoreUrl(cieEnv), () => {
      toast.error(I18n.t("authentication.cie_id.cie_not_installed.link_error"));
    });
  };

  return (
    <OperationResultScreenContent
      action={{
        testID: "cie-id-not-installed-open-store",
        label: I18n.t(
          "authentication.cie_id.cie_not_installed.primary_action_label"
        ),
        onPress: handleOpenStore
      }}
      pictogram="attention"
      secondaryAction={{
        testID: "cie-id-not-installed-pop-to-top",
        label: I18n.t("global.buttons.close"),
        onPress: navigation.popToTop
      }}
      subtitle={I18n.t("authentication.cie_id.cie_not_installed.description")}
      title={I18n.t("authentication.cie_id.cie_not_installed.title")}
    />
  );
};

export default CieIdNotInstalled;
