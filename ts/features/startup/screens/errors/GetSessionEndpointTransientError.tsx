import React from "react";
import { Modal } from "react-native";
import I18n from "../../../../i18n";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../store/reducers/startup";

export const GetSessionEndpointTransientError = () => {
  const startupStatus = useIOSelector(isStartupLoaded);
  // TODO: use this constant in MP event
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const afterIdentificationWithIdp =
    startupStatus === StartupStatusEnum.NOT_AUTHENTICATED;
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
