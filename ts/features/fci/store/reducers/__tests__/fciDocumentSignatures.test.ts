import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import {
  fciAddDocumentSignaturesRequest,
  fciUpdateDocumentSignaturesRequest
} from "../../actions";
import { DocumentSignature } from "../../../../../../definitions/fci/DocumentSignature";
import { SignatureField } from "../../../../../../definitions/fci/SignatureField";
import { ClausesTypeEnum } from "../../../../../../definitions/fci/ClausesType";

describe("FciDocumentSignaturesReducer", () => {
  it("The initial state should be an ampty array", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.fci.documentSignatures.documents).toStrictEqual(
      []
    );
  });
  it("The documentSignatures should be an array of size equal to one if the fciAddDocumentSignaturesRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const docSignature: DocumentSignature = {
      document_id: "123",
      signature: "signature",
      signature_fields: []
    };
    store.dispatch(fciAddDocumentSignaturesRequest(docSignature));
    expect(
      store.getState().features.fci.documentSignatures.documents.length
    ).toBe(1);
    expect(
      store.getState().features.fci.documentSignatures.documents
    ).toStrictEqual([docSignature]);
  });
  it("The documentSignatures should be an array of size equal to two if the fciAddDocumentSignaturesRequest is dispatched two times", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const docSignatures: ReadonlyArray<DocumentSignature> = [
      {
        document_id: "1",
        signature: "signature",
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
        document_id: "2",
        signature: "signature",
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
    docSignatures.map(docSignature => {
      store.dispatch(fciAddDocumentSignaturesRequest(docSignature));
    });
    expect(
      store.getState().features.fci.documentSignatures.documents.length
    ).toBe(docSignatures.length);
    expect(
      store.getState().features.fci.documentSignatures.documents
    ).toStrictEqual(docSignatures);
  });
  it("The documentSignatures should be an array of size equal to one and zero signatureFields if the fciUpdateDocumentSignaturesRequest is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const signatureField: SignatureField = {
      clause: {
        title: "clause title 1",
        type: ClausesTypeEnum.REQUIRED
      },
      attrs: {}
    };

    const docSignatures = {
      document_id: "1",
      signature: "signature",
      signature_fields: [signatureField]
    };

    store.dispatch(fciAddDocumentSignaturesRequest(docSignatures));
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
