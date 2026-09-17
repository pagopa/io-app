import { ItwConfig } from "@io-app/api-types/generated/definitions/content/ItwConfig";

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
