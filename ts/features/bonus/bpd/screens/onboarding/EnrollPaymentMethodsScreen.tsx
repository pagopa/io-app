import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../bonusVacanze/components/markdown/FooterTwoButtons";

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.title"),
  continueStr: I18n.t("global.buttons.continue"),
  skip: I18n.t("global.buttons.skip"),
  title: I18n.t("bonus.bpd.onboarding.enrollPaymentMethod.title"),
  body1: I18n.t("bonus.bpd.onboarding.enrollPaymentMethod.body1"),
  body2: I18n.t("bonus.bpd.onboarding.enrollPaymentMethod.body2")
});

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen allows the user to activate bpd on the payment methods already in the wallet
 */
const EnrollPaymentMethodsScreen: React.FunctionComponent<Props> = props => {
  const { headerTitle, continueStr, skip, title, body1, body2 } = loadLocales();
  return (
    <BaseScreenComponent goBack={false} headerTitle={headerTitle}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
          <View spacer={true} large={true} />
          <H1>{title}</H1>
          <View spacer={true} extralarge={true} />
          <Body>{body1}</Body>
          <Body>{body2}</Body>
        </View>
        <FooterTwoButtons
          onRight={props.skip}
          onCancel={props.skip}
          rightText={continueStr}
          leftText={skip}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  skip: () => dispatch(navigateToWalletHome())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EnrollPaymentMethodsScreen);
