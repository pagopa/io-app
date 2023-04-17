import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import Placeholder from "rn-placeholder";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { IOBadge } from "../../../../../components/core/IOBadge";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import I18n from "../../../../../i18n";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";

type Props = {
  initiative: InitiativeDTO;
};

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
  const { initiative } = props;

  const { initiativeName, endDate, status } = initiative;
  /*
  From BE we have:
  - amount: the amount still available in the initiative
  - accrued: total amount accrued with transactions
  - refunded: amount refunded by wire transfer
  */

  const amount: number = props.initiative.amount || 0;
  const accrued: number = props.initiative.accrued || 0;
  const refunded: number = props.initiative.refunded || 0;

  const isInitiativeConfigured = status === InitiativeStatusEnum.REFUNDABLE;
  const toBeRepaidAmount = accrued - refunded;
  const totalAmount = amount + accrued;

  const dateString = formatDateAsLocal(endDate, true);
  const remainingBonusAmountPercentage =
    totalAmount !== 0 ? (amount / totalAmount) * 100.0 : 100.0;

  return (
    <View style={styles.cardContainer} testID={"card-component"}>
      <View style={styles.topCardSection}>
        <View style={styles.bonusLogoContainer}></View>
        <VSpacer size={8} />
        <H1>{initiativeName}</H1>
        <LabelSmall color={"black"} weight="Regular">
          ciao ciao
        </LabelSmall>
        <VSpacer size={8} />
        <View style={styles.bonusStatusContainer}>
          <IOBadge
            small={true}
            text={I18n.t(
              `idpay.initiative.details.initiativeCard.statusLabels.${status}`
            )}
          />
          <HSpacer size={8} />
          <LabelSmall fontSize="small" weight="SemiBold" color="bluegreyDark">
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
      <View style={styles.bottomCardSection}>
        <View style={styles.alignCenter}>
          <LabelSmall color="bluegreyDark" weight="Regular">
            {I18n.t("idpay.initiative.details.initiativeCard.availableAmount")}
          </LabelSmall>
          <H1 style={!isInitiativeConfigured ? styles.consumedOpacity : {}}>
            {formatNumberRightSign(amount)}
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

const InitiativeCardComponentSkeleton = () => (
  <View style={styles.cardContainer} testID={"card-component"}>
    <View style={styles.topCardSection}>
      <Placeholder.Box
        animate="fade"
        height={56}
        width={56}
        radius={4}
        color="#CED8F9"
      />
      <VSpacer size={16} />
      <Placeholder.Box
        animate="fade"
        height={24}
        width={180}
        radius={4}
        color="#CED8F9"
      />
      <VSpacer size={8} />
      <Placeholder.Box
        animate="fade"
        height={16}
        width={100}
        radius={4}
        color="#CED8F9"
      />
      <VSpacer size={8} />
      <Placeholder.Box
        animate="fade"
        height={16}
        width={100}
        radius={4}
        color="#CED8F9"
      />
    </View>
    <VSpacer size={32} />
    <View style={styles.bottomCardSection}>
      <View style={styles.alignCenter}>
        <Placeholder.Box
          animate="fade"
          height={16}
          width={64}
          radius={4}
          color="#CED8F9"
        />
        <VSpacer size={8} />
        <Placeholder.Box
          animate="fade"
          height={24}
          width={140}
          radius={4}
          color="#CED8F9"
        />
        <VSpacer size={16} />
        <Placeholder.Box
          animate="fade"
          height={8}
          width={120}
          radius={4}
          color="#CED8F9"
        />
      </View>
      <HSpacer size={48} />
      <View style={styles.alignCenter}>
        <Placeholder.Box
          animate="fade"
          height={16}
          width={64}
          radius={4}
          color="#CED8F9"
        />
        <VSpacer size={8} />
        <Placeholder.Box
          animate="fade"
          height={24}
          width={140}
          radius={4}
          color="#CED8F9"
        />
      </View>
    </View>
  </View>
);

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

export { InitiativeCardComponent, InitiativeCardComponentSkeleton };
