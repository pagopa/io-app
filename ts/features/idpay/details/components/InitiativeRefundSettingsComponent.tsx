import {
  ListItemHeader,
  ListItemNav,
  ListItemNavAlert
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { View } from "react-native";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { Skeleton } from "../../common/components/Skeleton";
import { IdPayConfigurationRoutes } from "../../configuration/navigation/routes";

type Props = {
  initiative?: InitiativeDTO;
};

const InitiativeRefundSettingsComponent = (props: Props) => {
  const { initiative } = props;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToInstrumentsConfiguration = (initiativeId: string) => {
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen:
          IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
        params: {
          initiativeId
        }
      }
    );
  };

  const navigateToIbanConfiguration = (initiativeId: string) => {
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
        params: {
          initiativeId
        }
      }
    );
  };

  const instrumentsSettingsButton = pipe(
    initiative,
    O.fromNullable,
    O.fold(
      () => (
        <ListItemNav
          value={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          accessibilityLabel={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          description={<Skeleton width={100} height={21} />}
          onPress={() => null}
        />
      ),
      ({ initiativeId, nInstr, status }) => {
        // between ListItemNav and ListItemNavAlert, ListItemNavAlert is the least inclusive one
        const methodCountString = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods`,
          {
            defaultValue: I18n.t(
              `idpay.initiative.details.initiativeDetailsScreen.configured.settings.methods.other`,
              { count: nInstr }
            ),
            count: nInstr
          }
        );
        const listItemOptions: ListItemNavAlert = {
          value: I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          ),
          description: methodCountString,

          onPress: () => navigateToInstrumentsConfiguration(initiativeId),
          accessibilityLabel: `${I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          ${methodCountString}`
        };
        const areActionsRequired =
          status === InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_IBAN ||
          status === InitiativeStatusEnum.NOT_REFUNDABLE;
        return areActionsRequired ? (
          <ListItemNavAlert
            {...listItemOptions}
            description={I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.actionsRequired"
            )}
            accessibilityLabel={`${
              listItemOptions.accessibilityLabel
            }, ${I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.actionsRequired"
            )}`}
          />
        ) : (
          <ListItemNav {...listItemOptions} />
        );
      }
    )
  );

  const ibanSettingsButton = pipe(
    initiative,
    O.fromNullable,
    O.fold(
      () => (
        <ListItemNav
          value={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
          )}
          description={<Skeleton width={270} height={21} />}
          accessibilityLabel={`${I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
          )}, ${I18n.t("global.remoteStates.loading")}`}
          onPress={() => null}
        />
      ),
      ({ initiativeId, iban, status }) => {
        const listItemOptions: ListItemNavAlert = {
          value: I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
          ),
          description: iban,
          onPress: () => navigateToIbanConfiguration(initiativeId),
          accessibilityLabel: I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
          )
        };
        const areActionsRequired =
          status === InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT ||
          status === InitiativeStatusEnum.NOT_REFUNDABLE;
        return areActionsRequired ? (
          <ListItemNavAlert
            {...listItemOptions}
            description={I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.actionsRequired"
            )}
            accessibilityLabel={`${
              listItemOptions.accessibilityLabel
            }, ${I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.configured.settings.actionsRequired"
            )}`}
          />
        ) : (
          <ListItemNav
            {...listItemOptions}
            accessibilityLabel={`${listItemOptions.accessibilityLabel} , ${listItemOptions.description}`}
          />
        );
      }
    )
  );

  return (
    <View testID={"IDPayDetailsSettingsTestID"}>
      <ListItemHeader
        label={I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
        )}
      />
      {instrumentsSettingsButton}
      {ibanSettingsButton}
    </View>
  );
};

export { InitiativeRefundSettingsComponent };
