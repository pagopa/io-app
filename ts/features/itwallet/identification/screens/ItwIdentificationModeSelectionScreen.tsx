import {
  ListItemHeader,
  ModuleNavigation,
  VStack
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { cieFlowForDevServerEnabled } from "../../../cieLogin/utils";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { itwIsCieSupportedSelector } from "../store/selectors";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../analytics";
import { sectionStatusByKeySelector } from "../../../../store/reducers/backendStatus/sectionStatus";
import { useItwAlertWithStatusBar } from "../../common/hooks/useItwAlertWithStatusBar";
import { ItwScrollViewWithLargeHeader } from "../../common/components/ItwScrollViewWithLargeHeader";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { isItwDisabledIdentificationMethodsSelector } from "../../../../store/reducers/backendStatus/remoteConfig";

export const ItwIdentificationModeSelectionScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isCieSupportedPot = useIOSelector(itwIsCieSupportedSelector);
  const disabledIdentificationMethods = useIOSelector(
    isItwDisabledIdentificationMethodsSelector
  );
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

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
    () => cieFlowForDevServerEnabled || pot.getOrElse(isCieSupportedPot, false),
    [isCieSupportedPot]
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

  const bannerInfoSelector = useIOSelector(
    sectionStatusByKeySelector("itw_identification")
  );

  const title = I18n.t("features.itWallet.identification.mode.title");
  const { alertProps, statusBar } =
    useItwAlertWithStatusBar(bannerInfoSelector);

  useHeaderSecondLevel({
    title,
    supportRequest: true,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    alert: alertProps
  });

  return (
    <>
      {statusBar}
      <ItwScrollViewWithLargeHeader
        title={title}
        description={I18n.t(
          "features.itWallet.identification.mode.description"
        )}
        animatedRef={animatedScrollViewRef}
      >
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
              onPress={handleCieIdPress}
            />
          )}
        </VStack>
      </ItwScrollViewWithLargeHeader>
    </>
  );
};
