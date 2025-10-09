import {
  ContentWrapper,
  ForceScrollDownView,
  H2,
  IOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback, useMemo } from "react";
import I18n from "i18next";
import { Linking } from "react-native";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { identificationRequest } from "../../../identification/store/actions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { usePreventScreenCapture } from "../../../../utils/hooks/usePreventScreenCapture";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  getMixPanelCredential,
  trackCredentialPreview,
  trackIssuanceCredentialScrollToBottom,
  trackItwExit,
  trackSaveCredentialToWallet
} from "../../analytics";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import {
  isMultiLevelCredential,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import {
  selectCredentialOption,
  selectCredentialTypeOption
} from "../../machine/credential/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwCredentialPreviewClaimsList } from "../components/ItwCredentialPreviewClaimsList";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider.tsx";
import { selectIssuanceMode } from "../../machine/eid/selectors.ts";

export const ItwIssuanceCredentialPreviewScreen = () => {
  const credentialTypeOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );
  const credentialOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialOption
  );

  usePreventScreenCapture();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    sequenceS(O.Monad)({
      credentialType: credentialTypeOption,
      credential: credentialOption
    }),
    O.fold(
      // If there is no credential in the context (None), we can safely assume the issuing phase is still ongoing.
      // A None credential cannot be stored in the context, as any issuance failure causes the machine to transition
      // to the Failure state.
      () => (
        <LoadingScreenContent
          contentTitle={I18n.t(
            "features.itWallet.issuance.credentialPreview.loading"
          )}
        />
      ),
      props => <ContentView {...props} />
    )
  );
};

type ContentViewProps = {
  credentialType: string;
  credential: StoredCredential;
};

/**
 * Renders the content of the screen
 */
const ContentView = ({ credentialType, credential }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const dispatch = useIODispatch();
  const route = useRoute();
  const isMultilevel = isMultiLevelCredential(credential);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const issuanceMode =
    ItwEidIssuanceMachineContext.useSelector(selectIssuanceMode);
  const mixPanelCredential = useMemo(
    () => getMixPanelCredential(credentialType, isItwL3),
    [credentialType, isItwL3]
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
      if (issuanceMode === "reissuance") {
        Linking.openURL(
          "https://pagopa.qualtrics.com/jfe/form/SV_3JmGHi0IjGYESYC"
        ).catch(() => IOToast.error("global.genericError"));
      }
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
            credential: getCredentialNameFromType(credentialType)
          })}
        </H2>
        <VSpacer size={24} />
        <ItwCredentialPreviewClaimsList data={credential} />
      </ContentWrapper>
    </ForceScrollDownView>
  );
};
