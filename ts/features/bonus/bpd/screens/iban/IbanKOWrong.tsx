import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../img/servicesStatus/error-detail-icon.png";
import { H4 } from "../../../../../components/core/typography/H4";
import { Monospace } from "../../../../../components/core/typography/Monospace";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../bonusVacanze/components/markdown/FooterTwoButtons";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionResetScreen
} from "../../store/actions/iban";
import { bpdUpsertIbanSelector } from "../../store/reducers/details/activation/payoffInstrument";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  text: {
    textAlign: "center"
  }
});

const renderBody = (text1: string, text2: string, iban: string) => (
  <View style={IOStyles.flex}>
    <H4 color={"bluegrey"} weight={"Regular"} style={styles.text}>
      {text1}
    </H4>
    <View spacer={true} small={true} />
    <Monospace style={styles.text}>{iban}</Monospace>
    <View spacer={true} small={true} />
    <H4 color={"bluegrey"} weight={"Regular"} style={styles.text}>
      {text2}
    </H4>
  </View>
);

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
  const iban: string = fromNullable(props.candidateIban.value).fold(
    "",
    iban => iban as string
  );
  return (
    <BaseScreenComponent goBack={props.modifyIban} headerTitle={headerTitle}>
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={renderBody(text1, text2, iban)}
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

const mapStateToProps = (state: GlobalState) => ({
  candidateIban: bpdUpsertIbanSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(IbanKoWrong);
