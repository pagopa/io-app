import { CgnActivationDetail } from "../../../../../../definitions/cgn/CgnActivationDetail";
import { EycaCard } from "../../../../../../definitions/cgn/EycaCard";

export enum CgnActivationProgressEnum {
  "UNDEFINED" = "UNDEFINED",
  "TIMEOUT" = "TIMEOUT", // number of polling exceeded
  "PROGRESS" = "PROGRESS", // The request is started
  "PENDING" = "PENDING", // Polling time exceeded
  "ERROR" = "ERROR", // There's an error
  "EXISTS" = "EXISTS", // Another bonus related to this user was found
  "INELIGIBLE" = "INELIGIBLE", // Another bonus related to this user was found
  "SUCCESS" = "SUCCESS" // Activation has been completed
}

export type CgnActivationStatusActionT = {
  status: CgnActivationProgressEnum;
  activation?: CgnActivationDetail;
};

export type CgnEycaActivationStatus =
  | "POLLING"
  | "POLLING_TIMEOUT"
  | "PROCESSING"
  | "NOT_FOUND"
  | "COMPLETED"
  | "INELIGIBLE"
  | "ALREADY_ACTIVE"
  | "ERROR";

export type EycaDetailStatus = "NOT_FOUND" | "INELIGIBLE" | "ERROR" | "FOUND";
export type EycaDetailKOStatus = Exclude<EycaDetailStatus, "FOUND">;
export type EycaDetail =
  | {
      status: Extract<EycaDetailStatus, "FOUND">;
      card: EycaCard;
    }
  | {
      status: EycaDetailKOStatus;
    };
