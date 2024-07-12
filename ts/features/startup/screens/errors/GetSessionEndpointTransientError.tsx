import React from "react";
import { Modal } from "react-native";
import I18n from "../../../../i18n";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";

export const GetSessionEndpointTransientError = () => (
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
