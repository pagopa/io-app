import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import {
  ContentWrapper,
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
  isL3FeaturesEnabledSelector,
  selectIsLoading
} from "../../../machine/eid/selectors";
import SpidLogo from "../../../../../../img/features/itWallet/identification/spid_logo.svg";
import CiePin from "../../../../../../img/features/itWallet/identification/cie_pin.svg";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";

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
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
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
      section: I18n.t(`${baseTranslationPath}.section`)
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

  if (isLoading) {
    return (
      <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
    );
  }

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
        <VStack space={8}>
          {isCieAuthenticationSupported &&
            !isCiePinDisabled &&
            (isL3FeaturesEnabled || eidReissuing) && (
              <ModuleNavigationAlt
                title={I18n.t(`${baseTranslationPath}.method.ciePin.title`, {
                  defaultValue: ""
                })}
                subtitle={I18n.t(
                  `${baseTranslationPath}.method.ciePin.subtitle`
                )}
                testID="CiePin"
                image={<CiePin width={28} height={32} />}
                onPress={handleCiePinPress}
                badge={{
                  text: I18n.t(`${baseTranslationPath}.method.ciePin.badge`, {
                    defaultValue: ""
                  }),
                  variant: "highlight",
                  outline: false
                }}
              />
            )}
          {!isSpidDisabled && (
            <ModuleNavigationAlt
              title={I18n.t(
                "features.itWallet.identification.mode.l2.method.spid.title"
              )}
              subtitle={I18n.t(`${baseTranslationPath}.method.spid.subtitle`)}
              testID="Spid"
              image={<SpidLogo width={50} height={24} />}
              onPress={handleSpidPress}
            />
          )}

          {!isCieIdDisabled && (
            <ModuleNavigationAlt
              title={I18n.t(`${baseTranslationPath}.method.cieId.title`)}
              subtitle={I18n.t(`${baseTranslationPath}.method.cieId.subtitle`)}
              icon={"cie"}
              testID="CieID"
              onPress={handleCieIdPress}
            />
          )}
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
