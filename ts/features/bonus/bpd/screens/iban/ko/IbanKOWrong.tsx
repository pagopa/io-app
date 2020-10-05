import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../img/servicesStatus/error-detail-icon.png";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../bonusVacanze/components/markdown/FooterTwoButtons";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionResetScreen
} from "../../../store/actions/iban";
import IbanKoBody from "./IbanKoBody";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.title"),
  title: I18n.t("bonus.bpd.iban.koWrong.title"),
  text1: I18n.t("bonus.bpd.iban.koWrong.text1"),
  text2: I18n.t("bonus.bpd.iban.koWrong.text2")
});

/**
 * This screen informs the user that the provided iban is not right and cannot continue.
 * @constructor
 */
const IbanKoWrong: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, text1, text2 } = loadLocales();
  return (
    <BaseScreenComponent goBack={props.modifyIban} headerTitle={headerTitle}>
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={<IbanKoBody text1={text1} text2={text2} />}
        />
        <FooterTwoButtons
          onRight={props.modifyIban}
          onCancel={props.cancel}
          rightText={"Modifica Iban"}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  modifyIban: () => {
    dispatch(bpdIbanInsertionResetScreen());
  },
  cancel: () => dispatch(bpdIbanInsertionCancel())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(IbanKoWrong);
