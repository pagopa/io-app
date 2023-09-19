import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import { H1 } from "../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { formatNumberAmount } from "../../../../utils/stringBuilder";
import { Skeleton } from "../../common/components/Skeleton";

type CounterType = "Amount" | "AmountWithProgress";

type BaseProps = {
  type: CounterType;
  isDisabled?: boolean;
  label?: string;
};

type AmountProps = {
  type: "Amount";
  amount: number;
};

type AmountWithProgressProps = {
  type: "AmountWithProgress";
  amount: number;
  progress: number;
};

export type BonusCounter =
  | BaseProps &
      (
        | ({ isLoading: true } & { type: CounterType })
        | ({ isLoading?: false } & (AmountProps | AmountWithProgressProps))
      );

const formatNumberRightSign = (amount: number) =>
  `${formatNumberAmount(amount, false)} €`;

const InitiativeBonusCounter = (props: BonusCounter) => {
  switch (props.type) {
    case "Amount":
      if (props.isLoading) {
        return (
          <View style={styles.alignCenter} testID="AmountSkeletonTestID">
            <Skeleton height={16} width={64} color="#CED8F9" />
            <VSpacer size={8} />
            <Skeleton height={24} width={140} color="#CED8F9" />
          </View>
        );
      }

      return (
        <View style={styles.alignCenter}>
          <LabelSmall color="bluegreyDark" weight="Regular">
            {props.label}
          </LabelSmall>
          <VSpacer size={8} />
          <H1 style={props.isDisabled ? styles.consumedOpacity : {}}>
            {formatNumberRightSign(props.amount)}
          </H1>
        </View>
      );
    case "AmountWithProgress":
      if (props.isLoading) {
        return (
          <View
            style={styles.alignCenter}
            testID="AmountWithProgressSkeletonTestID"
          >
            <Skeleton height={16} width={64} color="#CED8F9" />
            <VSpacer size={8} />
            <Skeleton height={24} width={140} color="#CED8F9" />
            <VSpacer size={16} />
            <Skeleton height={8} width={120} color="#CED8F9" />
          </View>
        );
      }

      return (
        <View style={styles.alignCenter}>
          <LabelSmall color="bluegreyDark" weight="Regular">
            {props.label}
          </LabelSmall>
          <VSpacer size={8} />
          <H1 style={props.isDisabled ? styles.consumedOpacity : {}}>
            {formatNumberRightSign(props.amount)}
          </H1>
          <VSpacer size={8} />
          <BonusProgressBar
            testID="BonusProgressBarTestID"
            isDisabled={props.isDisabled}
            progress={props.progress}
          />
        </View>
      );
  }
};

type ProgressBarProps = {
  progress: number;
  isDisabled?: boolean;
  testID?: string;
};

const BonusProgressBar = ({
  progress,
  isDisabled = false,
  testID
}: ProgressBarProps) => {
  const width = useSharedValue(100);
  React.useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    width.value = progress;
  });
  const scalingWidth = useAnimatedStyle(() => ({
    width: withTiming(width.value, { duration: 1000 })
  }));
  return (
    <View style={styles.progressBarContainer} testID={testID}>
      <Animated.View
        style={[
          {
            width: `${width.value}%`,
            backgroundColor: !isDisabled ? IOColors.blue : IOColors["grey-450"],
            flex: 1,
            borderRadius: 4
          },
          scalingWidth
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  },
  consumedOpacity: {
    opacity: 0.5
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: IOColors.white,
    width: 100,
    borderRadius: 4
  }
});

export { InitiativeBonusCounter };
