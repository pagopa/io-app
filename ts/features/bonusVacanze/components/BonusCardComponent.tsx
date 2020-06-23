import { Text, View } from "native-base";
import * as React from "react";
import { Image, ImageBackground, Platform, StyleSheet } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger
} from "react-native-popup-menu";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import { makeFontStyleObject } from "../../../theme/fonts";
import customVariables from "../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { addEvery } from "../../../utils/strings";

type Props = {
  bonus: BonusActivationWithQrCode;
  preview?: boolean;
  onPress?: () => void;
  viewQR?: () => void;
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  imageFull: {
    resizeMode: "stretch",
    height: 168,
    width: Platform.OS === "android" ? wp("89%") : "100%"
  },
  imagePreview: {
    resizeMode: "stretch",
    height: 88,
    width: Platform.OS === "android" ? wp("92%") : "100%"
  },
  preview: {
    marginBottom: -20,
    height: 88
  },
  previewContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    zIndex: 0,
    elevation: 0
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    textAlign: "center"
  },
  spaced: {
    justifyContent: "space-between"
  },
  alignCenter: {
    alignSelf: "center"
  },
  flexEnd: {
    alignSelf: "flex-end"
  },
  actions: {
    // color: customVariables.brandPrimary,
    textAlign: "center",
    ...makeFontStyleObject(Platform.select)
  },
  paddedIcon: {
    paddingLeft: 10
  },
  paddedContent: {
    padding: 16
  },
  colorWhite: {
    color: customVariables.colorWhite
  },
  fontLarge: {
    fontSize: customVariables.fontSize2
  },
  fontXLarge: {
    lineHeight: 30,
    fontSize: customVariables.fontSize4
  },
  previewName: {
    lineHeight: 24,
    fontSize: 18
  },
  previewAmount: {
    lineHeight: 30,
    fontSize: customVariables.fontSize4,
    ...makeFontStyleObject(Platform.select, "700", undefined, "RobotoMono")
  },
  bonusCode: {
    ...makeFontStyleObject(Platform.select, "600", undefined, "RobotoMono")
  },
  codeLabel: {
    fontSize: customVariables.fontSizeSmaller
  },
  logo: {
    resizeMode: "contain",
    height: 72,
    width: 72
  },
  previewLogo: {
    resizeMode: "contain",
    marginRight: 6,
    height: 40,
    width: 40
  }
});

const bonusVacanzeWhiteLogo = require("../../../../img/bonus/bonusVacanze/logo_BonusVacanze_White.png");
const bonusVacanzePreviewBg = require("../../../../img/bonus/bonusVacanze/bonus_preview_bg.png");
const bonusVacanzeBg = require("../../../../img/bonus/bonusVacanze/bonus_bg.png");
const BonusCardComponent: React.FunctionComponent<Props> = (props: Props) => {
  const { bonus } = props;

  const renderFullCard = () => {
    return (
      <View style={[styles.row, styles.spaced]}>
        <View style={{ flexDirection: "column" }}>
          <View spacer={true} small={true} />
          <Text bold={true} style={[styles.colorWhite, styles.fontLarge]}>
            {I18n.t("bonus.bonusVacanze.name")}
          </Text>
          <View spacer={true} small={true} />
          <View style={styles.row}>
            <Text bold={true} style={[styles.colorWhite, styles.previewAmount]}>
              {bonus.dsu_request.max_amount}
            </Text>
            <Text style={[styles.colorWhite, styles.fontLarge]}>{"€"}</Text>
          </View>
          <View spacer={true} />
          <Text style={[styles.colorWhite, styles.codeLabel]}>
            {I18n.t("bonus.bonusVacanze.code")}
          </Text>
          <Text style={[styles.colorWhite, styles.fontLarge, styles.bonusCode]}>
            {addEvery(bonus.id, " ", 4).trim()}
          </Text>
        </View>
        <View>
          <View style={styles.flexEnd}>
            <Menu>
              <MenuTrigger>
                <IconFont name={"io-more"} color={customVariables.colorWhite} />
              </MenuTrigger>

              <MenuOptions>
                <MenuOption
                  onSelect={() => clipboardSetStringWithFeedback(bonus.id)}
                >
                  <Text style={styles.actions}>
                    {I18n.t("bonus.bonusVacanze.cta.copyCode")}
                  </Text>
                </MenuOption>
                <ItemSeparatorComponent />
                <MenuOption onSelect={props.viewQR}>
                  <Text style={styles.actions}>
                    {I18n.t("bonus.bonusVacanze.cta.openQRCode")}
                  </Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
          <View spacer={true} extralarge={true} />
          <Image source={bonusVacanzeWhiteLogo} style={styles.logo} />
        </View>
      </View>
    );
  };

  const renderPreviewCard = () => {
    return (
      <View style={styles.preview}>
        <TouchableDefaultOpacity
          style={[styles.row, styles.spaced]}
          onPress={props.onPress}
        >
          <View style={[styles.row]}>
            <Text bold={true} style={[styles.colorWhite, styles.previewName]}>
              {I18n.t("bonus.bonusVacanze.name")}
            </Text>
            <View hspacer={true} large={true} />
            <Text bold={true} style={[styles.colorWhite, styles.previewAmount]}>
              {bonus.dsu_request.max_amount}
            </Text>
            <Text style={[styles.colorWhite, { fontSize: 20 }]}>{"€"}</Text>
          </View>
          <Image source={bonusVacanzeWhiteLogo} style={styles.previewLogo} />
        </TouchableDefaultOpacity>
      </View>
    );
  };

  return (
    <ImageBackground
      style={[styles.container, props.preview ? styles.preview : {}]}
      imageStyle={props.preview ? styles.imagePreview : styles.imageFull}
      source={props.preview ? bonusVacanzePreviewBg : bonusVacanzeBg}
    >
      <View style={styles.paddedContent}>
        {props.preview ? renderPreviewCard() : renderFullCard()}
      </View>
    </ImageBackground>
  );
};

export default BonusCardComponent;
