import { ImageSourcePropType } from "react-native";
import { SpidIdp } from "../../definitions/content/SpidIdp";
// since this is a test SPID idp, we set isTestIdp flag to avoid rendering.
// It is used has a placeholder to handle taps count on it and open when
// taps count threadshold is reached (see https://www.pivotaltracker.com/story/show/172082895)

export type LocalIdpsFallback = SpidIdp & { localLogo?: ImageSourcePropType };

export const idps: ReadonlyArray<LocalIdpsFallback> = [
  {
    id: "arubaid",
    name: "Aruba",
    localLogo: require("../../img/spid-idp-arubaid.png"),
    logo: "",
    profileUrl: "https://selfcarespid.aruba.it"
  },
  {
    id: "infocertid",
    name: "Infocert",
    logo: "",
    localLogo: require("../../img/spid-idp-infocertid.png"),
    profileUrl: "https://my.infocert.it/selfcare"
  },
  {
    id: "intesaid",
    name: "Intesa",
    localLogo: require("../../img/spid-idp-intesaid.png"),
    logo: "",
    profileUrl: "https://spid.intesa.it"
  },
  {
    id: "lepidaid",
    name: "Lepida",
    logo: "",
    localLogo: require("../../img/spid-idp-lepidaid.png"),
    profileUrl: "https://id.lepida.it/"
  },
  {
    id: "namirialid",
    name: "Namirial",
    logo: "",
    localLogo: require("../../img/spid-idp-namirialid.png"),
    profileUrl: "https://idp.namirialtsp.com/idp"
  },
  {
    id: "posteid",
    name: "Poste",
    logo: "",
    localLogo: require("../../img/spid-idp-posteid.png"),
    profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
  },
  {
    id: "sielteid",
    name: "Sielte",
    logo: "",
    localLogo: require("../../img/spid-idp-sielteid.png"),
    profileUrl: "https://myid.sieltecloud.it/profile/"
  },
  {
    id: "spiditalia",
    name: "SPIDItalia Register.it",
    logo: "",
    localLogo: require("../../img/spid-idp-spiditalia.png"),
    profileUrl: "https://spid.register.it"
  },
  {
    id: "timid",
    name: "Telecom Italia",
    logo: "",
    localLogo: require("../../img/spid-idp-timid.png"),
    profileUrl: "https://id.tim.it/identity/private/"
  }
];
