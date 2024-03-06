import { H4, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { connect } from "react-redux";
import { Body } from "../../../components/core/typography/Body";
import { withValidatedEmail } from "../../../components/helpers/withValidatedEmail";
import { withValidatedPagoPaVersion } from "../../../components/helpers/withValidatedPagoPaVersion";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import { CreditCardAttemptsList } from "../../../components/wallet/creditCardOnboardingAttempts/CreditCardAttemptsList";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../../navigation/params/AppParamsList";
import { navigateToCreditCardOnboardingAttempt } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import {
  CreditCardInsertion,
  creditCardAttemptsSelector
} from "../../../store/reducers/wallet/creditCard";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  IOStackNavigationRouteProps<AppParamsList>;

const ListEmptyComponent = (
  <>
    <VSpacer />
    <H4 color={"bluegreyDark"}>
      {I18n.t("wallet.creditCard.onboardingAttempts.emptyTitle")}
    </H4>
    <VSpacer size={16} />
    <Body>{I18n.t("wallet.creditCard.onboardingAttempts.emptyBody")}</Body>
    <VSpacer size={24} />
    <EdgeBorderComponent />
  </>
);

/**
 * This screen shows all attempts of onboarding payment instruments
 */
class CreditCardOnboardingAttemptsScreen extends React.Component<Props, never> {
  public render(): React.ReactNode {
    const { creditCardOnboardingAttempts } = this.props;
    return (
      <BaseScreenComponent
        goBack={() => this.props.navigation.goBack()}
        headerTitle={I18n.t("wallet.creditCard.onboardingAttempts.title")}
      >
        <CreditCardAttemptsList
          title={I18n.t(
            "wallet.creditCard.onboardingAttempts.lastAttemptsTitle"
          )}
          creditCardAttempts={creditCardOnboardingAttempts}
          ListEmptyComponent={ListEmptyComponent}
          onAttemptPress={(attempt: CreditCardInsertion) =>
            this.props.navigateToCreditCardAttemptDetail({
              attempt
            })
          }
        />
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  creditCardOnboardingAttempts: creditCardAttemptsSelector(state)
});

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToCreditCardAttemptDetail: (param: {
    attempt: CreditCardInsertion;
  }) => navigateToCreditCardOnboardingAttempt(param)
});

export default withValidatedPagoPaVersion(
  withValidatedEmail(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CreditCardOnboardingAttemptsScreen)
  )
);
