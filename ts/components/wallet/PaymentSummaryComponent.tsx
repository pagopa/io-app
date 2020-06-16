import { Text, View } from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import { BadgeComponent } from "../screens/BadgeComponent";
import { isNullyOrEmpty } from "../../utils/strings";

type Props = Readonly<{
  title: string;
  recipient?: string;
  description?: string;
  iuv?: string;
  error?: string;
  dateTime?: string;
  dark?: boolean;
  image?: ImageSourcePropType;
  paymentStatus?: paymentStatusType;
}>;

export type paymentStatusType = {
  color: string;
  description: string;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    lineHeight: 24
  },
  lightGray: {
    color: customVariables.lightGray
  },
  lighterGray: {
    color: customVariables.lighterGray
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  column: {
    flexDirection: "column",
    flex: 1,
    paddingRight: 4
  },
  flex: {
    flex: 1
  },
  paymentOutcome: {
    flexDirection: "row",
    alignItems: "center"
  },
  text11: {
    paddingLeft: 8
  }
});

/**
 * This component displays the transaction details
 */
export const PaymentSummaryComponent = (props: Props) => {
  const renderItem = (label: string, value?: string) => {
    if (isNullyOrEmpty(props.recipient)) {
      return null;
    }
    return (
      <React.Fragment>
        <Text small={true} style={props.dark && styles.lighterGray}>
          {label}
        </Text>
        <Text bold={true} dark={!props.dark} white={props.dark}>
          {value}
        </Text>
        <View spacer={true} />
      </React.Fragment>
    );
  };

  const paymentStatus = props.paymentStatus && (
    <React.Fragment>
      <View style={styles.paymentOutcome}>
        <BadgeComponent color={props.paymentStatus.color} />
        <View hspacer={true} small={true} />
        <Text small={true}>{props.paymentStatus.description}</Text>
      </View>
      <View spacer={true} />
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <Text
        bold={true}
        style={[
          styles.title,
          props.dark ? styles.lighterGray : styles.lightGray
        ]}
      >
        {props.title}
      </Text>

      {/** screen title */}
      <View spacer={true} />
      <ItemSeparatorComponent noPadded={true} />
      <View spacer={true} large={true} />

      {paymentStatus}

      <View style={styles.row}>
        <View style={styles.column}>
          {renderItem(I18n.t("wallet.recipient"), props.recipient)}

          {renderItem(
            I18n.t("wallet.firstTransactionSummary.object"),
            props.description
          )}

          {renderItem(I18n.t("payment.IUV"), props.iuv)}
        </View>

        {props.image !== undefined && <Image source={props.image} />}
      </View>
    </React.Fragment>
  );
};
