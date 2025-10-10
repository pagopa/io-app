import { Body, IOButton, VStack } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet.tsx";
import { openWebUrl } from "../../../../utils/url.ts";

type ItwEidFeedbackBottomSheetProps = {
  primaryAction?: () => void;
  secondaryAction?: () => void;
};

/**
 * Hook to open the feedback bottom sheet for the EID reissuance feature.
 * @param primaryAction - Optional primary action to be executed when the primary button is pressed.
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
        <VStack space={24}>
          <Body>
            {I18n.t(
              "features.itWallet.feedback.reissuance.bottomSheet.content"
            )}
          </Body>
          <View style={{ marginBottom: 16 }}>
            <VStack space={16}>
              <IOButton
                variant="solid"
                fullWidth
                label={I18n.t(
                  "features.itWallet.feedback.reissuance.bottomSheet.primaryAction"
                )}
                onPress={() => {
                  openWebUrl(
                    "https://pagopa.qualtrics.com/jfe/form/SV_5bhV8w1e2ujl9xs"
                  );
                  primaryAction?.();
                  dismiss();
                }}
              />
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <IOButton
                  variant="link"
                  textAlign={"center"}
                  label={I18n.t(
                    "features.itWallet.feedback.reissuance.bottomSheet.secondaryAction"
                  )}
                  onPress={() => {
                    secondaryAction?.();
                    dismiss();
                  }}
                />
              </View>
            </VStack>
          </View>
        </VStack>
      </>
    )
  });

  return { bottomSheet, present, dismiss };
};
