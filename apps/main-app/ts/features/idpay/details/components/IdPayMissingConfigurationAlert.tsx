import { StatusEnum as InitiativeStatusEnum } from "@io-app/api-types/generated/definitions/idpay/InitiativeDTO";
import { Alert, VSpacer } from "@io-app/design-system";
import { NavigatorScreenParams } from "@react-navigation/native";
import I18n from "i18next";
import { createRef } from "react";
import { View } from "react-native";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { IdPayConfigurationParamsList } from "../../configuration/navigation/params";
import { IdPayConfigurationRoutes } from "../../configuration/navigation/routes";

type Props = {
  initiativeId: string;
  status: InitiativeStatusEnum;
};

type StatusWithAlert = Exclude<
  InitiativeStatusEnum,
  | InitiativeStatusEnum.REFUNDABLE
  | InitiativeStatusEnum.SUSPENDED
  | InitiativeStatusEnum.UNSUBSCRIBED
>;

const getAlertCopy = (
  status: StatusWithAlert
): { action: string; content: string } => {
  switch (status) {
    case InitiativeStatusEnum.NOT_REFUNDABLE:
      return {
        action: I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.errorAlerts.NOT_REFUNDABLE.action"
        ),
        content: I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.errorAlerts.NOT_REFUNDABLE.content"
        )
      };
    case InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_IBAN:
      return {
        action: I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.errorAlerts.NOT_REFUNDABLE_ONLY_IBAN.action"
        ),
        content: I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.errorAlerts.NOT_REFUNDABLE_ONLY_IBAN.content"
        )
      };
    case InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT:
      return {
        action: I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.errorAlerts.NOT_REFUNDABLE_ONLY_INSTRUMENT.action"
        ),
        content: I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.errorAlerts.NOT_REFUNDABLE_ONLY_INSTRUMENT.content"
        )
      };
  }
};

const IdPayMissingConfigurationAlert = (props: Props) => {
  const navigation = useIONavigation();

  const { status, initiativeId } = props;

  if (
    status === InitiativeStatusEnum.UNSUBSCRIBED ||
    status === InitiativeStatusEnum.REFUNDABLE ||
    status === InitiativeStatusEnum.SUSPENDED
  ) {
    return null;
  }

  const viewRef = createRef<View>();

  const screen: Record<StatusWithAlert, keyof IdPayConfigurationParamsList> = {
    NOT_REFUNDABLE_ONLY_IBAN:
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
    NOT_REFUNDABLE_ONLY_INSTRUMENT:
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
    NOT_REFUNDABLE: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO
  };

  const handleNavigation = () => {
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen: screen[status] as keyof IdPayConfigurationParamsList,
        params: {
          initiativeId
        }
      } as NavigatorScreenParams<IdPayConfigurationParamsList>
    );
  };

  const { action, content } = getAlertCopy(status);

  return (
    <>
      <Alert
        action={action}
        content={content}
        onPress={handleNavigation}
        ref={viewRef}
        testID="missing-configuration-alert"
        variant="error"
      />
      <VSpacer size={16} />
    </>
  );
};

export { IdPayMissingConfigurationAlert };
