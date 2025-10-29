import { Body, IOButton, VStack } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet.tsx";
import { openWebUrl } from "../../../../utils/url.ts";
import { IT_WALLET_SURVEY_EID_REISSUANCE_FAILURE } from "../utils/constants.ts";

type ItwEidFeedbackBottomSheetProps = {
  additionalPrimaryAction?: () => void;
  additionalSecondaryAction?: () => void;
};

/**
 * Hook to open the feedback bottom sheet for the EID reissuance feature.
 * @param additionalPrimaryAction - Optional primary action to be executed when the primary button is pressed.
 * @param additionalSecondaryAction - Optional secondary action to be executed when the secondary button is pressed.
 */
export const useItwEidFeedbackBottomSheet = ({
  additionalPrimaryAction,
  additionalSecondaryAction
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
                  openWebUrl(IT_WALLET_SURVEY_EID_REISSUANCE_FAILURE);
                  additionalPrimaryAction?.();
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
                    additionalSecondaryAction?.();
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
