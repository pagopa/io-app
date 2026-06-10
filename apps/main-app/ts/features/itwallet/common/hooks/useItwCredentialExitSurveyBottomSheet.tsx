import { Body, IOButton, VStack } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import {
  trackItwSurveyRequest,
  trackItwSurveyRequestAccepted,
  trackItwSurveyRequestDeclined
} from "../../analytics";
import {
  MixPanelCredential,
  TrackQualtricsSurvey
} from "../../analytics/utils/types";
import { IT_WALLET_SURVEY_CREDENTIAL_EXIT } from "../utils/constants";

export type CredentialExitStep = "data_share" | "doc_preview";

/**
 * Module-level set: tracks which credentials have already shown the survey
 * this app session. Resets automatically when the app is killed and restarted.
 */
const credentialExitSurveyShownInSession = new Set<MixPanelCredential>();

type Props = {
  step: CredentialExitStep;
  credential: MixPanelCredential;
  /** Called after the bottom sheet is fully dismissed, regardless of user action. */
  onAfterDismiss: () => void;
};

/**
 * Shows a Qualtrics survey bottom sheet when the user exits a credential
 * issuance flow. The survey includes the step at which the user dropped off
 * and the credential being issued.
 *
 * The bottom sheet is shown at most once per credential per app session.
 * If already shown for this credential, `onAfterDismiss` is invoked immediately.
 */
export const useItwCredentialExitSurveyBottomSheet = ({
  step,
  credential,
  onAfterDismiss
}: Props) => {
  const { name: routeName } = useRoute();

  const skipDeclinedEvent = useRef(false);
  const onAfterDismissRef = useRef(onAfterDismiss);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    onAfterDismissRef.current = onAfterDismiss;
  }, [onAfterDismiss]);

  const surveyUrl = `${IT_WALLET_SURVEY_CREDENTIAL_EXIT}?step=${step}&credential=${credential}`;

  const trackingProps: TrackQualtricsSurvey = useMemo(
    () => ({
      survey_id: "itw_credential_exit",
      survey_page: routeName
    }),
    [routeName]
  );

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.feedback.credentialExit.bottomSheet.title"
    ),
    component: (
      <VStack space={24}>
        <Body>
          {I18n.t(
            "features.itWallet.feedback.credentialExit.bottomSheet.content"
          )}
        </Body>
        <View style={{ marginBottom: 16 }}>
          <VStack space={16}>
            <IOButton
              variant="solid"
              fullWidth
              label={I18n.t(
                "features.itWallet.feedback.credentialExit.bottomSheet.primaryAction"
              )}
              onPress={() => {
                // eslint-disable-next-line functional/immutable-data
                skipDeclinedEvent.current = true;
                trackItwSurveyRequestAccepted(trackingProps);
                openWebUrl(surveyUrl);
                dismiss();
              }}
            />
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <IOButton
                variant="link"
                textAlign="center"
                label={I18n.t(
                  "features.itWallet.feedback.credentialExit.bottomSheet.secondaryAction"
                )}
                onPress={() => dismiss()}
              />
            </View>
          </VStack>
        </View>
      </VStack>
    ),
    onDismiss: () => {
      if (!skipDeclinedEvent.current) {
        trackItwSurveyRequestDeclined(trackingProps);
      }
      // eslint-disable-next-line functional/immutable-data
      skipDeclinedEvent.current = false;
      onAfterDismissRef.current();
    }
  });

  const presentSurvey = useCallback(() => {
    if (credentialExitSurveyShownInSession.has(credential)) {
      onAfterDismissRef.current();
      return;
    }
     
    credentialExitSurveyShownInSession.add(credential);
    trackItwSurveyRequest(trackingProps);
    present();
  }, [credential, present, trackingProps]);

  return { bottomSheet, present: presentSurvey };
};
