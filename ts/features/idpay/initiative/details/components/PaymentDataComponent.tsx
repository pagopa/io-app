import { List, ListItem, Text, View } from "native-base";
import React from "react";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import I18n from "../../../../../i18n";

type IbanType = string | undefined;
type Props = {
  nInstr: number;
  iban: IbanType;
};

const IbanConfigured = (iban: IbanType) => {
  if (iban === undefined) {
    return (
      <ListItem>
        <Text>ICON</Text>
        <View hspacer />

        <View style={IOStyles.flex}>
          <H4>
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
            )}
          </H4>
          <LabelSmall weight="SemiBold" color="red">
            {"Azioni richieste"}
          </LabelSmall>
        </View>

        <Text>io-right</Text>
      </ListItem>
    );
  }
  return (
    <ListItemComponent
      title={I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
      )}
      subTitle={iban}
    />
  );
};

const InstrumentConfigured = (nInstr: number) => {
  if (nInstr === 0) {
    return (
      <ListItem>
        <Text>ICON</Text>
        <View hspacer />

        <View style={IOStyles.flex}>
          <H4>
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
            )}
          </H4>
          <LabelSmall weight="SemiBold" color="red">
            {"Azioni richieste"}
          </LabelSmall>
        </View>

        <Text>io-right</Text>
      </ListItem>
    );
  }

  return (
    <ListItemComponent
      title={I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
      )}
      subTitle={`${nInstr} ${I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.settings.methodsi18n"
      )}`}
    />
  );
};

const PaymentDataComponent = ({ nInstr, iban }: Props) => (
  <List>
    {InstrumentConfigured(nInstr)}
    {IbanConfigured(iban)}
  </List>
);

export default PaymentDataComponent;
