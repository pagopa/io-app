import { ServicesHomeActions } from "../../../home/store/actions";
import { ServiceDetailsActions } from "../../../details/store/actions/details";
import { ServicePreferenceActions } from "../../../details/store/actions/preference";
import { ServicesInstitutionActions } from "../../../institution/store/actions";

export type ServicesActions =
  | ServicesHomeActions
  | ServicesInstitutionActions
  | ServiceDetailsActions
  | ServicePreferenceActions;
