import { FimsHistoryActions } from "../../history/store/actions";
import { FimsSSOActions } from "../../singleSignOn/store/actions";

export type FimsActions = FimsSSOActions | FimsHistoryActions;
