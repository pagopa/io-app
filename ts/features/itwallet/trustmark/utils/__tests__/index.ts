import { getCredentialDocumentNumber } from "..";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";

describe("getCredentialDocumentNumber", () => {
  it("should return the document number for a credential", () => {
    const documentNumber = getCredentialDocumentNumber(
      ItwStoredCredentialsMocks.dc.parsedCredential
    );
    expect(documentNumber).toBe("10008581");
  });

  it("should return undefined if the document number is not present", () => {
    const documentNumber = getCredentialDocumentNumber(
      ItwStoredCredentialsMocks.eid.parsedCredential
    );
    expect(documentNumber).toBeUndefined();
  });
});
