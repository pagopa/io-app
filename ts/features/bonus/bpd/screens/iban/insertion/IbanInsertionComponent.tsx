import * as React from "react";
import { useEffect } from "react";
import { SafeAreaView, View } from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Iban } from "../../../../../../../definitions/backend/Iban";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../bonusVacanze/components/markdown/FooterTwoButtons";
import { navigateToBpdIbanKOCannotVerify } from "../../../navigation/action/iban";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionContinue,
  bpdIbanInsertionSkip,
  bpdUpsertIban
} from "../../../store/actions/iban";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen allows the user to add / modify an iban to be used to receive the refund provided by bpd
 * @constructor
 */
const IbanInsertionComponent: React.FunctionComponent<Props> = props => {
  useEffect(() => {
    console.log("mount!");
  }, []);
  return (
    <BaseScreenComponent goBack={props.cancel} headerTitle={"Insert Iban"}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={IOStyles.flex}>
          <H1>Insert Iban</H1>
        </View>
        <FooterTwoButtons
          onRight={() => props.submitIban("51" as Iban)}
          onCancel={props.continue}
          title={I18n.t("global.buttons.continue")}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(bpdIbanInsertionCancel()),
  continue: () => dispatch(bpdIbanInsertionContinue()),
  submitIban: (iban: Iban) => dispatch(bpdUpsertIban.request(iban))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IbanInsertionComponent);
