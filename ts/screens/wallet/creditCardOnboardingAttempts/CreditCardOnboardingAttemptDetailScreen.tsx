import {
  Body,
  ButtonOutline,
  H6,
  Label,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { BadgeComponent } from "../../../components/screens/BadgeComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { SlidedContentComponent } from "../../../components/wallet/SlidedContentComponent";
import { getPanDescription } from "../../../components/wallet/creditCardOnboardingAttempts/CreditCardAttemptsList";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../features/zendesk/store/actions";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { canShowHelpSelector } from "../../../store/reducers/assistanceTools";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { CreditCardInsertion } from "../../../store/reducers/wallet/creditCard";
import { outcomeCodesSelector } from "../../../store/reducers/wallet/outcomeCode";
import customVariables from "../../../theme/variables";
import { formatDateAsLocal } from "../../../utils/dates";
import { getPaymentOutcomeCodeDescription } from "../../../utils/payment";
import {
  addTicketCustomField,
  appendLog,
  assistanceToolRemoteConfig,
  resetCustomFields,
  zendeskCategoryId,
  zendeskPaymentMethodCategory
} from "../../../utils/supportAssistance";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";

export type CreditCardOnboardingAttemptDetailScreenNavigationParams = Readonly<{
  attempt: CreditCardInsertion;
}>;

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
    <Label weight={"Regular"} color="grey-700" style={IOStyles.flex}>
      {label}
    </Label>
    <Body>{value}</Body>
  </View>
);
/**
 * This screen shows credit card onboarding attempt details and allows the user
 * to ask assistance about this attempts
 */
const CreditCardOnboardingAttemptDetailScreen = () => {
  const dispatch = useIODispatch();
  const { attempt } =
    useRoute<
      Route<
        "CREDIT_CARD_ONBOARDING_ATTEMPT_DETAIL",
        CreditCardOnboardingAttemptDetailScreenNavigationParams
      >
    >().params;
  const navigation = useIONavigation();
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const outcomeCodes = useIOSelector(outcomeCodesSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const canShowHelp = useIOSelector(canShowHelpSelector);

  const zendeskAssistanceLogAndStart = () => {
    resetCustomFields();
    // Set metodo_di_pagamento as category
    addTicketCustomField(zendeskCategoryId, zendeskPaymentMethodCategory.value);
    // Append the attempt in the log
    appendLog(JSON.stringify(attempt));
    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceForPayment: false,
        assistanceForCard: true,
        assistanceForFci: false
      })
    );
    dispatch(zendeskSelectedCategory(zendeskPaymentMethodCategory));
  };

  const handleAskAssistance = () => {
    switch (choosenTool) {
      case ToolEnum.zendesk:
        zendeskAssistanceLogAndStart();
        break;
    }
  };

  const renderSeparator = () => (
    <React.Fragment>
      <VSpacer size={24} />
      <ItemSeparatorComponent noPadded={true} />
      <VSpacer size={24} />
    </React.Fragment>
  );

  const renderHelper = () => (
    <View>
      <Label color="grey-700" weight={"Regular"} style={styles.padded}>
        {I18n.t("wallet.creditCard.onboardingAttempts.help")}
      </Label>
      <VSpacer size={16} />
      <ButtonOutline
        fullWidth
        onPress={handleAskAssistance}
        icon="chat"
        label={I18n.t("payment.details.info.buttons.help")}
        accessibilityLabel={I18n.t("payment.details.info.buttons.help")}
      />
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
      goBack={() => navigation.goBack()}
      showChat={false}
      dark={true}
      headerTitle={I18n.t("wallet.creditCard.onboardingAttempts.title")}
    >
      <SlidedContentComponent hasFlatBottom={true}>
        <VSpacer size={4} />
        <H6 color={"bluegreyDark"}>
          {I18n.t("wallet.creditCard.onboardingAttempts.detailTitle")}
        </H6>
        {renderSeparator()}
        <View style={styles.badge}>
          <BadgeComponent color={conditionalData.color} />
          <Label color="grey-700" style={styles.badgeLabel}>
            {conditionalData.header}
          </Label>
        </View>
        <VSpacer size={16} />
        {
          <Label color="grey-700" weight={"Regular"}>
            {getPanDescription(attempt)}
          </Label>
        }
        <VSpacer size={16} />
        {attempt.failureReason && (
          <>
            <Label color="grey-700" weight={"Regular"}>
              {attempt.failureReason.kind === "GENERIC_ERROR"
                ? attempt.failureReason.reason
                : attempt.failureReason.kind}
            </Label>
            <VSpacer size={16} />
          </>
        )}
        {errorDescription && O.isSome(errorDescription) && (
          <>
            <Label color="grey-700" weight={"Regular"}>
              {errorDescription.value}
            </Label>
            <VSpacer size={16} />
          </>
        )}
        {renderRow(
          I18n.t("payment.details.info.outcomeCode"),
          attempt.outcomeCode ?? "-"
        )}
        <VSpacer size={4} />
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