import { BodyProps } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { useItwEidFeedbackBottomSheet } from "../../../common/hooks/useItwEidFeedbackBottomSheet.tsx";
import { trackItwSurveyRequest } from "../../../analytics";
import { trackItwEidReissuingMandatory } from "../analytics";
import { ItwEidReissuingTrigger } from "../../../analytics/utils/analyticsTypes";

export const ItwPresentationEidVerificationExpiredScreen = () => {
  const navigation = useIONavigation();
  const { name: routeName } = useRoute();

  /**
   * Fallback navigation action to main wallet home screen.
   */
  const fallbackNavigationAction = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  const eidFeedbackBottomSheet = useItwEidFeedbackBottomSheet({
    onPrimaryAction: fallbackNavigationAction,
    onSecondaryAction: fallbackNavigationAction
  });
  const startEidReissuing = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: {
        eidReissuing: true
      }
    });
  };

  useFocusEffect(
    useCallback(() => {
      trackItwEidReissuingMandatory(ItwEidReissuingTrigger.ADD_CREDENTIAL);
    }, [])
  );

  const bodyPropsArray: Array<BodyProps> = [
    {
      text: I18n.t(
        "features.itWallet.presentation.eid.verificationExpired.contentStart"
      ),
      style: {
        textAlign: "center"
      }
    },
    {
      text: I18n.t(
        "features.itWallet.presentation.eid.verificationExpired.contentBold"
      ),
      weight: "Semibold",
      style: {
        textAlign: "center"
      }
    },
    {
      text: I18n.t(
        "features.itWallet.presentation.eid.verificationExpired.contentEnd"
      ),
      style: {
        textAlign: "center"
      }
    }
  ];

  return (
    <>
      <OperationResultScreenContent
        pictogram="identityRefresh"
        title={I18n.t(
          "features.itWallet.presentation.eid.verificationExpired.title"
        )}
        subtitle={bodyPropsArray}
        action={{
          label: I18n.t(
            "features.itWallet.presentation.eid.verificationExpired.primaryAction"
          ),
          onPress: startEidReissuing
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.cancel"),
          onPress: () => {
            trackItwSurveyRequest({
              survey_id: "confirm_eid_flow_exit",
              survey_page: routeName
            });
            eidFeedbackBottomSheet.present();
          }
        }}
      />
      {eidFeedbackBottomSheet.bottomSheet}
    </>
  );
};
