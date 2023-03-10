import React from "react";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";

const UnsubscriptionSuccessScreen = () => {
  // eslint-disable-next-line no-console
  console.log("ciao");

  return (
    <BaseScreenComponent
      headerTitle="Rimuovi iniziativa"
      contextualHelp={emptyContextualHelp}
    ></BaseScreenComponent>
  );
};

export default UnsubscriptionSuccessScreen;
