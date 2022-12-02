import { List, ListItem, Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { TimelineDTO } from "../../../../../../definitions/idpay/timeline/TimelineDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import I18n from "../../../../../i18n";

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
      {/* HERE GOES TRANSACTION LIST */}
      {isTimelineEmpty ? emptyTimelineContent : TransactionsList(timelineList)}
      {/* END OF TRANSACTION LIST */}
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

const TransactionsList = (timeline: TimelineDTO["operationList"]) => (
  <List>
    {timeline.map((item, index) => (
      <CustomListItem transaction={item} key={index} />
    ))}
  </List>
);
const CustomListItem = ({ transaction }: { transaction: unknown }) => (
  <ListItem style={styles.listItem}>
    <View style={[IOStyles.flex, IOStyles.row, styles.alignCenter]}>
      <Text>LOGO</Text>
      <View hspacer />
      <View style={IOStyles.flex}>
        <H4>Pagamento Pos</H4>
        <LabelSmall weight="Regular" color="bluegrey">
          27 apr 2022
        </LabelSmall>
      </View>
    </View>
    <H4> - {transaction}2,45$</H4>
  </ListItem>
);

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

export default InitiativeConfiguredData;
