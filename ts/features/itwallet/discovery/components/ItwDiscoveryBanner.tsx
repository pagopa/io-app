import I18n from "i18next";
import { ComponentProps } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { ItwEngagementBanner } from "../../common/components/ItwEngagementBanner";
import { itwCloseBanner } from "../../common/store/actions/banners";
import {
  itwIsMdlPresentSelector,
  itwIsWalletEmptySelector
} from "../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";

type Props = {
  /** Custom styles applied to the underlying {@link ItwEngagementBanner} component */
  style?: ComponentProps<typeof ItwEngagementBanner>["style"];
};

/**
 * Disaplays a banner that prompts the user to activate or upgrade its wallet to the
 * new IT-Wallet.
 */
export const ItwDiscoveryBanner = ({ style }: Props) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const isWalletActive = useIOSelector(itwLifecycleIsValidSelector);
  const isWalletEmpty = useIOSelector(itwIsWalletEmptySelector);
  const hasMdl = useIOSelector(itwIsMdlPresentSelector);

  const handleStartPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  };

  const handleAddNewDocumentPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  const handleOnDismiss = () => {
    dispatch(itwCloseBanner("discovery_wallet"));
  };

  if (!isWalletActive) {
    return (
      <ItwEngagementBanner
        title={I18n.t("features.itWallet.engagementBanner.activation.title")}
        description={I18n.t(
          "features.itWallet.engagementBanner.activation.description"
        )}
        action={I18n.t("features.itWallet.engagementBanner.activation.action")}
        onPress={handleAddNewDocumentPress}
        onDismiss={handleOnDismiss}
        dismissable={true}
        style={style}
      />
    );
  }

  if (isWalletEmpty) {
    return (
      <ItwEngagementBanner
        title={I18n.t("features.itWallet.engagementBanner.upgrade_empty.title")}
        description={I18n.t(
          "features.itWallet.engagementBanner.upgrade_empty.description"
        )}
        action={I18n.t(
          "features.itWallet.engagementBanner.upgrade_empty.action"
        )}
        onPress={handleStartPress}
        onDismiss={handleOnDismiss}
        style={style}
      />
    );
  }

  if (hasMdl) {
    return (
      <ItwEngagementBanner
        title={I18n.t(
          "features.itWallet.engagementBanner.upgrade_with_mdl.title"
        )}
        description={I18n.t(
          "features.itWallet.engagementBanner.upgrade_with_mdl.description"
        )}
        action={I18n.t(
          "features.itWallet.engagementBanner.upgrade_with_mdl.action"
        )}
        onPress={handleStartPress}
        onDismiss={handleOnDismiss}
        dismissable={true}
        style={style}
      />
    );
  }

  return (
    <ItwEngagementBanner
      title={I18n.t("features.itWallet.engagementBanner.upgrade.title")}
      description={I18n.t(
        "features.itWallet.engagementBanner.upgrade.description"
      )}
      action={I18n.t("features.itWallet.engagementBanner.upgrade.action")}
      onPress={handleStartPress}
      onDismiss={handleOnDismiss}
      dismissable={true}
      style={style}
    />
  );
};
