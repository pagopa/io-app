import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Badge, Text, View } from "native-base";
import * as React from "react";
import { Image, ImageBackground, Platform, StyleSheet } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger
} from "react-native-popup-menu";
// import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
// import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
// import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
// import IconFont from "../../../../components/ui/IconFont";
// import I18n from "../../../../i18n";
// import { makeFontStyleObject } from "../../../../theme/fonts";
// import customVariables from "../../../../theme/variables";
// import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
// import { isShareEnabled } from "../../../../utils/share";
// import { maybeNotNullyString } from "../../../../utils/strings";
// import { getBonusCodeFormatted, isBonusActive } from "../utils/bonus";
// import {
//   IOColors,
//   hexToRgba
// } from "../../../../components/core/variables/IOColors";

type Props = InitiativeDTO;

const opaqueBorderColor = IOColors.bluegreyDark; // hexToRgba(IOColors.black, 0.1);

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
  // imagePreview: {
  //   resizeMode: "stretch",
  //   height: 88,
  //   width: "100%"
  // },
  // preview: {
  //   marginBottom: -20,
  //   height: 88
  // },
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
  //   actions: {
  // color: customVariables.brandPrimary,
  // textAlign: "center"
  // ...makeFontStyleObject(Platform.select)
  //   },
  paddedContent: {
    padding: 16
  },
  // colorWhite: {
  //   color: IOColors.white
  // },
  // fontLarge: {
  //   fontSize: 20,
  //   fontWeight: "700"
  // },
  //   previewName: {
  //     lineHeight: 24,
  //     fontSize: 18
  //   },
  Amount: {
    lineHeight: 32,
    fontSize: 24, // customVariables.fontSize4,
    color: IOColors.white,
    ...makeFontStyleObject("Bold", undefined, "TitilliumWeb")
  },
  //   bonusCode: {
  //     ...makeFontStyleObject(Platform.select, "600", undefined, "RobotoMono")
  //   },
  logo: {
    resizeMode: "contain",
    height: 72,
    width: 72
  },
  //   previewLogo: {
  //     resizeMode: "contain",
  //     marginRight: 6,
  //     height: 40,
  //     width: 40
  //   },
  // badge: {
  //   height: 18,
  //   marginTop: 6,
  //   backgroundColor: IOColors.white
  // },
  // statusText: {
  //   fontSize: 12,
  //   lineHeight: 16
  //   // color: customVariables.textColor
  // },
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

import bonusVacanzeBg from "../../../../../img/bonus/bonusVacanze/bonus_bg.png";
// import bonusVacanzePreviewBg from "../../../../../img/bonus/bonusVacanze/bonus_preview_bg.png";
import bonusVacanzeWhiteLogo from "../../../../../img/bonus/bonusVacanze/logo_BonusVacanze_White.png";
import { InitiativeDTO } from "../../../../../definitions/idpay/wallet/InitiativeDTO";
import { makeFontStyleObject } from "../../../../components/core/fonts";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TypedI18n from "../../../../i18n";
import { maybeNotNullyString } from "../../../../utils/strings";
import { H2 } from "../../../../components/core/typography/H2";
import { H4 } from "../../../../components/core/typography/H4";
import { H5 } from "../../../../components/core/typography/H5";
// eslint-disable-next-line sonarjs/cognitive-complexity
const BonusCardComponent = (props: Props) => {
  //   const { bonus } = props;

  const renderFullCard = () => {
    const maybeStatusDescription = maybeNotNullyString(
      props
        ? TypedI18n.t(`bonus.${props.status.toLowerCase()}`, {
            defaultValue: ""
          })
        : ""
    );
    const isBonusActive = props.status === "REFUNDABLE";
    return (
      <View
        style={[styles.row, styles.spaced]}
        accessible={true}
        accessibilityLabel={TypedI18n.t(
          "bonus.bonusVacanze.accessibility.card", // CHANGE THIS
          {
            code: props.initiativeId,
            value: props.available,
            status: props.status
          }
        )}
      >
        <View style={{ flexDirection: "column" }}>
          <View spacer={true} small={true} />
          <H2 color="white">{props.initiativeName}</H2>
          <Text
            style={{ color: IOColors.white }}
          >{`Valid until ${props.endDate.toLocaleDateString()}`}</Text>
          {/* <Text
            bold={true}
            style={[
              !isBonusActive ? styles.consumedOpacity : {},
              styles.colorWhite,
              styles.previewAmount
            ]}
          >
            {props.available}
          </Text> */}
          {/* <View spacer={true} small={true} /> */}
          {/* <View style={styles.row}> */}
          {/* {O.isSome(maybeStatusDescription) && (
              <Badge style={styles.badge}>
                <Text style={styles.statusText} semibold={true}>
                  {maybeStatusDescription.value}
                </Text>
              </Badge>
            )} */}
          {/* </View> */}
          <View spacer={true} large />
          <View style={[styles.row, styles.spaced]}>
            <View style={{ flexDirection: "column" }}>
              <Text
                bold={true}
                style={[
                  !isBonusActive ? styles.consumedOpacity : {},
                  styles.Amount
                ]}
              >
                {`${props.available},00€`}
              </Text>
              <H5 color="white">{"Disponibile"}</H5>
            </View>

            <View hspacer />

            <View style={{ flexDirection: "column" }}>
              <Text
                bold={true}
                style={[
                  !isBonusActive ? styles.consumedOpacity : {},
                  styles.Amount
                ]}
              >
                {`${props.accrued}€`}
              </Text>

              <H5 color="white">{"da rimborsare"}</H5>
            </View>
            {/* {TypedI18n.t("bonus.bonusVacanze.code")} */}
          </View>
          {/* <Text
            style={[
              styles.colorWhite,
              styles.fontLarge
              // styles.bonusCode
            ]}
          >
            {(props.available, props.accrued)}
          </Text> */}
        </View>
        <View>
          <View
            style={styles.flexEnd}
            accessible={true}
            importantForAccessibility={"no-hide-descendants"}
            accessibilityElementsHidden={true}
          >
            {/* <Menu>
              <MenuTrigger>
                <IconFont name={"io-more"} color={IOColors.white} />
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
            </Menu> */}
          </View>
          <View spacer={true} extralarge={true} />
          <Image source={bonusVacanzeWhiteLogo} style={styles.logo} />
        </View>
      </View>
    );
  };

  //   const renderPreviewCard = () => (
  //     <TouchableDefaultOpacity
  //       style={[styles.row, styles.spaced]}
  //       onPress={props.onPress}
  //       accessible={true}
  //       accessibilityRole={"button"}
  //       accessibilityLabel={I18n.t("bonus.bonusVacanze.accessibility.preview", {
  //         value: props.bonus.dsu_request.max_amount,
  //         status: I18n.t(`bonus.${props.bonus.status.toLowerCase()}`, {
  //           defaultValue: ""
  //         })
  //       })}
  //     >
  //       <View style={styles.row}>
  //         <Text bold={true} style={[styles.colorWhite, styles.previewName]}>
  //           {I18n.t("bonus.bonusVacanze.name")}
  //         </Text>
  //         <View hspacer={true} large={true} />
  //         <Text
  //           bold={true}
  //           style={[
  //             !isBonusActive(props.bonus) ? styles.consumedOpacity : {},
  //             styles.colorWhite,
  //             styles.previewAmount
  //           ]}
  //         >
  //           {bonus.dsu_request.max_amount}
  //         </Text>
  //         <Text
  //           style={[
  //             !isBonusActive(props.bonus) ? styles.consumedOpacity : {},
  //             styles.colorWhite,
  //             { fontSize: 20 }
  //           ]}
  //         >
  //           {"€"}
  //         </Text>
  //       </View>
  //       {/* <Image source={bonusVacanzeWhiteLogo} style={styles.previewLogo} />
  //     </TouchableDefaultOpacity>
  //   ); */}

  return (
    <>
      {Platform.OS === "android" && <View style={styles.shadowBox} />}
      <ImageBackground
        style={[
          styles.container
          //  props.preview ?
          // styles.preview
          //  : {}
        ]}
        imageStyle={
          // props.preview ?
          // styles.imagePreview
          //   :
          styles.imageFull
        }
        source={
          // props.preview ?
          // bonusVacanzePreviewBg
          //  :
          bonusVacanzeBg
        }
      >
        <View style={styles.paddedContent}>{renderFullCard()}</View>
      </ImageBackground>
    </>
  );
};

export default BonusCardComponent;
