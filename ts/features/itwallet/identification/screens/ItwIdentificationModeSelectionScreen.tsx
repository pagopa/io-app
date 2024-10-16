import {
  ContentWrapper,
  ListItemHeader,
  ModuleNavigation,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { cieFlowForDevServerEnabled } from "../../../cieLogin/utils";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import { itwIsCieSupportedSelector } from "../store/selectors";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../analytics";

export const ItwIdentificationModeSelectionScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const isCieSupportedPot = useIOSelector(itwIsCieSupportedSelector);

  const isCieSupported = React.useMemo(
    () => cieFlowForDevServerEnabled || pot.getOrElse(isCieSupportedPot, false),
    [isCieSupportedPot]
  );

  useFocusEffect(trackItWalletIDMethod);

  const handleSpidPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "spid" });
  };

  const handleCiePinPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "cie_pin" });
  };

  const handleCieIdPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "cieid" });
  };

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
        <VSpacer size={24} />
        <ItwMarkdown>
          {I18n.t("features.itWallet.identification.mode.privacy")}
        </ItwMarkdown>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
