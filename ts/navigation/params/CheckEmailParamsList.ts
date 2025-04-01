import { EmailAlreadyUsedScreenParamList } from "../../features/settings/views/mailCheck/EmailAlreadyTakenScreen";
import { EmailNotVerifiedScreenParamList } from "../../features/settings/views/mailCheck/ValidateEmailScreen";
import ROUTES from "../routes";

export type CheckEmailParamsList = {
  [ROUTES.CHECK_EMAIL_ALREADY_TAKEN]: EmailAlreadyUsedScreenParamList;
  [ROUTES.CHECK_EMAIL_NOT_VERIFIED]: EmailNotVerifiedScreenParamList;
};
