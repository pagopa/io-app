import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { InfoBox } from "../../../../../components/box/InfoBox";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { FooterTwoButtons } from "../../../bonusVacanze/components/markdown/FooterTwoButtons";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.title"),
  skip: I18n.t("global.buttons.skip"),
  continueText: I18n.t("global.buttons.continue"),
  title: I18n.t("bonus.bpd.onboarding.errorPaymentMethod.title"),
  body1: I18n.t("bonus.bpd.onboarding.errorPaymentMethod.body1"),
  body2: I18n.t("bonus.bpd.onboarding.enrollPaymentMethod.body2")
});

const ErrorPaymentMethodsScreen: React.FunctionComponent<Props> = props => {
  const {
    headerTitle,
    skip,
    continueText,
    title,
    body1,
    body2
  } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={false}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
          <View spacer={true} large={true} />
          <H1>{title}</H1>
          <View spacer={true} large={true} />
          <InfoBox>
            <Body>{body1}</Body>
          </InfoBox>
          <View spacer={true} large={true} />
          <Body>{body2}</Body>
        </View>
        <FooterTwoButtons
          onRight={props.skip}
          onCancel={props.skip}
          rightText={continueText}
          leftText={skip}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  skip: () => {
    dispatch(navigationHistoryPop(1));
    dispatch(navigateToWalletHome());
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorPaymentMethodsScreen);
