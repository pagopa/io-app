import {
  ContentWrapper,
  ForceScrollDownView,
  H2,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { usePreventScreenCapture } from "../../../../utils/hooks/usePreventScreenCapture";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { identificationRequest } from "../../../identification/store/actions";
import {
  trackCredentialPreview,
  trackIssuanceCredentialScrollToBottom,
  trackItwExit,
  trackSaveCredentialToWallet
} from "../analytics";
import { getMixPanelCredential } from "../../analytics/utils";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import {
  CredentialMetadata,
  isMultiLevelCredential
} from "../../common/utils/itwTypesUtils";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import { selectCredentialOption } from "../../machine/credential/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwCredentialPreviewClaimsList } from "../components/ItwCredentialPreviewClaimsList";

export const ItwIssuanceCredentialPreviewScreen = () => {
  const credentialOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialOption
  );

  usePreventScreenCapture();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    credentialOption,
    O.fold(
      // If there is no credential in the context (None), we can safely assume the issuing phase is still ongoing.
      // A None credential cannot be stored in the context, as any issuance failure causes the machine to transition
      // to the Failure state.
      () => (
        <LoadingScreenContent
          title={I18n.t("features.itWallet.issuance.credentialPreview.loading")}
        />
      ),
      credential => <ContentView credential={credential.metadata} />
    )
  );
};

type ContentViewProps = {
  credential: CredentialMetadata;
};

/**
 * Renders the content of the screen
 */
const ContentView = ({ credential }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const dispatch = useIODispatch();
  const route = useRoute();
  const isMultilevel = isMultiLevelCredential(credential);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const mixPanelCredential = useMemo(
    () => getMixPanelCredential(credential.credentialType, isItwL3),
    [credential, isItwL3]
  );

  useFocusEffect(
    useCallback(() => {
      trackCredentialPreview({
        credential: mixPanelCredential,
        credential_type: isMultilevel ? "multiple" : "unique"
      });
    }, [mixPanelCredential, isMultilevel])
  );

  const dismissDialog = useItwDismissalDialog({
    handleDismiss: () => {
      machineRef.send({ type: "close" });
      trackItwExit({ exit_page: route.name, credential: mixPanelCredential });
    }
  });

  const handleSaveToWallet = () => {
    trackSaveCredentialToWallet(mixPanelCredential);
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
          onSuccess: () => machineRef.send({ type: "add-to-wallet" })
        }
      )
    );
  };

  const trackScrollToBottom = (crossed: boolean) => {
    if (crossed) {
      trackIssuanceCredentialScrollToBottom(
        mixPanelCredential,
        ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW
      );
    }
  };

  useHeaderSecondLevel({
    title: "",
    goBack: dismissDialog.show
  });

  useDebugInfo({
    parsedCredential: credential.parsedCredential
  });

  return (
    <ForceScrollDownView
      contentContainerStyle={{ flexGrow: 1 }}
      onThresholdCrossed={trackScrollToBottom}
      footerActions={{
        actions: {
          type: "TwoButtons",
          primary: {
            icon: "add",
            iconPosition: "end",
            label: I18n.t(
              "features.itWallet.issuance.credentialPreview.actions.primary"
            ),
            onPress: handleSaveToWallet
          },
          secondary: {
            label: I18n.t(
              "features.itWallet.issuance.credentialPreview.actions.secondary"
            ),
            onPress: dismissDialog.show
          }
        }
      }}
    >
      <ContentWrapper style={{ flexGrow: 1 }}>
        <H2>
          {I18n.t("features.itWallet.issuance.credentialPreview.title", {
            credential: getCredentialNameFromType(credential.credentialType)
          })}
        </H2>
        <VSpacer size={24} />
        <ItwCredentialPreviewClaimsList data={credential} />
      </ContentWrapper>
    </ForceScrollDownView>
  );
};
