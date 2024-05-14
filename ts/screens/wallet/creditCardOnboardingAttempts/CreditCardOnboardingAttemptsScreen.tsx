import { H4, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Body } from "../../../components/core/typography/Body";
import { withValidatedPagoPaVersion } from "../../../components/helpers/withValidatedPagoPaVersion";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import { CreditCardAttemptsList } from "../../../components/wallet/creditCardOnboardingAttempts/CreditCardAttemptsList";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { navigateToCreditCardOnboardingAttempt } from "../../../store/actions/navigation";
import {
  CreditCardInsertion,
  creditCardAttemptsSelector
} from "../../../store/reducers/wallet/creditCard";
import { useIOSelector } from "../../../store/hooks";

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
const CreditCardOnboardingAttemptsScreen = () => {
  const creditCardOnboardingAttempts = useIOSelector(
    creditCardAttemptsSelector
  );
  const navigation = useIONavigation();

  return (
    <BaseScreenComponent
      goBack={() => navigation.goBack()}
      headerTitle={I18n.t("wallet.creditCard.onboardingAttempts.title")}
    >
      <CreditCardAttemptsList
        title={I18n.t("wallet.creditCard.onboardingAttempts.lastAttemptsTitle")}
        creditCardAttempts={creditCardOnboardingAttempts}
        ListEmptyComponent={ListEmptyComponent}
        onAttemptPress={(attempt: CreditCardInsertion) =>
          navigateToCreditCardOnboardingAttempt({
            attempt
          })
        }
      />
    </BaseScreenComponent>
  );
};

export default withValidatedPagoPaVersion(CreditCardOnboardingAttemptsScreen);
