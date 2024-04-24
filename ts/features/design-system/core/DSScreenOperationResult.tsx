import { useNavigation } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import I18n from "../../../i18n";
import { BodyProps } from "../../../components/core/typography/ComposedBodyFromArray";

const DSScreenOperationResult = () => {
  const navigation = useNavigation();

  const bodyPropsArray: Array<BodyProps> = [
    {
      text: I18n.t("email.cduScreens.emailAlreadyTaken.subtitleStart"),
      style: {
        textAlign: "center"
      }
    },
    {
      text: <> example@try.com </>,
      style: {
        textAlign: "center"
      },
      weight: "SemiBold"
    },
    {
      text: I18n.t("email.cduScreens.emailAlreadyTaken.subtitleEnd"),
      style: {
        textAlign: "center"
      }
    }
  ];

  return (
    <OperationResultScreenContent
      pictogram="umbrellaNew"
      title="C’è un problema temporaneo, riprova."
      subtitle={bodyPropsArray}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: () => navigation.goBack()
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.retry"),
        accessibilityLabel: I18n.t("global.buttons.retry"),
        onPress: () => navigation.goBack()
      }}
    />
  );
};

export { DSScreenOperationResult };
