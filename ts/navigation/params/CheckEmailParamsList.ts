import { EmailAlreadyUsedScreenParamList } from "../../features/mailCheck/views/EmailAlreadyTakenScreen";
import { EmailNotVerifiedScreenParamList } from "../../features/mailCheck/views/ValidateEmailScreen";
import ROUTES from "../routes";

export type CheckEmailParamsList = {
  [ROUTES.CHECK_EMAIL_ALREADY_TAKEN]: EmailAlreadyUsedScreenParamList;
  [ROUTES.CHECK_EMAIL_NOT_VERIFIED]: EmailNotVerifiedScreenParamList;
};
