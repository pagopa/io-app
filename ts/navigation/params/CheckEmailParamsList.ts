import { EmailAlreadyUsedScreenParamList } from "../../screens/profile/mailCheck/EmailAlreadyTakenScreen";
import { EmailNotVerifiedScreenParamList } from "../../screens/profile/mailCheck/ValidateEmailScreen";
import ROUTES from "../routes";

export type CheckEmailParamsList = {
  [ROUTES.CHECK_EMAIL_ALREADY_TAKEN]: EmailAlreadyUsedScreenParamList;
  [ROUTES.CHECK_EMAIL_NOT_VERIFIED]: EmailNotVerifiedScreenParamList;
};
