import * as t from "io-ts";

/**
 * Decoder type for the evidence field of the credential.
 */
export const EvidenceClaim = t.array(
  t.type({
    type: t.string,
    record: t.type({
      type: t.string,
      source: t.type({
        organization_name: t.string,
        organization_id: t.string,
        country_code: t.string
      })
    })
  })
);

export const TextClaim = t.string;

export const DateOfBirthClaim = t.array(
  t.type({
    
  })
)

export const JsonParseableObject = new t.Type<object, string, unknown>(
  "JsonParseableObject",
  (input: unknown): input is object => {
    if (typeof input === "string") {
      try {
        const parsedObject = JSON.parse(input);
        return typeof parsedObject === "object" && parsedObject !== null;
      } catch {
        return false;
      }
    }
    return false;
  },
  (input, context) => {
    try {
      if (typeof input === "string") {
        const parsedObject = JSON.parse(input);
        return t.success(parsedObject);
      } else {
        return t.failure(
          input,
          context,
          "Input is not a JSON-parseable object"
        );
      }
    } catch {
      return t.failure(input, context, "Input is not a JSON-parseable object");
    }
  },
  output => JSON.stringify(output)
);
