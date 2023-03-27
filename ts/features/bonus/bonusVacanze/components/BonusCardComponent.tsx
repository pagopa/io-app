import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Badge, Text as NBText } from "native-base";
import * as React from "react";
import {
  View,
  Image,
  ImageBackground,
  Platform,
  StyleSheet
} from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger
} from "react-native-popup-menu";
import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import {
  hexToRgba,
  IOColors
} from "../../../../components/core/variables/IOColors";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import IconFont from "../../../../components/ui/IconFont";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";
import I18n from "../../../../i18n";
import { makeFontStyleObject } from "../../../../theme/fonts";
import customVariables from "../../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { isShareEnabled } from "../../../../utils/share";
import { maybeNotNullyString } from "../../../../utils/strings";
import { getBonusCodeFormatted, isBonusActive } from "../utils/bonus";

import bonusVacanzeBg from "../../../../../img/bonus/bonusVacanze/bonus_bg.png";
import bonusVacanzePreviewBg from "../../../../../img/bonus/bonusVacanze/bonus_preview_bg.png";
import bonusVacanzeWhiteLogo from "../../../../../img/bonus/bonusVacanze/logo_BonusVacanze_White.png";

type Props = {
  bonus: BonusActivationWithQrCode;
  preview?: boolean;
  onPress?: () => void;
  viewQR?: () => void;
  share?: () => void;
};

const opaqueBorderColor = hexToRgba(IOColors.black, 0.1);

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
  row: {
    flexDirection: "row",
    alignItems: "center",
    textAlign: "center"
  },
  spaced: {
    justifyContent: "space-between"
  },
  flexEnd: {
    alignSelf: "flex-end"
  },
  actions: {
    // color: customVariables.brandPrimary,
    textAlign: "center",
    ...makeFontStyleObject(Platform.select)
  },
  paddedContent: {
    padding: 16
  },
  colorWhite: {
    color: IOColors.white
  },
  fontLarge: {
    fontSize: customVariables.fontSize2
  },
  previewName: {
    lineHeight: 24,
    fontSize: 18
  },
  previewAmount: {
    lineHeight: 30,
    fontSize: 28,
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
  badge: {
    height: 18,
    marginTop: 6,
    backgroundColor: IOColors.white
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
    borderTopColor: opaqueBorderColor,
    height: 15,
    width: "100%",
    maxWidth: 327
  }
});

// eslint-disable-next-line sonarjs/cognitive-complexity
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
          status: pipe(
            maybeStatusDescription,
            O.getOrElseW(() => props.bonus.status)
          )
        })}
      >
        <View style={{ flexDirection: "column" }}>
          <VSpacer size={8} />
          <NBText bold={true} style={[styles.colorWhite, styles.fontLarge]}>
            {I18n.t("bonus.bonusVacanze.name")}
          </NBText>
          <VSpacer size={8} />
          <View style={styles.row}>
            <NBText
              bold={true}
              style={[
                !isBonusActive(props.bonus) ? styles.consumedOpacity : {},
                styles.colorWhite,
                styles.previewAmount
              ]}
            >
              {bonus.dsu_request.max_amount}
            </NBText>
            <NBText
              style={[
                !isBonusActive(props.bonus) ? styles.consumedOpacity : {},
                styles.colorWhite,
                styles.fontLarge
              ]}
            >
              {"€"}
            </NBText>
            <HSpacer size={16} />
            {O.isSome(maybeStatusDescription) && (
              <Badge style={styles.badge}>
                <NBText style={styles.statusText} semibold={true}>
                  {maybeStatusDescription.value}
                </NBText>
              </Badge>
            )}
          </View>
          <VSpacer size={16} />
          <NBText style={styles.colorWhite}>
            {I18n.t("bonus.bonusVacanze.code")}
          </NBText>
          <NBText
            style={[styles.colorWhite, styles.fontLarge, styles.bonusCode]}
          >
            {getBonusCodeFormatted(bonus)}
          </NBText>
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
                <IconFont name={"io-more"} color={IOColors.white} />
              </MenuTrigger>

              <MenuOptions>
                <MenuOption
                  onSelect={() => clipboardSetStringWithFeedback(bonus.id)}
                >
                  <NBText style={styles.actions}>
                    {I18n.t("bonus.bonusVacanze.cta.copyCode")}
                  </NBText>
                </MenuOption>
                {isBonusActive(props.bonus) && (
                  <>
                    <ItemSeparatorComponent />
                    <MenuOption onSelect={props.viewQR}>
                      <NBText style={styles.actions}>
                        {I18n.t("bonus.bonusVacanze.cta.openQRCode")}
                      </NBText>
                    </MenuOption>
                    {isShareEnabled() ? (
                      <>
                        <ItemSeparatorComponent />
                        <MenuOption onSelect={props.share}>
                          <NBText style={styles.actions}>
                            {I18n.t("global.buttons.share")}
                          </NBText>
                        </MenuOption>
                      </>
                    ) : null}
                  </>
                )}
              </MenuOptions>
            </Menu>
          </View>
          <VSpacer size={40} />
          <Image source={bonusVacanzeWhiteLogo} style={styles.logo} />
        </View>
      </View>
    );
  };

  const renderPreviewCard = () => (
    <TouchableDefaultOpacity
      style={[styles.row, styles.spaced]}
      onPress={props.onPress}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={I18n.t("bonus.bonusVacanze.accessibility.preview", {
        value: props.bonus.dsu_request.max_amount,
        status: I18n.t(`bonus.${props.bonus.status.toLowerCase()}`, {
          defaultValue: ""
        })
      })}
    >
      <View style={styles.row}>
        <NBText bold={true} style={[styles.colorWhite, styles.previewName]}>
          {I18n.t("bonus.bonusVacanze.name")}
        </NBText>
        <HSpacer size={24} />
        <NBText
          bold={true}
          style={[
            !isBonusActive(props.bonus) ? styles.consumedOpacity : {},
            styles.colorWhite,
            styles.previewAmount
          ]}
        >
          {bonus.dsu_request.max_amount}
        </NBText>
        <NBText
          style={[
            !isBonusActive(props.bonus) ? styles.consumedOpacity : {},
            styles.colorWhite,
            { fontSize: 20 }
          ]}
        >
          {"€"}
        </NBText>
      </View>
      <Image source={bonusVacanzeWhiteLogo} style={styles.previewLogo} />
    </TouchableDefaultOpacity>
  );

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
