import React from "react";
import { IOColors } from "../variables/IOColors";

// Added these verbose names to avoid chaos and misunderstandings
// when using `Quick File Search…`
import SectionPictogramMessages from "./svg/SectionPictogramMessages";
import SectionPictogramPayments from "./svg/SectionPictogramPayments";
import SectionPictogramDocuments from "./svg/SectionPictogramDocuments";
import SectionPictogramServices from "./svg/SectionPictogramServices";
import SectionPictogramProfile from "./svg/SectionPictogramProfile";
import SectionPictogramSettings from "./svg/SectionPictogramSettings";
import SectionPictogramSmile from "./svg/SectionPictogramSmile";

export const SectionPictogramMap = {
  messages: SectionPictogramMessages,
  payments: SectionPictogramPayments,
  documents: SectionPictogramDocuments,
  services: SectionPictogramServices,
  profile: SectionPictogramProfile,
  settings: SectionPictogramSettings,
  smile: SectionPictogramSmile
};

const SectionPictogram = ({ name, color, ...props }, ref) => {
  const SectionPictogramElement = SectionPictogramMap[name];
  return (
    <SectionPictogramElement
      {...props}
      color={IOColors[color]}
      name={name}
      ref={ref}
    />
  );
};

export default React.forwardRef(SectionPictogram);
