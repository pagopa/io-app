import { List, ListItem, Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { TimelineDTO } from "../../../../../../definitions/idpay/timeline/TimelineDTO";
import { OperationTypeEnum as TransactionOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { OperationTypeEnum as InstrumentOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/InstrumentOperationDTO";
import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import I18n from "../../../../../i18n";
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
  timelineList: TimelineDTO["operationList"];
};

const InitiativeConfiguredData = ({
  initiative,
  timelineList
}: configuredProps) => {
  const isTimelineEmpty = timelineList.length === 0;
  return (
    <>
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
        )}
      </H3>
      <View spacer />
      {isTimelineEmpty ? emptyTimelineContent : TransactionsList(timelineList)}
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
  const pickComponent = () => {
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
        {pickComponent()}
      </View>
    </ListItem>
  );
};


export default InitiativeConfiguredData;
