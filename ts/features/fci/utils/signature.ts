import * as t from "io-ts";
import sha from "sha.js";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import Crypto from "react-native-quick-crypto";
import ReactNativeBlobUtil from "react-native-blob-util";
import { QtspClauses } from "../../../../definitions/fci/QtspClauses";
import { DocumentToSign } from "../../../../definitions/fci/DocumentToSign";
import { constants } from "../../../utils/httpSignature/constants";

export const QtspDocumentToSign = t.type({
  url: t.string
});

export type QtspDocumentToSign =
  | t.TypeOf<typeof QtspDocumentToSign> & DocumentToSign;

export const createSimpleHash = () => Crypto.createHash("sha256");

const getFileDigest = (url: string) =>
  pipe(
    TE.tryCatch(() => ReactNativeBlobUtil.fetch("GET", url), E.toError),
    TE.map(response => response.base64()),
    TE.map(buffer => sha(constants.SHA_256).update(buffer).digest("hex"))
  );

export const getTosSignature = (qtspClauses: QtspClauses) =>
  pipe(
    qtspClauses.filled_document_url,
    getFileDigest,
    TE.map(
      documentDigest =>
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        qtspClauses.nonce +
        "+" +
        documentDigest +
        qtspClauses.accepted_clauses.reduce(
          (finalString, currentClause) =>
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            finalString + "+" + currentClause.text,
          ""
        )
    ),
    TE.map(tos => tos.replace(/\r\n/g, "")),
    TE.map(tosChallenge =>
      sha(constants.SHA_256).update(tosChallenge).digest("hex")
    )
  );

export const getCustomSignature = (
  documentsToSign: Array<QtspDocumentToSign>
) =>
  pipe(
    documentsToSign,
    A.map(document =>
      pipe(
        getFileDigest(document.url),
        TE.map(hash => {
          const attributes = document.signature_fields
            .map(signatureField =>
              "unique_name" in signatureField.attrs
                ? signatureField.attrs.unique_name
                : // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                  signatureField.attrs.page +
                  "-" +
                  signatureField.attrs.bottom_left.x +
                  "-" +
                  signatureField.attrs.bottom_left.y +
                  "-" +
                  signatureField.attrs.top_right.x +
                  "-" +
                  signatureField.attrs.top_right.y
            )
            .join("+");
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          return hash + "+" + attributes;
        })
      )
    ),
    A.sequence(TE.ApplicativeSeq),
    TE.map(chellenges => chellenges.join("+")),
    TE.map(challenge => challenge.replace(/\r\n/g, "")),
    TE.map(challenge => sha(constants.SHA_256).update(challenge).digest("hex"))
  );
