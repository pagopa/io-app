import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../common/model/RemoteValue";
import { idpsSelector } from "../content";
import { idps as mockedIdps } from "../__mock__/idps";
import { idps, SpidIdp } from "../../../utils/idps";

describe("idps selector", () => {
  it("should return the list of Idps available", () => {
    expect(idpsSelector.resultFunc(remoteReady(mockedIdps))).toEqual(
      mockedIdps
    );
  });

  it("should return the fallback Idps if state is undefined", () => {
    expect(idpsSelector.resultFunc(remoteUndefined)).toEqual(idps);
  });

  it("should return the fallback Idps if state has errors", () => {
    expect(
      idpsSelector.resultFunc(remoteError(new Error("Some error")))
    ).toEqual(idps);
  });

  const someIdps: ReadonlyArray<SpidIdp> = [
    {
      id: "spid_id_1",
      name: "Spid ID 1",
      logo: {
        light: { uri: "http://placeimg.com/640/480/technics" }
      },
      profileUrl: "http://someuri.com"
    },
    {
      id: "spid_id_2",
      name: "Spid ID 2",
      logo: {
        light: { uri: "http://placeimg.com/640/480/some" }
      },
      profileUrl: "https://someuri.com"
    }
  ];

  it("should return the set of IDPS from store", () => {
    expect(idpsSelector.resultFunc(remoteReady(someIdps))).toEqual(someIdps);
  });

  it("should return the fallback IDPS if state is in loading", () => {
    expect(idpsSelector.resultFunc(remoteLoading)).toEqual(idps);
  });
});
