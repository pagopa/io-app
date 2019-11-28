import { none, some } from "italia-ts-commons/lib/pot";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { Municipality } from "../../../definitions/content/Municipality";
import { extractFiscalCodeData } from "../profile";

describe("extracting data from fiscal code", () => {
  // mario rossi / roma / rm / 1-1-1980
  const goodCf = "RSSMRA80A01H501U" as FiscalCode;
  const goodMunicipality: Municipality = {
    codiceProvincia: "091",
    codiceRegione: "12",
    denominazione: "Roma",
    denominazioneInItaliano: "Roma",
    denominazioneRegione: "Lazio",
    siglaProvincia: "RM"
  };
  const potGood = some(goodMunicipality);
  const data = extractFiscalCodeData(goodCf, potGood);
  it("should return the extracted data", () => {
    expect(data.birthDate).toBeDefined();
    expect(data.birthDate).toEqual("01/01/1980");
    expect(data.gender).toEqual("M");
    expect(data.denominazione).toEqual("Roma");
    expect(data.siglaProvincia).toEqual("RM");
  });

  const wrongCf = "RSSMRA80A0RH501U" as FiscalCode;
  const dataWrong1 = extractFiscalCodeData(wrongCf, potGood);
  it("should return the extracted data without birth information", () => {
    expect(dataWrong1.birthDate).not.toBeDefined();
    expect(data.gender).toEqual("M");
    expect(data.denominazione).toEqual("Roma");
    expect(data.siglaProvincia).toEqual("RM");
  });

  // giulia rossi / roma / rm / 12-07-1956
  const goodCfF = "GLIRSS56L52H501P" as FiscalCode;
  const dataF = extractFiscalCodeData(goodCfF, potGood);
  it("should recognize the female sex", () => {
    expect(dataF.birthDate).toBeDefined();
    expect(dataF.birthDate).toEqual("12/07/1956");
    expect(dataF.gender).toEqual("F");
    expect(dataF.denominazione).toEqual("Roma");
    expect(dataF.siglaProvincia).toEqual("RM");
  });

  // giulia rossi / roma / rm / 12-07-2003
  const goodCfF2 = "GLIRSS03L52H501A" as FiscalCode;
  const dataF2 = extractFiscalCodeData(goodCfF2, potGood);
  it("should recognize the 2003 as year of birth", () => {
    expect(dataF2.birthDate).toBeDefined();
    expect(dataF2.birthDate).toEqual("12/07/2003");
    expect(dataF2.gender).toEqual("F");
    expect(dataF2.denominazione).toEqual("Roma");
    expect(dataF2.siglaProvincia).toEqual("RM");
  });

  // giulia rossi / roma / rm / 12-07-2003
  const dataNoM = extractFiscalCodeData(goodCfF2, none);
  it("should return birth place empty", () => {
    expect(dataNoM.birthDate).toBeDefined();
    expect(dataNoM.birthDate).toEqual("12/07/2003");
    expect(dataNoM.gender).toEqual("F");
    expect(dataNoM.denominazione).toEqual("");
    expect(dataNoM.siglaProvincia).toEqual("");
  });
});
