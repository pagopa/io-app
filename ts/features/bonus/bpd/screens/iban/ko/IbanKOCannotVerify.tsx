import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../bonusVacanze/components/markdown/FooterTwoButtons";
import {
  bpdIbanInsertionContinue,
  bpdIbanInsertionResetScreen
} from "../../../store/actions/iban";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen warns the user that the provided iban cannot be verified.
 * This is just a warning, the user can continue and the iban has been registered on the bpd remote system.
 * @constructor
 */
const IbanKoCannotVerify: React.FunctionComponent<Props> = props => (
  <BaseScreenComponent
    goBack={props.modifyIban}
    headerTitle={"Cashback pagamenti digitali"}
  >
    <SafeAreaView style={IOStyles.flex}>
      <View style={IOStyles.flex}>
        <H1>Cannot verify Iban!</H1>
      </View>
      <FooterTwoButtons
        onRight={props.completeInsertion}
        onCancel={props.modifyIban}
        rightText={I18n.t("global.buttons.continue")}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  modifyIban: () => dispatch(bpdIbanInsertionResetScreen()),
  completeInsertion: () => dispatch(bpdIbanInsertionContinue())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(IbanKoCannotVerify);
