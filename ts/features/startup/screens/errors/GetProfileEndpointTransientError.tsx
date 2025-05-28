import { useEffect } from "react";
import { Modal } from "react-native";
import I18n from "../../../../i18n";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../store/reducers/startup";
import { useIOSelector } from "../../../../store/hooks";
import { trackGetProfileEndpointTransientErrorScreen } from "../../analytics";

export const GetProfileEndpointTransientError = () => {
  const startupStatus = useIOSelector(isStartupLoaded);
  const afterIdentificationWithIdp =
    startupStatus === StartupStatusEnum.NOT_AUTHENTICATED;

  useEffect(() => {
    trackGetProfileEndpointTransientErrorScreen(afterIdentificationWithIdp);
  }, [afterIdentificationWithIdp]);

  return (
    <Modal>
      <OperationResultScreenContent
        pictogram="umbrella"
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
