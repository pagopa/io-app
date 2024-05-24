import { LocalIdpsFallback } from "../../../../utils/idps";

enum IdentificationMode {
  spid = 0,
  ciePin = 1,
  cieId = 2
}

export type SelectMode = {
  type: "select-mode";
  mode: IdentificationMode;
};

export type SelectSpidIdp = {
  type: "select-spid-idp";
  idp: LocalIdpsFallback;
};

export type InputCiePin = {
  type: "input-cie-pin";
  pin: string;
};

export type Events = SelectMode | SelectSpidIdp | InputCiePin;
