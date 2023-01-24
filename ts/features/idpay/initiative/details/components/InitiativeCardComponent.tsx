import * as React from "react";
import { View, Image, ImageBackground, StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { StatusEnum } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { makeFontStyleObject } from "../../../../../components/core/fonts";
import { H2 } from "../../../../../components/core/typography/H2";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import TypedI18n from "../../../../../i18n";
import { formatDateAsLocal } from "../../../../../utils/dates";
import bonusVacanzeWhiteLogo from "../../../../../../img/bonus/bonusVacanze/logo_BonusVacanze_White.png";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import cardBg from "../../../../../../img/features/idpay/card_full.png";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";

type Props = {
  status: StatusEnum;
  endDate: Date;
  initiativeName?: string;
  amount?: number;
  accrued?: number;
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 230,
    width: widthPercentageToDP(100)
  },
  card: {
    position: "absolute",
    alignSelf: "center",
    width: widthPercentageToDP(100),
    height: 230
  },
  imageFull: {
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
    padding: 32,
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
            <VSpacer size={8} />

            <H2 color="white">{props.initiativeName}</H2>
            <Body color="white">
              {`${TypedI18n.t(
                "idpay.initiative.details.initiativeCard.validUntil"
              )} ${formatDateAsLocal(props.endDate, true)}`}
            </Body>
          </View>
          <View style={styles.row}>
            <View>
              <View
                style={!isInitiativeConfigured ? styles.consumedOpacity : {}}
              >
                {/* Using H1 here seems wrong. We need a custom
                typographic component for the wallet cards. */}
                <H1 color="white">
                  {formatNumberAmount(props.amount || 0, true)}
                </H1>
              </View>
              <H5 color="white">
                {TypedI18n.t(
                  "idpay.initiative.details.initiativeCard.availableAmount"
                )}
              </H5>
            </View>

            <HSpacer size={8} />

            <View>
              <View
                style={!isInitiativeConfigured ? styles.consumedOpacity : {}}
              >
                <H1 color="white">
                  {formatNumberAmount(props.accrued || 0, true)}
                </H1>
              </View>

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
    <View style={styles.card} testID={"card-component"}>
      <ImageBackground
        source={cardBg}
        imageStyle={[styles.imageFull]}
        style={styles.cardContainer}
      />
      <View style={styles.paddedMainContent}>{renderFullCard()}</View>
    </View>
  );
};

export default InitiativeCardComponent;
