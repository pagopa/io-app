import { ItwConfig } from "@io-app/api-types/generated/definitions/content/ItwConfig";
import { createMigrate } from "redux-persist";

import { migrations } from "../remoteConfig";

type IoTsCodec = {
  readonly name: string;
  readonly props?: Record<string, IoTsCodec>;
  readonly type?: IoTsCodec;
  readonly types?: ReadonlyArray<IoTsCodec>;
};

const ioTsShape = (codec: IoTsCodec): unknown => {
  if (codec.props) {
    return Object.fromEntries(
      Object.entries(codec.props).map(([key, value]) => [key, ioTsShape(value)])
    );
  }
  if (codec.types) {
    return codec.types.map(ioTsShape);
  }
  if (codec.type) {
    return [ioTsShape(codec.type)];
  }
  return codec.name;
};

describe("ITW remote config persist shape", () => {
  it("should freeze ItwConfig [if this test fails, add a persist migration before updating the snapshot]", () => {
    expect(ioTsShape(ItwConfig)).toMatchSnapshot();
  });
});

describe("ITW remote config migration", () => {
  test("initializes the CED flag while preserving the previous remote configuration", async () => {
    const previousState = {
      enabled: true,
      ipatente_cta_visible: true,
      _persist: { version: -1, rehydrated: true }
    };

    await expect(createMigrate(migrations)(previousState, 0)).resolves.toEqual({
      ...previousState,
      discover_more_ced_enabled: false
    });
  });
});
