import {
  BodySmall,
  ContentWrapper,
  ForceScrollDownView,
  H2,
  HStack,
  Icon,
  IOMarkdownLite,
  useIOTheme,
  VStack
} from "@io-app/design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useCallback } from "react";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { identificationRequest } from "../../../identification/store/actions";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { isItwCredential } from "../../common/utils/itwCredentialUtils";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectCanRenderEidPreview,
  selectEidOption,
  selectIdentification,
  selectIsLoading
} from "../../machine/eid/selectors";
import {
  trackCredentialPreview,
  trackItwExit,
  trackItwRequestSuccess,
  trackSaveCredentialToWallet
} from "../analytics";
import { toItwIdMethod } from "../../analytics/utils/types";
import { ItwCredentialPreviewClaimsList } from "../components/ItwCredentialPreviewClaimsList";

export const ItwIssuanceEidPreviewScreen = () => {
  const eidOption = ItwEidIssuanceMachineContext.useSelector(selectEidOption);
  const canRenderEidPreview = ItwEidIssuanceMachineContext.useSelector(
    selectCanRenderEidPreview
  );

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  // If there is no eID in the context, the issuing phase is still ongoing.
  // Once the eID is assigned, wait for the identity-match check to finish before
  // rendering its details; otherwise the preview could flash before a mismatch failure.
  if (!canRenderEidPreview || O.isNone(eidOption)) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  return <ContentView eid={eidOption.value.metadata} />;
};

type ContentViewProps = {
  eid: CredentialMetadata;
};

/**
 * Renders the content of the screen if the PID is decoded.
 * @param eid - the decoded eID
 */
const ContentView = ({ eid }: ContentViewProps) => {
  const dispatch = useIODispatch();
  const route = useRoute();

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);

  const isL3 = isL3FeaturesEnabled && isItwCredential(eid);
  const mixPanelCredential = isL3 ? "ITW_PID" : "ITW_ID_V2";

  const theme = useIOTheme();

  useFocusEffect(
    useCallback(() => {
      trackCredentialPreview({
        credential: mixPanelCredential,
        credential_type: "unique"
      });
      if (identification) {
        trackItwRequestSuccess(
          toItwIdMethod(identification),
          identification.level,
          isL3 ? "L3" : "L2"
        );
      }
    }, [identification, mixPanelCredential, isL3])
  );

  useDebugInfo({
    parsedCredential: eid.parsedCredential
  });

  const customLabels = isL3
    ? {
        customLabels: {
          title: I18n.t(
            "features.itWallet.discovery.screen.itw.dismissalDialog.title"
          ),
          body: I18n.t(
            "features.itWallet.discovery.screen.itw.dismissalDialog.body"
          ),
          confirmLabel: I18n.t(
            "features.itWallet.discovery.screen.itw.dismissalDialog.confirm"
          ),
          cancelLabel: I18n.t(
            "features.itWallet.discovery.screen.itw.dismissalDialog.cancel"
          )
        }
      }
    : undefined;

  const dismissDialog = useItwDismissalDialog({
    ...customLabels,
    handleDismiss: () => {
      trackItwExit({ exit_page: route.name, credential: mixPanelCredential });
      machineRef.send({
        type: "close",
        surveyStep: isL3 ? "pid_preview" : undefined
      });
    }
  });

  const handleSaveToWallet = () => {
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: () =>
            machineRef.send({
              type: "add-to-wallet"
            })
        }
      )
    );
  };

  useHeaderSecondLevel({
    title: "",
    goBack: dismissDialog.show,
    supportRequest: true
  });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
      <ForceScrollDownView
        buttonAccessibilityLabel={I18n.t("global.accessibility.scrollToBottom")}
        contentContainerStyle={{ flexGrow: 1 }}
        footerActions={{
          actions: {
            type: "TwoButtons",
            primary: {
              label: I18n.t(
                "features.itWallet.issuance.eidPreview.actions.primary"
              ),
              onPress: () => {
                trackSaveCredentialToWallet(mixPanelCredential);
                handleSaveToWallet();
              }
            },
            secondary: {
              label: I18n.t(
                "features.itWallet.issuance.eidPreview.actions.secondary"
              ),
              onPress: dismissDialog.show
            }
          }
        }}
      >
        <ContentWrapper style={{ flexGrow: 1 }}>
          <VStack space={24}>
            <HStack space={8} style={{ alignItems: "center" }}>
              {!isL3 && (
                <Icon
                  name="legalValue"
                  color={theme["interactiveElem-default"]}
                />
              )}
              <H2>
                {isL3
                  ? I18n.t("features.itWallet.issuance.eidPreview.titleL3")
                  : I18n.t("features.itWallet.issuance.eidPreview.title")}
              </H2>
            </HStack>
            <IOMarkdownLite
              content={
                isL3
                  ? I18n.t("features.itWallet.issuance.eidPreview.subtitleL3")
                  : I18n.t("features.itWallet.issuance.eidPreview.subtitle")
              }
            />
            <ItwCredentialPreviewClaimsList
              data={eid}
              releaserVisible={false}
            />
            {isL3 && (
              <BodySmall>
                {I18n.t("features.itWallet.issuance.eidPreview.bottomTextL3")}
              </BodySmall>
            )}
          </VStack>
        </ContentWrapper>
      </ForceScrollDownView>
    </LoadingSpinnerOverlay>
  );
};
