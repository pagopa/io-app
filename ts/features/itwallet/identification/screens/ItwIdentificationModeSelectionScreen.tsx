import {
  ContentWrapper,
  ListItemHeader,
  ModuleNavigation,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { isCieSupportedSelector } from "../../../../store/reducers/cie";
import { cieFlowForDevServerEnabled } from "../../../cieLogin/utils";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import ItwMarkdown from "../../common/components/ItwMarkdown";

export const ItwIdentificationModeSelectionScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const isCieSupportedPot = useIOSelector(isCieSupportedSelector);

  const isCieSupported = React.useMemo(
    () => cieFlowForDevServerEnabled || pot.getOrElse(isCieSupportedPot, false),
    [isCieSupportedPot]
  );

  const handleSpidPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
  };

  const handleCiePinPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
  };

  const handleCieIdPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: I18n.t("features.itWallet.identification.mode.title") }}
      description={I18n.t("features.itWallet.identification.mode.description")}
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
