import {
  Badge,
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
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import {
  trackItWalletIDMethod,
  trackItwUserWithoutL3Bottomsheet,
  trackItwUserWithoutL3Requirements
} from "../../../analytics";
import { itwDisabledIdentificationMethodsSelector } from "../../../common/store/selectors/remoteConfig";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectIsLoading,
  selectIssuanceLevel,
  selectIssuanceMode
} from "../../../machine/eid/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";

export type ItwIdentificationNavigationParams = {
  eidReissuing?: boolean;
};

export type ItwIdentificationModeSelectionScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_IDENTIFICATION_MODE_SELECTION"
  >;

const i18nNs = "features.itWallet.identification.modeSelection" as const;

export const ItwIdentificationModeSelectionScreen = (
  props: ItwIdentificationModeSelectionScreenProps
) => {
  const { eidReissuing } = props.route.params;
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const mode = ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);
  const isWalletAlreadyActivated = useIOSelector(itwLifecycleIsValidSelector);
  const { name: routeName } = useRoute();

  const disabledIdentificationMethods = useIOSelector(
    itwDisabledIdentificationMethodsSelector
  );

  const isCiePinDisabled = useMemo(
    () => disabledIdentificationMethods.includes("CiePin"),
    [disabledIdentificationMethods]
  );
  const isSpidDisabled = useMemo(
    () => disabledIdentificationMethods.includes("SPID") || isL3,
    [disabledIdentificationMethods, isL3]
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
        description: I18n.t(`${i18nNs}.description.reissuance`)
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
      if (eidReissuing) {
        machineRef.send({ type: "start", mode: "reissuance", level: "l2" });
      }
    }, [eidReissuing, machineRef])
  );

  useFocusEffect(
    useCallback(() => {
      trackItWalletIDMethod(isL3 ? "L3" : "L2");
    }, [isL3])
  );

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
        level: "l2-fallback"
      });
    }
  }, [isWalletAlreadyActivated, machineRef, routeName]);

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
        <VStack space={16}>
          {!isCiePinDisabled && <CiePinMethodModule />}
          {!isSpidDisabled && <SpidMethodModule />}
          {!isCieIdDisabled && <CieIdMethodModule />}
          {isL3 && !eidReissuing && (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <IOButton
                variant="link"
                textAlign="center"
                label={I18n.t(`${i18nNs}.noCieCta`)}
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

const CiePinMethodModule = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const level = ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);
  const mode = ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
  }, [machineRef]);

  const { title, subtitle } = useMemo(() => {
    if (level === "l2-plus") {
      return {
        title: I18n.t(`${i18nNs}.mode.ciePin.title`),
        subtitle: I18n.t(`${i18nNs}.mode.ciePin.subtitle.l2-plus`)
      };
    }

    return {
      title: I18n.t(`${i18nNs}.mode.ciePin.title`),
      subtitle: I18n.t(`${i18nNs}.mode.ciePin.subtitle.default`)
    };
  }, [level]);

  const badgeProps: Badge | undefined = useMemo(() => {
    if (level !== "l2" || mode !== "reissuance") {
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
    <ModuleNavigationAlt
      title={title}
      subtitle={subtitle}
      testID="CiePinMethodModuleTestID"
      image={<CiePin width={28} height={32} />}
      onPress={handleOnPress}
      badge={badgeProps}
    />
  );
};

const SpidMethodModule = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const level = ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
  }, [machineRef]);

  const { title, subtitle } = useMemo(() => {
    if (level === "l2-plus") {
      return {
        title: I18n.t(`${i18nNs}.mode.spid.title.l2-plus`),
        subtitle: I18n.t(`${i18nNs}.mode.spid.subtitle.l2-plus`)
      };
    }

    return {
      title: I18n.t(`${i18nNs}.mode.spid.title.default`),
      subtitle: I18n.t(`${i18nNs}.mode.spid.subtitle.default`)
    };
  }, [level]);

  return (
    <ModuleNavigationAlt
      title={title}
      subtitle={subtitle}
      testID="SpidMethodModuleTestID"
      icon="spid"
      onPress={handleOnPress}
    />
  );
};

const CieIdMethodModule = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const level = ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
  }, [machineRef]);

  const { title, subtitle } = useMemo(() => {
    if (level === "l2-plus") {
      return {
        title: I18n.t(`${i18nNs}.mode.cieId.title`),
        subtitle: I18n.t(`${i18nNs}.mode.cieId.subtitle.l2-plus`)
      };
    }

    return {
      title: I18n.t(`${i18nNs}.mode.cieId.title`),
      subtitle: I18n.t(`${i18nNs}.mode.cieId.subtitle.default`)
    };
  }, [level]);

  return (
    <ModuleNavigationAlt
      title={title}
      subtitle={subtitle}
      icon={"cie"}
      testID="CieIDMethodModuleTestID"
      onPress={handleOnPress}
    />
  );
};
