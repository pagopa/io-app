import { Municipality } from "../../generated/definitions/content/Municipality";
import { validatePayload } from "../utils/validator";

const mockMunicipality: Municipality = {
  codiceProvincia: "XX",
  codiceRegione: "YY",
  denominazione: "MOCK CITY",
  denominazioneInItaliano: "MOCK CITTA'",
  denominazioneRegione: "MOCK REGIONE",
  siglaProvincia: "XY"
};

export const municipality = validatePayload(Municipality, mockMunicipality);
