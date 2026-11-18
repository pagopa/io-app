import type { NfcAntennaConfidence, NfcAntennaPosition } from "./types";

// Generated from SIW-5555 and Google Play supported devices; see README.md.
export const antennaMapping: Readonly<
  Record<
    string,
    | Readonly<
        Record<
          string,
          readonly [NfcAntennaPosition, NfcAntennaConfidence] | undefined
        >
      >
    | undefined
  >
> = {
  a05s: {
    "sm-a057f": ["center", "low"],
    "sm-a057g": ["center", "low"],
    "sm-a057m": ["center", "low"]
  },
  a10: {
    "sm-a105f": ["top", "high"],
    "sm-a105fn": ["top", "high"],
    "sm-a105g": ["top", "high"],
    "sm-a105m": ["top", "high"],
    "sm-a105n": ["top", "high"]
  },
  a12: {
    "sm-a125f": ["center", "medium"],
    "sm-a125m": ["center", "medium"],
    "sm-a125n": ["center", "medium"]
  },
  a12s: {
    "sm-a127f": ["center", "medium"],
    "sm-a127m": ["center", "medium"]
  },
  a12u: {
    "sm-a125u": ["center", "medium"],
    "sm-a125u1": ["center", "medium"],
    "sm-a125w": ["center", "medium"],
    "sm-s127dl": ["center", "medium"]
  },
  a13: {
    "sm-a135f": ["top", "high"],
    "sm-a135m": ["top", "high"],
    "sm-a135n": ["top", "high"],
    "sm-a135u": ["top", "high"],
    "sm-a135u1": ["top", "high"]
  },
  a13ve: {
    "sm-a137f": ["top", "high"]
  },
  a14: {
    "sm-a145f": ["top", "high"],
    "sm-a145fb": ["top", "high"],
    "sm-a145m": ["top", "high"],
    "sm-a145mb": ["top", "high"]
  },
  a14m: {
    "sm-a145p": ["top", "high"],
    "sm-a145r": ["top", "high"]
  },
  a14x: {
    "sm-a146b": ["top", "high"],
    "sm-a146m": ["top", "high"]
  },
  a14xm: {
    "sm-a146p": ["top", "high"],
    "sm-a146u": ["top", "high"],
    "sm-a146u1": ["top", "high"],
    "sm-a146w": ["top", "high"],
    "sm-s146vl": ["top", "high"]
  },
  a15: {
    "sm-a155f": ["top", "high"],
    "sm-a155m": ["top", "high"],
    "sm-a155n": ["top", "high"]
  },
  a15x: {
    "sm-a1560": ["top", "high"],
    "sm-a156b": ["top", "high"],
    "sm-a156e": ["top", "high"],
    "sm-a156m": ["top", "high"],
    "sm-a156u": ["top", "high"],
    "sm-a156u1": ["top", "high"],
    "sm-a156w": ["top", "high"],
    "sm-s156v": ["top", "high"]
  },
  a16: {
    "sm-a165f": ["center", "medium"],
    "sm-a165m": ["center", "medium"],
    "sm-a165n": ["center", "medium"]
  },
  a16x: {
    "sm-a1660": ["top", "high"],
    "sm-a166b": ["top", "high"],
    "sm-a166e": ["top", "high"],
    "sm-a166m": ["top", "high"],
    "sm-a166u": ["top", "high"],
    "sm-a166u1": ["top", "high"],
    "sm-a166w": ["top", "high"],
    "sm-s166v": ["top", "high"]
  },
  a16xm: {
    "sm-a166p": ["top", "high"]
  },
  a17x: {
    "sm-a1760": ["top", "medium"],
    "sm-a176b": ["top", "medium"],
    "sm-a176u": ["top", "medium"],
    "sm-a176u1": ["top", "medium"],
    "sm-a176w": ["top", "medium"],
    "sm-s176v": ["top", "medium"]
  },
  a20e: {
    "sm-a202f": ["top", "high"]
  },
  a21s: {
    "sm-a217f": ["top", "high"],
    "sm-a217m": ["top", "high"],
    "sm-a217n": ["top", "high"]
  },
  a22: {
    "sm-a225f": ["top", "high"],
    "sm-a225m": ["top", "high"]
  },
  a22x: {
    "sm-a226br": ["top", "high"]
  },
  a23ex: {
    "sm-a233c": ["top", "high"]
  },
  a23xq: {
    "sm-a2360": ["top", "high"],
    "sm-a236b": ["top", "high"],
    "sm-a236e": ["top", "high"],
    "sm-a236m": ["top", "high"],
    "sm-a236u": ["top", "high"],
    "sm-a236u1": ["top", "high"],
    "sm-s236dl": ["top", "high"],
    "sm-s237vl": ["top", "high"]
  },
  a25ex: {
    "sm-a253c": ["top", "high"],
    "sm-a253q": ["top", "high"],
    "sm-a253z": ["top", "high"]
  },
  a25x: {
    "sm-a2560": ["top", "high"],
    "sm-a256b": ["top", "high"],
    "sm-a256e": ["top", "high"],
    "sm-a256n": ["top", "high"],
    "sm-a256u": ["top", "high"],
    "sm-a256u1": ["top", "high"],
    "sm-s256vl": ["top", "high"]
  },
  a26x: {
    "sm-a266b": ["center", "medium"],
    "sm-a266u": ["center", "medium"],
    "sm-a266u1": ["center", "medium"],
    "sm-s266v": ["center", "medium"]
  },
  a26xs: {
    "sm-a266m": ["center", "medium"]
  },
  a30s: {
    "sm-a307fn": ["top", "high"],
    "sm-a307g": ["top", "high"],
    "sm-a307gn": ["top", "high"],
    "sm-a307gt": ["top", "high"]
  },
  a31: {
    "sm-a315f": ["top", "high"],
    "sm-a315g": ["top", "high"],
    "sm-a315n": ["top", "high"]
  },
  a32: {
    "sm-a325f": ["center", "high"],
    "sm-a325m": ["center", "high"],
    "sm-a325n": ["center", "high"]
  },
  a32x: {
    "sm-a326b": ["center", "high"],
    "sm-a326br": ["center", "high"],
    "sm-a326u": ["center", "high"],
    "sm-a326u1": ["center", "high"],
    "sm-a326w": ["center", "high"],
    "sm-s326dl": ["center", "high"]
  },
  a33x: {
    "sm-a3360": ["top", "high"],
    "sm-a336b": ["top", "high"],
    "sm-a336e": ["top", "high"],
    "sm-a336m": ["top", "high"],
    "sm-a336n": ["top", "high"]
  },
  a34x: {
    "sm-a3460": ["top", "high"],
    "sm-a346b": ["top", "high"],
    "sm-a346e": ["top", "high"],
    "sm-a346m": ["top", "high"],
    "sm-a346n": ["top", "high"]
  },
  a35x: {
    "sm-a3560": ["top", "high"],
    "sm-a356b": ["top", "high"],
    "sm-a356e": ["top", "high"],
    "sm-a356n": ["top", "high"],
    "sm-a356u": ["top", "high"],
    "sm-a356u1": ["top", "high"],
    "sm-a356w": ["top", "high"],
    "sm-s356v": ["top", "high"]
  },
  a36xq: {
    "sm-a3660": ["top", "high"],
    "sm-a366b": ["top", "high"],
    "sm-a366e": ["top", "high"],
    "sm-a366n": ["top", "high"],
    "sm-a366q": ["top", "high"],
    "sm-a366u": ["top", "high"],
    "sm-a366u1": ["top", "high"],
    "sm-a366w": ["top", "high"],
    "sm-s366v": ["top", "high"]
  },
  a40: {
    "sm-a405fm": ["center", "low"],
    "sm-a405fn": ["center", "low"],
    "sm-a405s": ["center", "low"]
  },
  a41: {
    "sm-a415f": ["center", "medium"]
  },
  a50: {
    "sm-a505f": ["top", "high"],
    "sm-a505fm": ["top", "high"],
    "sm-a505fn": ["top", "high"],
    "sm-a505g": ["top", "high"],
    "sm-a505gn": ["top", "high"],
    "sm-a505gt": ["top", "high"],
    "sm-a505n": ["top", "high"],
    "sm-a505u": ["top", "high"],
    "sm-a505u1": ["top", "high"],
    "sm-a505w": ["top", "high"],
    "sm-a505yn": ["top", "high"],
    "sm-s506dl": ["top", "high"]
  },
  a51: {
    "sm-a515f": ["top", "high"],
    "sm-a515u": ["top", "high"],
    "sm-a515u1": ["top", "high"],
    "sm-a515w": ["top", "high"],
    "sm-a515x": ["top", "high"],
    "sm-s515dl": ["top", "high"]
  },
  a52q: {
    "sm-a525f": ["top", "high"],
    "sm-a525m": ["top", "high"]
  },
  a52sxq: {
    "sm-a528b": ["top", "high"],
    "sm-a528n": ["top", "high"]
  },
  a53x: {
    "sm-a5360": ["top", "high"],
    "sm-a536b": ["top", "high"],
    "sm-a536e": ["top", "high"],
    "sm-a536n": ["top", "high"],
    "sm-a536u": ["top", "high"],
    "sm-a536u1": ["top", "high"],
    "sm-a536w": ["top", "high"],
    "sm-s536dl": ["top", "high"]
  },
  a54x: {
    "sm-a5460": ["top", "high"],
    "sm-a546b": ["top", "high"],
    "sm-a546e": ["top", "high"],
    "sm-a546u": ["top", "high"],
    "sm-a546u1": ["top", "high"],
    "sm-a546v": ["top", "high"],
    "sm-a546w": ["top", "high"],
    "sm-s546vl": ["top", "high"]
  },
  a55x: {
    "sm-a5560": ["top", "high"],
    "sm-a556b": ["top", "high"],
    "sm-a556e": ["top", "high"]
  },
  a56x: {
    "sm-a5660": ["top", "high"],
    "sm-a566b": ["top", "high"],
    "sm-a566e": ["top", "high"],
    "sm-a566u1": ["top", "high"],
    "sm-a566w": ["top", "high"]
  },
  a70q: {
    "sm-a7050": ["top", "high"],
    "sm-a705f": ["top", "high"],
    "sm-a705fn": ["top", "high"],
    "sm-a705gm": ["top", "high"],
    "sm-a705mn": ["top", "high"],
    "sm-a705u": ["top", "high"],
    "sm-a705w": ["top", "high"],
    "sm-a705yn": ["top", "high"]
  },
  a71: {
    "sm-a715f": ["top", "high"],
    "sm-a715w": ["top", "high"],
    "sm-a715x": ["top", "high"]
  },
  a73g: {
    "sm-a700h": ["top", "high"]
  },
  a7alte: {
    "sm-a700f": ["top", "high"]
  },
  a7lte: {
    "sm-a700fd": ["top", "high"],
    "sm-a700x": ["top", "high"]
  },
  a7ltechn: {
    "sm-a7000": ["top", "high"],
    "sm-a700yd": ["top", "high"]
  },
  a7ltectc: {
    "sm-a7009": ["top", "high"]
  },
  a7ltektt: {
    "sm-a700k": ["top", "high"]
  },
  a7ltelgt: {
    "sm-a700l": ["top", "high"]
  },
  a7lteskt: {
    "sm-a700s": ["top", "high"]
  },
  a7y18ve: {
    "sm-a750c": ["top", "high"]
  },
  aether: {
    "22126rn91y": ["top", "high"]
  },
  akita: {
    "pixel 8a": ["center", "high"]
  },
  amber: {
    "21081111rg": ["top", "high"]
  },
  amethyst: {
    "24115ra8eg": ["top", "high"],
    "24115ra8ei": ["top", "high"]
  },
  apollo: {
    m2007j3sg: ["top", "medium"],
    m2007j3si: ["top", "medium"]
  },
  aristotle: {
    "2306epn60g": ["center", "medium"]
  },
  b0q: {
    "sm-s9080": ["center", "medium"],
    "sm-s908e": ["center", "medium"],
    "sm-s908n": ["center", "medium"],
    "sm-s908u": ["center", "medium"],
    "sm-s908u1": ["center", "medium"],
    "sm-s908w": ["center", "medium"]
  },
  b0s: {
    "sm-s908b": ["center", "medium"]
  },
  b4q: {
    "sm-f7210": ["bottom", "high"],
    "sm-f721b": ["bottom", "high"],
    "sm-f721c": ["bottom", "high"],
    "sm-f721n": ["bottom", "high"],
    "sm-f721u": ["bottom", "high"],
    "sm-f721u1": ["bottom", "high"],
    "sm-f721w": ["bottom", "high"]
  },
  b5q: {
    "sm-f7310": ["bottom", "high"],
    "sm-f731b": ["bottom", "high"],
    "sm-f731n": ["bottom", "high"],
    "sm-f731q": ["bottom", "high"],
    "sm-f731u": ["bottom", "high"],
    "sm-f731u1": ["bottom", "high"],
    "sm-f731w": ["bottom", "high"]
  },
  b6q: {
    "sm-f7410": ["bottom", "medium"],
    "sm-f741b": ["bottom", "medium"],
    "sm-f741n": ["bottom", "medium"],
    "sm-f741q": ["bottom", "medium"],
    "sm-f741u": ["bottom", "medium"],
    "sm-f741u1": ["bottom", "medium"],
    "sm-f741w": ["bottom", "medium"]
  },
  bangkk: {
    "moto g53 5g": ["center", "medium"],
    "moto g84 5g": ["center", "medium"]
  },
  begonia: {
    begonia: ["top", "high"],
    "redmi note 8 pro": ["top", "high"]
  },
  begoniain: {
    "redmi note 8 pro": ["top", "high"]
  },
  beryl: {
    "24094rad4i": ["top", "high"]
  },
  beyond0: {
    "sm-g970f": ["center", "high"],
    "sm-g970n": ["center", "high"]
  },
  beyond0q: {
    "sm-g9700": ["center", "high"],
    "sm-g9708": ["center", "high"],
    "sm-g970u": ["center", "high"],
    "sm-g970u1": ["center", "high"],
    "sm-g970w": ["center", "high"]
  },
  beyond1: {
    "sm-g973f": ["center", "high"],
    "sm-g973n": ["center", "high"]
  },
  beyond1q: {
    "sm-g9730": ["center", "high"],
    "sm-g9738": ["center", "high"],
    "sm-g973c": ["center", "high"],
    "sm-g973u": ["center", "high"],
    "sm-g973u1": ["center", "high"],
    "sm-g973w": ["center", "high"]
  },
  beyond2: {
    "sm-g975f": ["center", "high"],
    "sm-g975n": ["center", "high"]
  },
  beyond2q: {
    "sm-g9750": ["center", "high"],
    "sm-g9758": ["center", "high"],
    "sm-g975u": ["center", "high"],
    "sm-g975u1": ["center", "high"],
    "sm-g975w": ["center", "high"]
  },
  bluejay: {
    "pixel 6a": ["center", "high"]
  },
  camellian: {
    m2103k19g: ["top", "high"]
  },
  cancun: {
    cancun: ["top", "low"],
    "moto g14": ["top", "low"]
  },
  cancunf: {
    "moto g73 5g": ["center", "medium"],
    "xt2343-3": ["center", "medium"]
  },
  cattail: {
    cattail: ["top", "medium"],
    m2006c3mii: ["top", "medium"]
  },
  chopin: {
    "21061110ag": ["top", "high"],
    m2104k10ac: ["top", "high"]
  },
  citrine: {
    "24094rad4g": ["top", "high"]
  },
  cph1837: {
    cph1837: ["top", "medium"]
  },
  curtana: {
    curtana: ["top", "high"]
  },
  degas: {
    "2406apnfag": ["top", "medium"]
  },
  devon: {
    "moto g(100)": ["top", "medium"],
    "moto g32": ["top", "medium"]
  },
  dm1q: {
    "sm-s9110": ["center", "high"],
    "sm-s911b": ["center", "high"],
    "sm-s911c": ["center", "high"],
    "sm-s911n": ["center", "high"],
    "sm-s911u": ["center", "high"],
    "sm-s911u1": ["center", "high"],
    "sm-s911w": ["center", "high"]
  },
  dm2q: {
    "sm-s9160": ["center", "high"],
    "sm-s916b": ["center", "high"],
    "sm-s916n": ["center", "high"],
    "sm-s916u": ["center", "high"],
    "sm-s916u1": ["center", "high"],
    "sm-s916w": ["center", "high"]
  },
  dm3q: {
    "sm-s9180": ["center", "high"],
    "sm-s918b": ["center", "high"],
    "sm-s918n": ["center", "high"],
    "sm-s918q": ["center", "high"],
    "sm-s918u": ["center", "high"],
    "sm-s918u1": ["center", "high"],
    "sm-s918w": ["center", "high"]
  },
  dreamlte: {
    "sm-g950f": ["center", "medium"]
  },
  dreamlteks: {
    "sm-g950n": ["center", "medium"]
  },
  dreamqltecan: {
    "sm-g950w": ["center", "medium"]
  },
  dreamqltechn: {
    "sm-g9500": ["center", "medium"]
  },
  dreamqltecmcc: {
    "sm-g9508": ["center", "medium"]
  },
  dreamqltesq: {
    "sm-g950u": ["center", "medium"]
  },
  dreamqlteue: {
    "sm-g950u1": ["center", "medium"]
  },
  e1q: {
    "sm-s9210": ["top", "high"],
    "sm-s921e": ["top", "high"],
    "sm-s921q": ["top", "high"],
    "sm-s921u": ["top", "high"],
    "sm-s921u1": ["top", "high"],
    "sm-s921w": ["top", "high"]
  },
  e1s: {
    "sm-s921b": ["top", "high"],
    "sm-s921n": ["top", "high"]
  },
  e2q: {
    "sm-s9260": ["top", "high"],
    "sm-s926u": ["top", "high"],
    "sm-s926u1": ["top", "high"],
    "sm-s926w": ["top", "high"]
  },
  e2s: {
    "sm-s926b": ["top", "high"],
    "sm-s926n": ["top", "high"]
  },
  e3q: {
    "sm-s9280": ["top", "high"],
    "sm-s928b": ["top", "high"],
    "sm-s928n": ["top", "high"],
    "sm-s928q": ["top", "high"],
    "sm-s928u": ["top", "high"],
    "sm-s928u1": ["top", "high"],
    "sm-s928w": ["top", "high"]
  },
  earth: {
    "22120rn86g": ["top", "high"],
    "22120rn86i": ["top", "high"],
    "2212arnc4l": ["top", "high"]
  },
  emerald: {
    "23117ra68g": ["top", "high"]
  },
  fire: {
    "23053rn02a": ["top", "high"],
    "23053rn02i": ["top", "high"],
    "23053rn02l": ["top", "high"]
  },
  fleur: {
    "2201117sy": ["top", "high"]
  },
  g0q: {
    "sm-s9060": ["center", "high"],
    "sm-s906e": ["center", "high"],
    "sm-s906n": ["center", "high"],
    "sm-s906u": ["center", "high"],
    "sm-s906u1": ["center", "high"],
    "sm-s906w": ["center", "high"]
  },
  g0s: {
    "sm-s906b": ["center", "high"]
  },
  galahad: {
    galahad: ["top", "medium"],
    m2004j19c: ["top", "medium"]
  },
  gale: {
    "23100rn82l": ["center", "medium"],
    "23106rn0da": ["center", "medium"],
    "2311drn14i": ["center", "medium"]
  },
  garnet: {
    "2312crad3c": ["top", "high"],
    "2312dra50c": ["top", "high"],
    "2312dra50g": ["top", "high"],
    "2312dra50i": ["top", "high"]
  },
  gauguin: {
    m2007j17g: ["top", "medium"]
  },
  gauguinpro: {
    m2007j17c: ["top", "high"]
  },
  gold: {
    "2312draabc": ["top", "high"],
    "2312draabi": ["top", "high"]
  },
  gust: {
    "23108rn04y": ["center", "medium"]
  },
  heat: {
    "23053rn02y": ["top", "high"]
  },
  "hnabr-m": {
    "abr-nx1": ["top", "medium"],
    "abr-nx3": ["top", "medium"]
  },
  "hnali-q": {
    "ali-nx3": ["center", "medium"]
  },
  "hnbrp-q1": {
    "brp-nx1m": ["top", "medium"],
    "brp-nx3": ["top", "medium"]
  },
  "hncrt-m1": {
    "crt-lx1": ["top", "medium"],
    "crt-lx2": ["top", "medium"],
    "crt-lx3": ["top", "medium"]
  },
  "hncrt-m2": {
    "crt-nx1": ["top", "high"],
    "crt-nx3": ["top", "high"]
  },
  hndnyx: {
    "dny-nx9": ["top", "high"]
  },
  hneli: {
    "eli-an00": ["top", "high"]
  },
  hnelix: {
    "eli-nx9": ["top", "high"]
  },
  "hnlly-m1": {
    "lly-nx1": ["top", "medium"],
    "lly-nx3": ["top", "medium"]
  },
  "hnlly-q": {
    "lly-lx1": ["top", "medium"],
    "lly-lx2": ["top", "medium"],
    "lly-lx3": ["top", "medium"]
  },
  hnrea: {
    "rea-nx9": ["top", "high"]
  },
  "hnrmo-q": {
    "rmo-nx3": ["center", "low"]
  },
  husky: {
    "pixel 8 pro": ["top", "high"]
  },
  "hw-02l": {
    "hw-02l": ["top", "medium"]
  },
  hwele: {
    "ele-al00": ["top", "medium"],
    "ele-l04": ["top", "medium"],
    "ele-l09": ["top", "medium"],
    "ele-l14": ["top", "medium"],
    "ele-l29": ["top", "medium"],
    "ele-l39": ["top", "medium"],
    "ele-l49": ["top", "medium"],
    "ele-tl00": ["top", "medium"]
  },
  hwmar: {
    hwv33: ["center", "medium"],
    "mar-lx1a": ["center", "medium"],
    "mar-lx1am": ["center", "medium"],
    "mar-lx1b": ["center", "medium"],
    "mar-lx1m": ["center", "medium"],
    "mar-lx1mm": ["center", "medium"],
    "mar-lx2": ["center", "medium"],
    "mar-lx2b": ["center", "medium"],
    "mar-lx2j": ["center", "medium"],
    "mar-lx2m": ["center", "medium"],
    "mar-lx3a": ["center", "medium"],
    "mar-lx3am": ["center", "medium"],
    "mar-lx3bm": ["center", "medium"]
  },
  "hwpot-h": {
    "pot-lx1": ["top", "medium"],
    "pot-lx1af": ["top", "medium"]
  },
  hwsne: {
    "sne-lx1": ["top", "medium"],
    "sne-lx2": ["top", "medium"],
    "sne-lx3": ["top", "medium"]
  },
  hwvog: {
    "vog-al00": ["top", "medium"],
    "vog-al10": ["top", "medium"],
    "vog-l04": ["top", "medium"],
    "vog-l09": ["top", "medium"],
    "vog-l29": ["top", "medium"],
    "vog-tl00": ["top", "medium"]
  },
  iron: {
    "2312draabg": ["top", "high"]
  },
  j6lte: {
    "sm-j600f": ["top", "medium"],
    "sm-j600fn": ["top", "medium"],
    "sm-j600g": ["top", "medium"],
    "sm-j600gt": ["top", "medium"]
  },
  j6ltekx: {
    "sm-j600n": ["top", "medium"]
  },
  j6ltelgt: {
    "sm-j600l": ["top", "medium"]
  },
  joyeuse: {
    "redmi note 9 pro": ["top", "high"]
  },
  lake: {
    "2409brn2cy": ["center", "medium"]
  },
  lamu: {
    lamu_g: ["top", "high"],
    "moto g15": ["top", "high"]
  },
  lancelot: {
    m2004j19g: ["top", "medium"]
  },
  lemon: {
    m2010j19sy: ["top", "medium"]
  },
  lime: {
    m2010j19sg: ["top", "medium"]
  },
  lisa: {
    "2109119dg": ["center", "medium"]
  },
  lynx: {
    "pixel 7a": ["center", "high"]
  },
  malachite: {
    "24090ra29c": ["top", "high"],
    "24090ra29g": ["top", "high"],
    "24090ra29i": ["top", "high"]
  },
  malmo: {
    "moto g85 5g": ["top", "high"],
    "motorola edge 40 pro": ["top", "high"],
    "xt2427-4": ["top", "high"]
  },
  maltose: {
    m2101k7bl: ["top", "high"]
  },
  manaus: {
    "motorola edge (2022)": ["top", "high"],
    "motorola edge 40 neo": ["top", "high"]
  },
  miami: {
    "moto g71 5g": ["top", "high"],
    "motorola edge 30 neo": ["top", "high"]
  },
  miel: {
    "2201117sg": ["top", "high"],
    "2201117si": ["top", "high"],
    "2201117sl": ["top", "high"]
  },
  mona: {
    "moto g stylus - 2025": ["top", "high"],
    "motorola edge 50 fusion": ["top", "high"]
  },
  nice: {
    "moto g86 5g": ["top", "high"]
  },
  nord: {
    ac2001: ["top", "low"],
    ac2003: ["top", "low"]
  },
  o1q: {
    "sm-g9910": ["center", "high"],
    "sm-g991q": ["center", "high"],
    "sm-g991u1": ["center", "high"],
    "sm-g991w": ["center", "high"]
  },
  o1s: {
    "sm-g991b": ["center", "high"],
    "sm-g991n": ["center", "high"]
  },
  obsidian: {
    "24116raccg": ["top", "high"]
  },
  op4b79l1: {
    cph1931: ["top", "medium"],
    cph1933: ["top", "medium"]
  },
  op4b80l1: {
    cph1937: ["top", "medium"],
    cph1941: ["top", "medium"],
    cph1943: ["top", "medium"]
  },
  op4b9b: {
    cph2021: ["top", "medium"]
  },
  op4bdcl1: {
    cph2065: ["top", "high"]
  },
  op4c72l1: {
    cph2067: ["top", "high"]
  },
  op4c77l1: {
    cph2061: ["top", "high"]
  },
  op4c7bl1: {
    cph2069: ["top", "high"]
  },
  op4efdl1: {
    cph2135: ["top", "medium"]
  },
  op4f0bl1: {
    cph2207: ["top", "high"]
  },
  op4f1bl1: {
    cph2145: ["top", "high"]
  },
  op4f39l1: {
    cph2195: ["top", "medium"],
    cph2197: ["top", "medium"],
    cph2303: ["top", "medium"]
  },
  op4f7fl1: {
    cph2247: ["top", "high"]
  },
  op4f83l1: {
    cph2251: ["top", "high"]
  },
  op4f97: {
    cph2271: ["top", "medium"],
    cph2273: ["top", "high"]
  },
  op52f3l1: {
    cph2483: ["top", "high"],
    cph2495: ["top", "high"]
  },
  op532fl1: {
    cph2343: ["top", "high"]
  },
  op5655: {
    phw110: ["top", "high"]
  },
  op56e8l1: {
    cph2529: ["top", "high"]
  },
  op5705l1: {
    cph2531: ["top", "high"]
  },
  op573dl1: {
    a303op: ["top", "medium"],
    cph2553: ["top", "medium"],
    cph2557: ["top", "medium"]
  },
  op574fl1: {
    cph2577: ["top", "high"]
  },
  op59fb: {
    pjy110: ["top", "medium"]
  },
  op5a33: {
    pka110: ["top", "medium"]
  },
  op5ae1l1: {
    cph2629: ["top", "high"]
  },
  op5b05l1: {
    a402op: ["top", "medium"],
    cph2639: ["top", "medium"],
    cph2665: ["top", "medium"]
  },
  op5ea7l1: {
    cph2693: ["top", "medium"]
  },
  op5ec7l1: {
    cph2699: ["top", "high"]
  },
  opd4a1l1: {
    cph2371: ["top", "high"]
  },
  p3q: {
    "sm-g9980": ["center", "high"],
    "sm-g998u": ["center", "high"],
    "sm-g998u1": ["center", "high"],
    "sm-g998w": ["center", "high"]
  },
  p3s: {
    "sm-g998b": ["center", "high"],
    "sm-g998n": ["center", "high"]
  },
  pa1q: {
    "sm-s9310": ["top", "high"],
    "sm-s931b": ["top", "high"],
    "sm-s931n": ["top", "high"],
    "sm-s931q": ["top", "high"],
    "sm-s931u": ["top", "high"],
    "sm-s931u1": ["top", "high"],
    "sm-s931w": ["top", "high"],
    "sm-s931z": ["top", "high"]
  },
  pa2q: {
    "sm-s9360": ["top", "high"],
    "sm-s936b": ["top", "high"],
    "sm-s936n": ["top", "high"],
    "sm-s936u": ["top", "high"],
    "sm-s936u1": ["top", "high"],
    "sm-s936w": ["top", "high"]
  },
  pa3q: {
    "sm-s9380": ["top", "high"],
    "sm-s938b": ["top", "high"],
    "sm-s938n": ["top", "high"],
    "sm-s938q": ["top", "high"],
    "sm-s938u": ["top", "high"],
    "sm-s938u1": ["top", "high"],
    "sm-s938w": ["top", "high"],
    "sm-s938z": ["top", "high"]
  },
  panther: {
    "pixel 7": ["top", "high"]
  },
  peux: {
    "2201116si": ["top", "high"]
  },
  pissarro: {
    "21091116c": ["top", "high"]
  },
  pissarropro: {
    "21091116ug": ["top", "high"]
  },
  pomelo: {
    m2010j19sl: ["top", "medium"]
  },
  pond: {
    "2409brn2ca": ["center", "medium"],
    "2409brn2cl": ["center", "medium"]
  },
  q7q: {
    "sm-f9660": ["center", "medium"],
    "sm-f966b": ["center", "medium"],
    "sm-f966n": ["center", "medium"],
    "sm-f966q": ["center", "medium"],
    "sm-f966u": ["center", "medium"],
    "sm-f966u1": ["center", "medium"],
    "sm-f966w": ["center", "medium"],
    "sm-f966z": ["center", "medium"]
  },
  r0q: {
    "sm-s9010": ["center", "high"],
    "sm-s901e": ["center", "high"],
    "sm-s901n": ["center", "high"],
    "sm-s901u": ["center", "high"],
    "sm-s901u1": ["center", "high"],
    "sm-s901w": ["center", "high"]
  },
  r0s: {
    "sm-s901b": ["center", "high"]
  },
  r11q: {
    "sm-s7110": ["center", "high"],
    "sm-s711u": ["center", "high"],
    "sm-s711u1": ["center", "high"],
    "sm-s711w": ["center", "high"]
  },
  r11s: {
    "sm-s711b": ["center", "high"],
    "sm-s711n": ["center", "high"]
  },
  r12s: {
    "sm-s7210": ["top", "high"],
    "sm-s721b": ["top", "high"],
    "sm-s721n": ["top", "high"],
    "sm-s721q": ["top", "high"],
    "sm-s721u": ["top", "high"],
    "sm-s721u1": ["top", "high"],
    "sm-s721w": ["top", "high"]
  },
  r5q: {
    "sm-g770f": ["center", "high"],
    "sm-g770u1": ["center", "high"]
  },
  r8q: {
    "sm-g780g": ["center", "high"],
    "sm-g7810": ["center", "high"],
    "sm-g781b": ["center", "high"],
    "sm-g781n": ["center", "high"],
    "sm-g781u": ["center", "high"],
    "sm-g781u1": ["center", "high"],
    "sm-g781v": ["center", "high"],
    "sm-g781w": ["center", "high"]
  },
  r8s: {
    "sm-g780f": ["center", "high"]
  },
  r9q: {
    "sm-g9900": ["center", "high"],
    "sm-g990b": ["center", "high"],
    "sm-g990b2": ["center", "high"],
    "sm-g990u": ["center", "high"],
    "sm-g990u1": ["center", "high"],
    "sm-g990u2": ["center", "high"],
    "sm-g990u3": ["center", "high"],
    "sm-g990w": ["center", "high"],
    "sm-g990w2": ["center", "high"]
  },
  r9s: {
    "sm-g990e": ["center", "high"]
  },
  rain: {
    "220333qny": ["top", "medium"]
  },
  re507c: {
    rmx3361: ["top", "low"]
  },
  re54abl1: {
    rmx3360: ["top", "low"],
    rmx3363: ["top", "low"]
  },
  renoir: {
    m2101k9c: ["top", "high"],
    m2101k9g: ["top", "high"]
  },
  rosemary: {
    m2101k7bl: ["top", "high"],
    m2101k7bny: ["top", "high"]
  },
  rothko: {
    "2407fpn8eg": ["top", "medium"],
    "2407fpn8er": ["top", "medium"],
    a402xm: ["top", "medium"]
  },
  ruby: {
    "22101316c": ["top", "high"],
    "22101316g": ["top", "high"],
    "22101316i": ["top", "high"]
  },
  rubypro: {
    "22101316ug": ["top", "high"]
  },
  sapphire: {
    "23129ra5fl": ["top", "high"],
    "23129raa4g": ["top", "high"]
  },
  sapphiren: {
    "23124ra7eo": ["top", "high"]
  },
  "sc-02j": {
    "sc-02j": ["center", "medium"]
  },
  "sc-02k": {
    "sc-02k": ["center", "medium"]
  },
  "sc-03k": {
    "sc-03k": ["center", "medium"]
  },
  "sc-03l": {
    "sc-03l": ["center", "high"]
  },
  "sc-04l": {
    "sc-04l": ["center", "high"]
  },
  "sc-41a": {
    "sc-41a": ["center", "medium"]
  },
  "sc-51b": {
    "sc-51b": ["center", "high"]
  },
  "sc-51c": {
    "sc-51c": ["center", "high"]
  },
  "sc-51d": {
    "sc-51d": ["center", "high"]
  },
  "sc-51e": {
    "sc-51e": ["top", "high"]
  },
  "sc-51f": {
    "sc-51f": ["top", "high"]
  },
  "sc-52b": {
    "sc-52b": ["center", "high"]
  },
  "sc-52c": {
    "sc-52c": ["center", "medium"]
  },
  "sc-52d": {
    "sc-52d": ["center", "high"]
  },
  "sc-52e": {
    "sc-52e": ["top", "high"]
  },
  "sc-52f": {
    "sc-52f": ["top", "high"]
  },
  "sc-53c": {
    "sc-53c": ["top", "high"]
  },
  "sc-53d": {
    "sc-53d": ["top", "high"]
  },
  "sc-53e": {
    "sc-53e": ["top", "high"]
  },
  "sc-53f": {
    "sc-53f": ["top", "high"]
  },
  "sc-54c": {
    "sc-54c": ["bottom", "high"]
  },
  "sc-54d": {
    "sc-54d": ["bottom", "high"]
  },
  "sc-54e": {
    "sc-54e": ["bottom", "medium"]
  },
  "sc-54f": {
    "sc-54f": ["top", "high"]
  },
  "sc-56b": {
    "sc-56b": ["top", "high"]
  },
  "sc-56c": {
    "sc-56c": ["top", "high"]
  },
  "sc-56f": {
    "sc-56f": ["center", "medium"]
  },
  scg08: {
    scg08: ["center", "high"]
  },
  scg09: {
    scg09: ["center", "high"]
  },
  scg10: {
    scg10: ["center", "high"]
  },
  scg13: {
    scg13: ["center", "high"]
  },
  scg14: {
    scg14: ["center", "medium"]
  },
  scg15: {
    scg15: ["top", "high"]
  },
  scg17: {
    scg17: ["bottom", "high"]
  },
  scg18: {
    scg18: ["top", "high"]
  },
  scg19: {
    scg19: ["center", "high"]
  },
  scg20: {
    scg20: ["center", "high"]
  },
  scg21: {
    scg21: ["top", "high"]
  },
  scg23: {
    scg23: ["bottom", "high"]
  },
  scg24: {
    scg24: ["center", "high"]
  },
  scg25: {
    scg25: ["top", "high"]
  },
  scg26: {
    scg26: ["top", "high"]
  },
  scg27: {
    scg27: ["top", "high"]
  },
  scg29: {
    scg29: ["bottom", "medium"]
  },
  scg30: {
    scg30: ["top", "high"]
  },
  scg31: {
    scg31: ["top", "high"]
  },
  scg32: {
    scg32: ["top", "high"]
  },
  scg33: {
    scg33: ["top", "high"]
  },
  scg34: {
    scg34: ["center", "medium"]
  },
  scout: {
    "motorola edge 60": ["top", "high"]
  },
  scv36: {
    scv36: ["center", "medium"]
  },
  scv38: {
    scv38: ["center", "medium"]
  },
  scv39: {
    scv39: ["center", "medium"]
  },
  scv41: {
    scv41: ["center", "high"]
  },
  scv42: {
    scv42: ["center", "high"]
  },
  scv48: {
    scv48: ["center", "medium"]
  },
  secret: {
    m2101k7bg: ["top", "high"]
  },
  shiba: {
    "pixel 8": ["top", "high"]
  },
  spes: {
    "2201117tg": ["top", "high"],
    "2201117ti": ["top", "high"],
    "2201117tl": ["top", "high"]
  },
  spesn: {
    "2201117ty": ["top", "high"]
  },
  star2lte: {
    "sm-g965f": ["center", "medium"]
  },
  star2lteks: {
    "sm-g965n": ["center", "medium"]
  },
  star2qltechn: {
    "sm-g9650": ["center", "medium"]
  },
  star2qltecs: {
    "sm-g965w": ["center", "medium"]
  },
  star2qltesq: {
    "sm-g965u": ["center", "medium"]
  },
  star2qlteue: {
    "sm-g965u1": ["center", "medium"]
  },
  starlte: {
    "sm-g960f": ["center", "medium"]
  },
  starlteks: {
    "sm-g960n": ["center", "medium"]
  },
  starqltechn: {
    "sm-g9600": ["center", "medium"]
  },
  starqltecmcc: {
    "sm-g9608": ["center", "medium"]
  },
  starqltecs: {
    "sm-g960w": ["center", "medium"]
  },
  starqltesq: {
    "sm-g960u": ["center", "medium"]
  },
  starqlteue: {
    "sm-g960u1": ["center", "medium"]
  },
  sweet: {
    "2209116ag": ["top", "high"],
    m2101k6g: ["top", "high"]
  },
  sweetin: {
    m2101k6p: ["top", "high"]
  },
  t2q: {
    "sm-g9960": ["center", "high"],
    "sm-g996u": ["center", "high"],
    "sm-g996u1": ["center", "high"],
    "sm-g996w": ["center", "high"]
  },
  t2s: {
    "sm-g996b": ["center", "high"],
    "sm-g996n": ["center", "high"]
  },
  tanzanite: {
    "24117rn76e": ["top", "high"],
    "24117rn76g": ["top", "high"],
    "24117rn76l": ["top", "high"],
    "24117rn76o": ["top", "high"]
  },
  taoyao: {
    "2203129g": ["center", "medium"]
  },
  tapas: {
    "23021raaeg": ["top", "high"],
    "23027rad4i": ["top", "high"],
    "23028ra60l": ["top", "high"]
  },
  tegu: {
    "pixel 9a": ["center", "high"]
  },
  tokay: {
    "pixel 9": ["top", "high"]
  },
  topaz: {
    "23021raa2y": ["top", "high"]
  },
  veux: {
    "2201116sg": ["top", "high"],
    "2201116sr": ["top", "high"]
  },
  vida: {
    "2201116ti": ["top", "high"]
  },
  vili: {
    "2107113sg": ["top", "high"],
    "2107113si": ["top", "high"],
    "2107113sr": ["top", "high"]
  },
  viva: {
    "2201116tg": ["top", "high"]
  },
  willow: {
    "redmi note 8t": ["top", "medium"],
    willow: ["top", "medium"]
  },
  wind: {
    "220333ql": ["top", "medium"]
  },
  xig04: {
    xig04: ["center", "medium"]
  },
  xig05: {
    xig05: ["top", "high"]
  },
  xig07: {
    xig07: ["top", "medium"]
  },
  zircon: {
    "23090ra98g": ["top", "high"],
    "23090ra98i": ["top", "high"],
    "24040ra98r": ["top", "high"]
  }
};
