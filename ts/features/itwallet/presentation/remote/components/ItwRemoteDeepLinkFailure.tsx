import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ItwRemoteRequestPayload } from "../utils/itwRemoteTypeUtils.ts";
import {
  ZendeskSubcategoryValue,
  useItwFailureSupportModal
} from "../../../common/hooks/useItwFailureSupportModal.tsx";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import {
  ItwFailure,
  ItwFailureType
} from "../../../common/utils/ItwFailureTypes.ts";
import { trackItwRemoteDeepLinkFailure } from "../analytics";
import { trackItwKoStateAction } from "../../../analytics";

type Props = {
  /**
   * The validation error
   */
  failure: Error;
  /**
   * The original payload that caused the error
   */
  payload: Partial<ItwRemoteRequestPayload>;
};

/**
 * Component that renders an error message for an invalid deep link payload
 * and provides access to the support bottom sheet.
 */
export const ItwRemoteDeepLinkFailure = ({ failure, payload }: Props) => {
  const navigation = useIONavigation();

  useDebugInfo({
    failure,
    payload
  });

  const itwFailure: ItwFailure = {
    type: ItwFailureType.ITW_REMOTE_PAYLOAD_INVALID,
    reason: failure
  };

  const supportModal = useItwFailureSupportModal({
    failure: itwFailure,
    supportChatEnabled: true,
    zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_PRESENTAZIONE_REMOTA
  });

  const supportModalAction = {
    label: I18n.t("features.itWallet.support.button"),
    onPress: () => {
      trackItwKoStateAction({
        reason: failure,
        cta_category: "custom_1",
        cta_id: I18n.t("features.itWallet.support.button")
      });
      supportModal.present();
    }
  };

  trackItwRemoteDeepLinkFailure(failure);

  return (
    <>
      <OperationResultScreenContent
        title={I18n.t(
          "features.itWallet.presentation.remote.deepLinkValidationErrorScreen.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.presentation.remote.deepLinkValidationErrorScreen.subtitle"
        )}
        testID={"failure"}
        pictogram={"umbrella"}
        action={supportModalAction}
        secondaryAction={{
          label: I18n.t(
            "features.itWallet.presentation.remote.deepLinkValidationErrorScreen.secondaryAction"
          ),
          onPress: () => {
            trackItwKoStateAction({
              reason: failure,
              cta_category: "custom_2",
              cta_id: I18n.t(
                "features.itWallet.presentation.remote.deepLinkValidationErrorScreen.secondaryAction"
              )
            });
            navigation.popToTop();
          }
        }}
      />
      {supportModal.bottomSheet}
    </>
  );
};
