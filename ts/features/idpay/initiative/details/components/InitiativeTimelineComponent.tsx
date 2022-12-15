import * as pot from "@pagopa/ts-commons/lib/pot";
import { List, ListItem, Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { OperationTypeEnum as InstrumentOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/InstrumentOperationDTO";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { TimelineDTO } from "../../../../../../definitions/idpay/timeline/TimelineDTO";
import { OperationTypeEnum as TransactionOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { idpayTimelineSelector } from "../store";
import PaymentDataComponent from "./PaymentDataComponent";
import {
  IbanOnboardingCard,
  InstrumentOnboardingCard,
  OnboardingTransactionCard,
  TimelineTransactionCard
} from "./timelineItems/CardTransaction";

const styles = StyleSheet.create({
  spaceBetween: {
    justifyContent: "space-between"
  }
});

type configuredInitiativeProps = {
  initiative: InitiativeDTO;
};

const emptyTimelineContent = (
  <>
    <H3>
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
      )}
    </H3>
    <View spacer />
    <LabelSmall weight="Regular" color="bluegreyDark">
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsSubtitle"
      )}
      <LabelSmall weight="SemiBold">
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsLink"
        )}
      </LabelSmall>
    </LabelSmall>
  </>
);

const TimelineRenderer = (timeline: TimelineDTO["operationList"]) => (
  <>
    <View style={[IOStyles.row, styles.spaceBetween]}>
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
        )}
      </H3>
      <Body weight="SemiBold" color="blue">
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.showMore"
        )}
      </Body>
    </View>
    <View spacer small />
    <List>
      {timeline.map(item => (
        <PickTransactionItem transaction={item} key={item.operationId} />
      ))}
    </List>
  </>
);

type TransactionItemProps = { transaction: OperationListDTO };
const PickTransactionItem = ({ transaction }: TransactionItemProps) => {
  switch (transaction.operationType) {
    case TransactionOperationTypeEnum.TRANSACTION:
      return <TimelineTransactionCard transaction={transaction} />;
    case OnboardingOperationTypeEnum.ONBOARDING:
      return <OnboardingTransactionCard transaction={transaction} />;
    case InstrumentOperationTypeEnum.ADD_INSTRUMENT:
      return <InstrumentOnboardingCard transaction={transaction} />;
    case IbanOperationTypeEnum.ADD_IBAN:
      return <IbanOnboardingCard transaction={transaction} />;
    default:
      return <Text>Error loading {transaction.operationType}</Text>;
  }
};
const ConfiguredInitiativeData = ({
  initiative
}: configuredInitiativeProps) => {
  const timelineFromSelector = useIOSelector(idpayTimelineSelector);

  const renderTimelineIfNotLoading = () => {
    const isTimelineLoading = pot.isLoading(timelineFromSelector);
    if (isTimelineLoading) {
      return null;
    }
    const timelineList = pot.getOrElse(
      pot.map(timelineFromSelector, timeline => timeline.operationList),
      []
    );
    const isTimelineEmpty = timelineList.length === 0;
    return isTimelineEmpty
      ? emptyTimelineContent
      : TimelineRenderer(timelineList);
  };
  return (
    <>
      {renderTimelineIfNotLoading()}
      <View spacer large />
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
        )}
      </H3>
      <View spacer small />
      <PaymentDataComponent iban={initiative.iban} nInstr={initiative.nInstr} />
    </>
  );
};


export default ConfiguredInitiativeData;
