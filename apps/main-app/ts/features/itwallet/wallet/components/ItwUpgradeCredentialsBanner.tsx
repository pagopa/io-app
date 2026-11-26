import { Banner } from "@io-app/design-system";
import I18n from "i18next";

import { useIODispatch } from "../../../../store/hooks";
import { itwCloseBanner } from "../../common/store/actions/banners";

export const ItwUpgradeCredentialsBanner = () => {
  const dispatch = useIODispatch();
  const dismiss = () => dispatch(itwCloseBanner("upgradeCredentials"));

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
