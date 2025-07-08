import { Linking } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { CiePreparationType } from "../components/cie/ItwCiePreparationBaseScreenContent";
import { isL3FeaturesEnabledSelector } from "../../machine/eid/selectors";

export type ItwIdentificationCieWarningScreenNavigationParams = {
  type: CiePreparationType;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_IDENTIFICATION_CIE_WARNING"
>;

const cieFaqUrls: Record<CiePreparationType, string> = {
  pin: "https://assistenza.ioapp.it/hc/it/articles/30724125085713-Ho-dimenticato-il-PIN-della-CIE",
  // TODO: update the URL when the new one is available
  card: "https://assistenza.ioapp.it/hc/it/articles/30724116346129-Cos-%C3%A8-la-CIE-e-come-richiederla"
};

export const ItwIdentificationCieWarningScreen = (params: ScreenProps) => {
  const { type } = params.route.params;
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isWalletAlreadyActive = useIOSelector(itwLifecycleIsValidSelector);
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );

  const sectionKey =
    isWalletAlreadyActive || !isL3FeaturesEnabled ? "upgrade" : "issuance";

  const handlePrimaryActionPress = () => {
    if (isWalletAlreadyActive) {
      void Linking.openURL(cieFaqUrls[type]);
    } else {
      machineRef.send({ type: "go-to-l2-identification" });
    }
  };

  const handleSecondaryActionPress = () => {
    machineRef.send({
      type: isWalletAlreadyActive || !isL3FeaturesEnabled ? "close" : "back"
    });
  };

  useHeaderSecondLevel({
    title: ""
  });

  return (
    <OperationResultScreenContent
      title={I18n.t(
        `features.itWallet.identification.cie.warning.${type}.${sectionKey}.title`
      )}
      subtitle={I18n.t(
        `features.itWallet.identification.cie.warning.${type}.${sectionKey}.subtitle`
      )}
      pictogram={"attention"}
      action={{
        label: I18n.t(
          `features.itWallet.identification.cie.warning.${type}.${sectionKey}.primaryAction`
        ),
        onPress: handlePrimaryActionPress
      }}
      secondaryAction={{
        label: I18n.t(
          `features.itWallet.identification.cie.warning.${type}.${sectionKey}.secondaryAction`
        ),
        onPress: handleSecondaryActionPress
      }}
      isHeaderVisible={true}
    />
  );
};
