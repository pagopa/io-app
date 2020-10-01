import { View } from "native-base";
import { useState } from "react";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Iban } from "../../../../../../../definitions/backend/Iban";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../bonusVacanze/components/markdown/FooterTwoButtons";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionContinue
} from "../../../store/actions/iban";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

enum ScreenState {
  INSERTION = "INSERTION",
  LOADING = "LOADING",
  RESULT = "RESULT"
}

const IbanInsertionTest: React.FunctionComponent<Props> = props => {
  const [] = useState();

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
  continue: () => dispatch(bpdIbanInsertionContinue())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(IbanInsertionTest);
