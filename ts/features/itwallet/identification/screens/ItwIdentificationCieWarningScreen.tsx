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
      const closeAction = {
        label: I18n.t(
          "features.itWallet.identification.cieWarning.closeAction"
        ),
        onPress: closeIdentification
      };
      switch (warning) {
        case "noPin": {
          const primaryAction = {
            label: I18n.t(
              "features.itWallet.identification.cieWarning.primaryAction"
            ),
            onPress: () =>
              Linking.openURL(
                "https://assistenza.ioapp.it/hc/it/articles/30724125085713-Ho-dimenticato-il-PIN-della-CIE"
              )
          };
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
        case "noCie": {
          // TODO: update the URL when the new one is available
          const primaryAction = {
            label: I18n.t(
              "features.itWallet.identification.cieWarning.primaryAction"
            ),
            onPress: () =>
              Linking.openURL(
                "https://www.cartaidentita.interno.gov.it/assistenza/"
              )
          };
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
