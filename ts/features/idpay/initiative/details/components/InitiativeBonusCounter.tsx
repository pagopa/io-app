import * as React from "react";
import { StyleSheet, View } from "react-native";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { Skeleton } from "../../../common/components/Skeleton";
import { BonusProgressBar } from "./BonusProgressBar";

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

type Props =
  | BaseProps &
      (
        | ({ isLoading: true } & { type: CounterType })
        | ({ isLoading?: false } & (AmountProps | AmountWithProgressProps))
      );

const formatNumberRightSign = (amount: number) =>
  `${formatNumberAmount(amount, false)} €`;

const InitiativeBonusCounter = (props: Props) => {
  switch (props.type) {
    case "Amount":
      if (props.isLoading) {
        return (
          <View style={styles.alignCenter}>
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
          <H1 style={props.isDisabled ? styles.consumedOpacity : {}}>
            {formatNumberRightSign(props.amount)}
          </H1>
        </View>
      );
    case "AmountWithProgress":
      if (props.isLoading) {
        return (
          <View style={styles.alignCenter}>
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
          <H1 style={props.isDisabled ? styles.consumedOpacity : {}}>
            {formatNumberRightSign(props.amount)}
          </H1>
          <VSpacer size={8} />
          <BonusProgressBar
            isDisabled={props.isDisabled}
            progress={props.progress}
          />
        </View>
      );
  }
};

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  },
  consumedOpacity: {
    opacity: 0.5
  }
});

export { InitiativeBonusCounter };
