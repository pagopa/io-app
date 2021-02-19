import { Option } from "fp-ts/lib/Option";
import { OutcomeCodes } from "../../../types/outcomeCode";

export type BackendStatusState = {
  status: Option<OutcomeCodes>;
  areSystemsDead: boolean;
  deadsCounter: number;
};
