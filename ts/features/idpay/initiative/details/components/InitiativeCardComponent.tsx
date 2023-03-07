import { Badge } from "native-base";
import * as React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import cardBg from "../../../../../../img/features/idpay/card_full.png";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";

type Props = {
  initiative: InitiativeDTO;
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 8
  },
  cardImg: {
    height: 320
  },
  imageBG: {
    zIndex: -1
  },
  badge: {
    backgroundColor: IOColors.blue
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    textAlign: "center"
  },

  paddedMainContent: {
    padding: 32,
    paddingTop: 0,
    flex: 1
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

  const dateString = formatDateAsLocal(endDate, true);

  const remainingAmount = (amount || 0) - (refunded || 0);
  const remainintPercentage =
    (remainingAmount / (amount || remainingAmount)) * 100;

  const renderNewCard = () => (
    <View style={IOStyles.flex}>
      {/* top part */}
      <View style={[IOStyles.flex, { flex: 2, alignItems: "center" }]}>
        <View
          style={{
            backgroundColor: IOColors.white,
            height: 56,
            width: 56,
            borderRadius: 8
          }}
        ></View>
        <VSpacer size={8} />
        <H1>{initiativeName}</H1>
        <Body>{/* the ministry would go here */}</Body>
        <VSpacer size={8} />
        <View style={[IOStyles.row, { alignItems: "center" }]}>
          <Badge style={styles.badge}>
            <LabelSmall color="white">
              {isInitiativeConfigured ? "ATTIVO" : "ERRORE"}
            </LabelSmall>
          </Badge>
          <HSpacer size={8} />
          <LabelSmall color="bluegreyDark">
            {isInitiativeConfigured ? "Fino al" : "Scade il"} {dateString}
          </LabelSmall>
        </View>
      </View>
      <VSpacer size={48} />

      {/* bottom part */}
      <View
        style={[
          IOStyles.flex,
          styles.row,
          { alignItems: "flex-end", justifyContent: "space-evenly" }
        ]}
      >
        <View style={{ alignItems: "center" }}>
          <LabelSmall color="bluegreyDark" weight="Regular">
            {I18n.t("idpay.initiative.details.initiativeCard.availableAmount")}
          </LabelSmall>
          <H1 style={!isInitiativeConfigured ? styles.consumedOpacity : {}}>
            {formatNumberAmount((amount || 0) - (refunded || 0), true)}
          </H1>
          <VSpacer size={8} />
          <View
            style={{
              height: 4,
              backgroundColor: IOColors.white,
              width: "100%",
              borderRadius: 4
            }}
          >
            <View
              style={{
                width: `${remainintPercentage}%`,
                backgroundColor: IOColors.blue,
                flex: 1,
                borderRadius: 4
              }}
            ></View>
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          <LabelSmall color="bluegreyDark" weight="Regular">
            {I18n.t("idpay.initiative.details.initiativeCard.toRefund")}
          </LabelSmall>
          <H1 style={!isInitiativeConfigured ? styles.consumedOpacity : {}}>
            {formatNumberAmount(toBeRepaidAmount, true)}
          </H1>
          <VSpacer size={4} />
          <VSpacer size={8} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.cardContainer} testID={"card-component"}>
      <ImageBackground
        source={cardBg}
        imageStyle={styles.imageBG}
        style={styles.cardImg}
      >
        <View style={styles.paddedMainContent}>{renderNewCard()}</View>
      </ImageBackground>
    </View>
  );
};

export default InitiativeCardComponent;
