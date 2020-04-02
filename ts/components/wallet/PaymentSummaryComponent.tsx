import { Text, View } from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import I18n from "../../i18n";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import customVariables from '../../theme/variables';

type Props = Readonly<{
  title: string;
  recipient: string;
  description: string;
  dark?: boolean;
  image?: ImageSourcePropType;
}>;

const styles = StyleSheet.create({
  title: { fontSize: 18, lineHeight: 24 },
  lightGray: { color: customVariables.lightGray },
  lighterGray: { color: customVariables.lighterGray },
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { flexDirection: "column" }
});

/**
 * This component displays the transaction details
 */
export const PaymentSummaryComponent = (props: Props) => {
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

      <View style={styles.row}>
        <View style={styles.column}>
          {/** recipient */}
          <Text style={props.dark && styles.lighterGray}>
            {I18n.t("wallet.recipient")}
          </Text>
          <Text bold={true} dark={!props.dark} white={props.dark}>
            {props.recipient}
          </Text>

          <View spacer={true} />

          {/** transaction/notice description */}
          <Text style={props.dark && styles.lighterGray}>
            {I18n.t("wallet.firstTransactionSummary.object")}
          </Text>
          <Text bold={true} dark={!props.dark} white={props.dark}>
            {props.description}
          </Text>
        </View>

        {props.image !== undefined && <Image source={props.image} />}
      </View>
    </React.Fragment>
  );
};
