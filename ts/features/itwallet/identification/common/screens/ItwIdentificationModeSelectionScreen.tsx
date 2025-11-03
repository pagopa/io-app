import {
  ContentWrapper,
  IOButton,
  ModuleNavigationAlt,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import CiePin from "../../../../../../img/features/itWallet/identification/cie_pin.svg";
import SpidLogo from "../../../../../../img/features/itWallet/identification/spid_logo.svg";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { useIOSelector } from "../../../../../store/hooks";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected,
  trackItwUserWithoutL3Bottomsheet,
  trackItwUserWithoutL3Requirements
} from "../../../analytics";
import { itwDisabledIdentificationMethodsSelector } from "../../../common/store/selectors/remoteConfig";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  isCIEAuthenticationSupportedSelector,
  isL3FeaturesEnabledSelector,
  selectIsLoading
} from "../../../machine/eid/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";

export type ItwIdentificationNavigationParams = {
  eidReissuing?: boolean;
  animationEnabled?: boolean;
};

export type ItwIdentificationModeSelectionScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_IDENTIFICATION_MODE_SELECTION"
  >;

export const ItwIdentificationModeSelectionScreen = (
  props: ItwIdentificationModeSelectionScreenProps
) => {
  const { eidReissuing } = props.route.params;
  const navigation = useIONavigation();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const isWalletAlreadyActivated = useIOSelector(itwLifecycleIsValidSelector);
  const { name: routeName } = useRoute();

  const ns = useMemo(() => {
    if (isL3 && eidReissuing) {
      return "features.itWallet.identification.mode.l3.reissuing" as const;
    }
    if (isL3) {
      return "features.itWallet.identification.mode.l3" as const;
    }
    if (eidReissuing) {
      return "features.itWallet.identification.mode.l2.reissuing" as const;
    }
    return "features.itWallet.identification.mode.l2" as const;
  }, [eidReissuing, isL3]);

  const { title, description, section } = useMemo(
    () => ({
      title: I18n.t(`${ns}.title`),
      description: I18n.t(`${ns}.description`),
      section: I18n.t(`${ns}.section`)
    }),
    [ns]
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
      trackItWalletIDMethod(isL3 ? "L3" : "L2");
    }, [isL3])
  );

  const handleSpidPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
    trackItWalletIDMethodSelected({
      ITW_ID_method: "spid",
      itw_flow: isL3 ? "L3" : "L2"
    });
  }, [isL3, machineRef]);

  const handleCiePinPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
    trackItWalletIDMethodSelected({
      ITW_ID_method: "ciePin",
      itw_flow: isL3 ? "L3" : "L2"
    });
  }, [isL3, machineRef]);

  const handleCieIdPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
    trackItWalletIDMethodSelected({
      ITW_ID_method: "cieId",
      itw_flow: isL3 ? "L3" : "L2"
    });
  }, [isL3, machineRef]);

  const handleNoCiePress = useCallback(() => {
    if (isWalletAlreadyActivated) {
      trackItwUserWithoutL3Requirements({
        screen_name: routeName,
        reason: "user_without_cie",
        position: "screen"
      });
      // If the user is in the L3 upgrade flow, he cannot proceed without a CIE card
      machineRef.send({ type: "go-to-cie-warning", warning: "card" });
    } else {
      trackItwUserWithoutL3Bottomsheet();
      machineRef.send({
        type: "restart",
        mode: "issuance",
        isL2Fallback: true
      });
    }
  }, [isWalletAlreadyActivated, machineRef, routeName]);

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
    () => disabledIdentificationMethods.includes("SPID") || isL3FeaturesEnabled,
    [disabledIdentificationMethods, isL3FeaturesEnabled]
  );
  const isCieIdDisabled = useMemo(
    () => disabledIdentificationMethods.includes("CieID"),
    [disabledIdentificationMethods]
  );
  const isCiePinDisabled = useMemo(
    () => disabledIdentificationMethods.includes("CiePin"),
    [disabledIdentificationMethods]
  );

  const onConfirmPress = () => {
    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME,
            params: { requiredEidFeedback: true }
          }
        }
      ]
    });
  };

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      body: ""
    },
    handleDismiss: onConfirmPress
  });

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
      goBack={eidReissuing ? dismissalDialog.show : undefined}
    >
      <ContentWrapper>
        <VStack space={24}>
          <VStack space={8}>
            {!(!isCieAuthenticationSupported || isCiePinDisabled) && (
              <ModuleNavigationAlt
                title={I18n.t(`${ns}.method.ciePin.title`, {
                  defaultValue: ""
                })}
                subtitle={I18n.t(`${ns}.method.ciePin.subtitle`)}
                testID="CiePin"
                image={<CiePin width={28} height={32} />}
                onPress={handleCiePinPress}
                badge={
                  isL3 || eidReissuing
                    ? {
                        text: I18n.t(`${ns}.method.ciePin.badge`, {
                          defaultValue: ""
                        }),
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
                subtitle={I18n.t(`${ns}.method.spid.subtitle`)}
                testID="Spid"
                image={<SpidLogo width={50} height={24} />}
                onPress={handleSpidPress}
              />
            )}

            {!isCieIdDisabled && (
              <ModuleNavigationAlt
                title={I18n.t(`${ns}.method.cieId.title`)}
                subtitle={I18n.t(`${ns}.method.cieId.subtitle`)}
                icon={"cie"}
                testID="CieID"
                onPress={handleCieIdPress}
              />
            )}
          </VStack>
          {isL3 && !eidReissuing && (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <IOButton
                variant="link"
                textAlign="center"
                label={I18n.t("features.itWallet.identification.mode.l3.noCie")}
                onPress={handleNoCiePress}
                testID={"noCieButton"}
              />
            </View>
          )}
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
