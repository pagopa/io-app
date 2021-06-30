import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../features/bonus/bpd/model/RemoteValue";
import { idpsSelector } from "../content";
import { SpidIdp } from "../../../../definitions/content/SpidIdp";
import { idps as mockedIdps } from "../__mock__/idps";
import { idps } from "../../../utils/idps";

describe("idps selector", () => {
  it("should return the list of Idps available", () => {
    expect(
      idpsSelector.resultFunc(remoteReady({ items: mockedIdps }))
    ).toStrictEqual(mockedIdps);
  });

  it("should return the fallback Idps if state is undefined", () => {
    expect(idpsSelector.resultFunc(remoteUndefined)).toStrictEqual(idps);
  });

  it("should return the fallback Idps if state has errors", () => {
    expect(
      idpsSelector.resultFunc(remoteError(new Error("Some error")))
    ).toStrictEqual(idps);
  });

  const someIdps: ReadonlyArray<SpidIdp> = [
    {
      id: "spid_id_1",
      name: "Spid ID 1",
      logo: "http://placeimg.com/640/480/technics",
      profileUrl: "http://someuri.com"
    },
    {
      id: "spid_id_2",
      name: "Spid ID 2",
      logo: "http://placeimg.com/640/480/some",
      profileUrl: "https://someuri.com"
    }
  ];

  it("should return the set of IDPS from store", () => {
    expect(
      idpsSelector.resultFunc(remoteReady({ items: someIdps }))
    ).toStrictEqual(someIdps);
  });

  it("should return the fallback IDPS if state is in loading", () => {
    expect(idpsSelector.resultFunc(remoteLoading)).toStrictEqual(idps);
  });
});
