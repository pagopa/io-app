import { Alert, Body, IOButton, VStack } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions/index";
import { itwSetEnv } from "../store/actions/environment.ts";
import { selectItwEnv } from "../store/selectors/environment.ts";

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
          variant="solid"
          label={I18n.t(
            "features.itWallet.playgrounds.environment.bottom_sheet.action"
          )}
          onPress={() => {
            dispatch(itwSetEnv("prod"));
            dispatch(itwLifecycleStoresReset());
            infoModal.dismiss();
          }}
        />
      </VStack>
    )
  });

  if (env !== "pre") {
    return null;
  }

  return (
    <>
      <Alert
        testID="itwEnvironmentAlertTestID"
        variant="warning"
        content={I18n.t(
          "features.itWallet.playgrounds.environment.banner.content"
        )}
        action={I18n.t(
          "features.itWallet.playgrounds.environment.banner.action"
        )}
        onPress={infoModal.present}
      />
      {infoModal.bottomSheet}
    </>
  );
};
