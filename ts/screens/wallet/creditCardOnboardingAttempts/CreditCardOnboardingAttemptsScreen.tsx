import { Content, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { withValidatedEmail } from "../../../components/helpers/withValidatedEmail";
import { withValidatedPagoPaVersion } from "../../../components/helpers/withValidatedPagoPaVersion";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import { H2 } from "../../../components/core/typography/H2";
import I18n from "../../../i18n";
import { navigateToPaymentHistoryDetail } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { PaymentHistory } from "../../../store/reducers/payments/history";
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import { creditCardAttemptionsSelector } from "../../../store/reducers/wallet/creditCard";
import { Body } from "../../../components/core/typography/Body";
import { CreditCardAttemptsList } from "../../../components/wallet/creditCardOnboardingAttempts/CreditCardAttemptsList";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  NavigationScreenProps;

const styles = StyleSheet.create({
  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },
  brandDarkGray: {
    color: variables.brandDarkGray
  },
  whiteBg: {
    backgroundColor: variables.colorWhite
  }
});

const ListEmptyComponent = (
  <Content
    scrollEnabled={false}
    style={[styles.noBottomPadding, styles.whiteBg]}
  >
    <H2 color={"bluegreyDark"}>
      {I18n.t("wallet.creditCard.onboardingAttempts.emptyTitle")}
    </H2>
    <View spacer={true} />
    <Body>{I18n.t("wallet.creditCard.onboardingAttempts.emptyBody")}</Body>
    <View spacer={true} large={true} />
    <EdgeBorderComponent />
  </Content>
);

/**
 * This screen shows all attempts of onboarding payment instruments
 */
class CreditCardOnboardingAttemptsScreen extends React.Component<Props, never> {
  public render(): React.ReactNode {
    const { creditCardOnboardingAttempts } = this.props;
    return (
      <BaseScreenComponent
        goBack={this.props.navigation.goBack}
        headerTitle={I18n.t("wallet.creditCard.onboardingAttempts.title")}
      >
        <CreditCardAttemptsList
          title={I18n.t(
            "wallet.creditCard.onboardingAttempts.lastAttemptsTitle"
          )}
          creditCardAttempts={creditCardOnboardingAttempts}
          ListEmptyComponent={ListEmptyComponent}
          navigateToPaymentHistoryDetail={(payment: PaymentHistory) =>
            this.props.navigateToPaymentHistoryDetail({
              payment
            })
          }
        />
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  creditCardOnboardingAttempts: creditCardAttemptionsSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToPaymentHistoryDetail: (param: { payment: PaymentHistory }) =>
    dispatch(navigateToPaymentHistoryDetail(param))
});

export default withValidatedPagoPaVersion(
  withValidatedEmail(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CreditCardOnboardingAttemptsScreen)
  )
);
