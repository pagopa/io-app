import { Content } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Body } from "../../../components/core/typography/Body";
import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import RemindEmailValidationOverlay from "../../../components/RemindEmailValidationOverlay";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import { CreditCardAttemptsList } from "../../../components/wallet/creditCardOnboardingAttempts/CreditCardAttemptsList";
import I18n from "../../../i18n";
import {
  creditCardAttemptsSelector,
  CreditCardInsertion
} from "../../../store/reducers/wallet/creditCard";
import variables from "../../../theme/variables";
import { useIOSelector } from "../../../store/hooks";
import ROUTES from "../../../navigation/routes";
import { isPagoPaSupportedSelector } from "../../../common/versionInfo/store/reducers/versionInfo";
import RemindUpdatePagoPaVersionOverlay from "../../../components/RemindUpdatePagoPaVersionOverlay";
import { isProfileEmailValidatedSelector } from "../../../store/reducers/profile";
import { emailValidationSelector } from "../../../store/reducers/emailValidation";

const styles = StyleSheet.create({
  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },
  whiteBg: {
    backgroundColor: IOColors.white
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
    <VSpacer size={16} />
    <Body>{I18n.t("wallet.creditCard.onboardingAttempts.emptyBody")}</Body>
    <VSpacer size={24} />
    <EdgeBorderComponent />
  </Content>
);

/**
 * This screen shows all attempts of onboarding payment instruments
 */
const CreditCardOnboardingAttemptsScreen = () => {
  const creditCardOnboardingAttempts = useIOSelector(
    creditCardAttemptsSelector
  );
  const isPagoPaVersionSupported = useIOSelector(isPagoPaSupportedSelector);
  const isEmailValidated = useIOSelector(isProfileEmailValidatedSelector);
  const acknowledgeOnEmailValidated = useIOSelector(
    emailValidationSelector
  ).acknowledgeOnEmailValidated;
  const navigation = useNavigation();

  if (!isPagoPaVersionSupported) {
    return (
      <BaseScreenComponent goBack={true}>
        <RemindUpdatePagoPaVersionOverlay />
      </BaseScreenComponent>
    );
  }

  if (
    !isEmailValidated &&
    pipe(
      acknowledgeOnEmailValidated,
      O.getOrElse(() => true)
    )
  ) {
    return <RemindEmailValidationOverlay />;
  }

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
          navigation.navigate(ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPT_DETAIL, {
            attempt
          })
        }
      />
    </BaseScreenComponent>
  );
};

export default CreditCardOnboardingAttemptsScreen;
