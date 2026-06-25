import { Alert, Body, IOButton, VStack } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";

import { useIODispatch, useIOSelector } from "../../../../store/hooks.ts";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet.tsx";
import { itwResetEnv } from "../store/actions/environment.ts";
import { selectItwEnv } from "../store/selectors/environment.ts";

/**
 * Shows an Alert if the environment is set to "pre", which informs the user about
 * the risks of using the test environment.
 * The Alert contains a bottom sheet with more information and a button to reset the environment.
 * @returns The Alert component if the environment is set to "pre", otherwise null.
 */
export const ItwEnvironmentAlert = () => {
  const dispatch = useIODispatch();
  const env = useIOSelector(selectItwEnv);

  const infoModal = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.playgrounds.environment.bottom_sheet.title"
    ),
    component: (
      <VStack space={24}>
        <Body>
          {I18n.t(
            "features.itWallet.playgrounds.environment.bottom_sheet.content"
          )}
        </Body>
        <IOButton
          label={I18n.t(
            "features.itWallet.playgrounds.environment.bottom_sheet.action"
          )}
          onPress={() => {
            dispatch(itwResetEnv());
            infoModal.dismiss();
          }}
          variant="solid"
        />
      </VStack>
    )
  });

  if (env !== "pre") {
    return null;
  }

  return (
    <View style={{ marginVertical: 8 }}>
      <Alert
        action={I18n.t(
          "features.itWallet.playgrounds.environment.banner.action"
        )}
        content={I18n.t(
          "features.itWallet.playgrounds.environment.banner.content"
        )}
        onPress={infoModal.present}
        testID="itwEnvironmentAlertTestID"
        variant="warning"
      />
      {infoModal.bottomSheet}
    </View>
  );
};
