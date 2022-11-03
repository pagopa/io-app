import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import I18n from "../i18n";
import { makeFontStyleObject } from "../theme/fonts";
import variables from "../theme/variables";
import IconFont from "./ui/IconFont";
import { Body } from "./core/typography/Body";
import { IOColors } from "./core/variables/IOColors";

const styles = StyleSheet.create({
  experimentalFeaturesBannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: variables.contentPadding,
    paddingVertical: variables.spacingBase,
    backgroundColor: variables.colorHighlight
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
    color: IOColors.white
  }
});

const ExperimentalFeaturesBanner = (
  <View style={styles.experimentalFeaturesBannerContainer}>
    <View style={styles.experimentalFeaturesBannerLeft}>
      <IconFont size={36} color={IOColors.white} name={"io-profilo-exp"} />
    </View>
    <View style={styles.experimentalFeaturesBannerRight}>
      <Body color={"white"} weight={"SemiBold"}>
        {I18n.t("profile.main.experimentalFeatures.bannerMessage")}
      </Body>
    </View>
  </View>
);

export default ExperimentalFeaturesBanner;
