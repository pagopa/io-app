import { Banner, IOSkeleton } from "@io-app/design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { ComponentProps, useCallback, useMemo } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  trackItwDiscoveryBanner,
  trackItwDiscoveryBannerClosure,
  trackItwDiscoveryBannerTap
} from "../../analytics";
import { ITW_SCREENVIEW_EVENTS } from "../../analytics/enum";
import { ItwEngagementBanner } from "../../common/components/ItwEngagementBanner";
import { itwCloseBanner } from "../../common/store/actions/banners";
import {
  itwIsMdlPresentSelector,
  itwIsWalletEmptySelector
} from "../../credentials/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwIsRemotelyActiveSelector } from "../../walletInstance/store/selectors";

type Props = {
  /** Flow type to determine dismissal logic and tracking properties  */
  flow?: "messages_inbox" | "wallet";
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Custom styles applied to the underlying {@link ItwEngagementBanner} component */
  style?: ComponentProps<typeof ItwEngagementBanner>["style"];
};

/**
 * Displays a banner that prompts the user to activate or upgrade its wallet to the
 * new IT-Wallet.
 */
export const ItwDiscoveryBanner = ({
  flow = "wallet",
  onDismiss,
  style
}: Props) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const route = useRoute();

  const isRemotelyActive = useIOSelector(itwIsRemotelyActiveSelector);
  const isWalletActive = useIOSelector(itwLifecycleIsValidSelector);
  const hasItwInstance = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const isWalletEmpty = useIOSelector(itwIsWalletEmptySelector);
  const hasMdl = useIOSelector(itwIsMdlPresentSelector);

  const bannerId = useMemo(() => {
    if (isRemotelyActive) {
      return "itwDeviceChangedBannerPid";
    }
    if (!isWalletActive) {
      return "itwDiscoveryItWalletNewUser";
    }
    if (isWalletEmpty) {
      return "itwDiscoveryItWalletEmptyState";
    }
    if (hasMdl) {
      return "itwDiscoveryItWalletDrivingLicenseIsPresent";
    }
    return "itwDiscoveryItWalletGenericCredentials";
  }, [isWalletActive, isWalletEmpty, hasMdl, isRemotelyActive]);

  const bannerLanding = useMemo(() => {
    if (isRemotelyActive) {
      return ITW_SCREENVIEW_EVENTS.WALLET_ADD_LIST_ITEM;
    }
    return ITW_SCREENVIEW_EVENTS.ITW_INTRO;
  }, [isRemotelyActive]);

  const trackBannerProperties = useMemo(
    () => ({
      banner_id: bannerId,
      banner_page: route.name,
      banner_landing: bannerLanding
    }),
    [bannerId, route.name, bannerLanding]
  );

  useFocusEffect(
    useCallback(() => {
      trackItwDiscoveryBanner(trackBannerProperties);
    }, [trackBannerProperties])
  );

  const navigateToDiscoveryScreen = () => {
    trackItwDiscoveryBannerTap(trackBannerProperties);
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  };

  const handleOnDismiss = () => {
    trackItwDiscoveryBannerClosure(trackBannerProperties);
    onDismiss?.();
    dispatch(itwCloseBanner(`discovery_${flow}`));
  };

  if (!hasItwInstance && isRemotelyActive === undefined) {
    return (
      <IOSkeleton shape="rectangle" width={"100%"} height={200} radius={8} />
    );
  }

  if (isRemotelyActive) {
    return (
      <Banner
        testID="itwReactivationBannerTestID"
        title={I18n.t("features.itWallet.engagementBanner.reactivation.title")}
        content={I18n.t(
          "features.itWallet.engagementBanner.reactivation.description"
        )}
        action={I18n.t(
          "features.itWallet.engagementBanner.reactivation.confirm"
        )}
        pictogramName="itWallet"
        color="turquoise"
        onClose={handleOnDismiss}
        labelClose={I18n.t("global.buttons.close")}
        onPress={navigateToDiscoveryScreen}
      />
    );
  }

  if (!isWalletActive) {
    return (
      <ItwEngagementBanner
        title={I18n.t("features.itWallet.engagementBanner.activation.title")}
        description={I18n.t(
          "features.itWallet.engagementBanner.activation.description"
        )}
        action={I18n.t("features.itWallet.engagementBanner.activation.action")}
        onPress={navigateToDiscoveryScreen}
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
        onPress={navigateToDiscoveryScreen}
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
        onPress={navigateToDiscoveryScreen}
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
      onPress={navigateToDiscoveryScreen}
      onDismiss={handleOnDismiss}
      dismissable={true}
      style={style}
    />
  );
};
