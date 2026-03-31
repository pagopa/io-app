import {
  Badge,
  ContentWrapper,
  IOButton,
  ListItemHeader,
  ModuleNavigationAlt,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { trackItWalletIDMethodSelected } from "../../../analytics";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";
import { itwDisabledIdentificationMethodsSelector } from "../../../common/store/selectors/remoteConfig";
import { isL2Credential } from "../../../common/utils/itwCredentialUtils";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import { EidIssuanceLevel } from "../../../machine/eid/context";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectCredentialType,
  selectIsLoading,
  selectIssuanceLevel,
  selectIssuanceMode
} from "../../../machine/eid/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import {
  trackItWalletIDMethod,
  trackItwUserWithoutL3Requirements
} from "../../analytics";
import { useContinueWithBottomSheet } from "../hooks/useContinueWithBottomSheet";

export type ItwIdentificationNavigationParams = {
  eidReissuing?: boolean;
  level?: EidIssuanceLevel;
  credentialType?: string;
  animationEnabled?: boolean;
};

export type ItwIdentificationModeSelectionScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_IDENTIFICATION_MODE_SELECTION"
  >;

export const ItwIdentificationModeSelectionScreen = ({
  route
}: ItwIdentificationModeSelectionScreenProps) => {
  const { name: routeName, params } = route;

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const issuanceMode =
    ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const mode = ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);
  const level = ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);
  const isReissuanceMode = mode === "reissuance";
  const disabledIdentificationMethods = useIOSelector(
    itwDisabledIdentificationMethodsSelector
  );
  const isL2Active = useIOSelector(itwLifecycleIsValidSelector);
  const credentialType =
    ItwEidIssuanceMachineContext.useSelector(selectCredentialType);

  const isCiePinDisabled = useMemo(
    () =>
      disabledIdentificationMethods.includes("CiePin") ||
      level === "l2-fallback",
    [disabledIdentificationMethods, level]
  );
  const isSpidDisabled = useMemo(
    () => disabledIdentificationMethods.includes("SPID"),
    [disabledIdentificationMethods]
  );
  const isCieIdDisabled = useMemo(
    () => disabledIdentificationMethods.includes("CieID"),
    [disabledIdentificationMethods]
  );

  const featureName = useMemo(
    () => (isL3 ? "IT-Wallet" : "Documenti su IO"),
    [isL3]
  );

  const { section, title, description } = useMemo(() => {
    if (mode === "reissuance") {
      return {
        section: I18n.t(
          "features.itWallet.identification.modeSelection.section.reissuance"
        ),
        title: I18n.t(
          "features.itWallet.identification.modeSelection.title.reissuance"
        ),
        description: I18n.t(
          "features.itWallet.identification.modeSelection.description.reissuance",
          {
            feature: featureName
          }
        )
      };
    }

    return {
      section: I18n.t(
        "features.itWallet.identification.modeSelection.section.issuance",
        {
          feature: featureName
        }
      ),
      title: I18n.t(
        "features.itWallet.identification.modeSelection.title.issuance"
      ),
      description: I18n.t(
        "features.itWallet.identification.modeSelection.description.issuance",
        {
          feature: featureName
        }
      )
    };
  }, [mode, featureName]);

  useFocusEffect(
    useCallback(() => {
      if (params.eidReissuing && issuanceMode !== "reissuance") {
        machineRef.send({
          type: "start",
          mode: "reissuance",
          level: params.level || "l2",
          credentialType: params.credentialType
        });
      }
    }, [machineRef, params, issuanceMode])
  );

  useFocusEffect(
    useCallback(() => {
      trackItWalletIDMethod(isL3 ? "L3" : "L2");
    }, [isL3])
  );

  const handleNoCiePress = useCallback(() => {
    trackItwUserWithoutL3Requirements({
      screen_name: routeName,
      reason: "user_without_cie",
      position: "screen"
    });

    if (!isL2Active && isL2Credential(credentialType)) {
      machineRef.send({
        type: "restart",
        mode: "issuance",
        level: "l2-fallback",
        credentialType
      });
    } else {
      machineRef.send({ type: "go-to-cie-warning", warning: "card" });
    }
  }, [machineRef, routeName, credentialType, isL2Active]);

  const dismissalDialog = useItwDismissalDialog({
    enabled: params.eidReissuing,
    customLabels: {
      body: ""
    },
    handleDismiss: () => {
      machineRef.send({ type: "close" });
    }
  });

  if (isLoading) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  return (
    <IOScrollViewWithLargeHeader
      title={{
        section,
        label: title
      }}
      description={description}
      headerActionsProp={{ showHelp: true }}
      goBack={params.eidReissuing ? dismissalDialog.show : undefined}
    >
      <ContentWrapper>
        <VSpacer size={8} />
        <VStack space={16}>
          {isReissuanceMode && isL3 ? (
            <>
              {(!isCiePinDisabled || !isCieIdDisabled) && (
                <VStack space={8}>
                  <ListItemHeader
                    label={I18n.t(
                      "features.itWallet.identification.modeSelection.frequency.every12Months"
                    )}
                    endElement={{
                      type: "badge",
                      componentProps: {
                        text: I18n.t(
                          "features.itWallet.identification.modeSelection.mode.ciePin.reissuanceBadge"
                        ),
                        variant: "highlight",
                        outline: false,
                        testID: "CiePinReissuanceBadgeTestID"
                      }
                    }}
                  />
                  <VStack space={16}>
                    {!isCiePinDisabled && <CiePinMethodModule />}
                    {!isCieIdDisabled && <CieIdMethodModule />}
                  </VStack>
                </VStack>
              )}
              {!isSpidDisabled && (
                <VStack space={8}>
                  <ListItemHeader
                    label={I18n.t(
                      "features.itWallet.identification.modeSelection.frequency.every90Days"
                    )}
                  />
                  <SpidMethodModule />
                </VStack>
              )}
            </>
          ) : (
            <>
              {!isCiePinDisabled && <CiePinMethodModule />}
              {!isCieIdDisabled && <CieIdMethodModule />}
              {!isSpidDisabled && <SpidMethodModule />}
            </>
          )}
          {!isReissuanceMode && isL3 && (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <IOButton
                variant="link"
                textAlign="center"
                label={I18n.t(
                  "features.itWallet.identification.modeSelection.noCieCta"
                )}
                onPress={handleNoCiePress}
                testID={"noCieButtonTestID"}
              />
            </View>
          )}
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

const CiePinMethodModule = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const level = ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);
  const mode = ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);

  const isItw = level === "l3";
  const isReissuanceMode = mode === "reissuance";

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
  }, [machineRef]);

  const ciePinBottomSheet = useContinueWithBottomSheet({
    type: "ciePin",
    onPrimaryAction: handleOnPress,
    isL3: isItw
  });

  const badgeProps: Badge = {
    testID: "CiePinRecommendedBadgeTestID",
    text: I18n.t(
      "features.itWallet.identification.modeSelection.mode.ciePin.badge"
    ),
    variant: "highlight",
    outline: false
  };

  if (isItw) {
    return (
      <>
        <ModuleNavigationAlt
          testID="CiePinMethodModuleTestIDL3"
          title={I18n.t(
            "features.itWallet.identification.modeSelection.mode.ciePin.title"
          )}
          icon="fiscalCodeIndividual"
          onPress={() => {
            trackItWalletIDMethodSelected({
              ITW_ID_method: "ciePin",
              itw_flow: "L3"
            });
            ciePinBottomSheet.present();
          }}
        />
        {ciePinBottomSheet.bottomSheet}
      </>
    );
  }

  return (
    <ModuleNavigationAlt
      testID="CiePinMethodModuleTestIDL2"
      title={I18n.t(
        "features.itWallet.identification.modeSelection.mode.ciePin.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.identification.modeSelection.mode.ciePin.subtitle.default"
      )}
      icon="cieCard"
      onPress={handleOnPress}
      badge={isReissuanceMode ? badgeProps : undefined}
    />
  );
};

const SpidMethodModule = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const level = ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);

  const isItw = level === "l3";

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
  }, [machineRef]);

  const spidBottomSheet = useContinueWithBottomSheet({
    type: "spid",
    onPrimaryAction: handleOnPress,
    isL3: isItw
  });

  if (isItw) {
    return (
      <>
        <ModuleNavigationAlt
          testID="SpidMethodModuleTestIDL3"
          title={I18n.t(
            "features.itWallet.identification.modeSelection.mode.spid.title.l3"
          )}
          icon="spid"
          onPress={() => {
            trackItWalletIDMethodSelected({
              ITW_ID_method: "spid",
              itw_flow: "L3"
            });
            spidBottomSheet.present();
          }}
        />
        {spidBottomSheet.bottomSheet}
      </>
    );
  }
  return (
    <ModuleNavigationAlt
      testID="SpidMethodModuleTestIDL2"
      title={I18n.t(
        "features.itWallet.identification.modeSelection.mode.spid.title.default"
      )}
      subtitle={I18n.t(
        "features.itWallet.identification.modeSelection.mode.spid.subtitle.default"
      )}
      icon="spid"
      onPress={handleOnPress}
    />
  );
};

const CieIdMethodModule = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const level = ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);

  const isItw = level === "l3";

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
  }, [machineRef]);

  const cieIdBottomSheet = useContinueWithBottomSheet({
    type: "cieId",
    onPrimaryAction: handleOnPress,
    isL3: isItw
  });

  if (isItw) {
    return (
      <>
        <ModuleNavigationAlt
          testID="CieIDMethodModuleTestIDL3"
          title={I18n.t(
            "features.itWallet.identification.modeSelection.mode.cieId.title"
          )}
          icon={"cie"}
          onPress={() => {
            trackItWalletIDMethodSelected({
              ITW_ID_method: "cieId",
              itw_flow: "L3"
            });
            cieIdBottomSheet.present();
          }}
        />
        {cieIdBottomSheet.bottomSheet}
      </>
    );
  }

  return (
    <ModuleNavigationAlt
      testID="CieIDMethodModuleTestIDL2"
      title={I18n.t(
        "features.itWallet.identification.modeSelection.mode.cieId.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.identification.modeSelection.mode.cieId.subtitle.default"
      )}
      icon={"cie"}
      onPress={handleOnPress}
    />
  );
};
