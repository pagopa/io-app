import { Body, IOButton, VStack } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
import { useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import {
  trackItwSurveyRequest,
  trackItwSurveyRequestAccepted,
  trackItwSurveyRequestDeclined
} from "../../analytics";
import { TrackQualtricsSurvey } from "../../analytics/utils/types";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { IT_WALLET_SURVEY_EID_ACTIVATION_EXIT } from "../utils/constants";

export type EidActivationExitStep =
  | "disambiguation"
  | "intro"
  | "select_method"
  | "cie_preparation"
  | "pid_preview";

/**
 * Module-level flag: the survey is shown at most once per app session.
 * Resets automatically when the app is killed and restarted.
 * Using a const object to comply with functional/no-let rules.
 */
const eidActivationExitSession = { shown: false };

type Props = {
  step?: EidActivationExitStep;
};

/**
 * Shows a Qualtrics survey bottom sheet when the user exits the EID
 * activation flow. The survey includes the step at which the user dropped off
 * and the current Documenti su IO status.
 *
 * The bottom sheet is shown at most once per app session. If already shown,
 * `onAfterDismiss` is invoked immediately.
 */
export const useItwActivationExitSurveyBottomSheet = ({
  step = "intro"
}: Props = {}) => {
  const { name: routeName } = useRoute();
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const docStatus = isWalletValid ? "active" : "not_active";

  const skipDeclinedEvent = useRef(false);

  const surveyUrl = `${IT_WALLET_SURVEY_EID_ACTIVATION_EXIT}?step=${step}&doc_status=${docStatus}`;

  const trackingProps: TrackQualtricsSurvey = useMemo(
    () => ({
      survey_id: "itw_eid_activation_exit",
      survey_page: routeName
    }),
    [routeName]
  );

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.feedback.eidActivationExit.bottomSheet.title"
    ),
    component: (
      <VStack space={24}>
        <Body>
          {I18n.t(
            "features.itWallet.feedback.eidActivationExit.bottomSheet.content"
          )}
        </Body>
        <View style={{ marginBottom: 16 }}>
          <VStack space={16}>
            <IOButton
              variant="solid"
              fullWidth
              label={I18n.t(
                "features.itWallet.feedback.eidActivationExit.bottomSheet.primaryAction"
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
                  "features.itWallet.feedback.eidActivationExit.bottomSheet.secondaryAction"
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
    }
  });

  const presentSurvey = useCallback(() => {
    if (eidActivationExitSession.shown) {
      return;
    }
    // eslint-disable-next-line functional/immutable-data
    eidActivationExitSession.shown = true;
    trackItwSurveyRequest(trackingProps);
    present();
  }, [present, trackingProps]);

  return { bottomSheet, present: presentSurvey };
};
