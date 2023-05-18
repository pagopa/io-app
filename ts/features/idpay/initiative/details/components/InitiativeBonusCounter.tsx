import * as React from "react";
import { StyleSheet, View } from "react-native";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { Skeleton } from "../../../common/components/Skeleton";
import { BonusProgressBar } from "./BonusProgressBar";

type BaseProps = {
  isDisabled?: boolean;
};

type Props =
  | {
      type: "Amount";
      isLoading?: undefined | false;
      label: string;
      amount: number;
    }
  | {
      type: "Amount";
      isLoading: true;
    }
  | {
      type: "AmountWithProgress";
      isLoading?: undefined | false;
      label: string;
      amount: number;
      total: number;
    }
  | {
      type: "AmountWithProgress";
      isLoading: true;
    };

const formatNumberRightSign = (amount: number) =>
  `${formatNumberAmount(amount, false)} €`;

const InitiativeBonusCounter = (props: Props & BaseProps) => {
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

      const percentage = props.total !== 0 ? props.amount / props.total : 1.0;

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
            percentage={percentage * 100.0}
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
