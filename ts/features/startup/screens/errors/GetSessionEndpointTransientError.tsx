import { useEffect } from "react";
import { Modal } from "react-native";
import I18n from "../../../../i18n";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../store/reducers/startup";
import { trackGetSessionEndpointTransientErrorScreen } from "../../analytics";

export const GetSessionEndpointTransientError = () => {
  const startupStatus = useIOSelector(isStartupLoaded);
  const afterIdentificationWithIdp =
    startupStatus === StartupStatusEnum.NOT_AUTHENTICATED;

  useEffect(() => {
    trackGetSessionEndpointTransientErrorScreen(afterIdentificationWithIdp);
  }, [afterIdentificationWithIdp]);

  return (
    <Modal>
      <OperationResultScreenContent
        pictogram="umbrellaNew"
        title={I18n.t(
          "fastLogin.userInteraction.sessionExpired.transientError.title"
        )}
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.transientError.subtitle"
        )}
      />
    </Modal>
  );
};
