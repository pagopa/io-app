import { ServicesHomeActions } from "../../../home/store/actions";
import { ServiceDetailsActions } from "../../../details/store/actions/details";
import { ServicePreferenceActions } from "../../../details/store/actions/preference";
import { InstitutionServicesActions } from "../../../institution/store/actions";
import { SearchActions } from "../../../search/store/actions";

export type ServicesActions =
  | ServicesHomeActions
  | InstitutionServicesActions
  | SearchActions
  | ServiceDetailsActions
  | ServicePreferenceActions;
