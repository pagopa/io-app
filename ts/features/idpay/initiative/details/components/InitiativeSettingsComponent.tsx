import { useNavigation } from "@react-navigation/core";
import { List, View } from "native-base";
import React from "react";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import TypedI18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { IDPayConfigurationRoutes } from "../../configuration/navigation/navigator";

type Props = {
  initiative: InitiativeDTO;
};

export const InitiativeSettingsComponent = (props: Props) => {
  const { initiative } = props;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToInstrumentsConfiguration = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen:
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT
    });
  };

  return (
    <>
      <H3>
        {TypedI18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
        )}
      </H3>
      <View spacer xsmall />
      <LabelSmall weight="Regular" color="bluegreyDark">
        {TypedI18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsSubtitle"
        ) + " "}
        <LabelSmall weight="SemiBold">
          {TypedI18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsLink"
          )}
        </LabelSmall>
      </LabelSmall>
      <View spacer extralarge />
      <H3>
        {TypedI18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
        )}
      </H3>
      <View spacer small />
      <List>
        <ListItemComponent
          title={TypedI18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          subTitle={`${initiative.nInstr} ${TypedI18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.methodsi18n"
          )}`}
          onPress={navigateToInstrumentsConfiguration}
        />
        <ListItemComponent
          title={TypedI18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
          )}
          subTitle={initiative.iban}
        />
      </List>
    </>
  );
};
