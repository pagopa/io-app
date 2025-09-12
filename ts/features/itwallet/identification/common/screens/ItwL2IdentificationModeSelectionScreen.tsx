import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import {
  ContentWrapper,
  ListItemHeader,
  VStack,
  ModuleNavigationAlt
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../../analytics";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIOSelector } from "../../../../../store/hooks";
import { itwDisabledIdentificationMethodsSelector } from "../../../common/store/selectors/remoteConfig";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import {
  isCIEAuthenticationSupportedSelector,
  isL3FeaturesEnabledSelector
} from "../../../machine/eid/selectors";
import SpidLogo from "../../../../../../img/features/itWallet/spid-logo.svg";

export type ItwL2IdentificationNavigationParams = {
  eidReissuing?: boolean;
};

export type ItwL2IdentificationModeSelectionScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_IDENTIFICATION_MODE_SELECTION_L2"
  >;

export const ItwL2IdentificationModeSelectionScreen = (
  props: ItwL2IdentificationModeSelectionScreenProps
) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const { eidReissuing } = props.route.params;

  const baseTranslationPath = useMemo(
    () =>
      eidReissuing
        ? "features.itWallet.identification.mode.l2.reissuing"
        : "features.itWallet.identification.mode.l2",
    [eidReissuing]
  );

  const { title, description, section } = useMemo(
    () => ({
      title: I18n.t(`${baseTranslationPath}.title`),
      description: I18n.t(`${baseTranslationPath}.description`),
      section: I18n.t(`${baseTranslationPath}.section`, {
        defaultValue: ""
      })
    }),
    [baseTranslationPath]
  );

  useFocusEffect(
    useCallback(() => {
      if (eidReissuing) {
        machineRef.send({ type: "start", mode: "reissuance" });
      }
    }, [eidReissuing, machineRef])
  );

  useFocusEffect(
    useCallback(() => {
      trackItWalletIDMethod("L2");
    }, [])
  );

  const handleSpidPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "spid", itw_flow: "L2" });
  }, [machineRef]);

  const handleCiePinPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "ciePin", itw_flow: "L2" });
  }, [machineRef]);

  const handleCieIdPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "cieId", itw_flow: "L2" });
  }, [machineRef]);

  const disabledIdentificationMethods = useIOSelector(
    itwDisabledIdentificationMethodsSelector
  );
  const isCieAuthenticationSupported = ItwEidIssuanceMachineContext.useSelector(
    isCIEAuthenticationSupportedSelector
  );
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
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

  return (
    <IOScrollViewWithLargeHeader
      title={{
        section,
        label: title
      }}
      description={description}
      headerActionsProp={{ showHelp: true }}
    >
      <ContentWrapper>
        {!eidReissuing && (
          <ListItemHeader
            label={I18n.t("features.itWallet.identification.mode.l2.header")}
          />
        )}
        <VStack space={8} style={{ marginTop: eidReissuing ? 24 : 0 }}>
          {isCieAuthenticationSupported &&
            !isCiePinDisabled &&
            !isL3FeaturesEnabled && (
              <ModuleNavigationAlt
                title={I18n.t(
                  "features.itWallet.identification.mode.l2.method.ciePin.title"
                )}
                subtitle={I18n.t(
                  `${baseTranslationPath}.method.ciePin.subtitle`
                )}
                testID="CiePin"
                icon={eidReissuing ? "securityPad" : "fiscalCodeIndividual"}
                onPress={handleCiePinPress}
                badge={
                  eidReissuing
                    ? {
                        text: I18n.t(
                          "features.itWallet.identification.mode.l2.reissuing.method.ciePin.badge"
                        ),
                        variant: "highlight",
                        outline: false
                      }
                    : undefined
                }
              />
            )}
          {!isSpidDisabled && (
            <ModuleNavigationAlt
              title={I18n.t(
                "features.itWallet.identification.mode.l2.method.spid.title"
              )}
              subtitle={I18n.t(`${baseTranslationPath}.method.spid.subtitle`)}
              testID="Spid"
              {...(eidReissuing
                ? { image: <SpidLogo width={50} height={24} /> }
                : { icon: "spid" })}
              onPress={handleSpidPress}
            />
          )}

          {!isCieIdDisabled && (
            <ModuleNavigationAlt
              title={I18n.t(
                "features.itWallet.identification.mode.l2.method.cieId.title"
              )}
              subtitle={I18n.t(`${baseTranslationPath}.method.cieId.subtitle`)}
              icon={eidReissuing ? "cie" : "device"}
              testID="CieID"
              onPress={handleCieIdPress}
            />
          )}
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
