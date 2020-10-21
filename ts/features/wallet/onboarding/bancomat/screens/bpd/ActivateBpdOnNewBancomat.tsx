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
import { PaymentMethodBpdList } from "../../../../../bonus/bpd/components/PaymentMethodBpdList";
import { onboardingBancomatAddedPansSelector } from "../../store/reducers/addedPans";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.bancomat.headerTitle"),
  title: I18n.t("wallet.onboarding.bancomat.bpd.activateNew.title"),
  body1: I18n.t("wallet.onboarding.bancomat.bpd.activateNew.body1"),
  body2: I18n.t("wallet.onboarding.bancomat.bpd.activateNew.body2"),
  skip: I18n.t("wallet.onboarding.bancomat.bpd.activateNew.skip"),
  continueStr: I18n.t("global.buttons.continue")
});

const ActivateBpdOnNewBancomat: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body1, body2, skip, continueStr } = loadLocales();
  return (
    <BaseScreenComponent headerTitle={headerTitle}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <View spacer={true} large={true} />
            <H1>{title}</H1>
            <View spacer={true} large={true} />
            <Body>{body1}</Body>
            <View spacer={true} large={true} />
            <PaymentMethodBpdList paymentList={props.newBancomat} />
            <View spacer={true} large={true} />
            <Body>{body2}</Body>
          </View>
        </ScrollView>

        <FooterTwoButtons
          type={"TwoButtonsInlineHalf"}
          onCancel={props.skip}
          onRight={props.skip}
          rightText={continueStr}
          leftText={skip}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  skip: () => dispatch(NavigationActions.back())
});

const mapStateToProps = (state: GlobalState) => ({
  newBancomat: onboardingBancomatAddedPansSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivateBpdOnNewBancomat);
