import { Text } from "native-base";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import I18n from "../i18n";
import { makeFontStyleObject } from "../theme/fonts";
import variables from "../theme/variables";
import IconFont from "./ui/IconFont";

const styles = StyleSheet.create({
  experimentalFeaturesBannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: variables.contentPadding,
    paddingVertical: variables.spacingBase,
    backgroundColor: variables.brandHighlight
  },
  experimentalFeaturesBannerLeft: {
    flex: 0,
    marginRight: variables.spacingBase
  },
  experimentalFeaturesBannerRight: {
    flex: 1
  },
  experimentalFeaturesBannerMessage: {
    ...makeFontStyleObject(Platform.select, "600"),
    fontSize: 14,
    lineHeight: 18,
    color: variables.colorWhite
  }
});

const ExperimentalFeaturesBanner = (
  <View style={styles.experimentalFeaturesBannerContainer}>
    <View style={styles.experimentalFeaturesBannerLeft}>
      <IconFont
        size={36}
        color={variables.colorWhite}
        name={"io-profilo-exp"}
      />
    </View>
    <View style={styles.experimentalFeaturesBannerRight}>
      <Text style={styles.experimentalFeaturesBannerMessage}>
        {I18n.t("profile.main.experimentalFeatures.bannerMessage")}
      </Text>
    </View>
  </View>
);

export default ExperimentalFeaturesBanner;
