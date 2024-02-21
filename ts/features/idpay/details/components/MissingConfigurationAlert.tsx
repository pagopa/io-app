import React from "react";
import { View } from "react-native";
import { Alert, VSpacer } from "@pagopa/io-app-design-system";
import { NavigatorScreenParams } from "@react-navigation/native";
import { StatusEnum as InitiativeStatusEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import I18n from "../../../../i18n";
import {
  IDPayConfigurationParamsList,
  IDPayConfigurationRoutes
} from "../../configuration/navigation/navigator";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

type StatusWithAlert = Exclude<
  InitiativeStatusEnum,
  | InitiativeStatusEnum.REFUNDABLE
  | InitiativeStatusEnum.UNSUBSCRIBED
  | InitiativeStatusEnum.SUSPENDED
>;

type Props = {
  initiativeId: string;
  status: InitiativeStatusEnum;
};

const MissingConfigurationAlert = (props: Props) => {
  const navigation = useIONavigation();

  const { status, initiativeId } = props;

  if (
    status === InitiativeStatusEnum.UNSUBSCRIBED ||
    status === InitiativeStatusEnum.REFUNDABLE ||
    status === InitiativeStatusEnum.SUSPENDED
  ) {
    return null;
  }

  const viewRef = React.createRef<View>();

  const screen: Record<StatusWithAlert, keyof IDPayConfigurationParamsList> = {
    NOT_REFUNDABLE_ONLY_IBAN:
      IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
    NOT_REFUNDABLE_ONLY_INSTRUMENT:
      IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
    NOT_REFUNDABLE: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO
  };

  const handleNavigation = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: screen[status] as keyof IDPayConfigurationParamsList,
      params: {
        initiativeId
      }
    } as NavigatorScreenParams<IDPayConfigurationParamsList>);
  };

  return (
    <>
      <Alert
        viewRef={viewRef}
        content={I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.errorAlerts.${status}.content`
        )}
        action={I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.errorAlerts.${status}.action`
        )}
        onPress={handleNavigation}
        variant="error"
      />
      <VSpacer size={16} />
    </>
  );
};

export { MissingConfigurationAlert };
