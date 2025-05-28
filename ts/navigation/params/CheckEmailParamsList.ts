import { EmailAlreadyUsedScreenParamList } from "../../features/mailCheck/screens/EmailAlreadyTakenScreen";
import { EmailNotVerifiedScreenParamList } from "../../features/mailCheck/screens/ValidateEmailScreen";
import ROUTES from "../routes";

export type CheckEmailParamsList = {
  [ROUTES.CHECK_EMAIL_ALREADY_TAKEN]: EmailAlreadyUsedScreenParamList;
  [ROUTES.CHECK_EMAIL_NOT_VERIFIED]: EmailNotVerifiedScreenParamList;
};
