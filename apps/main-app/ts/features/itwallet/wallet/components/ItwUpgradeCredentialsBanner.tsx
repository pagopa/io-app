import { Banner } from "@io-app/design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";

import { useIODispatch } from "../../../../store/hooks";
import { trackItwBannerVisualized } from "../../analytics";
import { itwCloseBanner } from "../../common/store/actions/banners";

export const ItwUpgradeCredentialsBanner = () => {
  const dispatch = useIODispatch();
  const { name: routeName } = useRoute();
  const dismiss = () => dispatch(itwCloseBanner("upgradeCredentials"));

  useFocusEffect(
    useCallback(() => {
      trackItwBannerVisualized({
        banner_id: "itwUpgradeCredentialsBanner",
        banner_page: routeName,
        banner_landing: routeName,
        banner_campaign: I18n.t(
          "features.itWallet.issuance.upgrade.banner.title"
        )
      });
    }, [routeName])
  );

  return (
    <Banner
      action={I18n.t("features.itWallet.issuance.upgrade.banner.action")}
      color="turquoise"
      content={I18n.t("features.itWallet.issuance.upgrade.banner.content")}
      labelClose={I18n.t("global.buttons.close")}
      onClose={dismiss}
      onPress={dismiss}
      pictogramName="premiumCredentials"
      title={I18n.t("features.itWallet.issuance.upgrade.banner.title")}
    />
  );
};
