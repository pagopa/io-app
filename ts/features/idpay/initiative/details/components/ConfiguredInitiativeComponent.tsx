import * as pot from "@pagopa/ts-commons/lib/pot";
import { List, ListItem, Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { OperationTypeEnum as InstrumentOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/InstrumentOperationDTO";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { TimelineDTO } from "../../../../../../definitions/idpay/timeline/TimelineDTO";
import {
  CircuitTypeEnum,
  OperationTypeEnum as TransactionOperationTypeEnum
} from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { idpayTimelineSelector } from "../store";
import {
  IbanOnboardingCard,
  InstrumentOnboardingCard,
  OnboardingTransactionCard,
  TimelineTransactionCard
} from "./timelineItems/CardTransaction";

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  },
  listItem: {
    flex: 1,
    justifyContent: "space-between"
  }
});
type configuredProps = {
  initiative: InitiativeDTO;
};

const InitiativeConfiguredData = ({ initiative }: configuredProps) => {
  const timelineFromSelector = useIOSelector(idpayTimelineSelector);
  const isTimelineLoading = pot.isLoading(timelineFromSelector);
  const timelineList = pot.getOrElse(
    pot.map(timelineFromSelector, timeline => timeline.operationList),
    // placeholder, will be removed once it can be tested
    [
      {
        amount: -10,
        brandLogo: "",
        circuitType: CircuitTypeEnum["00"],
        maskedPan: "1234",
        operationDate: new Date("2021-01-01T00:00:00.000Z"),
        operationId: "1234567890",
        operationType: TransactionOperationTypeEnum.TRANSACTION
      },
      {
        operationType: OnboardingOperationTypeEnum.ONBOARDING,
        operationDate: new Date("2021-01-01T00:00:00.000Z"),
        operationId: "1234567890"
      },
      {
        operationType: InstrumentOperationTypeEnum.ADD_INSTRUMENT,
        brandLogo: "",
        maskedPan: "1234",
        channel: "1234",
        operationDate: new Date("2021-01-01T00:00:00.000Z"),
        operationId: "1234567890"
      },
      {
        operationType: IbanOperationTypeEnum.ADD_IBAN,
        channel: "1234",
        iban: "IT1234567890123456789012345",
        operationDate: new Date("2021-01-01T00:00:00.000Z"),
        operationId: "1234567890"
      }
    ]
  );

  const isTimelineEmpty = timelineList.length === 0;

  const renderTimelineIfNotLoading = () => {
    if (isTimelineLoading) {
      return null;
    }
    return isTimelineEmpty
      ? emptyTimelineContent
      : TransactionsList(timelineList);
  };
  return (
    <>
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
        )}
      </H3>
      <View spacer />
      {renderTimelineIfNotLoading()}
      <View spacer large />
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
        )}
      </H3>
      <View spacer small />
      <List>
        <ListItemComponent
          title={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          subTitle={`${initiative.nInstr} ${I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.methodsi18n"
          )}`}
        />
        <ListItemComponent
          title={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
          )}
          subTitle={initiative.iban}
        />
      </List>
    </>
  );
};
const emptyTimelineContent = (
  <LabelSmall weight="Regular" color="bluegreyDark">
    {I18n.t(
      "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsSubtitle"
    ) + " "}
    <LabelSmall weight="SemiBold">
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsLink"
      )}
    </LabelSmall>
  </LabelSmall>
);

const TransactionsList = (timeline: TimelineDTO["operationList"]) => (
  <List>
    {timeline.map((item, index) => (
      <CustomListItem transaction={item} key={index} />
    ))}
  </List>
);

type TransactionProps = { transaction: OperationListDTO };

const CustomListItem = ({ transaction }: TransactionProps) => {
  const pickTransactionItem = () => {
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
  return (
    <ListItem style={styles.listItem}>
      <View style={[IOStyles.flex, IOStyles.row, styles.alignCenter]}>
        {pickTransactionItem()}
      </View>
    </ListItem>
  );
};

export default InitiativeConfiguredData;
