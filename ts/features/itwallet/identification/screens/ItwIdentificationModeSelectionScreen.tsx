import {
  ListItemHeader,
  ModuleNavigation,
  VStack
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
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

export const ItwIdentificationModeSelectionScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isCieSupportedPot = useIOSelector(itwIsCieSupportedSelector);

  const isCieSupported = React.useMemo(
    () => cieFlowForDevServerEnabled || pot.getOrElse(isCieSupportedPot, false),
    [isCieSupportedPot]
  );
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useFocusEffect(trackItWalletIDMethod);

  const handleSpidPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "spid" });
  };

  const handleCiePinPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "ciePin" });
  };

  const handleCieIdPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "cieId" });
  };

  const bannerInfoSelector = useIOSelector(
    sectionStatusByKeySelector("favourite_language")
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
          {isCieSupported && (
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
        </VStack>
      </ItwScrollViewWithLargeHeader>
    </>
  );
};
