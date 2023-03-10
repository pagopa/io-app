import React from "react";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";

const UnsubscriptionConfirmationScreen = () => {
  // eslint-disable-next-line no-console
  console.log("ciao");

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle="Rimuovi iniziativa"
      contextualHelp={emptyContextualHelp}
    ></BaseScreenComponent>
  );
};

export default UnsubscriptionConfirmationScreen;
