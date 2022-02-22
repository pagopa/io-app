import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { useDispatch } from "react-redux";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import {
  instabugLog,
  openInstabugQuestionReport,
  TypeLogs
} from "../../../boot/configureInstabug";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { Label } from "../../../components/core/typography/Label";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import { BadgeComponent } from "../../../components/screens/BadgeComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import IconFont from "../../../components/ui/IconFont";
import { getPanDescription } from "../../../components/wallet/creditCardOnboardingAttempts/CreditCardAttemptsList";
import { SlidedContentComponent } from "../../../components/wallet/SlidedContentComponent";
import { zendeskSupportStart } from "../../../features/zendesk/store/actions";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { canShowHelpSelector } from "../../../store/reducers/assistanceTools";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus";
import { CreditCardInsertion } from "../../../store/reducers/wallet/creditCard";
import { outcomeCodesSelector } from "../../../store/reducers/wallet/outcomeCode";
import customVariables from "../../../theme/variables";
import { formatDateAsLocal } from "../../../utils/dates";
import { getPaymentOutcomeCodeDescription } from "../../../utils/payment";
import {
  addTicketCustomField,
  appendLog,
  assistanceToolRemoteConfig,
  zendeskCategoryId,
  zendeskPaymentMethodCategoryValue
} from "../../../utils/supportAssistance";

export type CreditCardOnboardingAttemptDetailScreenNavigationParams = Readonly<{
  attempt: CreditCardInsertion;
}>;

type Props =
  NavigationStackScreenProps<CreditCardOnboardingAttemptDetailScreenNavigationParams>;

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
const CreditCardOnboardingAttemptDetailScreen = (props: Props) => {
  const dispatch = useDispatch();
  const attempt = props.navigation.getParam("attempt");
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const outcomeCodes = useIOSelector(outcomeCodesSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const canShowHelp = useIOSelector(canShowHelpSelector);

  const instabugLogAndOpenReport = () => {
    instabugLog(JSON.stringify(attempt), TypeLogs.INFO, instabugTag);
    openInstabugQuestionReport();
  };
  const zendeskAssistanceLogAndStart = () => {
    // Set metodo_di_pagamento as category
    addTicketCustomField(zendeskCategoryId, zendeskPaymentMethodCategoryValue);
    // Append the attempt in the log
    appendLog(JSON.stringify(attempt));
    dispatch(
      zendeskSupportStart({ startingRoute: "n/a", assistanceForPayment: true })
    );
  };

  const handleAskAssistance = () => {
    switch (choosenTool) {
      case ToolEnum.instabug:
        instabugLogAndOpenReport();
        break;
      case ToolEnum.zendesk:
        zendeskAssistanceLogAndStart();
        break;
    }
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
        onPress={handleAskAssistance}
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
      ? getPaymentOutcomeCodeDescription(attempt.outcomeCode, outcomeCodes)
      : undefined;
  return (
    <BaseScreenComponent
      goBack={() => props.navigation.goBack()}
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
        {/* This check is redundant, since if the help can't be shown the user can't get there */}
        {canShowHelp && renderHelper()}
      </SlidedContentComponent>
    </BaseScreenComponent>
  );
};

export default CreditCardOnboardingAttemptDetailScreen;
