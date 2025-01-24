import {
  ContentWrapper,
  ListItemHeader,
  ModuleNavigation,
  VStack
} from "@pagopa/io-app-design-system";
import { useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { cieFlowForDevServerEnabled } from "../../../cieLogin/utils";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../analytics";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { isCIEAuthenticationSupportedSelector } from "../../machine/eid/selectors";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { itwDisabledIdentificationMethodsSelector } from "../../common/store/selectors/remoteConfig";

export type ItwIdentificationModeSelectionScreenNavigationParams = {
  eidReissuing?: boolean;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_IDENTIFICATION_MODE_SELECTION"
>;

export const ItwIdentificationModeSelectionScreen = (params: ScreenProps) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isCieAuthenticationSupported = ItwEidIssuanceMachineContext.useSelector(
    isCIEAuthenticationSupportedSelector
  );
  const disabledIdentificationMethods = useIOSelector(
    itwDisabledIdentificationMethodsSelector
  );

  const isSpidDisabled = useMemo(
    () => disabledIdentificationMethods.includes("SPID"),
    [disabledIdentificationMethods]
  );
  const isCieIdDisabled = useMemo(
    () => disabledIdentificationMethods.includes("CieID"),
    [disabledIdentificationMethods]
  );
  const isCiePinDisabled = useMemo(
    () => disabledIdentificationMethods.includes("CiePin"),
    [disabledIdentificationMethods]
  );

  const isCieSupported = useMemo(
    () => cieFlowForDevServerEnabled || isCieAuthenticationSupported,
    [isCieAuthenticationSupported]
  );

  const { eidReissuing } = params.route.params;

  useFocusEffect(
    useCallback(() => {
      if (eidReissuing) {
        machineRef.send({ type: "start-reissuing" });
      }
    }, [eidReissuing, machineRef])
  );

  useFocusEffect(trackItWalletIDMethod);

  const handleSpidPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "spid" });
  }, [machineRef]);

  const handleCiePinPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "ciePin" });
  }, [machineRef]);

  const handleCieIdPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "cieId" });
  }, [machineRef]);

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: I18n.t("features.itWallet.identification.mode.title") }}
      description={I18n.t("features.itWallet.identification.mode.description")}
      headerActionsProp={{ showHelp: true }}
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("features.itWallet.identification.mode.header")}
        />
        <VStack space={8}>
          {!isSpidDisabled && (
            <ModuleNavigation
              title={I18n.t(
                "features.itWallet.identification.mode.method.spid.title"
              )}
              subtitle={I18n.t(
                "features.itWallet.identification.mode.method.spid.subtitle"
              )}
              testID="Spid"
              icon="spid"
              onPress={handleSpidPress}
            />
          )}
          {isCieSupported && !isCiePinDisabled && (
            <ModuleNavigation
              title={I18n.t(
                "features.itWallet.identification.mode.method.ciePin.title"
              )}
              subtitle={I18n.t(
                "features.itWallet.identification.mode.method.ciePin.subtitle"
              )}
              testID="CiePin"
              icon="fiscalCodeIndividual"
              onPress={handleCiePinPress}
            />
          )}
          {!isCieIdDisabled && (
            <ModuleNavigation
              title={I18n.t(
                "features.itWallet.identification.mode.method.cieId.title"
              )}
              subtitle={I18n.t(
                "features.itWallet.identification.mode.method.cieId.subtitle"
              )}
              icon="device"
              testID="CieID"
              onPress={handleCieIdPress}
            />
          )}
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
