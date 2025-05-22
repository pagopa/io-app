import {
  ContentWrapper,
  ForceScrollDownView,
  H2,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useMemo } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { identificationRequest } from "../../../identification/store/actions";
import { useIODispatch } from "../../../../store/hooks";
import { usePreventScreenCapture } from "../../../../utils/hooks/usePreventScreenCapture";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  CREDENTIALS_MAP,
  trackCredentialPreview,
  trackIssuanceCredentialScrollToBottom,
  trackItwExit,
  trackSaveCredentialToWallet
} from "../../analytics";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  selectCredentialOption,
  selectCredentialTypeOption
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwCredentialPreviewClaimsList } from "../components/ItwCredentialPreviewClaimsList";

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

  const mixPanelCredential = useMemo(
    () => CREDENTIALS_MAP[credentialType],
    [credentialType]
  );

  useFocusEffect(() => {
    trackCredentialPreview(mixPanelCredential);
  });
  const dismissDialog = useItwDismissalDialog({
    handleDismiss: () => {
      machineRef.send({ type: "close" });
      trackItwExit({ exit_page: route.name, credential: mixPanelCredential });
    }
  });

  const handleSaveToWallet = () => {
    trackSaveCredentialToWallet(credential.credentialType);
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
