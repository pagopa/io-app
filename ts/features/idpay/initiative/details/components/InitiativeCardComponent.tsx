import { Text, View } from "native-base";
import * as React from "react";
import { Image, Platform, StyleSheet } from "react-native";
import { StatusEnum } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { makeFontStyleObject } from "../../../../../components/core/fonts";
import { H2 } from "../../../../../components/core/typography/H2";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import TypedI18n from "../../../../../i18n";
import { formatDateAsLocal } from "../../../../../utils/dates";
import bonusVacanzeWhiteLogo from "../../../../../../img/bonus/bonusVacanze/logo_BonusVacanze_White.png";
import InitiativeCardSVG from "../../../../../../img/features/idpay/bonus_bg_svg.svg";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";

type Props = {
  status: StatusEnum;
  endDate: Date;
  initiativeName?: string;
  amount?: number;
  accrued?: number;
};

const opaqueBorderColor = IOColors.bluegreyDark;

const styles = StyleSheet.create({
  imageFull: {
    resizeMode: "stretch",
    zIndex: -1
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    textAlign: "center"
  },
  spaced: {
    justifyContent: "space-between"
  },
  bottomInitiativeIcon: {
    flex: 1,
    justifyContent: "flex-end"
  },
  paddedMainContent: {
    zIndex: 1,
    padding: 16,
    width: "100%",
    height: "100%",
    position: "absolute"
  },
  amount: {
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

const InitiativeCardComponent = (props: Props) => {
  const renderFullCard = () => {
    const isInitiativeConfigured = props.status === StatusEnum.REFUNDABLE;
    return (
      <View style={[styles.row, styles.spaced, IOStyles.flex]}>
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
              "idpay.initiative.details.initiativeCard.validUntil"
            )} ${formatDateAsLocal(props.endDate, true)}`}</Text>
          </View>
          <View style={styles.row}>
            <View>
              <Text
                bold={true}
                style={[
                  !isInitiativeConfigured ? styles.consumedOpacity : {},
                  styles.amount
                ]}
              >
                {formatNumberAmount(props.amount || 0, true)}
              </Text>
              <H5 color="white">
                {TypedI18n.t(
                  "idpay.initiative.details.initiativeCard.availableAmount"
                )}
              </H5>
            </View>

            <View small hspacer />

            <View>
              <Text
                bold={true}
                style={[
                  !isInitiativeConfigured ? styles.consumedOpacity : {},
                  styles.amount
                ]}
              >
                {formatNumberAmount(props.accrued || 0, true)}
              </Text>

              <H5 color="white">
                {TypedI18n.t(
                  "idpay.initiative.details.initiativeCard.toRefund"
                )}
              </H5>
            </View>
          </View>
        </View>
        <View>
          <View
            style={styles.bottomInitiativeIcon}
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
      <View style={IOStyles.flex}>
        <View style={styles.imageFull}>
          <InitiativeCardSVG />
        </View>
        <View style={styles.paddedMainContent}>{renderFullCard()}</View>
      </View>
    </>
  );
};

export default InitiativeCardComponent;
