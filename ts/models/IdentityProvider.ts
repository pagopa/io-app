/**
 * Describes a SPID Identity Provider
 */

export type IdentityProviderId =
  | "test"
  | "arubaid"
  | "infocertid"
  | "intesaid"
  | "lepidaid"
  | "namirialid"
  | "posteid"
  | "sielteid"
  | "spiditalia"
  | "timid"
  | "cie";

export type IdentityProvider = {
  id: IdentityProviderId;
  logo: any;
  name: string;
  entityID: string;
  profileUrl: string;
  isTestIdp?: boolean;
};
