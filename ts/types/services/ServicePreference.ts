import { IUnitTag } from "italia-ts-commons/lib/units";

/**
 * The unique ID of a Service
 */
export type ServiceID = string & IUnitTag<"ServiceID">;

/**
 * The contact preference related to a service
 */
export type ServicePreference = {
  inbox: boolean;
  notifications: boolean;
  email: boolean;
  version: number;
};
