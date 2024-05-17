import { StoredCredential } from "../common/utils/itwTypesUtils";
import eid from "./data/eid.json";
import dc from "./data/dc.json";
import mdl from "./data/mdl.json";
import ts from "./data/ts.json";

export const ItwCredentialsMocks = {
  eid: eid as StoredCredential,
  dc: dc as StoredCredential,
  mdl: mdl as StoredCredential,
  ts: ts as StoredCredential
};
