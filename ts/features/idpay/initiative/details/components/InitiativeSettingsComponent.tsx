import { useNavigation } from "@react-navigation/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { List, ListItem } from "native-base";
import React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
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
import { IDPayUnsubscriptionRoutes } from "../../../unsubscription/navigation/navigator";
import { IDPayConfigurationRoutes } from "../../configuration/navigation/navigator";

type Props = {
  initiative?: InitiativeDTO;
};

type SettingsButtonProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  hasWarnings?: boolean;
};

const SettingsButtonComponent = (props: SettingsButtonProps) => {
  const { title, subtitle, onPress, hasWarnings } = props;

  const subtitleComponent = pipe(
    subtitle,
    O.fromNullable,
    O.fold(
      () => (
        <>
          <VSpacer size={4} />
          <Placeholder.Box animate="fade" height={16} width={120} radius={4} />
        </>
      ),
      subtitle => {
        if (hasWarnings) {
          <LabelSmall weight="SemiBold" color="red">
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.actionsRequired"
            )}
          </LabelSmall>;
        }

        return (
          <LabelSmall weight="Regular" color="bluegrey">
            {subtitle}
          </LabelSmall>
        );
      }
    )
  );

  return (
    <ListItem onPress={onPress} style={{ paddingEnd: 0 }}>
      {props.hasWarnings && (
        <>
          <IconFont name={"io-warning"} color={IOColors.red} />
          <HSpacer size={16} />
        </>
      )}
      <View style={IOStyles.flex}>
        <H4>{title}</H4>
        {subtitleComponent}
      </View>
      <IconFont
        name={"io-right"}
        color={customVariables.contentPrimaryBackground}
      />
    </ListItem>
  );
};

export const InitiativeSettingsComponent = (props: Props) => {
  const { initiative } = props;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToInstrumentsConfiguration = (initiativeId: string) => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen:
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
      params: {
        initiativeId
      }
    });
  };

  const navigateToIbanConfiguration = (initiativeId: string) => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
      params: {
        initiativeId
      }
    });
  };

  const navigateToUnsubscription = (
    initiativeId: string,
    initiativeName?: string
  ) => {
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      initiativeId,
      initiativeName
    });
  };

  const instrumentsSettingsButton = pipe(
    initiative,
    O.fromNullable,
    O.fold(
      () => (
        <SettingsButtonComponent
          title={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
        />
      ),
      ({ initiativeId, nInstr, status }) => (
        <SettingsButtonComponent
          title={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          subtitle={I18n.t(
            `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods`,
            {
              defaultValue: I18n.t(
                `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods.other`,
                { count: nInstr }
              ),
              count: nInstr
            }
          )}
          onPress={() => navigateToInstrumentsConfiguration(initiativeId)}
          hasWarnings={status === InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_IBAN}
        />
      )
    )
  );

  const ibanSettingsButton = pipe(
    initiative,
    O.fromNullable,
    O.fold(
      () => (
        <SettingsButtonComponent
          title={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
          )}
        />
      ),
      ({ initiativeId, iban, status }) => (
        <SettingsButtonComponent
          title={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
          )}
          subtitle={iban}
          onPress={() => navigateToIbanConfiguration(initiativeId)}
          hasWarnings={
            status === InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT
          }
        />
      )
    )
  );

  const unsubscriptionButton = pipe(
    initiative,
    O.fromNullable,
    O.fold(
      () => null,
      ({ initiativeId, initiativeName }) => (
        <SettingsButtonComponent
          title={"Rimuovi iniziativa"}
          onPress={() => navigateToUnsubscription(initiativeId, initiativeName)}
        />
      )
    )
  );

  return (
    <>
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
        )}
      </H3>
      <VSpacer size={8} />
      <List>
        {instrumentsSettingsButton}
        {ibanSettingsButton}
        {/* TODO: temporary button, removed in IODPAY-175  */}
        {unsubscriptionButton}
      </List>
    </>
  );
};
