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
  /** Flow type to determine dismissal logic and tracking properties  */
  flow?: "messages_inbox" | "wallet";
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Custom styles applied to the underlying {@link ItwEngagementBanner} component */
  style?: ComponentProps<typeof ItwEngagementBanner>["style"];
};

/**
 * Disaplays a banner that prompts the user to activate or upgrade its wallet to the
 * new IT-Wallet.
 */
export const ItwDiscoveryBanner = ({
  flow = "wallet",
  onDismiss,
  style
}: Props) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const isWalletActive = useIOSelector(itwLifecycleIsValidSelector);
  const isWalletEmpty = useIOSelector(itwIsWalletEmptySelector);
  const hasMdl = useIOSelector(itwIsMdlPresentSelector);

  const navigateToDiscoveryScreen = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  };

  const navigateToDocumentOnboardingScreen = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  const handleOnDismiss = () => {
    onDismiss?.();
    dispatch(itwCloseBanner(`discovery_${flow}`));
  };

  if (!isWalletActive) {
    return (
      <ItwEngagementBanner
        title={I18n.t("features.itWallet.engagementBanner.activation.title")}
        description={I18n.t(
          "features.itWallet.engagementBanner.activation.description"
        )}
        action={I18n.t("features.itWallet.engagementBanner.activation.action")}
        onPress={navigateToDocumentOnboardingScreen}
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
        onPress={navigateToDocumentOnboardingScreen}
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
