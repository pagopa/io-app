import { createStore } from "redux";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { fciUpdateDocumentSignaturesRequest } from "../../actions";
import { DocumentToSign } from "../../../../../../definitions/fci/DocumentToSign";
import { SignatureField } from "../../../../../../definitions/fci/SignatureField";
import { TypeEnum as ClausesTypeEnum } from "../../../../../../definitions/fci/Clause";

describe("FciDocumentSignaturesReducer", () => {
  it("The initial state should be an ampty array", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.documentSignatures.documents).toStrictEqual(
      []
    );
  });
  it("The documentSignatures should be an array of size equal to one if the fciUpdateDocumentSignaturesRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const docToSign: DocumentToSign = {
      document_id: "123" as NonEmptyString,
      signature_fields: []
    };
    store.dispatch(fciUpdateDocumentSignaturesRequest(docToSign));
    expect(
      store.getState().features.fci.documentSignatures.documents.length
    ).toBe(1);
    expect(
      store.getState().features.fci.documentSignatures.documents
    ).toStrictEqual([docToSign]);
  });
  it("The documentSignatures should be an array of size equal to two if the fciUpdateDocumentSignaturesRequest is dispatched two times", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const docToSign: ReadonlyArray<DocumentToSign> = [
      {
        document_id: "1" as NonEmptyString,
        signature_fields: [
          {
            clause: {
              title: "clause title 1",
              type: ClausesTypeEnum.REQUIRED
            },
            attrs: {}
          }
        ] as Array<SignatureField>
      },
      {
        document_id: "2" as NonEmptyString,
        signature_fields: [
          {
            clause: {
              title: "clause title 2",
              type: ClausesTypeEnum.REQUIRED
            },
            attrs: {}
          }
        ] as Array<SignatureField>
      }
    ];
    docToSign.map(docSignature => {
      store.dispatch(fciUpdateDocumentSignaturesRequest(docSignature));
    });
    expect(
      store.getState().features.fci.documentSignatures.documents.length
    ).toBe(docToSign.length);
    expect(
      store.getState().features.fci.documentSignatures.documents
    ).toStrictEqual(docToSign);
  });
  it("The documentSignatures should be an array of size equal to one and zero signatureFields if the fciUpdateDocumentSignaturesRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const signatureField: SignatureField = {
      clause: {
        title: "clause title 1",
        type: ClausesTypeEnum.REQUIRED
      },
      attrs: {} as SignatureField["attrs"]
    };

    const docSignatures = {
      document_id: "1" as NonEmptyString,
      signature_fields: [signatureField]
    };

    store.dispatch(fciUpdateDocumentSignaturesRequest(docSignatures));
    expect(
      store.getState().features.fci.documentSignatures.documents.length
    ).toBe(1);
    expect(
      store.getState().features.fci.documentSignatures.documents
    ).toStrictEqual([docSignatures]);
    expect(
      store.getState().features.fci.documentSignatures.documents[0]
        .signature_fields.length
    ).toBe(1);

    store.dispatch(
      fciUpdateDocumentSignaturesRequest({
        ...docSignatures,
        signature_fields: [
          ...docSignatures.signature_fields.filter(f => f !== signatureField)
        ]
      })
    );

    expect(
      store.getState().features.fci.documentSignatures.documents.length
    ).toBe(1);
    expect(
      store.getState().features.fci.documentSignatures.documents[0]
        .signature_fields.length
    ).toBe(0);
  });
});
