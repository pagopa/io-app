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
  it("should freeze ItwConfig [review persist compatibility and migrate breaking changes before updating the snapshot]", () => {
    expect(ioTsShape(ItwConfig)).toMatchSnapshot();
  });
});

describe("ITW remote config migration", () => {
  test.each([
    { name: "without whats_new", config: {} },
    {
      name: "with whats_new",
      config: {
        whats_new: {
          min_app_version: { ios: "3.0.0", android: "3.0.0" }
        }
      }
    }
  ])("preserves a version 0 configuration $name", async ({ config }) => {
    const previousState = {
      enabled: true,
      min_app_version: { ios: "3.0.0", android: "3.0.0" },
      feedback_banner_visible: false,
      ipatente_cta_visible: true,
      ...config,
      _persist: { version: 0, rehydrated: true }
    };

    const migratedState = await createMigrate(migrations)(previousState, 0);

    expect(migratedState).toEqual(previousState);
    expect(ItwConfig.is(migratedState)).toBe(true);
  });

  test("leaves CED opportunities disabled while preserving the previous remote configuration", async () => {
    const previousState = {
      enabled: true,
      ipatente_cta_visible: true,
      _persist: { version: -1, rehydrated: true }
    };

    await expect(createMigrate(migrations)(previousState, 0)).resolves.toEqual({
      ...previousState,
      discover_more_ced: undefined
    });
  });
});
