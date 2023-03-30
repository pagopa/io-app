import { useNavigation } from "@react-navigation/core";
import { View } from "react-native";
import { List, ListItem } from "native-base";
import React from "react";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import IconFont from "../../../../../components/ui/IconFont";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import customVariables from "../../../../../theme/variables";
import { IDPayConfigurationRoutes } from "../../configuration/navigation/navigator";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { IDPayUnsubscriptionRoutes } from "../../../unsubscription/navigation/navigator";

type Props = {
  initiative: InitiativeDTO;
};

type SettingsButtonProps = {
  title: string;
  subTitle?: string;
  onPress: () => void;
  hasWarnings?: boolean;
};

const SettingsButtonComponent = (props: SettingsButtonProps) => (
  <ListItem onPress={props.onPress} style={{ paddingEnd: 0 }}>
    {props.hasWarnings && (
      <>
        <IconFont name={"io-warning"} color={IOColors.red} />
        <HSpacer size={16} />
      </>
    )}
    <View style={IOStyles.flex}>
      <H4>{props.title}</H4>
      {props.hasWarnings ? (
        <LabelSmall weight="SemiBold" color="red">
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.actionsRequired"
          )}
        </LabelSmall>
      ) : (
        <LabelSmall weight="Regular" color="bluegrey">
          {props.subTitle}
        </LabelSmall>
      )}
    </View>
    <IconFont
      name={"io-right"}
      color={customVariables.contentPrimaryBackground}
    />
  </ListItem>
);

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

  const navigateToIbanConfiguration = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
      params: {
        initiativeId: initiative.initiativeId
      }
    });
  };

  const navigateToUnsubscription = () => {
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      initiativeId: initiative.initiativeId,
      initiativeName: initiative.initiativeName
    });
  };

  return (
    <>
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
        )}
      </H3>
      <VSpacer size={8} />
      <List>
        <SettingsButtonComponent
          title={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          subTitle={I18n.t(
            `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods`,
            {
              defaultValue: I18n.t(
                `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods.other`,
                { count: initiative.nInstr }
              ),
              count: initiative.nInstr
            }
          )}
          onPress={navigateToInstrumentsConfiguration}
          hasWarnings={
            initiative.status === StatusEnum.NOT_REFUNDABLE_ONLY_IBAN
          }
        />
        <SettingsButtonComponent
          title={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
          )}
          subTitle={initiative.iban}
          onPress={navigateToIbanConfiguration}
          hasWarnings={
            initiative.status === StatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT
          }
        />
        {/* TODO: temporary button  */}
        <SettingsButtonComponent
          title={"Rimuovi iniziativa"}
          onPress={navigateToUnsubscription}
        />
      </List>
    </>
  );
};
