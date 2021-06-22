import * as pot from "italia-ts-commons/lib/pot";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../features/bonus/bpd/model/RemoteValue";
import { ContentState, idpsSelector } from "../content";
import { SpidIdp } from "../../../../definitions/content/SpidIdp";
import { idps as mockedIdps } from "../__mock__/idps";
import { idps } from "../../../utils/idps";

const state: ContentState = {
  servicesMetadata: {
    byId: {}
  },
  municipality: {
    codiceCatastale: pot.none,
    data: pot.none
  },
  contextualHelp: pot.none,
  idps: remoteUndefined
};
describe("idps selector", () => {
  const contentState: ContentState = {
    ...state,
    idps: remoteReady({ items: mockedIdps })
  };

  it("should return the list of Idps available", () => {
    expect(idpsSelector.resultFunc(contentState)).toStrictEqual(mockedIdps);
  });

  const stateWithNoIdps: ContentState = {
    ...state,
    idps: remoteUndefined
  };
  it("should return the fallback Idps if state is undefined", () => {
    expect(idpsSelector.resultFunc(stateWithNoIdps)).toStrictEqual(idps);
  });

  const stateWithErrors: ContentState = {
    ...state,
    idps: remoteError(new Error("Some error"))
  };
  it("should return the fallback Idps if state has errors", () => {
    expect(idpsSelector.resultFunc(stateWithErrors)).toStrictEqual(idps);
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

  const customIdpsList: ContentState = {
    ...state,
    idps: remoteReady({ items: someIdps })
  };
  it("should return the set of IDPS from store", () => {
    expect(idpsSelector.resultFunc(customIdpsList)).toStrictEqual(someIdps);
  });

  const loadingState: ContentState = {
    ...state,
    idps: remoteLoading
  };
  it("should return the fallback IDPS if state is in loading", () => {
    expect(idpsSelector.resultFunc(loadingState)).toStrictEqual(idps);
  });
});
