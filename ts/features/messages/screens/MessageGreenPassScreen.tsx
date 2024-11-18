import React from "react";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../navigation/params";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

type NavigationProps = IOStackNavigationRouteProps<
  MessagesParamsList,
  "MESSAGE_GREEN_PASS"
>;

export const MessageGreenPassScreen = (_props: NavigationProps) => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  return (
    <OperationResultScreenContent
      title="Questo servizio non è più attivo su IO"
      subtitle="Puoi accedere ai tuoi certificati Green Pass sul Fascicolo Sanitario Elettronico o richiedendone una copia al medico di base"
      isHeaderVisible
      pictogram="attention"
      testID="green-pass-orsc"
      action={{
        label: "Indietro",
        onPress: navigation.goBack
      }}
    />
  );
};
