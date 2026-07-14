import {
  ContentWrapper,
  IOButton,
  ListItemHeader,
  VSpacer,
  VStack
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
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

  const { section, title, description } = useMemo(() => {
    if (isL3) {
      return {
        section: I18n.t(
          `features.itWallet.identification.modeSelection.section.l3-${isReissuanceMode ? "reissuance" : "issuance"}`
        ),
        title: I18n.t(
          `features.itWallet.identification.modeSelection.title.l3-${isReissuanceMode ? "reissuance" : "issuance"}`
        ),
        description: I18n.t(
          `features.itWallet.identification.modeSelection.description.l3-${isReissuanceMode ? "reissuance" : "issuance"}`
        )
      };
    } else {
      return {
        section: I18n.t(
          "features.itWallet.identification.modeSelection.section.l2"
        ),
        title: I18n.t(
          "features.itWallet.identification.modeSelection.title.l2"
        ),
        description: I18n.t(
          `features.itWallet.identification.modeSelection.description.l2-${isReissuanceMode ? "reissuance" : "issuance"}`
        )
      };
    }
  }, [isL3, isReissuanceMode]);

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
    customLabels: { body: "" },
    handleDismiss: () =>
      machineRef.send({ type: "close", surveyStep: "select_method" })
  });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
      <IOScrollViewWithLargeHeader
        title={{ section, label: title }}
        description={description}
        headerActionsProp={{ showHelp: true }}
        goBack={dismissalDialog.show}
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
                isL3={isL3}
                isReissuanceMode={isReissuanceMode}
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
    </LoadingSpinnerOverlay>
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
          {!isCieIdDisabled && <CieIdMethodModule isL3 isReissuanceMode />}
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
        <SpidMethodModule isL3 isReissuanceMode />
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
    {!isCieIdDisabled && (
      <CieIdMethodModule isL3={isL3} isReissuanceMode={isReissuanceMode} />
    )}
    {!isSpidDisabled && (
      <SpidMethodModule isL3={isL3} isReissuanceMode={isReissuanceMode} />
    )}
  </>
);

const styles = StyleSheet.create({
  noCieButtonContainer: {
    marginTop: 16,
    flexDirection: "row"
  }
});
