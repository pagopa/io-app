import { Banner } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { itwDocumentsOnIOUrl } from "../../../../config";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";

export const ItwUpcomingWalletBanner = () => (
  <View style={style.banner}>
    <Banner
      testID="itwUpcomingWalletBannerTestID"
      color="neutral"
      size="big"
      pictogramName="notification"
      title={I18n.t("features.itWallet.discovery.upcomingWalletBanner.title")}
      content={I18n.t(
        "features.itWallet.discovery.upcomingWalletBanner.content"
      )}
      action={I18n.t("features.itWallet.discovery.upcomingWalletBanner.action")}
      onPress={() => openWebUrl(itwDocumentsOnIOUrl)}
    />
  </View>
);

const style = StyleSheet.create({
  banner: {
    marginTop: 16,
    marginBottom: 24
  }
});
