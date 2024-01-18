import { EmailAlreadyUsedScreenParamList } from "../../screens/profile/mailCheck/EmailAlreadyTakenScreen";
import ROUTES from "../routes";

export type CheckEmailParamsList = {
  [ROUTES.CHECK_EMAIL_ALREADY_TAKEN]: EmailAlreadyUsedScreenParamList;
  [ROUTES.CHECK_EMAIL_NOT_VERIFIED]: EmailAlreadyUsedScreenParamList;
};
