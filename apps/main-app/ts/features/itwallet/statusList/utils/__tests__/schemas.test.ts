import { StatusListPayloadSchema, validatePayloadSub } from "../schemas";

describe("StatusListPayloadSchema", () => {
  const validPayload = {
    sub: "https://issuer.example/status/1",
    iat: 1690000000,
    exp: 1700000000,
    ttl: 43200,
    status_list: {
      bits: 2,
      lst: "eNrbuRgAAhcBXQ"
    }
  };

  it("accepts a valid payload with all optional fields", () => {
    expect(StatusListPayloadSchema.safeParse(validPayload).success).toBe(true);
  });

  it("accepts a payload with only required fields", () => {
    const minimal = {
      sub: "https://issuer.example/status/1",
      iat: 1690000000,
      status_list: { bits: 1, lst: "abc" }
    };
    expect(StatusListPayloadSchema.safeParse(minimal).success).toBe(true);
  });

  it("accepts a payload with aggregation_uri", () => {
    const withAggregation = {
      ...validPayload,
      status_list: {
        ...validPayload.status_list,
        aggregation_uri: "https://issuer.example/aggregate"
      }
    };
    expect(StatusListPayloadSchema.safeParse(withAggregation).success).toBe(
      true
    );
  });

  it("rejects a payload with empty sub", () => {
    expect(
      StatusListPayloadSchema.safeParse({ ...validPayload, sub: "" }).success
    ).toBe(false);
  });

  it("rejects a payload with missing sub", () => {
    const { sub: _sub, ...noSub } = validPayload;
    expect(StatusListPayloadSchema.safeParse(noSub).success).toBe(false);
  });

  it("rejects a payload with missing iat", () => {
    const { iat: _iat, ...noIat } = validPayload;
    expect(StatusListPayloadSchema.safeParse(noIat).success).toBe(false);
  });

  it("rejects a payload with missing status_list", () => {
    const { status_list: _sl, ...noStatusList } = validPayload;
    expect(StatusListPayloadSchema.safeParse(noStatusList).success).toBe(false);
  });

  it("rejects a payload with empty lst", () => {
    const emptyLst = {
      ...validPayload,
      status_list: { bits: 1, lst: "" }
    };
    expect(StatusListPayloadSchema.safeParse(emptyLst).success).toBe(false);
  });

  it("rejects a payload with bits outside the allowed set (1, 2, 4, 8)", () => {
    const invalidBits = {
      ...validPayload,
      status_list: { bits: 3, lst: "abc" }
    };
    expect(StatusListPayloadSchema.safeParse(invalidBits).success).toBe(false);
  });
});

describe("validatePayloadSub", () => {
  const payload = {
    sub: "https://issuer.example/status/1",
    iat: 1690000000,
    status_list: { bits: 2 as const, lst: "eNrbuRgAAhcBXQ" }
  };

  it("returns true when payload sub matches the expected URI", () => {
    expect(validatePayloadSub(payload, "https://issuer.example/status/1")).toBe(
      true
    );
  });

  it("returns false when payload sub does not match the expected URI", () => {
    expect(validatePayloadSub(payload, "https://issuer.example/status/2")).toBe(
      false
    );
  });
});
