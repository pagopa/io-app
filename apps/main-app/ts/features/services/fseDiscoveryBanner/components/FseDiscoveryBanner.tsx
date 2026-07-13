import { Banner, IOVisualCostants } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  fseDiscoveryBannerWebUrlSelector,
  isFseDiscoveryBannerDismissableSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";
import { persistedDismissFseDiscoveryBanner } from "../store/actions";

export const FseDiscoveryBanner = ({
  handleOnClose
}: {
  handleOnClose: () => void;
}) => {
  const dispatch = useIODispatch();
  const webUrl = useIOSelector(fseDiscoveryBannerWebUrlSelector);
  const isDismissable = useIOSelector(isFseDiscoveryBannerDismissableSelector);

  const handleClose = () => {
    dispatch(persistedDismissFseDiscoveryBanner());
    handleOnClose();
  };
  const handlePress = useCallback(() => {
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
        testID="fseDiscoveryBanner"
        title={I18n.t("features.fseDiscoveryBanner.title")}
        content={I18n.t("features.fseDiscoveryBanner.body")}
        action={I18n.t("features.fseDiscoveryBanner.cta")}
        color="turquoise"
        pictogramName="itWallet"
        onPress={handlePress}
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
