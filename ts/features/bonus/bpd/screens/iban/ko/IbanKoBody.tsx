import * as React from "react";
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { VSpacer } from "@pagopa/io-app-design-system";
import { H4 } from "../../../../../../components/core/typography/H4";
import { Monospace } from "../../../../../../components/core/typography/Monospace";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../../../store/reducers/types";
import { bpdUpsertIbanSelector } from "../../../store/reducers/details/activation/payoffInstrument";

type OwnProps = {
  text1: string;
  text2: string;
  isFlex?: boolean;
};

export type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  text: {
    textAlign: "center"
  }
});

/**
 * Common rendering of the body for all the Iban KO screens
 * @param props
 * @constructor
 */
const IbanKoBody: React.FunctionComponent<Props> = props => {
  const iban: string = props.candidateIban.value ?? "";
  const style = props.isFlex ?? true ? IOStyles.flex : {};

  return (
    <View style={style}>
      <H4 color={"bluegrey"} weight={"Regular"} style={styles.text}>
        {props.text1}
      </H4>
      <VSpacer size={8} />
      <Monospace selectable={true} style={styles.text} weight={"Bold"}>
        {iban}
      </Monospace>
      <VSpacer size={8} />
      <H4 color={"bluegrey"} weight={"Regular"} style={styles.text}>
        {props.text2}
      </H4>
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  candidateIban: bpdUpsertIbanSelector(state)
});

export default connect(mapStateToProps)(IbanKoBody);
