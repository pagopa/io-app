import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../../bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import { bpdOnboardingStart } from "../../../../../bonus/bpd/store/actions/onboarding";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.bancomat.headerTitle"),
  title: I18n.t("wallet.onboarding.bancomat.bpd.suggestActivation.title"),
  body: I18n.t("wallet.onboarding.bancomat.bpd.suggestActivation.body"),
  skip: I18n.t("wallet.onboarding.bancomat.bpd.suggestActivation.skip"),
  confirm: I18n.t("wallet.onboarding.bancomat.bpd.suggestActivation.confirm")
});

/**
 * this screen prompts the user to activate bpd after inserting a new bancomat.
 * @constructor
 */
const SuggestBpdActivationScreen: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body, skip, confirm } = loadLocales();

  return (
    <BaseScreenComponent goBack={false} headerTitle={headerTitle}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <View spacer={true} large={true} />
            <H1>{title}</H1>
            <View spacer={true} large={true} />
            <Body>{body}</Body>
          </View>
        </ScrollView>
        <FooterTwoButtons
          type={"TwoButtonsInlineThird"}
          onRight={props.activateBpd}
          onCancel={props.skip}
          rightText={confirm}
          leftText={skip}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  skip: () => dispatch(NavigationActions.back()),
  activateBpd: () => dispatch(bpdOnboardingStart())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SuggestBpdActivationScreen);
