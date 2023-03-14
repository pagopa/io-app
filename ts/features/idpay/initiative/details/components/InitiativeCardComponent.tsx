import { Badge } from "native-base";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import I18n from "../../../../../i18n";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";

type Props = {
  initiative: InitiativeDTO;
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: IOColors.bluegreyNewBonus,
    borderBottomEndRadius: 24,
    borderBottomStartRadius: 24,
    padding: 32,
    paddingTop: 0,
    flex: 1
  },
  badge: {
    backgroundColor: IOColors.blue
  },
  bonusLogoContainer: {
    backgroundColor: IOColors.white,
    height: 56,
    width: 56,
    borderRadius: 8
  },
  topCardSection: {
    flex: 2,
    alignItems: "center"
  },
  bottomCardSection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-end"
  },
  bonusStatusContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  consumedOpacity: {
    opacity: 0.5
  },
  remainingPercentageSliderContainer: {
    height: 4,
    backgroundColor: IOColors.white,
    width: 100,
    borderRadius: 4
  },
  alignCenter: {
    alignItems: "center"
  }
});

type PercentageSliderProps = {
  percentage: number;
  isGreyedOut: boolean;
};
const BonusPercentageSlider = ({
  percentage,
  isGreyedOut
}: PercentageSliderProps) => {
  const width = useSharedValue(0);
  React.useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    width.value = percentage;
  });
  const scalingWidth = useAnimatedStyle(() => ({
    width: withTiming(width.value, { duration: 1000 })
  }));
  return (
    <View style={styles.remainingPercentageSliderContainer}>
      <Animated.View
        style={[
          {
            width: `${width.value}%`,
            backgroundColor: isGreyedOut ? IOColors.blue : IOColors["grey-450"],
            flex: 1,
            borderRadius: 4
          },
          scalingWidth
        ]}
      />
    </View>
  );
};
const InitiativeCardComponent = (props: Props) => {
  const { initiativeName, endDate, status, amount, accrued, refunded } =
    props.initiative;

  const isInitiativeConfigured = status === InitiativeStatusEnum.REFUNDABLE;
  const toBeRepaidAmount = (accrued || 0) - (refunded || 0);
  const remainingAmount = (amount || 0) - (accrued || 0);

  const dateString = formatDateAsLocal(endDate, true);
  const remainingBonusAmountPercentage =
    amount !== 0 && amount !== undefined
      ? (remainingAmount / amount) * 100.0
      : 100.0;
  return (
    <View style={styles.cardContainer} testID={"card-component"}>
      {/* top part */}
      <View style={styles.topCardSection}>
        <View style={styles.bonusLogoContainer}></View>
        <VSpacer size={8} />
        <H1>{initiativeName}</H1>
        <Body>{/* the ministry would go here */}</Body>
        <VSpacer size={8} />
        <View style={styles.bonusStatusContainer}>
          <Badge style={styles.badge}>
            <LabelSmall color="white">
              {I18n.t(
                `idpay.initiative.details.initiativeCard.statusLabels.${status}`
              )}
            </LabelSmall>
          </Badge>
          <HSpacer size={8} />
          <LabelSmall color="bluegreyDark">
            {I18n.t(
              `idpay.initiative.details.initiativeCard.${
                isInitiativeConfigured ? "validUntil" : "expiresOn"
              }`,
              {
                expiryDate: dateString
              }
            )}
          </LabelSmall>
        </View>
      </View>

      <VSpacer size={48} />
      {/* bottom part */}

      <View style={styles.bottomCardSection}>
        <View style={styles.alignCenter}>
          <LabelSmall color="bluegreyDark" weight="Regular">
            {I18n.t("idpay.initiative.details.initiativeCard.availableAmount")}
          </LabelSmall>
          <H1 style={!isInitiativeConfigured ? styles.consumedOpacity : {}}>
            {formatNumberAmount(remainingAmount, true)}
          </H1>
          <VSpacer size={8} />
          <BonusPercentageSlider
            isGreyedOut={isInitiativeConfigured}
            percentage={remainingBonusAmountPercentage}
          />
        </View>
        <View style={styles.alignCenter}>
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
};

export default InitiativeCardComponent;
