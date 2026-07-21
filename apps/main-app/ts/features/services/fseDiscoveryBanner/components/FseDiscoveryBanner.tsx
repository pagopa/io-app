import { Banner, IOVisualCostants } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  fseDiscoveryBannerWebUrlSelector,
  isFseDiscoveryBannerDismissableSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";
import {
  trackLandingScreenMultiBannerClosure,
  trackLandingScreenMultiBannerImpression,
  trackLandingScreenMultiBannerTap
} from "../../../landingScreenMultiBanner/utils/tracking";
import { persistedDismissFseDiscoveryBanner } from "../store/actions";

export const FseDiscoveryBanner = ({
  handleOnClose
}: {
  handleOnClose: () => void;
}) => {
  const dispatch = useIODispatch();
  const webUrl = useIOSelector(fseDiscoveryBannerWebUrlSelector);
  const isDismissable = useIOSelector(isFseDiscoveryBannerDismissableSelector);

  useEffect(() => {
    trackLandingScreenMultiBannerImpression(
      "FSE_REDIRECT",
      webUrl ?? "INVALID_LINK"
    );
  }, [webUrl]);

  const handleClose = useCallback(() => {
    trackLandingScreenMultiBannerClosure(
      "FSE_REDIRECT",
      webUrl ?? "INVALID_LINK"
    );
    dispatch(persistedDismissFseDiscoveryBanner());
    handleOnClose();
  }, [dispatch, handleOnClose, webUrl]);

  const handlePress = useCallback(() => {
    trackLandingScreenMultiBannerTap("FSE_REDIRECT", webUrl ?? "INVALID_LINK");
    if (webUrl != null) {
      openWebUrl(webUrl);
    }
  }, [webUrl]);

  const maybeCloseProps = isDismissable
    ? {
        onClose: handleClose,
        labelClose: I18n.t("global.buttons.close")
      }
    : {};

  return (
    <View style={styles.margins}>
      <Banner
        action={I18n.t("features.fseDiscoveryBanner.cta")}
        color="turquoise"
        content={I18n.t("features.fseDiscoveryBanner.body")}
        onPress={handlePress}
        pictogramName="itWallet"
        testID="fseDiscoveryBanner"
        title={I18n.t("features.fseDiscoveryBanner.title")}
        {...maybeCloseProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});
