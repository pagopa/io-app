import {
  Avatar,
  H3,
  H6,
  LabelSmallAlt,
  VSpacer
} from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import WalletCardShape from "../../../../../img/features/idpay/wallet_card.svg";
import I18n from "../../../../i18n";
import { formatNumberAmount } from "../../../../utils/stringBuilder";

export type IdPayCardProps = {
  name: string;
  avatarSource: ImageURISource;
  amount: number;
  expireDate: Date;
};

/**
 * Component that renders the ID PAy card in the wallet
 */
export const IdPayCard = (props: IdPayCardProps) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <WalletCardShape />
    </View>
    <View style={styles.content}>
      <View>
        <View style={styles.header}>
          <H6
            color="blueItalia-850"
            ellipsizeMode="tail"
            numberOfLines={1}
            style={{
              width: "80%"
            }}
          >
            {props.name}
          </H6>
          <Avatar size="small" logoUri={props.avatarSource} />
        </View>
        <VSpacer size={16} />
        <LabelSmallAlt>Disponibile</LabelSmallAlt>
        <H3 color="blueItalia-500">
          {formatNumberAmount(props.amount, true, "right")}
        </H3>
      </View>
      <LabelSmallAlt color="blueItalia-850">
        {I18n.t("bonusCard.validUntil", {
          endDate: format(props.expireDate, "MM/YY")
        })}
      </LabelSmallAlt>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 10
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  content: {
    flex: 1,
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 16,
    paddingLeft: 16,
    justifyContent: "space-between"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
