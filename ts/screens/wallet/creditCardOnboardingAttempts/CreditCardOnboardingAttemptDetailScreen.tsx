import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import {
  instabugLog,
  openInstabugQuestionReport,
  TypeLogs
} from "../../../boot/configureInstabug";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import IconFont from "../../../components/ui/IconFont";
import { SlidedContentComponent } from "../../../components/wallet/SlidedContentComponent";
import I18n from "../../../i18n";
import { profileSelector } from "../../../store/reducers/profile";
import { GlobalState } from "../../../store/reducers/types";
import customVariables from "../../../theme/variables";
import { CreditCardInsertion } from "../../../store/reducers/wallet/creditCard";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { Label } from "../../../components/core/typography/Label";
import { Body } from "../../../components/core/typography/Body";
import { formatDateAsLocal } from "../../../utils/dates";
import { H3 } from "../../../components/core/typography/H3";
import { BadgeComponent } from "../../../components/screens/BadgeComponent";
import { getPanDescription } from "../../../components/wallet/creditCardOnboardingAttempts/CreditCardAttemptsList";
import { getProfileDetailsLog } from "../../../utils/profile";
import { outcomeCodesSelector } from "../../../store/reducers/wallet/outcomeCode";
import { getPaymentOutcomeCodeDescription } from "../../../utils/payment";

type NavigationParams = Readonly<{
  attempt: CreditCardInsertion;
}>;

type Props = NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  padded: { paddingHorizontal: customVariables.contentPadding },

  badge: {
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center"
  },
  badgeLabel: {
    paddingLeft: 8
  }
});

const renderRow = (label: string, value: string) => (
  <View style={styles.row}>
    <Label weight={"Regular"} color={"bluegrey"} style={IOStyles.flex}>
      {label}
    </Label>
    <Body>{value}</Body>
  </View>
);
const instabugTag = "credit-card-support";
/**
 * This screen shows credit card onboarding attempt details and allows the user
 * to ask assistance about this attempts
 */
const CreditCardOnboardingAttemptDetailScreen: React.FC<Props> = (
  props: Props
) => {
  const attempt = props.navigation.getParam("attempt");
  const instabugLogAndOpenReport = () => {
    pot.map(props.profile, p => {
      const profileDetails = getProfileDetailsLog(p);
      instabugLog(profileDetails, TypeLogs.INFO, instabugTag);
      instabugLog(JSON.stringify(attempt), TypeLogs.INFO, instabugTag);
    });
    openInstabugQuestionReport();
  };

  const renderSeparator = () => (
    <React.Fragment>
      <View spacer={true} large={true} />
      <ItemSeparatorComponent noPadded={true} />
      <View spacer={true} large={true} />
    </React.Fragment>
  );

  const renderHelper = () => (
    <View>
      <Label color={"bluegrey"} weight={"Regular"} style={styles.padded}>
        {I18n.t("wallet.creditCard.onboardingAttempts.help")}
      </Label>
      <View spacer={true} />
      <ButtonDefaultOpacity
        onPress={instabugLogAndOpenReport}
        bordered={true}
        block={true}
      >
        <IconFont name={"io-messaggi"} />
        <Text>{I18n.t("payment.details.info.buttons.help")}</Text>
      </ButtonDefaultOpacity>
    </View>
  );

  const startDate = new Date(attempt.startDate);
  const when = `${formatDateAsLocal(
    startDate,
    true,
    true
  )} - ${startDate.toLocaleTimeString()}`;
  const conditionalData = attempt.onboardingComplete
    ? {
        color: "green",
        header: I18n.t("wallet.creditCard.onboardingAttempts.success")
      }
    : {
        color: "red",
        header: I18n.t("wallet.creditCard.onboardingAttempts.failure")
      };
  const errorDescription =
    !attempt.onboardingComplete && attempt.outcomeCode
      ? getPaymentOutcomeCodeDescription(
          attempt.outcomeCode,
          props.outcomeCodes
        )
      : undefined;
  return (
    <BaseScreenComponent
      goBack={props.navigation.goBack}
      showInstabugChat={false}
      dark={true}
      headerTitle={I18n.t("wallet.creditCard.onboardingAttempts.title")}
    >
      <SlidedContentComponent hasFlatBottom={true}>
        <View spacer={true} xsmall={true} />
        <H3 color={"bluegreyDark"}>
          {I18n.t("wallet.creditCard.onboardingAttempts.detailTitle")}
        </H3>
        {renderSeparator()}
        <View style={styles.badge}>
          <BadgeComponent color={conditionalData.color} />
          <Label color={"bluegrey"} style={styles.badgeLabel}>
            {conditionalData.header}
          </Label>
        </View>
        <View spacer={true} />
        {
          <Label color={"bluegrey"} weight={"Regular"}>
            {getPanDescription(attempt)}
          </Label>
        }
        <View spacer={true} />
        {attempt.failureReason && (
          <>
            <Label color={"bluegrey"} weight={"Regular"}>
              {attempt.failureReason.kind === "GENERIC_ERROR"
                ? attempt.failureReason.reason
                : attempt.failureReason.kind}
            </Label>
            <View spacer={true} />
          </>
        )}
        {errorDescription && errorDescription.isSome() && (
          <>
            <Label color={"bluegrey"} weight={"Regular"}>
              {errorDescription.value}
            </Label>
            <View spacer={true} />
          </>
        )}
        {renderRow(
          I18n.t("payment.details.info.outcomeCode"),
          attempt.outcomeCode ?? "-"
        )}
        <View spacer={true} xsmall={true} />
        {renderRow(
          I18n.t("wallet.creditCard.onboardingAttempts.dateTime"),
          when
        )}
        {renderSeparator()}
        {renderHelper()}
      </SlidedContentComponent>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  profile: profileSelector(state),
  outcomeCodes: outcomeCodesSelector(state)
});

export default connect(mapStateToProps)(
  CreditCardOnboardingAttemptDetailScreen
);
