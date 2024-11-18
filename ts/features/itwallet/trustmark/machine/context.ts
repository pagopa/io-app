import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Context = {
  credential: StoredCredential;
  expirationDate?: Date;
  expirationSeconds?: number;
  trustmarkUrl?: string;
};
