import React from "react";
import { IOColors } from "../variables/IOColors";

import AirBaloon from "./svg/AirBaloon";
import Heart from "./svg/Heart";
import Completed from "./svg/Completed";
import EmailValidation from "./svg/EmailValidation";
import Abacus from "./svg/Abacus";
import PiggyBank from "./svg/PiggyBank";
import Processing from "./svg/Processing";
import Baloons from "./svg/Baloons";
import Places from "./svg/Places";
import NotAvailable from "./svg/NotAvailable";
import Airship from "./svg/Airship";
import SearchPictogram from "./svg/SearchPictogram";
import Unrecognized from "./svg/Unrecognized";
import ErrorPictogram from "./svg/ErrorPictogram";
import Umbrella from "./svg/Umbrella";
import InProgress from "./svg/InProgress";
import Fireworks from "./svg/Fireworks";
import Puzzle from "./svg/Puzzle";
import Question from "./svg/Question";
import Pin from "./svg/Pin";
import TimeoutPictogram from "./svg/TimeoutPictogram";
import UploadFilePictogram from "./svg/UploadFilePictogram";
import Hourglass from "./svg/Hourglass";
import TeaBreak from "./svg/TeaBreak";
import SmsPictogram from "./svg/SmsPictogram";
import Condom from "./svg/Condom";
import InboxPictogram from "./svg/InboxPictogram";

export const PictogramMap = {
  airBaloon: AirBaloon,
  abacus: Abacus,
  emailValidation: EmailValidation,
  inbox: InboxPictogram,
  piggyBank: PiggyBank,
  processing: Processing,
  baloons: Baloons,
  places: Places,
  notAvailable: NotAvailable,
  airship: Airship,
  search: SearchPictogram,
  unrecognized: Unrecognized,
  error: ErrorPictogram,
  umbrella: Umbrella,
  inProgress: InProgress,
  fireworks: Fireworks,
  puzzle: Puzzle,
  question: Question,
  pin: Pin,
  timeout: TimeoutPictogram,
  uploadFile: UploadFilePictogram,
  hourglass: Hourglass,
  teaBreak: TeaBreak,
  sms: SmsPictogram,
  condom: Condom,
  heart: Heart,
  completed: Completed
};

const Pictogram = ({ name, color, ...props }, ref) => {
  const PictogramElement = PictogramMap[name];
  return (
    <PictogramElement
      {...props}
      color={IOColors[color]}
      name={name}
      ref={ref}
    />
  );
};

export default React.forwardRef(Pictogram);
