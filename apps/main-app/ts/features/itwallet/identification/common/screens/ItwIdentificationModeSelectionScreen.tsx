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
import { itwHasNfcFeatureSelector } from "../store/selectors";

export type ItwIdentificationModeSelectionScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_IDENTIFICATION_MODE_SELECTION"
  >;

export type ItwIdentificationNavigationParams = {
  animationEnabled?: boolean;
  credentialType?: string;
  eidReissuing?: boolean;
  level?: EidIssuanceLevel;
};

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
  const hasNfcFeature = useIOSelector(itwHasNfcFeatureSelector);
  const isL2Active = useIOSelector(itwLifecycleIsValidSelector);

  const isReissuanceMode = mode === "reissuance";

  const isCiePinDisabled =
    disabledIdentificationMethods.includes("CiePin") ||
    level === "l2-fallback" ||
    !hasNfcFeature;
  const isSpidDisabled = disabledIdentificationMethods.includes("SPID");
  const isCieIdDisabled = disabledIdentificationMethods.includes("CieID");

  const { section, title, description } = useMemo(() => {
    if (isL3) {
      return {
        section: I18n.t(
          isReissuanceMode
            ? "features.itWallet.identification.modeSelection.section.l3-reissuance"
            : "features.itWallet.identification.modeSelection.section.l3-issuance"
        ),
        title: I18n.t(
          isReissuanceMode
            ? "features.itWallet.identification.modeSelection.title.l3-reissuance"
            : "features.itWallet.identification.modeSelection.title.l3-issuance"
        ),
        description: I18n.t(
          isReissuanceMode
            ? "features.itWallet.identification.modeSelection.description.l3-reissuance"
            : "features.itWallet.identification.modeSelection.description.l3-issuance"
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
          isReissuanceMode
            ? "features.itWallet.identification.modeSelection.description.l2-reissuance"
            : "features.itWallet.identification.modeSelection.description.l2-issuance"
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
        description={description}
        goBack={dismissalDialog.show}
        headerActionsProp={{ showHelp: true }}
        title={{ section, label: title }}
      >
        <ContentWrapper>
          <VSpacer size={8} />
          <VStack space={16}>
            {isReissuanceMode && isL3 ? (
              <GroupedMethodList
                isCieIdDisabled={isCieIdDisabled}
                isCiePinDisabled={isCiePinDisabled}
                isSpidDisabled={isSpidDisabled}
              />
            ) : (
              <DefaultMethodList
                isCieIdDisabled={isCieIdDisabled}
                isCiePinDisabled={isCiePinDisabled}
                isL3={isL3}
                isReissuanceMode={isReissuanceMode}
                isSpidDisabled={isSpidDisabled}
              />
            )}
            {!isReissuanceMode && isL3 && (
              <View style={styles.noCieButtonContainer}>
                <IOButton
                  label={I18n.t(
                    "features.itWallet.identification.modeSelection.noCieCta"
                  )}
                  onPress={handleNoCiePress}
                  testID="noCieButtonTestID"
                  textAlign="center"
                  variant="link"
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
  isCieIdDisabled: boolean;
  isCiePinDisabled: boolean;
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
          label={I18n.t(
            "features.itWallet.identification.modeSelection.frequency.every12Months"
          )}
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
  isCieIdDisabled: boolean;
  isCiePinDisabled: boolean;
  isL3: boolean;
  isReissuanceMode: boolean;
  isSpidDisabled: boolean;
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
