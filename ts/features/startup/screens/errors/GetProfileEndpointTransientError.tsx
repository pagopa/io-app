import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect } from "react";
import { Modal } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../store/reducers/startup";
import { trackGetProfileEndpointTransientErrorScreen } from "../../analytics";

export const GetProfileEndpointTransientError = () => {
  const startupStatus = useIOSelector(isStartupLoaded);
  const afterIdentificationWithIdp =
    startupStatus === StartupStatusEnum.NOT_AUTHENTICATED;

  useEffect(() => {
    trackGetProfileEndpointTransientErrorScreen(afterIdentificationWithIdp);
  }, [afterIdentificationWithIdp]);

  const theme = useIOTheme();

  return (
    <Modal backdropColor={IOColors[theme["appBackground-primary"]]}>
      <OperationResultScreenContent
        enableAnimatedPictogram
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
