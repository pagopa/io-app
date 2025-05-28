import { getSpidErrorCodeDescription } from "../spidErrorCode";

describe("getSpidErrorCodeDescription", () => {
  it("should return the correct description for a known error code", () => {
    expect(getSpidErrorCodeDescription("1")).toBe("Autenticazione corretta");
    expect(getSpidErrorCodeDescription("19")).toBe(
      "Autenticazione fallita per ripetuta sottomissione di credenziali errate (superato numero  tentativi secondo le policy adottate) "
    );
    expect(getSpidErrorCodeDescription("1002")).toBe(
      "Utente con identità bloccata da ioapp.it"
    );
  });

  it("should return 'N/A' for an unknown error code", () => {
    expect(getSpidErrorCodeDescription("9999")).toBe("N/A");
    expect(getSpidErrorCodeDescription("")).toBe("N/A");
    expect(getSpidErrorCodeDescription("not_a_code")).toBe("N/A");
  });
});
