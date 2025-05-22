import { useMemo } from "react";
import {
  ContentWrapper,
  ListItemHeader,
  ModuleNavigation,
  VStack
} from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwDisabledIdentificationMethodsSelector } from "../../common/store/selectors/remoteConfig.ts";
import { ItwEidIssuanceMachineContext } from "../../machine/provider.tsx";
import { isCIEAuthenticationSupportedSelector } from "../../machine/eid/selectors.ts";
import { cieFlowForDevServerEnabled } from "../../../authentication/login/cie/utils";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader.tsx";
import I18n from "../../../../i18n.ts";

type DefaultIdentificationViewProps = {
  onSpidPress: () => void;
  onCiePinPress: () => void;
  onCieIdPress: () => void;
};

export const DefaultIdentificationView = ({
  onSpidPress,
  onCiePinPress,
  onCieIdPress
}: DefaultIdentificationViewProps) => {
  const disabledIdentificationMethods = useIOSelector(
    itwDisabledIdentificationMethodsSelector
  );
  const isCieAuthenticationSupported = ItwEidIssuanceMachineContext.useSelector(
    isCIEAuthenticationSupportedSelector
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
              onPress={onSpidPress}
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
              onPress={onCiePinPress}
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
              onPress={onCieIdPress}
            />
          )}
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
