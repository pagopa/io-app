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
import { H1 } from "../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import I18n from "../../../../../i18n";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { IOBadge } from "../../../../../components/core/IOBadge";

type Props = {
  initiative: InitiativeDTO;
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: IOColors["blue-50"],
    borderBottomEndRadius: 24,
    borderBottomStartRadius: 24,
    paddingVertical: 32,
    paddingTop: 0,
    flex: 1
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
    justifyContent: "center"
  },
  bonusStatusContainer: {
    flex: 1,
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
  const width = useSharedValue(100);
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
const formatNumberRightSign = (amount: number) =>
  `${formatNumberAmount(amount, false)} €`;
const InitiativeCardComponent = (props: Props) => {
  const { initiativeName, endDate, status } = props.initiative;

  const amount: number = props.initiative.amount || 0;
  const accrued: number = props.initiative.accrued || 0;
  const refunded: number = props.initiative.refunded || 0;

  const isInitiativeConfigured = status === InitiativeStatusEnum.REFUNDABLE;
  const toBeRepaidAmount = accrued - refunded;
  const remainingAmount = amount - accrued;
  const totalAmount = amount + accrued; 

  const dateString = formatDateAsLocal(endDate, true);
  const remainingBonusAmountPercentage =
    totalAmount !== 0 ? (remainingAmount / totalAmount) * 100.0 : 100.0;
  return (
    <View style={styles.cardContainer} testID={"card-component"}>
      {/* top part */}
      <View style={styles.topCardSection}>
        <View style={styles.bonusLogoContainer}></View>
        <VSpacer size={8} />
        <H1>{initiativeName}</H1>
        <LabelSmall color={"black"} weight="Regular">
          {/* the ministry would go here */}
        </LabelSmall>

        <VSpacer size={8} />
        <View style={styles.bonusStatusContainer}>
          {/* as of now, this is misaligned, will be fixed once #4337 is merged */}
          <IOBadge
            small={true}
            text={I18n.t(
              `idpay.initiative.details.initiativeCard.statusLabels.${status}`
            )}
          />
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

      <VSpacer size={32} />
      {/* bottom part */}

      <View style={styles.bottomCardSection}>
        <View style={styles.alignCenter}>
          <LabelSmall color="bluegreyDark" weight="Regular">
            {I18n.t("idpay.initiative.details.initiativeCard.availableAmount")}
          </LabelSmall>
          <H1 style={!isInitiativeConfigured ? styles.consumedOpacity : {}}>
            {formatNumberRightSign(remainingAmount)}
          </H1>
          <VSpacer size={8} />
          <BonusPercentageSlider
            isGreyedOut={isInitiativeConfigured}
            percentage={remainingBonusAmountPercentage}
          />
        </View>
        <HSpacer size={48} />
        <View style={styles.alignCenter}>
          <LabelSmall color="bluegreyDark" weight="Regular">
            {I18n.t("idpay.initiative.details.initiativeCard.toRefund")}
          </LabelSmall>
          <H1 style={!isInitiativeConfigured ? styles.consumedOpacity : {}}>
            {formatNumberRightSign(toBeRepaidAmount)}
          </H1>
        </View>
      </View>
    </View>
  );
};

export default InitiativeCardComponent;
