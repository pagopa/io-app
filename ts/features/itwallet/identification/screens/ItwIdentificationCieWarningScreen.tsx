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
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { useIOSelector } from "../../../../store/hooks.ts";
import { TranslationKeys } from "../../../../../locales/locales.ts";

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
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);

  const sectionKey = isItwValid ? "toCieFAQ" : "toL2Identification";

  const t = (key: "title" | "subtitle" | "primaryAction" | "closeAction") =>
    I18n.t(
      `features.itWallet.identification.cieWarning.${warning}.${sectionKey}.${key}` as TranslationKeys
    );

  const closeIdentification = () => {
    machineRef.send({ type: "close" });
  };

  const goToL2Identification = () => {
    machineRef.send({ type: "go-to-l2-identification" });
  };

  const cieFaqUrls: Record<CieWarningType, string> = {
    noPin:
      "https://assistenza.ioapp.it/hc/it/articles/30724125085713-Ho-dimenticato-il-PIN-della-CIE",
    // TODO: update the URL when the new one is available
    noCie:
      "https://assistenza.ioapp.it/hc/it/articles/30724116346129-Cos-%C3%A8-la-CIE-e-come-richiederla"
  };

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      const primaryAction = {
        label: t("primaryAction"),
        onPress: isItwValid
          ? () => Linking.openURL(cieFaqUrls[warning])
          : goToL2Identification
      };

      const secondaryAction = {
        label: t("closeAction"),
        onPress: closeIdentification
      };

      return {
        title: t("title"),
        subtitle: t("subtitle"),
        pictogram: "attention",
        action: primaryAction,
        secondaryAction
      };
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
