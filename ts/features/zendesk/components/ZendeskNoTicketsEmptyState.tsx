import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { zendeskConfigSelector } from "../store/reducers";
import { handleContactSupport } from "../utils";

type Props = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
  assistanceForFci: boolean;
};

export const ZendeskNoTicketsEmptyState = ({
  assistanceForPayment,
  assistanceForCard,
  assistanceForFci
}: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const zendeskRemoteConfig = useIOSelector(zendeskConfigSelector);

  const handleContactSupportPress = React.useCallback(
    () =>
      handleContactSupport(
        navigation,
        assistanceForPayment,
        assistanceForCard,
        assistanceForFci,
        zendeskRemoteConfig
      ),
    [
      navigation,
      assistanceForPayment,
      assistanceForCard,
      assistanceForFci,
      zendeskRemoteConfig
    ]
  );

  return (
    <OperationResultScreenContent
      testID={"emptyTicketsComponent"}
      pictogram={"help"}
      title={I18n.t("support.ticketList.noTicket.title")}
      subtitle={I18n.t("support.ticketList.noTicket.body")}
      action={{
        label: I18n.t("support.helpCenter.cta.contactSupport"),
        onPress: handleContactSupportPress,
        testID: "continueButtonId"
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.back"),
        onPress: () => navigation.goBack(),
        testID: "cancelButtonId"
      }}
    />
  );
};
