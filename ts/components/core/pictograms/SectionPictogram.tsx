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

export const IOSectionPictograms = {
  messages: SectionPictogramMessages,
  payments: SectionPictogramPayments,
  documents: SectionPictogramDocuments,
  services: SectionPictogramServices,
  profile: SectionPictogramProfile,
  settings: SectionPictogramSettings,
  smile: SectionPictogramSmile
};

export type IOSectionPictograms = keyof typeof IOSectionPictograms;

type IOSectionPictogramsProps = {
  name: IOSectionPictograms;
  color?: IOColors;
  size?: number | "100%";
};

const SectionPictogram = ({
  name,
  color = "greyLight",
  size = 48,
  ...props
}: IOSectionPictogramsProps) => {
  const SectionPictogramElement = IOSectionPictograms[name];
  return (
    <SectionPictogramElement
      {...props}
      size={size}
      color={IOColors[color] as IOColors}
    />
  );
};
export default SectionPictogram;
