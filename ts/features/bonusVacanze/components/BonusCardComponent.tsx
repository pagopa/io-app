import { Badge, Text, View } from "native-base";
import * as React from "react";
import { Image, ImageBackground, Platform, StyleSheet } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger
} from "react-native-popup-menu";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import { makeFontStyleObject } from "../../../theme/fonts";
import customVariables from "../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { isShareEnabled } from "../../../utils/share";
import { maybeNotNullyString } from "../../../utils/strings";
import { getBonusCodeFormatted, isBonusActive } from "../utils/bonus";

type Props = {
  bonus: BonusActivationWithQrCode;
  preview?: boolean;
  onPress?: () => void;
  viewQR?: () => void;
  share?: () => void;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 168
  },
  imageFull: {
    resizeMode: "stretch",
    height: 168,
    maxWidth: 327
  },
  imagePreview: {
    resizeMode: "stretch",
    height: 88,
    width: "100%"
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
  },
  euroCharacter: {
    fontSize: customVariables.fontSize3,
    lineHeight: customVariables.lineHeightH3
  },
  badge: {
    height: 18,
    marginTop: 6,
    backgroundColor: customVariables.colorWhite
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    color: customVariables.textColor
  },
  consumedOpacity: {
    opacity: 0.5
  },
  shadowBox: {
    marginBottom: -13,
    borderRadius: 8,
    borderTopWidth: 10,
    borderTopColor: "rgba(0,0,0,0.1)",
    height: 15,
    width: "100%",
    maxWidth: 327
  }
});

import bonusVacanzeWhiteLogo from "../../../../img/bonus/bonusVacanze/logo_BonusVacanze_White.png";
import bonusVacanzePreviewBg from "../../../../img/bonus/bonusVacanze/bonus_preview_bg.png";
import bonusVacanzeBg from "../../../../img/bonus/bonusVacanze/bonus_bg.png";
const BonusCardComponent: React.FunctionComponent<Props> = (props: Props) => {
  const { bonus } = props;

  const renderFullCard = () => {
    const maybeStatusDescription = maybeNotNullyString(
      bonus
        ? I18n.t(`bonus.${bonus.status.toLowerCase()}`, {
            defaultValue: ""
          })
        : ""
    );
    return (
      <View
        style={[styles.row, styles.spaced]}
        accessible={true}
        accessibilityLabel={I18n.t("bonus.bonusVacanze.accessibility.card", {
          code: props.bonus.id,
          value: props.bonus.dsu_request.max_amount,
          status: maybeStatusDescription.getOrElse(props.bonus.status)
        })}
      >
        <View style={{ flexDirection: "column" }}>
          <View spacer={true} small={true} />
          <Text bold={true} style={[styles.colorWhite, styles.fontLarge]}>
            {I18n.t("bonus.bonusVacanze.name")}
          </Text>
          <View spacer={true} small={true} />
          <View style={styles.row}>
            <Text
              bold={true}
              style={[
                !isBonusActive(props.bonus) ? styles.consumedOpacity : {},
                styles.colorWhite,
                styles.previewAmount
              ]}
            >
              {bonus.dsu_request.max_amount}
            </Text>
            <Text
              style={[
                !isBonusActive(props.bonus) ? styles.consumedOpacity : {},
                styles.colorWhite,
                styles.fontLarge
              ]}
            >
              {"€"}
            </Text>
            <View hspacer={true} />
            {maybeStatusDescription.isSome() && (
              <Badge style={styles.badge}>
                <Text style={styles.statusText} semibold={true}>
                  {maybeStatusDescription.value}
                </Text>
              </Badge>
            )}
          </View>
          <View spacer={true} />
          <Text style={[styles.colorWhite]}>
            {I18n.t("bonus.bonusVacanze.code")}
          </Text>
          <Text style={[styles.colorWhite, styles.fontLarge, styles.bonusCode]}>
            {getBonusCodeFormatted(bonus)}
          </Text>
        </View>
        <View>
          <View
            style={styles.flexEnd}
            accessible={true}
            importantForAccessibility={"no-hide-descendants"}
            accessibilityElementsHidden={true}
          >
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
                {isBonusActive(props.bonus) && (
                  <>
                    <ItemSeparatorComponent />
                    <MenuOption onSelect={props.viewQR}>
                      <Text style={styles.actions}>
                        {I18n.t("bonus.bonusVacanze.cta.openQRCode")}
                      </Text>
                    </MenuOption>
                    {isShareEnabled() ? (
                      <>
                        <ItemSeparatorComponent />
                        <MenuOption onSelect={props.share}>
                          <Text style={styles.actions}>
                            {I18n.t("global.buttons.share")}
                          </Text>
                        </MenuOption>
                      </>
                    ) : null}
                  </>
                )}
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
            <Text
              bold={true}
              style={[
                !isBonusActive(props.bonus) ? styles.consumedOpacity : {},
                styles.colorWhite,
                styles.previewAmount
              ]}
            >
              {bonus.dsu_request.max_amount}
            </Text>
            <Text
              style={[
                !isBonusActive(props.bonus) ? styles.consumedOpacity : {},
                styles.colorWhite,
                { fontSize: 20 }
              ]}
            >
              {"€"}
            </Text>
          </View>
          <Image source={bonusVacanzeWhiteLogo} style={styles.previewLogo} />
        </TouchableDefaultOpacity>
      </View>
    );
  };

  return (
    <>
      {Platform.OS === "android" && <View style={styles.shadowBox} />}
      <ImageBackground
        style={[styles.container, props.preview ? styles.preview : {}]}
        imageStyle={props.preview ? styles.imagePreview : styles.imageFull}
        source={props.preview ? bonusVacanzePreviewBg : bonusVacanzeBg}
      >
        <View style={styles.paddedContent}>
          {props.preview ? renderPreviewCard() : renderFullCard()}
        </View>
      </ImageBackground>
    </>
  );
};

export default BonusCardComponent;
