import { ActionType } from "typesafe-actions";
import { pnActivationUpsert } from "./service";

export type PnActions = ActionType<typeof pnActivationUpsert>;
