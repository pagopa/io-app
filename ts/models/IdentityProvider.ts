/**
 * Describes a SPID Identity Provider
 */

type IdentityProviderId =
  | "test"
  | "arubaid"
  | "infocertid"
  | "intesaid"
  | "lepidaid"
  | "namirialid"
  | "posteid"
  | "sielteid"
  | "spiditaliaid"
  | "timid";

export type IdentityProvider = {
  id: IdentityProviderId;
  logo: any;
  name: string;
  entityID: string;
  profileUrl: string;
  isTestIdp?: boolean;
};
