import {
  ContentWrapper,
  IOButton,
  ListItemHeader,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
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
import { trackItWalletIDMethod, trackItwUserWithoutCie } from "../../analytics";
import { CieIdMethodModule } from "../components/CieIdMethodModule";
import { CiePinMethodModule } from "../components/CiePinMethodModule";
import { SpidMethodModule } from "../components/SpidMethodModule";

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
  const mode = ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const isL3 = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const level = ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);
  const credentialType =
    ItwEidIssuanceMachineContext.useSelector(selectCredentialType);

  const disabledIdentificationMethods = useIOSelector(
    itwDisabledIdentificationMethodsSelector
  );
  const isL2Active = useIOSelector(itwLifecycleIsValidSelector);

  const isReissuanceMode = mode === "reissuance";

  const isCiePinDisabled =
    disabledIdentificationMethods.includes("CiePin") || level === "l2-fallback";
  const isSpidDisabled = disabledIdentificationMethods.includes("SPID");
  const isCieIdDisabled = disabledIdentificationMethods.includes("CieID");

  const featureName = isL3 ? "IT-Wallet" : "Documenti su IO";

  const { section, title, description } = useMemo(() => {
    if (isReissuanceMode) {
      return {
        section: I18n.t(
          "features.itWallet.identification.modeSelection.section.reissuance"
        ),
        title: I18n.t(
          "features.itWallet.identification.modeSelection.title.reissuance"
        ),
        description: I18n.t(
          "features.itWallet.identification.modeSelection.description.reissuance",
          { feature: featureName }
        )
      };
    }
    return {
      section: I18n.t(
        "features.itWallet.identification.modeSelection.section.issuance",
        { feature: featureName }
      ),
      title: I18n.t(
        "features.itWallet.identification.modeSelection.title.issuance"
      ),
      description: I18n.t(
        "features.itWallet.identification.modeSelection.description.issuance",
        { feature: featureName }
      )
    };
  }, [isReissuanceMode, featureName]);

  useFocusEffect(
    useCallback(() => {
      if (params.eidReissuing && mode !== "reissuance") {
        machineRef.send({
          type: "start",
          mode: "reissuance",
          level: params.level || "l2",
          credentialType: params.credentialType
        });
      }
    }, [machineRef, params, mode])
  );

  useFocusEffect(
    useCallback(() => {
      trackItWalletIDMethod(isL3 ? "L3" : "L2");
    }, [isL3])
  );

  const handleNoCiePress = useCallback(() => {
    trackItwUserWithoutCie();

    if (!isL2Active && isL2Credential(credentialType)) {
      machineRef.send({
        type: "restart",
        mode: "issuance",
        level: "l2-fallback",
        credentialType
      });
    } else {
      machineRef.send({
        type: "go-to-cie-warning",
        warning: "card",
        routeName
      });
    }
  }, [machineRef, routeName, credentialType, isL2Active]);

  const dismissalDialog = useItwDismissalDialog({
    enabled: params.eidReissuing,
    customLabels: { body: "" },
    handleDismiss: () => {
      machineRef.send({ type: "close" });
    }
  });

  if (isLoading) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  return (
    <IOScrollViewWithLargeHeader
      title={{ section, label: title }}
      description={description}
      headerActionsProp={{ showHelp: true }}
      goBack={params.eidReissuing ? dismissalDialog.show : undefined}
    >
      <ContentWrapper>
        <VSpacer size={8} />
        <VStack space={16}>
          {isReissuanceMode && isL3 ? (
            <GroupedMethodList
              isCiePinDisabled={isCiePinDisabled}
              isCieIdDisabled={isCieIdDisabled}
              isSpidDisabled={isSpidDisabled}
            />
          ) : (
            <DefaultMethodList
              isCiePinDisabled={isCiePinDisabled}
              isCieIdDisabled={isCieIdDisabled}
              isSpidDisabled={isSpidDisabled}
              isReissuanceMode={isReissuanceMode}
              isL3={isL3}
            />
          )}
          {!isReissuanceMode && isL3 && (
            <View style={styles.noCieButtonContainer}>
              <IOButton
                variant="link"
                textAlign="center"
                label={I18n.t(
                  "features.itWallet.identification.modeSelection.noCieCta"
                )}
                onPress={handleNoCiePress}
                testID="noCieButtonTestID"
              />
            </View>
          )}
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

type GroupedMethodListProps = {
  isCiePinDisabled: boolean;
  isCieIdDisabled: boolean;
  isSpidDisabled: boolean;
};

const GroupedMethodList = ({
  isCiePinDisabled,
  isCieIdDisabled,
  isSpidDisabled
}: GroupedMethodListProps) => (
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
          {!isCiePinDisabled && <CiePinMethodModule isL3 isReissuanceMode />}
          {!isCieIdDisabled && <CieIdMethodModule isL3 />}
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
        <SpidMethodModule isL3 />
      </VStack>
    )}
  </>
);

type DefaultMethodListProps = {
  isCiePinDisabled: boolean;
  isCieIdDisabled: boolean;
  isSpidDisabled: boolean;
  isL3: boolean;
  isReissuanceMode: boolean;
};

const DefaultMethodList = ({
  isCiePinDisabled,
  isCieIdDisabled,
  isSpidDisabled,
  isL3,
  isReissuanceMode
}: DefaultMethodListProps) => (
  <>
    {!isCiePinDisabled && (
      <CiePinMethodModule isL3={isL3} isReissuanceMode={isReissuanceMode} />
    )}
    {!isCieIdDisabled && <CieIdMethodModule isL3={isL3} />}
    {!isSpidDisabled && <SpidMethodModule isL3={isL3} />}
  </>
);

const styles = StyleSheet.create({
  noCieButtonContainer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center"
  }
});
