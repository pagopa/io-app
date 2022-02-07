import React from "react";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import Completed from "../../../../../../img/pictograms/payment-completed.svg";

const ThankYouComponent = () => (
  <InfoScreenComponent
    image={<Completed width={80} height={80} />}
    title={"Fatto!"}
    body={"Abbiamo salvato la tua scelta."}
  />
);

export default ThankYouComponent;
