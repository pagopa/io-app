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
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";
import { itwDisabledIdentificationMethodsSelector } from "../../../common/store/selectors/remoteConfig";
import { EidIssuanceLevel } from "../../../machine/eid/context";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectIsLoading,
  selectIssuanceLevel,
  selectIssuanceMode
} from "../../../machine/eid/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import {
  trackItWalletIDMethod,
  trackItwUserWithoutL3Bottomsheet,
  trackItwUserWithoutL3Requirements
} from "../../analytics";
import { useContinueWithBottomSheet } from "../hooks/useContinueWithBottomSheet";
import { isRestrictedCredential } from "../../../common/utils/itwCredentialUtils";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  itwCloseBanner,
  itwScheduleBanner
} from "../../../common/store/actions/banners";

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

const i18nNs = "features.itWallet.identification.modeSelection" as const;

export const ItwIdentificationModeSelectionScreen = ({
  route
}: ItwIdentificationModeSelectionScreenProps) => {
  const { name: routeName, params } = route;

  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
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
        section: I18n.t(`${i18nNs}.section.reissuance`),
        title: I18n.t(`${i18nNs}.title.reissuance`),
        description: I18n.t(`${i18nNs}.description.reissuance`, {
          feature: featureName
        })
      };
    }

    return {
      section: I18n.t(`${i18nNs}.section.issuance`, {
        feature: featureName
      }),
      title: I18n.t(`${i18nNs}.title.issuance`),
      description: I18n.t(`${i18nNs}.description.issuance`, {
        feature: featureName
      })
    };
  }, [mode, featureName]);

  useFocusEffect(
    useCallback(() => {
      if (params.eidReissuing) {
        machineRef.send({
          type: "start",
          mode: "reissuance",
          level: params.level || "l2",
          credentialType: params.credentialType
        });
      }
    }, [machineRef, params])
  );

  useFocusEffect(
    useCallback(() => {
      trackItWalletIDMethod(isL3 ? "L3" : "L2");
    }, [isL3])
  );

  const handleNoCiePress = useCallback(() => {
    if (mode === "upgrade") {
      trackItwUserWithoutL3Requirements({
        screen_name: routeName,
        reason: "user_without_cie",
        position: "screen"
      });
      // If the user is in the L3 upgrade flow, he cannot proceed without a CIE card
      machineRef.send({ type: "go-to-cie-warning", warning: "card" });
    } else {
      trackItwUserWithoutL3Bottomsheet();
      const canContinueWithDocIO = params.credentialType
        ? isRestrictedCredential(params.credentialType)
        : false;

      dispatch(itwCloseBanner("discovery_wallet"));
      dispatch(itwCloseBanner("discovery_messages_inbox"));
      dispatch(
        itwScheduleBanner({
          bannerId: "discovery_delayed",
          showFrom: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      );

      if (canContinueWithDocIO) {
        machineRef.send({
          type: "restart",
          mode: "issuance",
          level: "l2-fallback"
        });
      } else {
        navigation.replace(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.DISCOVERY.INFO,
          params: {
            error: "ko-no-cie"
          }
        });
      }
    }
  }, [mode, machineRef, routeName, dispatch, navigation, params]);

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
          {isReissuanceMode ? (
            <>
              {(!isCiePinDisabled || !isCieIdDisabled) && (
                <VStack space={8}>
                  <ListItemHeader
                    label={I18n.t(`${i18nNs}.frequency.every12Months`)}
                    endElement={{
                      type: "badge",
                      componentProps: {
                        text: I18n.t(`${i18nNs}.mode.ciePin.reissuanceBadge`),
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
                    label={I18n.t(`${i18nNs}.frequency.every90Days`)}
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
          {isL3 && !params.eidReissuing && (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <IOButton
                variant="link"
                textAlign="center"
                label={I18n.t(`${i18nNs}.noCieCta`)}
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
  const isL3 = level === "l3";

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
  }, [machineRef]);

  const ciePinBottomSheet = useContinueWithBottomSheet({
    type: "ciePin",
    onPrimaryAction: handleOnPress,
    isL3
  });

  const badgeProps: Badge | undefined = useMemo(() => {
    if (mode === "reissuance" || (level === "l2" && mode === "issuance")) {
      // Should not display the recommended badge for reissuance or L2 issuance
      return undefined;
    }

    return {
      text: I18n.t(`${i18nNs}.mode.ciePin.badge`),
      variant: "highlight",
      outline: false,
      testID: "CiePinRecommendedBadgeTestID"
    };
  }, [level, mode]);

  return (
    <>
      <ModuleNavigationAlt
        title={I18n.t(`${i18nNs}.mode.ciePin.title`)}
        subtitle={I18n.t(`${i18nNs}.mode.ciePin.subtitle`)}
        testID="CiePinMethodModuleTestID"
        icon="cieCard"
        onPress={() => {
          if (isL3) {
            ciePinBottomSheet.present();
          } else {
            handleOnPress();
          }
        }}
        badge={badgeProps}
      />
      {isL3 && ciePinBottomSheet.bottomSheet}
    </>
  );
};

const SpidMethodModule = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const level = ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);
  const isL3 = level === "l3";

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
  }, [machineRef]);

  const spidBottomSheet = useContinueWithBottomSheet({
    type: "spid",
    onPrimaryAction: handleOnPress,
    isL3
  });

  const { title, subtitle } = useMemo(() => {
    if (isL3) {
      return {
        title: I18n.t(`${i18nNs}.mode.spid.title.l3`),
        subtitle: I18n.t(`${i18nNs}.mode.spid.subtitle.l3`)
      };
    }

    return {
      title: I18n.t(`${i18nNs}.mode.spid.title.default`),
      subtitle: I18n.t(`${i18nNs}.mode.spid.subtitle.default`)
    };
  }, [isL3]);

  return (
    <>
      <ModuleNavigationAlt
        title={title}
        subtitle={subtitle}
        testID="SpidMethodModuleTestID"
        icon="spid"
        onPress={() => {
          if (isL3) {
            spidBottomSheet.present();
          } else {
            handleOnPress();
          }
        }}
      />
      {isL3 && spidBottomSheet.bottomSheet}
    </>
  );
};

const CieIdMethodModule = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const level = ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);
  const isL3 = level === "l3";

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
  }, [machineRef]);

  const cieIdBottomSheet = useContinueWithBottomSheet({
    type: "cieId",
    onPrimaryAction: handleOnPress,
    isL3
  });

  const { title, subtitle } = useMemo(() => {
    if (isL3) {
      return {
        title: I18n.t(`${i18nNs}.mode.cieId.title`),
        subtitle: I18n.t(`${i18nNs}.mode.cieId.subtitle.l3`)
      };
    }

    return {
      title: I18n.t(`${i18nNs}.mode.cieId.title`),
      subtitle: I18n.t(`${i18nNs}.mode.cieId.subtitle.default`)
    };
  }, [isL3]);

  return (
    <>
      <ModuleNavigationAlt
        title={title}
        subtitle={subtitle}
        icon={"cie"}
        testID="CieIDMethodModuleTestID"
        onPress={() => {
          if (isL3) {
            cieIdBottomSheet.present();
          } else {
            handleOnPress();
          }
        }}
      />
      {isL3 && cieIdBottomSheet.bottomSheet}
    </>
  );
};
