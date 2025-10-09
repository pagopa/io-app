import { Body, FooterActions, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet.tsx";
import { openWebUrl } from "../../../../utils/url.ts";

type ItwEidFeedbackBottomSheetProps = {
  primaryAction?: () => void;
  secondaryAction?: () => void;
};

/**
 * Hook to open the feedback bottom sheet for the EID reissuance feature.
 * @param secondaryAction - Optional secondary action to be executed when the secondary button is pressed.
 */
export const useItwEidFeedbackBottomSheet = ({
  primaryAction,
  secondaryAction
}: ItwEidFeedbackBottomSheetProps = {}) => {
  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t("features.itWallet.feedback.reissuance.bottomSheet.title"),
    component: (
      <>
        <Body>
          {I18n.t("features.itWallet.feedback.reissuance.bottomSheet.content")}
        </Body>
        <VSpacer size={12} />
      </>
    ),
    footer: (
      <FooterActions
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t(
              "features.itWallet.feedback.reissuance.bottomSheet.primaryAction"
            ),
            onPress: () => {
              openWebUrl(
                "https://pagopa.qualtrics.com/jfe/form/SV_3JmGHi0IjGYESYC"
              );
              primaryAction?.();
              dismiss();
            }
          },
          secondary: {
            label: I18n.t(
              "features.itWallet.feedback.reissuance.bottomSheet.secondaryAction"
            ),
            onPress: () => {
              secondaryAction?.();
              dismiss();
            }
          }
        }}
      />
    )
  });

  return { bottomSheet, present, dismiss };
};
