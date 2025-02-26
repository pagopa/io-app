import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import I18n from "../../../../../i18n.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ItwRemoteRequestPayload } from "../Utils/itwRemoteTypeUtils.ts";
import {
  ZendeskSubcategoryValue,
  useItwFailureSupportModal
} from "../../../common/hooks/useItwFailureSupportModal.tsx";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import {
  ItwFailure,
  ItwFailureType
} from "../../../common/utils/ItwFailureTypes.ts";

type Props = {
  payload: Partial<ItwRemoteRequestPayload>;
};
/**
 * Component that renders an error message for an invalid deep link payload
 * and provides access to the support bottom sheet.
 */
export const ItwRemoteDeepLinkFailure = ({ payload }: Props) => {
  const navigation = useIONavigation();

  useDebugInfo({
    failure: payload
  });

  const failure: ItwFailure = {
    type: ItwFailureType.ITW_REMOTE_PAYLOAD_INVALID,
    reason: payload
  };

  const supportModal = useItwFailureSupportModal({
    failure,
    supportChatEnabled: true,
    zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_PRESENTAZIONE_REMOTA
  });

  const supportModalAction = {
    label: I18n.t("features.itWallet.support.button"),
    onPress: supportModal.present
  };

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
            navigation.popToTop();
          }
        }}
      />
      {supportModal.bottomSheet}
    </>
  );
};
