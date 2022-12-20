import { useNavigation } from "@react-navigation/core";

import { List, ListItem, View } from "native-base";
import React from "react";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";

import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { IDPayConfigurationRoutes } from "../../configuration/navigation/navigator";

import { H4 } from "../../../../../components/core/typography/H4";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import IconFont from "../../../../../components/ui/IconFont";
import I18n from "../../../../../i18n";
import customVariables from "../../../../../theme/variables";

type Props = {
  initiative: InitiativeDTO;
};

export const InitiativeSettingsComponent = (props: Props) => {
  const { initiative } = props;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToInstrumentsConfiguration = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen:
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
      params: {
        initiativeId: initiative.initiativeId
      }
    });
  };

  const renderInstruments = () => {
    if (initiative.status === StatusEnum.NOT_REFUNDABLE_ONLY_IBAN) {
      return (
        <ListItem onPress={navigateToInstrumentsConfiguration}>
          <IconFont name={"io-warning"} color={IOColors.red} />

          <View hspacer />
          <View style={IOStyles.flex}>
            <H4>
              {I18n.t(
                "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
              )}
            </H4>
            <LabelSmall weight="SemiBold" color="red">
              {I18n.t(
                "idpay.initiative.details.initiativeDetailsScreen.configured.settings.actionsRequired"
              )}
            </LabelSmall>
          </View>
          <IconFont
            name={"io-right"}
            color={customVariables.contentPrimaryBackground}
          />
        </ListItem>
      );
    }

    return (
      <ListItemComponent
        title={I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
        )}
        subTitle={`${initiative.nInstr} ${I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.methodsi18n"
        )}`}
        onPress={navigateToInstrumentsConfiguration}
      />
    );
  };

  const renderIban = () => {
    if (initiative.status === StatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT) {
      return (
        <ListItem>
          <IconFont name={"io-warning"} color={IOColors.red} />

          <View hspacer />
          <View style={IOStyles.flex}>
            <H4>
              {I18n.t(
                "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
              )}
            </H4>
            <LabelSmall weight="SemiBold" color="red">
              {I18n.t(
                "idpay.initiative.details.initiativeDetailsScreen.configured.settings.actionsRequired"
              )}
            </LabelSmall>
          </View>
          <IconFont
            name={"io-right"}
            color={customVariables.contentPrimaryBackground}
          />
        </ListItem>
      );
    }

    return (
      <ListItemComponent
        title={I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
        )}
        subTitle={initiative.iban}
      />
    );
  };

  return (
    <>
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
        )}
      </H3>
      <View spacer small />
      <List>
        {renderInstruments()}
        {renderIban()}
      </List>
    </>
  );
};
