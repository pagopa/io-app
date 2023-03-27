import * as React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { navigateBack } from "../../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { FooterTwoButtons } from "../../../../../bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import { bpdOnboardingStart } from "../../../../../bonus/bpd/store/actions/onboarding";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.title"),
  title: I18n.t("bonus.bpd.suggestActivation.title"),
  body: I18n.t("bonus.bpd.suggestActivation.body"),
  skip: I18n.t("bonus.bpd.suggestActivation.skip"),
  confirm: I18n.t("bonus.bpd.suggestActivation.confirm")
});

/**
 * this screen prompts the user to activate bpd after inserting a new bancomat.
 * @constructor
 */
const SuggestBpdActivationScreen: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body, skip, confirm } = loadLocales();

  return (
    <BaseScreenComponent
      goBack={false}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <VSpacer size={24} />
            <H1>{title}</H1>
            <VSpacer size={24} />
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
  skip: () => navigateBack(),
  activateBpd: () => dispatch(bpdOnboardingStart())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SuggestBpdActivationScreen);
