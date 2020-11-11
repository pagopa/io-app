import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { H5 } from "../../../../components/core/typography/H5";
import { IOColors } from "../../../../components/core/variables/IOColors";
import IconFont from "../../../../components/ui/IconFont";
import { BpdAmount } from "../store/actions/amount";
import { BpdPeriod } from "../store/actions/periods";

type Props = {
  lastUpdateDate: string;
  transactionsNumber: number;
  period: BpdPeriod;
  totalAmount: BpdAmount;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center"
  }
});

const BPDTransactionSummaryComponent: React.FunctionComponent<Props> = (
  props: Props
) => (
  <>
    <View style={styles.row}>
      <IconFont name={"io-notice"} size={24} color={IOColors.blue} />
      <H5 color={"bluegrey"} weight={"Regular"}>
        {"Ultimo aggiornamento "}{" "}
        <H5 color={"bluegrey"} weight={"SemiBold"}>
          {props.lastUpdateDate}
        </H5>
      </H5>
    </View>
    <View spacer={true} />
    <Body>
      Nel periodo 01 gen 2021 - 30 giu 2021 hai totalizzato 56 transazioni
      valide e maturato un cashback di 150,00 euro.
    </Body>
  </>
);

export default BPDTransactionSummaryComponent;
