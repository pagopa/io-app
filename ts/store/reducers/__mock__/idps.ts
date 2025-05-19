import { SpidIdp } from "../../../utils/idps";

export const idps: ReadonlyArray<SpidIdp> = [
  {
    id: "test",
    name: "Test",
    logo: {
      light: {
        uri: "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid.png"
      }
    },
    profileUrl: "",
    isTestIdp: true
  }
];
