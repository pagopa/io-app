import { ServicesHomeActions } from "../../../home/store/actions";
import { ServiceDetailsActions } from "../../../details/store/actions/details";
import { ServicePreferenceActions } from "../../../details/store/actions/preference";

export type ServicesActions =
  | ServicesHomeActions
  | ServiceDetailsActions
  | ServicePreferenceActions;
