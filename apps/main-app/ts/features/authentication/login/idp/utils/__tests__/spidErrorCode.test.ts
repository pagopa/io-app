import {
  findSpidErrorCodeDescription,
  getSpidErrorCodeDescription
} from "../spidErrorCode";

describe("getSpidErrorCodeDescription", () => {
  it.each([
    ["1", "Autenticazione corretta"],
    [
      "19",
      "Autenticazione fallita per ripetuta sottomissione di credenziali errate (superato numero  tentativi secondo le policy adottate) "
    ],
    ["1002", "Utente con identità bloccata da ioapp.it"]
  ])(
    "Should return the correct description for error code '%s'",
    (errorCode, expectedDescription) => {
      expect(getSpidErrorCodeDescription(errorCode)).toBe(expectedDescription);
    }
  );

  it.each([["9999"], [""], ["not_a_code"]])(
    "Should return 'N/A' for unknown error code '%s'",
    errorCode => {
      expect(getSpidErrorCodeDescription(errorCode)).toBe("N/A");
    }
  );
});

describe("findSpidErrorCodeDescription", () => {
  it("should return the official description of a SPID error code", () => {
    expect(findSpidErrorCodeDescription("25")).toBe(
      "Processo di autenticazione annullato dall’utente"
    );
  });

  it("should return undefined for a code that is not a SPID one", () => {
    expect(findSpidErrorCodeDescription("not-a-spid-code")).toBeUndefined();
  });
});
