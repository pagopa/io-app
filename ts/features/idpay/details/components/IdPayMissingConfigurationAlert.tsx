import { Alert, VSpacer } from "@pagopa/io-app-design-system";
import { NavigatorScreenParams } from "@react-navigation/native";
import { createRef } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { StatusEnum as InitiativeStatusEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { IdPayConfigurationParamsList } from "../../configuration/navigation/params";
import { IdPayConfigurationRoutes } from "../../configuration/navigation/routes";

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

  return (
    <>
      <Alert
        ref={viewRef}
        testID="missing-configuration-alert"
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

export { IdPayMissingConfigurationAlert };
