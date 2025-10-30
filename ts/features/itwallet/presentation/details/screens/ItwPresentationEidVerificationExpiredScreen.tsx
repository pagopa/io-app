import { BodyProps } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { useItwEidFeedbackBottomSheet } from "../../../common/hooks/useItwEidFeedbackBottomSheet.tsx";

export const ItwPresentationEidVerificationExpiredScreen = () => {
  const navigation = useIONavigation();

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
          onPress: () => eidFeedbackBottomSheet.present()
        }}
      />
      {eidFeedbackBottomSheet.bottomSheet}
    </>
  );
};
