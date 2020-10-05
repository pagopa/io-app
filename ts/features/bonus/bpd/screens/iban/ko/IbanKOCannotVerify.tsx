import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../img/search/search-icon.png";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../bonusVacanze/components/markdown/FooterTwoButtons";
import {
  bpdIbanInsertionContinue,
  bpdIbanInsertionResetScreen
} from "../../../store/actions/iban";
import IbanKoBody from "./IbanKoBody";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.title"),
  edit: I18n.t("bonus.bpd.iban.edit"),
  continueStr: I18n.t("global.buttons.continue"),
  title: I18n.t("bonus.bpd.iban.koCannotVerify.title"),
  text1: I18n.t("bonus.bpd.iban.koCannotVerify.text1"),
  text2: I18n.t("bonus.bpd.iban.koCannotVerify.text2")
});

/**
 * This screen warns the user that the provided iban cannot be verified.
 * This is just a warning, the user can continue and the iban has been registered on the bpd remote system.
 * @constructor
 */
const IbanKoCannotVerify: React.FunctionComponent<Props> = props => {
  const { headerTitle, continueStr, edit, title, text1, text2 } = loadLocales();
  return (
    <BaseScreenComponent goBack={props.modifyIban} headerTitle={headerTitle}>
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={<IbanKoBody text1={text1} text2={text2} />}
        />
        <FooterTwoButtons
          onRight={props.completeInsertion}
          onCancel={props.modifyIban}
          rightText={continueStr}
          leftText={edit}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  modifyIban: () => dispatch(bpdIbanInsertionResetScreen()),
  completeInsertion: () => dispatch(bpdIbanInsertionContinue())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(IbanKoCannotVerify);
