import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import I18n from "../../../../../i18n.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ItwRemoteRequestPayload } from "../Utils/itwRemoteTypeUtils.ts";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes.ts";
import ROUTES from "../../../../../navigation/routes.ts";
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

export const ItwRemoteDeepLinkFailureScreen = ({ payload }: Props) => {
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
        pictogram={"umbrellaNew"}
        action={supportModalAction}
        secondaryAction={{
          label: I18n.t(
            "features.itWallet.presentation.remote.deepLinkValidationErrorScreen.secondaryAction"
          ),
          onPress: () => {
            navigation.reset({
              index: 1,
              routes: [
                {
                  name: ROUTES.MAIN,
                  params: {
                    screen: MESSAGES_ROUTES.MESSAGES_HOME
                  }
                }
              ]
            });
          }
        }}
      />
      {supportModal.bottomSheet}
    </>
  );
};
