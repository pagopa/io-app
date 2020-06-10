/**
 * Describes a SPID Identity Provider
 */

import { Idp } from "../../definitions/content/Idp";

export type IdentityProviderId =
  | "test"
  | "arubaid"
  | "infocertid"
  | "intesaid"
  | "lepidaid"
  | "namirialid"
  | "posteid"
  | "sielteid"
  | "spiditaliaid"
  | "timid"
  | "cie";

export type textDataForIdp = Record<IdentityProviderId, Idp>;

export type IdentityProvider = {
  id: IdentityProviderId;
  logo: any;
  name: string;
  entityID: string;
  profileUrl: string;
  isTestIdp?: boolean;
};
