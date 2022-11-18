import { Text, View } from "native-base";
import * as React from "react";
import { Image, ImageBackground, Platform, StyleSheet } from "react-native";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../definitions/idpay/wallet/InitiativeDTO";
import { makeFontStyleObject } from "../../../../components/core/fonts";
import { H2 } from "../../../../components/core/typography/H2";
import { H5 } from "../../../../components/core/typography/H5";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TypedI18n from "../../../../i18n";
import { formatDateAsLocal } from "../../../../utils/dates";
import bonusVacanzeWhiteLogo from "../../../../../img/bonus/bonusVacanze/logo_BonusVacanze_White.png";
import bonusCardBG from "../../../../../img/idpay/bonus_bg.png";

type Props = InitiativeDTO;

const opaqueBorderColor = IOColors.bluegreyDark;

const styles = StyleSheet.create({
  flexFull: {
    flex: 1
  },
  imageFull: {
    resizeMode: "stretch",
    zIndex: 0
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    textAlign: "center"
  },
  spaced: {
    justifyContent: "space-between"
  },
  bottomBonusIcon: {
    flex: 1,
    justifyContent: "flex-end"
  },
  paddedContent: {
    flex: 1,
    padding: 16
  },
  Amount: {
    lineHeight: 32,
    fontSize: 24,
    color: IOColors.white,
    ...makeFontStyleObject("Bold", undefined, "TitilliumWeb")
  },
  logo: {
    resizeMode: "contain",
    height: 65,
    width: 65
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
    maxWidth: 343
  }
});

const BonusCardComponent = (props: Props) => {
  const renderFullCard = () => {
    // const maybeStatusDescription = maybeNotNullyString(
    //   props
    //     ? TypedI18n.t(`bonus.${props.status.toLowerCase()}`, {
    //         defaultValue: ""
    //       })
    //     : ""
    // );
    const isBonusActive = props.status === StatusEnum.REFUNDABLE;
    return (
      <View
        style={[styles.row, styles.spaced, styles.flexFull]}
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
        <View
          style={[
            {
              height: "100%"
            },
            styles.spaced
          ]}
        >
          <View>
            <View spacer={true} small={true} />

            <H2 color="white">{props.initiativeName}</H2>
            <Text style={{ color: IOColors.white }}>{`${TypedI18n.t(
              "idpay.wallet.bonusCard.validUntil"
            )} ${formatDateAsLocal(props.endDate, true)}`}</Text>
          </View>
          <View style={styles.row}>
            <View>
              <Text
                bold={true}
                style={[
                  !isBonusActive ? styles.consumedOpacity : {},
                  styles.Amount
                ]}
              >
                {`${props.available},00 €`}
              </Text>
              <H5 color="white">
                {TypedI18n.t("idpay.wallet.bonusCard.availableAmount")}
              </H5>
            </View>

            <View small hspacer />

            <View>
              <Text
                bold={true}
                style={[
                  !isBonusActive ? styles.consumedOpacity : {},
                  styles.Amount
                ]}
              >
                {`${props.accrued},00 €`}
              </Text>

              <H5 color="white">
                {TypedI18n.t("idpay.wallet.bonusCard.toRefund")}
              </H5>
            </View>
          </View>
        </View>
        <View>
          <View
            style={styles.bottomBonusIcon}
            accessible={true}
            importantForAccessibility={"no-hide-descendants"}
            accessibilityElementsHidden={true}
          >
            <Image source={bonusVacanzeWhiteLogo} style={styles.logo} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      {Platform.OS === "android" ? (
        <View style={styles.shadowBox} />
      ) : undefined}
      <ImageBackground
        style={styles.flexFull}
        imageStyle={styles.imageFull}
        source={bonusCardBG}
      >
        <View style={styles.paddedContent}>{renderFullCard()}</View>
      </ImageBackground>
    </>
  );
};

export default BonusCardComponent;
