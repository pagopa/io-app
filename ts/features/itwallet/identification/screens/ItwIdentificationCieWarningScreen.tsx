import { Linking } from "react-native";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent.tsx";
import I18n from "../../../../i18n.ts";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel.tsx";

export type CieWarningType = "noPin" | "noCie";

export type ItwIdentificationCieWarningScreenNavigationParams = {
  warning: CieWarningType;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_IDENTIFICATION_CIE_WARNING"
>;

export const ItwIdentificationCieWarningScreen = (params: ScreenProps) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const { warning } = params.route.params;

  const closeIdentification = () => {
    machineRef.send({ type: "close" });
  };

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      const primaryAction = {
        label: I18n.t(
          "features.itWallet.identification.cieWarning.primaryAction"
        ),
        onPress: () =>
          Linking.openURL(
            "https://www.cartaidentita.interno.gov.it/assistenza/"
          )
      };
      const closeAction = {
        label: I18n.t(
          "features.itWallet.identification.cieWarning.closeAction"
        ),
        onPress: closeIdentification
      };
      switch (warning) {
        case "noPin": {
          return {
            title: I18n.t(
              "features.itWallet.identification.cieWarning.noPin.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.identification.cieWarning.noPin.subtitle"
            ),
            pictogram: "attention",
            action: primaryAction,
            secondaryAction: closeAction
          };
        }
        case "noCie":
          return {
            title: I18n.t(
              "features.itWallet.identification.cieWarning.noCie.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.identification.cieWarning.noCie.subtitle"
            ),
            pictogram: "attention",
            action: primaryAction,
            secondaryAction: closeAction
          };
      }
    };

  useHeaderSecondLevel({
    title: ""
  });

  const resultScreenProps = getOperationResultScreenContentProps();

  return (
    <OperationResultScreenContent
      {...resultScreenProps}
      isHeaderVisible={true}
    />
  );
};
