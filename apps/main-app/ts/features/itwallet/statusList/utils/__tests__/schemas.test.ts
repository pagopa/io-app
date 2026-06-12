import {
  StatusListPayloadSchema,
  StoredStatusListSchema,
  validatePayloadSub
} from "../schemas";

describe("StatusListPayloadSchema", () => {
  const validPayload = {
    sub: "https://issuer.example/status/1",
    exp: 1700000000,
    iat: 1690000000,
    ttl: 3600,
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

  it("rejects a payload with non-positive bits", () => {
    const zeroBits = {
      ...validPayload,
      status_list: { bits: 0, lst: "abc" }
    };
    expect(StatusListPayloadSchema.safeParse(zeroBits).success).toBe(false);
  });
});

describe("StoredStatusListSchema", () => {
  const validEntry = {
    payload: {
      sub: "https://issuer.example/status/1",
      status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" }
    },
    meta: { resolvedAt: 1700000000000 }
  };

  it("accepts a valid stored entry", () => {
    expect(StoredStatusListSchema.safeParse(validEntry).success).toBe(true);
  });

  it("rejects a stored entry with missing meta", () => {
    const { meta: _meta, ...noMeta } = validEntry;
    expect(StoredStatusListSchema.safeParse(noMeta).success).toBe(false);
  });

  it("rejects a stored entry with missing resolvedAt", () => {
    expect(
      StoredStatusListSchema.safeParse({
        ...validEntry,
        meta: {}
      }).success
    ).toBe(false);
  });

  it("rejects a stored entry with non-positive resolvedAt", () => {
    expect(
      StoredStatusListSchema.safeParse({
        ...validEntry,
        meta: { resolvedAt: 0 }
      }).success
    ).toBe(false);
  });
});

describe("validatePayloadSub", () => {
  const payload = {
    sub: "https://issuer.example/status/1",
    status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" }
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
