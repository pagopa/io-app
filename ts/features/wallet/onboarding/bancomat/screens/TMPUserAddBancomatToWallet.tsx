import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { GlobalState } from "../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import {
  walletAddBancomatCancel,
  walletAddBancomatCompleted
} from "../store/actions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * TODO: TEMP Component only for proof of concept and avoid conflicts,
 * will be removed in the next iteration
 * Represents the screen that will allow the user to add any found bancomat to the wallet.
 * @constructor
 */
const TMPSearchBankScreen: React.FunctionComponent<Props> = props => (
  <BaseScreenComponent goBack={false} headerTitle={"Add a bancomat!"}>
    <SafeAreaView style={IOStyles.flex}>
      <View style={IOStyles.flex}>
        <H1>Add bancomat!</H1>
      </View>
      <FooterTwoButtons
        onRight={props.complete}
        onCancel={props.cancel}
        rightText={"Simula Aggiungi Tutto"}
        leftText={"Annulla"}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddBancomatCancel()),
  complete: () => dispatch(walletAddBancomatCompleted())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TMPSearchBankScreen);
