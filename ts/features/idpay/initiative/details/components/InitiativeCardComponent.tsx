import * as React from "react";
import { Image, ImageBackground, StyleSheet, View } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import bonusVacanzeWhiteLogo from "../../../../../../img/bonus/bonusVacanze/logo_BonusVacanze_White.png";
import cardBg from "../../../../../../img/features/idpay/card_full.png";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { H2 } from "../../../../../components/core/typography/H2";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";

type Props = {
  initiative: InitiativeDTO;
};

const styles = StyleSheet.create({
  fullHeight: {
    height: "100%"
  },
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
  const { initiativeName, endDate, status, amount, accrued, refunded } =
    props.initiative;

  const isInitiativeConfigured = status === InitiativeStatusEnum.REFUNDABLE;
  const toBeRepaidAmount = (accrued || 0) - (refunded || 0);

  const renderFullCard = () => (
    <View style={[styles.row, styles.spaced, IOStyles.flex]}>
      <View style={[styles.fullHeight, styles.spaced]}>
        <View>
          <VSpacer size={8} />
          <H2 color="white">{initiativeName}</H2>
          <Body color="white">
            {I18n.t("idpay.initiative.details.initiativeCard.validUntil", {
              expiryDate: formatDateAsLocal(endDate, true)
            })}
          </Body>
        </View>
        <View style={styles.row}>
          <View>
            <View style={!isInitiativeConfigured ? styles.consumedOpacity : {}}>
              {/* Using H1 here seems wrong. We need a custom
                typographic component for the wallet cards. */}
              <H1 color="white">{formatNumberAmount(amount || 0, true)}</H1>
            </View>

            <H5 color="white">
              {I18n.t(
                "idpay.initiative.details.initiativeCard.availableAmount"
              )}
            </H5>
          </View>

          <HSpacer size={8} />

          <View>
            <View style={!isInitiativeConfigured ? styles.consumedOpacity : {}}>
              <H1 color="white">
                {formatNumberAmount(toBeRepaidAmount, true)}
              </H1>
            </View>
            <H5 color="white">
              {I18n.t("idpay.initiative.details.initiativeCard.toRefund")}
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
