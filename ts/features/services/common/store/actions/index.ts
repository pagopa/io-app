import { ServiceDetailsActions } from "../../../details/store/actions/details";
import { ServicePreferenceActions } from "../../../details/store/actions/preference";

export type ServicesActions = ServiceDetailsActions | ServicePreferenceActions;
