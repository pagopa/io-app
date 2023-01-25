import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Badge, Text as NBBadgeText } from "native-base";
import * as React from "react";
import {
  Text,
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
import { makeFontStyleObject } from "../../../../components/core/fonts";
import customVariables from "../../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { isShareEnabled } from "../../../../utils/share";
import { maybeNotNullyString } from "../../../../utils/strings";
import { getBonusCodeFormatted, isBonusActive } from "../utils/bonus";

import bonusVacanzeBg from "../../../../../img/bonus/bonusVacanze/bonus_bg.png";
import bonusVacanzePreviewBg from "../../../../../img/bonus/bonusVacanze/bonus_preview_bg.png";
import bonusVacanzeWhiteLogo from "../../../../../img/bonus/bonusVacanze/logo_BonusVacanze_White.png";
import { H2 } from "../../../../components/core/typography/H2";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";

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
    textAlign: "center"
  },
  paddedContent: {
    padding: 16
  },
  colorWhite: {
    color: IOColors.white
  },
  currency: {
    fontSize: 20,
    lineHeight: 24,
    ...makeFontStyleObject("Regular")
  },
  previewAmount: {
    lineHeight: 28,
    fontSize: 28,
    ...makeFontStyleObject("Bold", undefined, "RobotoMono")
  },
  bonusCode: {
    fontSize: 20,
    lineHeight: 24,
    ...makeFontStyleObject("SemiBold", undefined, "RobotoMono")
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
    alignSelf: "center",
    height: 18,
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
          <H2 color="white" weight="Bold">
            {I18n.t("bonus.bonusVacanze.name")}
          </H2>
          <VSpacer size={8} />
          <View style={[IOStyles.row, IOStyles.alignCenter]}>
            <View
              style={[
                IOStyles.row,
                IOStyles.alignCenter,
                !isBonusActive(props.bonus) ? styles.consumedOpacity : {}
              ]}
            >
              <Text style={[styles.colorWhite, styles.previewAmount]}>
                {bonus.dsu_request.max_amount}
              </Text>
              <HSpacer size={4} />
              <Text style={[styles.colorWhite, styles.currency]}>{"€"}</Text>
            </View>
            <HSpacer size={8} />
            {O.isSome(maybeStatusDescription) && (
              // IOBadge · White version not available yet
              <Badge style={styles.badge}>
                <NBBadgeText style={styles.statusText} semibold={true}>
                  {maybeStatusDescription.value}
                </NBBadgeText>
              </Badge>
            )}
          </View>
          <VSpacer size={16} />
          <Body color="white">{I18n.t("bonus.bonusVacanze.code")}</Body>
          <Text style={[styles.colorWhite, styles.bonusCode]}>
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
                <IconFont name={"io-more"} color={IOColors.white} />
              </MenuTrigger>

              <MenuOptions>
                <MenuOption
                  onSelect={() => clipboardSetStringWithFeedback(bonus.id)}
                >
                  <Body style={styles.actions}>
                    {I18n.t("bonus.bonusVacanze.cta.copyCode")}
                  </Body>
                </MenuOption>
                {isBonusActive(props.bonus) && (
                  <>
                    <ItemSeparatorComponent />
                    <MenuOption onSelect={props.viewQR}>
                      <Body style={styles.actions}>
                        {I18n.t("bonus.bonusVacanze.cta.openQRCode")}
                      </Body>
                    </MenuOption>
                    {isShareEnabled() ? (
                      <>
                        <ItemSeparatorComponent />
                        <MenuOption onSelect={props.share}>
                          <Body style={styles.actions}>
                            {I18n.t("global.buttons.share")}
                          </Body>
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
        <H3 weight="Bold" color="white">
          {I18n.t("bonus.bonusVacanze.name")}
        </H3>
        <HSpacer size={24} />
        <View
          style={[
            IOStyles.row,
            IOStyles.alignCenter,
            !isBonusActive(props.bonus) ? styles.consumedOpacity : {}
          ]}
        >
          <Text style={[styles.colorWhite, styles.previewAmount]}>
            {bonus.dsu_request.max_amount}
          </Text>
          <HSpacer size={4} />
          <Text style={[styles.colorWhite, styles.currency]}>{"€"}</Text>
        </View>
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
