import * as crypto from "crypto";
import * as t from "io-ts";
import ReactNativeBlobUtil from "react-native-blob-util";
import rs from "jsrsasign";
import * as A from "fp-ts/lib/Array";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { QtspClauses } from "../../../../definitions/fci/QtspClauses";
import { DocumentToSign } from "../../../../definitions/fci/DocumentToSign";

export const QtspDocumentToSign = t.type({
  url: NonEmptyString
});

export type QtspDocumentToSign =
  | t.TypeOf<typeof QtspDocumentToSign> & DocumentToSign;

const getFileDigest = (url: string) =>
  pipe(
    TE.tryCatch(
      () => ReactNativeBlobUtil.config({ fileCache: true }).fetch("GET", url),
      E.toError
    ),
    TE.chain(response =>
      TE.tryCatch(
        () => ReactNativeBlobUtil.fs.readStream(response.path(), "utf8"),
        E.toError
      )
    ),
    TE.map(arrayBuffer => Buffer.from(arrayBuffer)),
    TE.map(buffer => crypto.createHash("sha256").update(buffer).digest("hex"))
  );

const ec = new rs.KJUR.crypto.ECDSA({ curve: "secp256k1" });
const kp1 = rs.KEYUTIL.generateKeypair("EC", "secp256k1");

// The value in hexadecimal cannot be accessed directly and there is no function to do so. Therefore I disabled the controls!
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const prvhex = kp1.prvKeyObj.prvKeyHex;

export const getTosSignature = (qtspClauses: QtspClauses) =>
  pipe(
    qtspClauses.filled_document_url,
    getFileDigest,
    TE.map(
      documentDigest =>
        qtspClauses.nonce +
        "+" +
        documentDigest +
        qtspClauses.accepted_clauses.reduce(
          (finalString, currentClause) =>
            finalString + "+" + currentClause.text,
          ""
        )
    ),
    TE.map(tos => tos.replace(/\r\n/g, "")),
    TE.map(tosChallenge =>
      crypto.createHash("sha256").update(tosChallenge).digest("hex")
    ),
    TE.map(tosChallengeHashHex => ec.signHex(tosChallengeHashHex, prvhex)),
    TE.map(signatureHex => Buffer.from(signatureHex, "hex").toString("base64"))
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
          return hash + "+" + attributes;
        })
      )
    ),
    A.sequence(TE.ApplicativeSeq),
    TE.map(chellenges => chellenges.join("+")),
    TE.map(challenge => challenge.replace(/\r\n/g, "")),
    TE.map(challenge =>
      crypto.createHash("sha256").update(challenge).digest("hex")
    ),
    TE.map(challengeHashHex => ec.signHex(challengeHashHex, prvhex)),
    TE.map(signatureHex => Buffer.from(signatureHex, "hex").toString("base64"))
  );
