# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.51.0-rc.3](https://github.com/pagopa/io-app/compare/2.51.0-rc.2...2.51.0-rc.3) (2024-01-25)


### Chores

* [[IOBP-517](https://pagopa.atlassian.net/browse/IOBP-517)] Removes unnecessary gallery permission on iOS  ([#5433](https://github.com/pagopa/io-app/issues/5433)) ([229906d](https://github.com/pagopa/io-app/commit/229906d6ee7860c4a357cd4f1a557d6ea2c9dc1f))
* bump fastlane from 2.212.1 to 2.212.2 ([651f4a6](https://github.com/pagopa/io-app/commit/651f4a6effe571701aa44e557669becbc870244a))

## [2.51.0-rc.2](https://github.com/pagopa/io-app/compare/2.51.0-rc.1...2.51.0-rc.2) (2024-01-24)


### Features

* [[IOCOM-922](https://pagopa.atlassian.net/browse/IOCOM-922)] Remove medical prescription ([#5407](https://github.com/pagopa/io-app/issues/5407)) ([b68ed9d](https://github.com/pagopa/io-app/commit/b68ed9d9d820bd6224b24c1703f31fb2aabe9639))
* [[IOPID-1391](https://pagopa.atlassian.net/browse/IOPID-1391)] Fix tablet compatibility alert displaying ([#5417](https://github.com/pagopa/io-app/issues/5417)) ([9fc529f](https://github.com/pagopa/io-app/commit/9fc529f943ab7854f84980655e0064c77c699f33))


### Bug Fixes

* [[IOBP-512](https://pagopa.atlassian.net/browse/IOBP-512)] Wallet details with new generic error screen ([#5427](https://github.com/pagopa/io-app/issues/5427)) ([893d6e4](https://github.com/pagopa/io-app/commit/893d6e4ffeef697316c8811fbca3382a1e7b4223))
* [[IOBP-515](https://pagopa.atlassian.net/browse/IOBP-515)] Expiry date into new wallet details screen ([#5418](https://github.com/pagopa/io-app/issues/5418)) ([3431429](https://github.com/pagopa/io-app/commit/3431429fa9d6f7ee5d92fd814af4e9d365c71647))
* [[IOPID-1359](https://pagopa.atlassian.net/browse/IOPID-1359)] Fix missing email on validation blocking screen ([#5414](https://github.com/pagopa/io-app/issues/5414)) ([20a931d](https://github.com/pagopa/io-app/commit/20a931d48d44721689c874b6dbb55ffb335b398f))
* [[IOPID-1408](https://pagopa.atlassian.net/browse/IOPID-1408)] Fix cdu email insert screen logic  ([#5430](https://github.com/pagopa/io-app/issues/5430)) ([3eb1b82](https://github.com/pagopa/io-app/commit/3eb1b82159343d4daa7a8a16f04e9dfed582ba41))


### Chores

* [[IOAPPCROSS-209](https://pagopa.atlassian.net/browse/IOAPPCROSS-209)] Fix onboarding screens + Fix E2E test ([#5410](https://github.com/pagopa/io-app/issues/5410)) ([30fe477](https://github.com/pagopa/io-app/commit/30fe4773491fe6bfeb12f9a24a7e9bd1c2afbd6f))
* [[IOBP-316](https://pagopa.atlassian.net/browse/IOBP-316)] Add return to origin page after payment flow completion ([#5399](https://github.com/pagopa/io-app/issues/5399)) ([3e0f184](https://github.com/pagopa/io-app/commit/3e0f184820d5a0667984207f53863b5cfb044c07))
* [[IOBP-455](https://pagopa.atlassian.net/browse/IOBP-455)] Removal of BonusVacanze references across the app ([#5408](https://github.com/pagopa/io-app/issues/5408)) ([3a476ba](https://github.com/pagopa/io-app/commit/3a476bae0900a003de45b41ae10cd762bb03526f))
* [[IOBP-492](https://pagopa.atlassian.net/browse/IOBP-492)] BonusVacanze removal ([#5411](https://github.com/pagopa/io-app/issues/5411)) ([d461ab0](https://github.com/pagopa/io-app/commit/d461ab012ef8d54afdc321bb95744f022b056d3d))
* [[IOBP-510](https://pagopa.atlassian.net/browse/IOBP-510)] Add `UIWalletDetailsInfo` to bypass `WalletDetailsInfo`'s `type` enum. ([#5412](https://github.com/pagopa/io-app/issues/5412)) ([6e56bac](https://github.com/pagopa/io-app/commit/6e56bac02ad2b04cbe92adbf9c91ab251124210e))
* [[IOPID-1298](https://pagopa.atlassian.net/browse/IOPID-1298),[IOPID-1396](https://pagopa.atlassian.net/browse/IOPID-1396)] `Main` stack navigator - `startup` saga synch ([#5420](https://github.com/pagopa/io-app/issues/5420)) ([71d6507](https://github.com/pagopa/io-app/commit/71d6507f19950c4bd4c05ce00ef2ccab2e664211))
* [[IOPID-1301](https://pagopa.atlassian.net/browse/IOPID-1301)] Bump ToS version from 4.7 to 4.8"" ([#5402](https://github.com/pagopa/io-app/issues/5402)) ([46af866](https://github.com/pagopa/io-app/commit/46af86615b881d57a9f785092eca3baf0cc89ada)), closes [pagopa/io-app#5391](https://github.com/pagopa/io-app/issues/5391)
* [[IOPID-1318](https://pagopa.atlassian.net/browse/IOPID-1318)] Fix MP events ([#5405](https://github.com/pagopa/io-app/issues/5405)) ([4b957a0](https://github.com/pagopa/io-app/commit/4b957a0cd659e42f8d55e0c7f5df1cf62fc3064d))
* e2e fix ([#5416](https://github.com/pagopa/io-app/issues/5416)) ([0a08463](https://github.com/pagopa/io-app/commit/0a0846343a02745d652f4555b41770358178845d))
* fix E2E tests after main stack navigator and startup saga sync ([#5429](https://github.com/pagopa/io-app/issues/5429)) ([d34be63](https://github.com/pagopa/io-app/commit/d34be635f123b5141b88fb2df2c4963811af3ead))
* Language 🇩🇪 adjustments  ([#5413](https://github.com/pagopa/io-app/issues/5413)) ([9634f37](https://github.com/pagopa/io-app/commit/9634f3728e0ecea14f137e4c730af7339ed7d014))
* **deps:** bump aiohttp from 3.8.6 to 3.9.0 in /scripts/check_urls ([#5339](https://github.com/pagopa/io-app/issues/5339)) ([d5d9499](https://github.com/pagopa/io-app/commit/d5d9499c5742cf7a40e9d3e4f874245599c1e9dc))

## [2.51.0-rc.1](https://github.com/pagopa/io-app/compare/2.51.0-rc.0...2.51.0-rc.1) (2024-01-17)


### Features

* [[IOCOM-793](https://pagopa.atlassian.net/browse/IOCOM-793)] Rename the sagas in the `features/messages/saga` folder ([#5403](https://github.com/pagopa/io-app/issues/5403)) ([b33bafb](https://github.com/pagopa/io-app/commit/b33bafb1b0b0aca84e6fd5064eac7efd867b6a17))


### Bug Fixes

* [[IABT-1515](https://pagopa.atlassian.net/browse/IABT-1515)] Fix date format in FCI data sharing screen ([#5365](https://github.com/pagopa/io-app/issues/5365)) ([a1d2b04](https://github.com/pagopa/io-app/commit/a1d2b0420b4acb579a2f478a25c1124c9107cddb))
* [[IOCOM-645](https://pagopa.atlassian.net/browse/IOCOM-645),[IABT-1485](https://pagopa.atlassian.net/browse/IABT-1485)] Fix an Android crash when dealing with calendar events ([#5404](https://github.com/pagopa/io-app/issues/5404)) ([a320053](https://github.com/pagopa/io-app/commit/a3200538ff839ef89b0a9c9c5965f11d611eb968))


### Chores

* [[IOBP-466](https://pagopa.atlassian.net/browse/IOBP-466)] Add gallery permission request in barcode scan screen for iOS devices ([#5334](https://github.com/pagopa/io-app/issues/5334)) ([12c22e8](https://github.com/pagopa/io-app/commit/12c22e8f2fc760b34545ecc92131be78bfbd0331))
* [[IOBP-511](https://pagopa.atlassian.net/browse/IOBP-511)] New Wallet payment playground refinement ([#5406](https://github.com/pagopa/io-app/issues/5406)) ([599a037](https://github.com/pagopa/io-app/commit/599a03758251b735b71b92386d165e05978fcb2d))
* removes compatibility layer for react-navigation ([#5284](https://github.com/pagopa/io-app/issues/5284)) ([a09a4e5](https://github.com/pagopa/io-app/commit/a09a4e56105d804afb1b95b5fe445f89f0fd32da))

## [2.51.0-rc.0](https://github.com/pagopa/io-app/compare/2.50.0-rc.5...2.51.0-rc.0) (2024-01-16)


### Features

* [IOBP-309, IOBP-312] Add error handling for payment verification and activation requests ([#5378](https://github.com/pagopa/io-app/issues/5378)) ([a29e57f](https://github.com/pagopa/io-app/commit/a29e57f1f007b77dbcb6027b4e3cd1d1196c4443))
* [[IOBP-437](https://pagopa.atlassian.net/browse/IOBP-437)] Add new wallet payment outcome error handling ([#5390](https://github.com/pagopa/io-app/issues/5390)) ([dff6e61](https://github.com/pagopa/io-app/commit/dff6e615a7d8e2674c3ffceff485546044734aef))


### Bug Fixes

* [[IOBP-462](https://pagopa.atlassian.net/browse/IOBP-462)] Missing transaction details data ([#5393](https://github.com/pagopa/io-app/issues/5393)) ([09eab9b](https://github.com/pagopa/io-app/commit/09eab9b10d05969413d2556f07ff151e045f9918))
* [[IOBP-501](https://pagopa.atlassian.net/browse/IOBP-501)] Wallet token into new wallet flows ([#5398](https://github.com/pagopa/io-app/issues/5398)) ([02cfc98](https://github.com/pagopa/io-app/commit/02cfc98520188d0455b9dc11f526ec549ac44de5))
* [[IOPID-1287](https://pagopa.atlassian.net/browse/IOPID-1287)] Change fingerprint icon and fix typo ([#5392](https://github.com/pagopa/io-app/issues/5392)) ([d6d2dc0](https://github.com/pagopa/io-app/commit/d6d2dc06cd1b133d3832be0cc060a236265a84e2))


### Chores

* [[IOAPPFD0-201](https://pagopa.atlassian.net/browse/IOAPPFD0-201)] Update some Profile screens with the new DS components ([#5333](https://github.com/pagopa/io-app/issues/5333)) ([978c689](https://github.com/pagopa/io-app/commit/978c689d41b38b9e09b8951479369a1ea614a0b0))
* [[IOBP-438](https://pagopa.atlassian.net/browse/IOBP-438)] Add abort dialog for payment flow ([#5379](https://github.com/pagopa/io-app/issues/5379)) ([2986e5c](https://github.com/pagopa/io-app/commit/2986e5c849673b88ae1a6f368d85af8a3fed0a52))
* [[IOBP-478](https://pagopa.atlassian.net/browse/IOBP-478)] Update ID Pay definitions for IBAN and onboarding exceptions ([#5369](https://github.com/pagopa/io-app/issues/5369)) ([6b76845](https://github.com/pagopa/io-app/commit/6b768454214b6291c5f6f3115f6fe6b68fb461dc))
* [[IOBP-479](https://pagopa.atlassian.net/browse/IOBP-479)] Add temporary missing methods error in method selection screen ([#5394](https://github.com/pagopa/io-app/issues/5394)) ([36e378f](https://github.com/pagopa/io-app/commit/36e378f63e619da086551af1d770e7c0ecc207b5))
* [[IOBP-486](https://pagopa.atlassian.net/browse/IOBP-486)] Add hardware button back navigation in Barcode scan screen for Android devices ([#5395](https://github.com/pagopa/io-app/issues/5395)) ([1e73ed6](https://github.com/pagopa/io-app/commit/1e73ed600f6e697ebf05fae55b639a11b7cb38ca))
* [[IOBP-488](https://pagopa.atlassian.net/browse/IOBP-488)] Refactor bonus features to remove cross feature dependencies ([#5397](https://github.com/pagopa/io-app/issues/5397)) ([dfc75ab](https://github.com/pagopa/io-app/commit/dfc75ab372ccd58d09ae0a17a24eccba7318a234))
* [[IOPID-1227](https://pagopa.atlassian.net/browse/IOPID-1227)] Fix bottomsheet error 1002 ([#5396](https://github.com/pagopa/io-app/issues/5396)) ([6260b35](https://github.com/pagopa/io-app/commit/6260b35d92f7ab42fb57e5965c1f1d89b2a41ee5))
* [[PE-510](https://pagopa.atlassian.net/browse/PE-510)] Integration of LV for CGN flows ([#5363](https://github.com/pagopa/io-app/issues/5363)) ([febfc01](https://github.com/pagopa/io-app/commit/febfc0194871a0759c685b9d8c6a50b1c731e8ca))

## [2.50.0-rc.5](https://github.com/pagopa/io-app/compare/2.50.0-rc.4...2.50.0-rc.5) (2024-01-11)


### Bug Fixes

* [[IABT-1520](https://pagopa.atlassian.net/browse/IABT-1520)] HeaderFirstLevel showing messages case when opening the support flow ([#5371](https://github.com/pagopa/io-app/issues/5371)) ([7df95ce](https://github.com/pagopa/io-app/commit/7df95ceb8406509c10a0ffb362c7623b33ebef8d))

## [2.50.0-rc.4](https://github.com/pagopa/io-app/compare/2.50.0-rc.3...2.50.0-rc.4) (2024-01-11)


### Features

* [[IOBP-311](https://pagopa.atlassian.net/browse/IOBP-311),[IOBP-317](https://pagopa.atlassian.net/browse/IOBP-317)] New wallet payment method selection screen ([#5350](https://github.com/pagopa/io-app/issues/5350)) ([8bb098e](https://github.com/pagopa/io-app/commit/8bb098e9962f16d7e53e9f559a21036797ec11e1))
* [[IOBP-432](https://pagopa.atlassian.net/browse/IOBP-432)] Add new wallet payment authorization webview ([#5276](https://github.com/pagopa/io-app/issues/5276)) ([a3bb6a4](https://github.com/pagopa/io-app/commit/a3bb6a46d3b8aff0fb0a816870085f6c03974135))
* [[IOBP-480](https://pagopa.atlassian.net/browse/IOBP-480)] Remove holder name from wallet payment confirm screen ([#5387](https://github.com/pagopa/io-app/issues/5387)) ([4de88bc](https://github.com/pagopa/io-app/commit/4de88bcae555a253b141ffac1ddd452f3eb9049a))


### Bug Fixes

* [[IOBP-482](https://pagopa.atlassian.net/browse/IOBP-482)] Adapted actual payment transaction apis with LV ([#5388](https://github.com/pagopa/io-app/issues/5388)) ([5f4e0c3](https://github.com/pagopa/io-app/commit/5f4e0c3e7c26bfc1d99f028cf4416f7c83c84e56))


### Chores

* [[IOAPPFD0-198](https://pagopa.atlassian.net/browse/IOAPPFD0-198)] Redesign of the developer section with better organization ([#5324](https://github.com/pagopa/io-app/issues/5324)) ([0bde66a](https://github.com/pagopa/io-app/commit/0bde66afe3258485c771e563af3bf07cd6c41fcf))
* [[IOAPPFD0-205](https://pagopa.atlassian.net/browse/IOAPPFD0-205)] Remove `profileAlt` icon reference from the codebase ([#5366](https://github.com/pagopa/io-app/issues/5366)) ([14f7cf7](https://github.com/pagopa/io-app/commit/14f7cf7e4b2eb917048eceb3216d12db042f440f))
* [[IOBP-396](https://pagopa.atlassian.net/browse/IOBP-396)] Add new `BonusCard` component into ID Pay initiative details screen ([#5329](https://github.com/pagopa/io-app/issues/5329)) ([a5a91bc](https://github.com/pagopa/io-app/commit/a5a91bc03877479f0592d01634b0557d6fc32a2e))
* [[IOPID-1301](https://pagopa.atlassian.net/browse/IOPID-1301)] Bump ToS version from 4.7 to 4.8" ([#5391](https://github.com/pagopa/io-app/issues/5391)) ([277c21f](https://github.com/pagopa/io-app/commit/277c21f5a940c28a82ac00c9bd99bb404307d3ff)), closes [pagopa/io-app#5385](https://github.com/pagopa/io-app/issues/5385)

## [2.50.0-rc.3](https://github.com/pagopa/io-app/compare/2.50.0-rc.2...2.50.0-rc.3) (2024-01-09)


### Features

* **Firma con IO:** [[SFEQS-1892](https://pagopa.atlassian.net/browse/SFEQS-1892)] Add environment to Mixpanel events ([#5159](https://github.com/pagopa/io-app/issues/5159)) ([43d203f](https://github.com/pagopa/io-app/commit/43d203f3381591c47347bf850c0ee8c0a29fa0a2))
* [[IOBP-313](https://pagopa.atlassian.net/browse/IOBP-313)] New wallet payment pick PSP ([#5302](https://github.com/pagopa/io-app/issues/5302)) ([77a768c](https://github.com/pagopa/io-app/commit/77a768cddff285f558f2c552b44efac409a5b789))
* [[IOBP-314](https://pagopa.atlassian.net/browse/IOBP-314)] Wallet payment confirm screen ([#5344](https://github.com/pagopa/io-app/issues/5344)) ([9f867be](https://github.com/pagopa/io-app/commit/9f867be9de4836242a0a6b8a9a6a84ff8e5f4184))
* [[IOCOM-382](https://pagopa.atlassian.net/browse/IOCOM-382)] Move all the message related files to `features/messages` folder ([#5375](https://github.com/pagopa/io-app/issues/5375)) ([e92e03c](https://github.com/pagopa/io-app/commit/e92e03cb0b030326d08678ee53f269c14f0c0811))


### Bug Fixes

* [[IOPID-1297](https://pagopa.atlassian.net/browse/IOPID-1297)] Fix: the navigation object hasn't been initialized yet ([#5381](https://github.com/pagopa/io-app/issues/5381)) ([5f9d702](https://github.com/pagopa/io-app/commit/5f9d702b88c79ef75228c24b1834a279cb6fd66c))


### Chores

* [[IOAPPFD0-202](https://pagopa.atlassian.net/browse/IOAPPFD0-202)] Update README.md physical devices section ([#5332](https://github.com/pagopa/io-app/issues/5332)) ([ccf5fc2](https://github.com/pagopa/io-app/commit/ccf5fc2d8f3f320dbaae9ad2b3f4fd1ff71e02bb))
* [[IOPID-1301](https://pagopa.atlassian.net/browse/IOPID-1301)] Bump ToS version from 4.7 to 4.8 ([#5385](https://github.com/pagopa/io-app/issues/5385)) ([a7efe4e](https://github.com/pagopa/io-app/commit/a7efe4e393b26e5d0d187457ed28d7f38cfa79bd))
* removes test step from husky pre-push ([#5380](https://github.com/pagopa/io-app/issues/5380)) ([3e9e9ee](https://github.com/pagopa/io-app/commit/3e9e9eea96c44e8c077b3152003b98728febabff))

## [2.50.0-rc.2](https://github.com/pagopa/io-app/compare/2.50.0-rc.1...2.50.0-rc.2) (2024-01-05)

## [2.50.0-rc.1](https://github.com/pagopa/io-app/compare/2.50.0-rc.0...2.50.0-rc.1) (2024-01-04)


### Bug Fixes

* [[IOCOM-759](https://pagopa.atlassian.net/browse/IOCOM-759)] Remove the section title if there are no attachments ([#5372](https://github.com/pagopa/io-app/issues/5372)) ([b08ac0a](https://github.com/pagopa/io-app/commit/b08ac0a193d7b4c5f0c633ca19221bf69cd71588))
* [[IOCOM-761](https://pagopa.atlassian.net/browse/IOCOM-761)] Text wrapping for precondition's title text ([#5368](https://github.com/pagopa/io-app/issues/5368)) ([d78fe84](https://github.com/pagopa/io-app/commit/d78fe8487efae9149b44a156b6e401c20eab8d2e))
* failing Android build ([#5376](https://github.com/pagopa/io-app/issues/5376)) ([a23dece](https://github.com/pagopa/io-app/commit/a23dece585eb9420c370a72df8ae62d22a254be0))

## [2.50.0-rc.0](https://github.com/pagopa/io-app/compare/2.49.0-rc.0...2.50.0-rc.0) (2024-01-03)


### Bug Fixes

* [[IOBP-446](https://pagopa.atlassian.net/browse/IOBP-446)] Add gallery permission request in barcode scan screen for Android devices ([#5313](https://github.com/pagopa/io-app/issues/5313)) ([3aa8576](https://github.com/pagopa/io-app/commit/3aa8576a09d1859734491df42196e953297e9680)), closes [/github.com/pagopa/io-app/pull/5313/files#diff-7752f292bcc12a6ee19233df702f1e1bafc087f6261759e0a5939c6e7a883f19](https://github.com/pagopa//github.com/pagopa/io-app/pull/5313/files/issues/diff-7752f292bcc12a6ee19233df702f1e1bafc087f6261759e0a5939c6e7a883f19)
* HeaderFirstLevel is misconfigured in services home screen ([#5358](https://github.com/pagopa/io-app/issues/5358)) ([993ae3e](https://github.com/pagopa/io-app/commit/993ae3e04900d05cc91617a3fb4e2ff573bcec0c))

## [2.49.0-rc.1](https://github.com/pagopa/io-app/compare/2.48.0-rc.7...2.49.0-rc.1) (2023-12-20)


## [2.49.0-rc.0](https://github.com/pagopa/io-app/compare/2.48.0-rc.7...2.49.0-rc.0) (2023-12-19)


### Bug Fixes

* [[IABT-1492](https://pagopa.atlassian.net/browse/IABT-1492)] Copy update ([#5314](https://github.com/pagopa/io-app/issues/5314)) ([a95c140](https://github.com/pagopa/io-app/commit/a95c140a39aa4f8b8a59505cac30268dc7484a17))
* [[IOPID-1267](https://pagopa.atlassian.net/browse/IOPID-1267)] Chore: fix toast ([#5351](https://github.com/pagopa/io-app/issues/5351)) ([cf76e5d](https://github.com/pagopa/io-app/commit/cf76e5d19564b613c5c47f1926beb10869242ad3))


### Chores

* [[IOBP-457](https://pagopa.atlassian.net/browse/IOBP-457)] Old wallet LV integration ([#5349](https://github.com/pagopa/io-app/issues/5349)) ([a3ad579](https://github.com/pagopa/io-app/commit/a3ad579ddce72300a1fc4bfc6e9c395f2c24e56b))
* [[IOPID-1182](https://pagopa.atlassian.net/browse/IOPID-1182)] Chore: enable all FL related local FF in production ([#5353](https://github.com/pagopa/io-app/issues/5353)) ([c039e54](https://github.com/pagopa/io-app/commit/c039e54e46007a252bc43c6892dd273da83eb85b))
* 🇩🇪 CGN translations ([#5293](https://github.com/pagopa/io-app/issues/5293)) ([1e969f9](https://github.com/pagopa/io-app/commit/1e969f9a12d75c6e17cf7475ba9f514a054fdb5d))

## [2.48.0-rc.7](https://github.com/pagopa/io-app/compare/2.48.0-rc.6...2.48.0-rc.7) (2023-12-15)


### Features

* [[IOBP-442](https://pagopa.atlassian.net/browse/IOBP-442)] New wallet payment details screen ([#5291](https://github.com/pagopa/io-app/issues/5291)) ([81ee7c3](https://github.com/pagopa/io-app/commit/81ee7c3a4bbd178480e42ef2d258dfc8e781d901))

## [2.48.0-rc.6](https://github.com/pagopa/io-app/compare/2.48.0-rc.5...2.48.0-rc.6) (2023-12-15)


### Features

* [[IOCOM-740](https://pagopa.atlassian.net/browse/IOCOM-740)] Update `tosVersion` to 4.7 ([#5341](https://github.com/pagopa/io-app/issues/5341)) ([f797c19](https://github.com/pagopa/io-app/commit/f797c1968d5debdda8133aa90c3c8755a344af4d))


### Bug Fixes

* [[IOCOM-736](https://pagopa.atlassian.net/browse/IOCOM-736)] Message retrieval fix for fast login ([#5335](https://github.com/pagopa/io-app/issues/5335)) ([81bf8d5](https://github.com/pagopa/io-app/commit/81bf8d5578a87ffc116604f906a9fddfd42bda95))
* [[IOPID-1257](https://pagopa.atlassian.net/browse/IOPID-1257)] Fix: no-mail user onboarding ([#5338](https://github.com/pagopa/io-app/issues/5338)) ([47aa4a0](https://github.com/pagopa/io-app/commit/47aa4a03be30c630c7a0d63ab4c590fc034fc106))
* [[IOPLT-304](https://pagopa.atlassian.net/browse/IOPLT-304)] HeaderFirstLevelHandler logic on current route selector instead of local status ([#5340](https://github.com/pagopa/io-app/issues/5340)) ([41bfa5b](https://github.com/pagopa/io-app/commit/41bfa5b55143bfe5e2f304ef9087aff30fd62206))


### Chores

* **deps:** bump urllib3 from 1.26.6 to 1.26.18 in /scripts/check_cie_button_exists ([#5132](https://github.com/pagopa/io-app/issues/5132)) ([ee48c2e](https://github.com/pagopa/io-app/commit/ee48c2e59c0f9d6b53ea714cb5661d3f0c90ce67))
* **deps:** bump urllib3 from 1.26.6 to 1.26.18 in /scripts/check_urls ([#5133](https://github.com/pagopa/io-app/issues/5133)) ([05f033b](https://github.com/pagopa/io-app/commit/05f033bd3b551b3a6357e19da8eb4245900f00b8))

## [2.48.0-rc.5](https://github.com/pagopa/io-app/compare/2.48.0-rc.4...2.48.0-rc.5) (2023-12-14)


### Bug Fixes

* [[IOCOM-737](https://pagopa.atlassian.net/browse/IOCOM-737)] Update the display rule of the RemoteContentBanner component ([#5336](https://github.com/pagopa/io-app/issues/5336)) ([10cab8e](https://github.com/pagopa/io-app/commit/10cab8e5ed1126fa63d0a2ae35cf88dbee00ab85))
* [[IOPID-1205](https://pagopa.atlassian.net/browse/IOPID-1205)] Hide error snack bar on refresh ([#5337](https://github.com/pagopa/io-app/issues/5337)) ([215172f](https://github.com/pagopa/io-app/commit/215172fde2adf48593f6637131639ac09763c63b))

## [2.48.0-rc.4](https://github.com/pagopa/io-app/compare/2.48.0-rc.3...2.48.0-rc.4) (2023-12-13)


### Chores

* [[IOPID-1186](https://pagopa.atlassian.net/browse/IOPID-1186)] Add bottomsheet logic for security suggestion acknowledged ([#5297](https://github.com/pagopa/io-app/issues/5297)) ([6c1e9ac](https://github.com/pagopa/io-app/commit/6c1e9ac3146a87d62833482f6ccc8fbaa9257f61))

## [2.48.0-rc.3](https://github.com/pagopa/io-app/compare/2.48.0-rc.2...2.48.0-rc.3) (2023-12-13)


### Features

* [[IOBP-405](https://pagopa.atlassian.net/browse/IOBP-405)] Wallet details update services pagoPA capability ([#5322](https://github.com/pagopa/io-app/issues/5322)) ([7a9f52b](https://github.com/pagopa/io-app/commit/7a9f52b62a0eb62a5b1ba17316395c5f5b2e9b1a))


### Bug Fixes

* [[IOBP-467](https://pagopa.atlassian.net/browse/IOBP-467)] Add correct details component in ID Pay timeline transaction item ([#5328](https://github.com/pagopa/io-app/issues/5328)) ([df350b6](https://github.com/pagopa/io-app/commit/df350b6893deb9f11fe8c70bae7cdefa43ccf7ef)), closes [1#diff-290dfda62f62d0a913eb406f4e342bfd3b05c46736f47193e32eed53fae9a073](https://github.com/pagopa/1/issues/diff-290dfda62f62d0a913eb406f4e342bfd3b05c46736f47193e32eed53fae9a073)


### Chores

* [[IOBP-176](https://pagopa.atlassian.net/browse/IOBP-176)] Add new pictograms in ID Pay onboarding failure screen ([#5330](https://github.com/pagopa/io-app/issues/5330)) ([2a3b29f](https://github.com/pagopa/io-app/commit/2a3b29f1c64316f0d44c7f50bb3926788be496a6))
* [[IOCOM-735](https://pagopa.atlassian.net/browse/IOCOM-735)] RC copy changes ([#5331](https://github.com/pagopa/io-app/issues/5331)) ([7ed4612](https://github.com/pagopa/io-app/commit/7ed4612858602c2c23800b1c5a9c367d46ca8e36))
* [[IOPID-1181](https://pagopa.atlassian.net/browse/IOPID-1181)] Add email uniqueness validation FF ([#5288](https://github.com/pagopa/io-app/issues/5288)) ([d6bf80f](https://github.com/pagopa/io-app/commit/d6bf80fa400b62016d4c71c36ce3c5ce6f83161d)), closes [/github.com/pagopa/io-dev-api-server/blob/00c956a2176dcf667f9334a539295d6c523a90ca/src/payloads/backend.ts#L112](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/00c956a2176dcf667f9334a539295d6c523a90ca/src/payloads/backend.ts/issues/L112)

## [2.48.0-rc.2](https://github.com/pagopa/io-app/compare/2.48.0-rc.1...2.48.0-rc.2) (2023-12-12)


### Features

* [[IOBP-421](https://pagopa.atlassian.net/browse/IOBP-421)] Added additional outcome screen for already added methods ([#5269](https://github.com/pagopa/io-app/issues/5269)) ([f2ddcec](https://github.com/pagopa/io-app/commit/f2ddcec79888c3fa72b88214d5d3b63916bc3669))


### Bug Fixes

* [[IOBP-444](https://pagopa.atlassian.net/browse/IOBP-444),[IOBP-445](https://pagopa.atlassian.net/browse/IOBP-445)] Update `rn-qr-generator` to 1.4.0 ([#5320](https://github.com/pagopa/io-app/issues/5320)) ([d781b57](https://github.com/pagopa/io-app/commit/d781b57eadfa743a5aab235244b2cf95ffdb9b00)), closes [1#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519](https://github.com/pagopa/1/issues/diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519)
* [[IOPID-1244](https://pagopa.atlassian.net/browse/IOPID-1244)] Fix: fiscal code offsets ([#5327](https://github.com/pagopa/io-app/issues/5327)) ([3b2c75e](https://github.com/pagopa/io-app/commit/3b2c75e7227553dd607284de37df8c7951901a35))


### Chores

* [[IOAPPFD0-199](https://pagopa.atlassian.net/browse/IOAPPFD0-199)] Refactor Profile main screen using `ListItemNav` and `FlatList` ([#5325](https://github.com/pagopa/io-app/issues/5325)) ([f868b4d](https://github.com/pagopa/io-app/commit/f868b4de21908f1c1b916db24843b5a287940877))
* [[IOBP-319](https://pagopa.atlassian.net/browse/IOBP-319)] Add new wallet payment redux and saga ([#5261](https://github.com/pagopa/io-app/issues/5261)) ([7f2af20](https://github.com/pagopa/io-app/commit/7f2af20317b2c66c16b56a2b3eda20d274986ee7))
* [[IOBP-395](https://pagopa.atlassian.net/browse/IOBP-395)] New `BonusCard` and `BonusCardScreenComponent` component ([#5216](https://github.com/pagopa/io-app/issues/5216)) ([d511280](https://github.com/pagopa/io-app/commit/d5112803c3a9f0d1f248b6b0b944cacfeb778832))
* [[IOBP-404](https://pagopa.atlassian.net/browse/IOBP-404)] Update ID Pay API definitions for new exceptions ([#5224](https://github.com/pagopa/io-app/issues/5224)) ([e880ac4](https://github.com/pagopa/io-app/commit/e880ac4bc93e80eec423b48301744381eb891e2c)), closes [1#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519](https://github.com/pagopa/1/issues/diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519) [1#diff-ca9d15f03f5e50bc254f70f40bea5ce8dd76e54f1f073163d1fc2f6aedde6075](https://github.com/pagopa/1/issues/diff-ca9d15f03f5e50bc254f70f40bea5ce8dd76e54f1f073163d1fc2f6aedde6075) [1#diff-19033164bbf27043f7ac25387954649f0091c3f980a21435b11dd025e719f5e2](https://github.com/pagopa/1/issues/diff-19033164bbf27043f7ac25387954649f0091c3f980a21435b11dd025e719f5e2)

## [2.48.0-rc.1](https://github.com/pagopa/io-app/compare/2.48.0-rc.0...2.48.0-rc.1) (2023-12-11)


### Features

* [[IOBP-453](https://pagopa.atlassian.net/browse/IOBP-453)] Addition of barcode regeneration screen ([#5312](https://github.com/pagopa/io-app/issues/5312)) ([2f7b41d](https://github.com/pagopa/io-app/commit/2f7b41d36c544b24dd45ee867f2abf0ef91dc6bc))
* [[IOCOM-689](https://pagopa.atlassian.net/browse/IOCOM-689)] Move Third Part Data retrieval before Message Details screen ([#5292](https://github.com/pagopa/io-app/issues/5292)) ([44b93f2](https://github.com/pagopa/io-app/commit/44b93f2255fcedfcc8d59fe34cbd6bcc3178c8f7))
* [[IOCOM-690](https://pagopa.atlassian.net/browse/IOCOM-690)] Move third party data request into its saga for SEND messages ([#5299](https://github.com/pagopa/io-app/issues/5299)) ([f0247b3](https://github.com/pagopa/io-app/commit/f0247b38c0ac9500a220d1e9f787810d12ea455f))
* [[IOCOM-692](https://pagopa.atlassian.net/browse/IOCOM-692)] Tech analytics events for remote content messages ([#5308](https://github.com/pagopa/io-app/issues/5308)) ([541cb3d](https://github.com/pagopa/io-app/commit/541cb3df4da2726fc0e32d5a573224f060567f3f))
* [[IOCOM-695](https://pagopa.atlassian.net/browse/IOCOM-695)] Add the `REMOTE_CONTENT_INFO` mixpanel event ([#5309](https://github.com/pagopa/io-app/issues/5309)) ([ce37759](https://github.com/pagopa/io-app/commit/ce3775957fc779bd1b6ad065e455ff789c60b54f))
* [[IOCOM-698](https://pagopa.atlassian.net/browse/IOCOM-698)] Add bottom sheet to `RemoteContentBanner` component ([#5298](https://github.com/pagopa/io-app/issues/5298)) ([6f002dc](https://github.com/pagopa/io-app/commit/6f002dc61cc10dd3dc0ee3ed63599a8a19a06992))
* [[IOCOM-699](https://pagopa.atlassian.net/browse/IOCOM-699)] Add remote content banner ([#5294](https://github.com/pagopa/io-app/issues/5294)) ([92afe26](https://github.com/pagopa/io-app/commit/92afe262e021a9ad64193e3c6194fb603faf4a96))
* [[IOCOM-716](https://pagopa.atlassian.net/browse/IOCOM-716)] Clear message details and third party message caches on reloadAllMessage.request ([#5317](https://github.com/pagopa/io-app/issues/5317)) ([f254748](https://github.com/pagopa/io-app/commit/f2547489a21927a1f0d9e257f001f07ac2387bd4))
* [[IOCOM-717](https://pagopa.atlassian.net/browse/IOCOM-717)] Update error message in the `MessageRouterScreen` ([#5318](https://github.com/pagopa/io-app/issues/5318)) ([2424f2c](https://github.com/pagopa/io-app/commit/2424f2c6f81337c322c4f83e2f3dd9cdc55cc9bd))


### Bug Fixes

* [[IABT-1474](https://pagopa.atlassian.net/browse/IABT-1474)] Avoid clearing contextual help data on logout ([#5316](https://github.com/pagopa/io-app/issues/5316)) ([3247dc3](https://github.com/pagopa/io-app/commit/3247dc3fd6790ca3add77d80fecf3508d4722173))
* [[IABT-1502](https://pagopa.atlassian.net/browse/IABT-1502)] Force light mode on iOS ([#5256](https://github.com/pagopa/io-app/issues/5256)) ([fd89ab7](https://github.com/pagopa/io-app/commit/fd89ab7e25e0c95754f895ef87ebc21a54327cbd)), closes [1#diff-0a933e7a014175a852c8c48b95cf972419f055ac6dfbcc70f02880b9a4fac4b1](https://github.com/pagopa/1/issues/diff-0a933e7a014175a852c8c48b95cf972419f055ac6dfbcc70f02880b9a4fac4b1)


### Chores

* [[IOAPPFD0-196](https://pagopa.atlassian.net/browse/IOAPPFD0-196)] Add `LargeHeader` header style to Privacy Policy main screen (Profile) ([#5280](https://github.com/pagopa/io-app/issues/5280)) ([6f65582](https://github.com/pagopa/io-app/commit/6f6558244495b5c864458a556209c1151ed02eb5))
* [[IOPID-1165](https://pagopa.atlassian.net/browse/IOPID-1165)] Mixpanel super and profile properties upgrade ([#5306](https://github.com/pagopa/io-app/issues/5306)) ([bdbf797](https://github.com/pagopa/io-app/commit/bdbf79759677c818832edb2b8693cf963b5ff222))
* [[IOPID-503](https://pagopa.atlassian.net/browse/IOPID-503)] Mixpanel events LV ([#4924](https://github.com/pagopa/io-app/issues/4924)) ([46018fb](https://github.com/pagopa/io-app/commit/46018fb8b597e79bea4ed2920a469839e7871cd4))

## [2.48.0-rc.0](https://github.com/pagopa/io-app/compare/2.47.0-rc.2...2.48.0-rc.0) (2023-12-06)


### Features

* [[IOBP-434](https://pagopa.atlassian.net/browse/IOBP-434)] New wallet onboarding LV integration ([#5270](https://github.com/pagopa/io-app/issues/5270)) ([e10dbf3](https://github.com/pagopa/io-app/commit/e10dbf37621942f84eaee9b4bcc7cb6fc1024d25))
* [[IOCOM-687](https://pagopa.atlassian.net/browse/IOCOM-687)] Selectors for Remote Content messages ([#5267](https://github.com/pagopa/io-app/issues/5267)) ([381028f](https://github.com/pagopa/io-app/commit/381028f24983223d7c625bd2276355a4889e48b9))
* [[IOCOM-694](https://pagopa.atlassian.net/browse/IOCOM-694)] Support for remote content on standard messages ([#5287](https://github.com/pagopa/io-app/issues/5287)) ([e3608af](https://github.com/pagopa/io-app/commit/e3608afecd2330ead0f2f0d59e678ed581e9b08c))
* [[IOPID-689](https://pagopa.atlassian.net/browse/IOPID-689)] Email validation at startup ([#5264](https://github.com/pagopa/io-app/issues/5264)) ([01e0992](https://github.com/pagopa/io-app/commit/01e0992093924d5ed441e7b1269b0af59ee4ed2f))


### Bug Fixes

* [[IOBP-439](https://pagopa.atlassian.net/browse/IOBP-439)] Fix payment method initiatives list refresh ([#5279](https://github.com/pagopa/io-app/issues/5279)) ([96869bb](https://github.com/pagopa/io-app/commit/96869bb40b4abab4fb55310a8bb346828beb66dc)), closes [1#diff-ebeb1ad0d49ec3ad8e8c582eb6dd4301a17731c7fc2b828f914f46d80c81a46](https://github.com/pagopa/1/issues/diff-ebeb1ad0d49ec3ad8e8c582eb6dd4301a17731c7fc2b828f914f46d80c81a46)
* [[IOBP-441](https://pagopa.atlassian.net/browse/IOBP-441)] Remove double header glitch from payment flow ([#5285](https://github.com/pagopa/io-app/issues/5285)) ([ea6910b](https://github.com/pagopa/io-app/commit/ea6910ba217d80bda5c4025f3937ac56181c5c42))


### Chores

* [[IOBP-328](https://pagopa.atlassian.net/browse/IOBP-328)] Remove FF from new barcode scan screen access ([#5286](https://github.com/pagopa/io-app/issues/5286)) ([0344bb1](https://github.com/pagopa/io-app/commit/0344bb1a0b21f9be7799629c95257b71c85aed4b))
* [[IOBP-368](https://pagopa.atlassian.net/browse/IOBP-368)] Revamp wallet transaction detail page ([#5282](https://github.com/pagopa/io-app/issues/5282)) ([cfb18dd](https://github.com/pagopa/io-app/commit/cfb18dd3607a4a90d1aa5cfcf6a4835151dda089))
* [[IOBP-423](https://pagopa.atlassian.net/browse/IOBP-423)] Idpay api definitions update for barcode ([#5278](https://github.com/pagopa/io-app/issues/5278)) ([9310816](https://github.com/pagopa/io-app/commit/9310816c0697f7aaf465907512e2c4487cfcc30c))
* 🇩🇪 minor adjustments ([#5263](https://github.com/pagopa/io-app/issues/5263)) ([ad7b325](https://github.com/pagopa/io-app/commit/ad7b325ed04d8e07a33ef24cb7dd23a7e0884e26))

## [2.47.0-rc.2](https://github.com/pagopa/io-app/compare/2.47.0-rc.1...2.47.0-rc.2) (2023-11-29)


### Bug Fixes

* change milliseconds notation ([b22d0d1](https://github.com/pagopa/io-app/commit/b22d0d103feb7b30ff05656605806cb683e1ec8c))

## [2.47.0-rc.1](https://github.com/pagopa/io-app/compare/2.47.0-rc.0...2.47.0-rc.1) (2023-11-29)


### Features

* [[IOBP-408](https://pagopa.atlassian.net/browse/IOBP-408)] New wallet onboarding with custom webview ([#5243](https://github.com/pagopa/io-app/issues/5243)) ([caaad29](https://github.com/pagopa/io-app/commit/caaad29a73d1c82de0cf9b8fbe232e21a73b633d))
* [[IOCOM-661](https://pagopa.atlassian.net/browse/IOCOM-661)] Tests for SEND multiple payments ([#5253](https://github.com/pagopa/io-app/issues/5253)) ([8fb43ba](https://github.com/pagopa/io-app/commit/8fb43ba19ee9d2c0c0c79147950f816e09be89e5))


### Bug Fixes

* [[IOBP-431](https://pagopa.atlassian.net/browse/IOBP-431)] Idpay barcode double header ([#5268](https://github.com/pagopa/io-app/issues/5268)) ([9f5c1c6](https://github.com/pagopa/io-app/commit/9f5c1c6c96ae25b4fccd2574f263856fcb78531e))
* [[IOPLT-276](https://pagopa.atlassian.net/browse/IOPLT-276)] Updates design system library to solve header title color on android ([#5274](https://github.com/pagopa/io-app/issues/5274)) ([c562874](https://github.com/pagopa/io-app/commit/c562874fea5ab35d6c635851d6d608de8deaf58e))
* [[PE-498](https://pagopa.atlassian.net/browse/PE-498)] CGN OTP code timer issue ([#5272](https://github.com/pagopa/io-app/issues/5272)) ([65c004d](https://github.com/pagopa/io-app/commit/65c004d6b2042c2542a889544340c085de6314cd))


### Chores

* [[IOAPPFD0-191](https://pagopa.atlassian.net/browse/IOAPPFD0-191)] Update DS section with new components just released ([#5257](https://github.com/pagopa/io-app/issues/5257)) ([74dfff7](https://github.com/pagopa/io-app/commit/74dfff7e03fcf3435be2296831bf83355c72b5bb))
* [[IOAPPFD0-193](https://pagopa.atlassian.net/browse/IOAPPFD0-193)] Add `NumberPad` + `CodeInput` screen to DS ([#5265](https://github.com/pagopa/io-app/issues/5265)) ([a7db388](https://github.com/pagopa/io-app/commit/a7db388972c789da8b50eeee291f66a57cd81582))
* [[IOBP-428](https://pagopa.atlassian.net/browse/IOBP-428)] Replaced native-base toast into `clipboardSetStringWithFeedback` method ([#5271](https://github.com/pagopa/io-app/issues/5271)) ([83805a0](https://github.com/pagopa/io-app/commit/83805a0c1216339b83053a85fdfd1abb88fd495f))
* [[IOPID-1135](https://pagopa.atlassian.net/browse/IOPID-1135)] Fix fast-login and getNonce timeout and retry policy ([#5249](https://github.com/pagopa/io-app/issues/5249)) ([ef78c16](https://github.com/pagopa/io-app/commit/ef78c16a2bf79075a9965ab807598b3459334e8a))
* [[IOPID-991](https://pagopa.atlassian.net/browse/IOPID-991)] Integration of email validation logic in the onboarding flow and profile preferences flow ([#5206](https://github.com/pagopa/io-app/issues/5206)) ([1aeee14](https://github.com/pagopa/io-app/commit/1aeee140db7619a8f931e1c7f43fe486dce919e7)), closes [/github.com/pagopa/io-app/blob/8d955e2a92223c0dd1baee255df383ee84ca1545/.env.local#L101](https://github.com/pagopa//github.com/pagopa/io-app/blob/8d955e2a92223c0dd1baee255df383ee84ca1545/.env.local/issues/L101) [/github.com/pagopa/io-dev-api-server/blob/284edc21086fe0cfae39462958c8e8114d762f04/src/config.ts#L67C4-L67C28](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/284edc21086fe0cfae39462958c8e8114d762f04/src/config.ts/issues/L67C4-L67C28) [/github.com/pagopa/io-dev-api-server/blob/284edc21086fe0cfae39462958c8e8114d762f04/src/payloads/profile.ts#L49](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/284edc21086fe0cfae39462958c8e8114d762f04/src/payloads/profile.ts/issues/L49) [/github.com/pagopa/io-dev-api-server/blob/284edc21086fe0cfae39462958c8e8114d762f04/src/payloads/profile.ts#L74](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/284edc21086fe0cfae39462958c8e8114d762f04/src/payloads/profile.ts/issues/L74)

## [2.47.0-rc.0](https://github.com/pagopa/io-app/compare/2.46.0-rc.3...2.47.0-rc.0) (2023-11-24)


### Features

* [[IOBP-348](https://pagopa.atlassian.net/browse/IOBP-348)] Addition of bottomSheet in idPay discount initiative CTA ([#5146](https://github.com/pagopa/io-app/issues/5146)) ([4749875](https://github.com/pagopa/io-app/commit/4749875d42f9e581113c3917ad8e56f6d1ba0061))
* [[IOBP-349](https://pagopa.atlassian.net/browse/IOBP-349)] Idpay discount barcode generation result ([#5232](https://github.com/pagopa/io-app/issues/5232)) ([874232d](https://github.com/pagopa/io-app/commit/874232d16c361977dcfd158a52122abc0ab149fa))
* [[IOBP-373](https://pagopa.atlassian.net/browse/IOBP-373)] New wallet details screen adaption ([#5189](https://github.com/pagopa/io-app/issues/5189)) ([84c83c0](https://github.com/pagopa/io-app/commit/84c83c0f416781b8c3d32df490aaf1f212710888))
* [[IOBP-375](https://pagopa.atlassian.net/browse/IOBP-375)] New wallet onboarding error outcome handling ([#5192](https://github.com/pagopa/io-app/issues/5192)) ([39ef7e7](https://github.com/pagopa/io-app/commit/39ef7e7e54bd3f7a5e6e68d3facc3c5ccf457d4a))
* [[IOCOM-662](https://pagopa.atlassian.net/browse/IOCOM-662)] Add unit tests for F24 feature ([#5234](https://github.com/pagopa/io-app/issues/5234)) ([0cadff5](https://github.com/pagopa/io-app/commit/0cadff548579a1ab1afd9a146c874c058776e61d))
* [[IOPLT-162](https://pagopa.atlassian.net/browse/IOPLT-162)] `HeaderFirstLevel` integration ([#5113](https://github.com/pagopa/io-app/issues/5113)) ([c7e7493](https://github.com/pagopa/io-app/commit/c7e7493b5b25cd23a4136be46afac01260025c57))
* [[IOPLT-184](https://pagopa.atlassian.net/browse/IOPLT-184)] Base Screen component wrapper header with animated title ([#5088](https://github.com/pagopa/io-app/issues/5088)) ([ff5362d](https://github.com/pagopa/io-app/commit/ff5362d7fa7c592ac0e48e9b97eb8c340203b68f))


### Bug Fixes

* [[IOBP-361](https://pagopa.atlassian.net/browse/IOBP-361)] Fix ID Pay rules info bottom sheet in initiative details screen ([#5209](https://github.com/pagopa/io-app/issues/5209)) ([4c65424](https://github.com/pagopa/io-app/commit/4c65424be29ff9e3dec26ec6d40d8d3ecf23361a)), closes [1#diff-aec7df12aad70c4276336c3813019b4655fac37dc09eb456b93208f7c6b8b302](https://github.com/pagopa/1/issues/diff-aec7df12aad70c4276336c3813019b4655fac37dc09eb456b93208f7c6b8b302) [1#diff-763f13f0b9f72e4763aa758664939937121a62cc637c86ff29bfe6f41ab7d56](https://github.com/pagopa/1/issues/diff-763f13f0b9f72e4763aa758664939937121a62cc637c86ff29bfe6f41ab7d56)
* [[IOBP-425](https://pagopa.atlassian.net/browse/IOBP-425)] Fix Mixpanel events in `BarcodeScanScreen` ([#5254](https://github.com/pagopa/io-app/issues/5254)) ([c36076c](https://github.com/pagopa/io-app/commit/c36076c80a442d68e3aa4378035c57cca7d7b1f5))
* [[PE-494](https://pagopa.atlassian.net/browse/PE-494)] CGN test ids for e2e tests ([#5210](https://github.com/pagopa/io-app/issues/5210)) ([3f4c0e6](https://github.com/pagopa/io-app/commit/3f4c0e6b7595a90904cf056183f5b7d84df132ed))


### Chores

* [[IOAPPFD0-175](https://pagopa.atlassian.net/browse/IOAPPFD0-175)] Restore inertial scrolling in the `Wallet` and `Profile` main screens (iOS) ([#5119](https://github.com/pagopa/io-app/issues/5119)) ([a98acd8](https://github.com/pagopa/io-app/commit/a98acd8c6b51af740fcbfd123f60c2d358bf2870))
* [[IOBP-346](https://pagopa.atlassian.net/browse/IOBP-346)] Idpay barcode saga ([#5212](https://github.com/pagopa/io-app/issues/5212)) ([259b651](https://github.com/pagopa/io-app/commit/259b65112029249aa26b1d2510be23976e570b0b))
* [[IOBP-392](https://pagopa.atlassian.net/browse/IOBP-392)] Refactor `TimelineOperationListItem` component ([#5200](https://github.com/pagopa/io-app/issues/5200)) ([5bc9f2d](https://github.com/pagopa/io-app/commit/5bc9f2df8edf2214b39451bc994feb2927d32d29)), closes [/github.com/pagopa/io-app/pull/5200/files#diff-bf0f0c12b0c8396401a112111f50ecd7d00a22d176641c354e3880e3879cbd51](https://github.com/pagopa//github.com/pagopa/io-app/pull/5200/files/issues/diff-bf0f0c12b0c8396401a112111f50ecd7d00a22d176641c354e3880e3879cbd51)
* [[IOPID-740](https://pagopa.atlassian.net/browse/IOPID-740)] Zendesk token refresh handling ([#5178](https://github.com/pagopa/io-app/issues/5178)) ([43e4957](https://github.com/pagopa/io-app/commit/43e495704c22dc507f185e31f9b3862d92e16093))

## [2.46.0-rc.3](https://github.com/pagopa/io-app/compare/2.46.0-rc.2...2.46.0-rc.3) (2023-11-14)


### Features

* [[IOCOM-667](https://pagopa.atlassian.net/browse/IOCOM-667)] Failure logging for messages' sagas ([#5223](https://github.com/pagopa/io-app/issues/5223)) ([5b92210](https://github.com/pagopa/io-app/commit/5b9221013f6b63e998b6f20e752f2dbe07993055))


### Chores

* [[IOPID-1015](https://pagopa.atlassian.net/browse/IOPID-1015)] Biometric refinement ([#5141](https://github.com/pagopa/io-app/issues/5141)) ([af94c2a](https://github.com/pagopa/io-app/commit/af94c2a7b48601a13de59022325c8ede3e85cfe5))

## [2.46.0-rc.2](https://github.com/pagopa/io-app/compare/2.46.0-rc.0...2.46.0-rc.2) (2023-11-08)


### Features

* [[IOCOM-571](https://pagopa.atlassian.net/browse/IOCOM-571)] Remove `pnNoticesF24Enabled` feature flag ([#5202](https://github.com/pagopa/io-app/issues/5202)) ([eec078a](https://github.com/pagopa/io-app/commit/eec078ac093ee39268efdd24121e220216ce8d16))
* [[IOPID-987](https://pagopa.atlassian.net/browse/IOPID-987)] Add contextual help content ([#5208](https://github.com/pagopa/io-app/issues/5208)) ([4d50cf1](https://github.com/pagopa/io-app/commit/4d50cf1bbaf8db71f7ba4eb29a03ffc5f9d56fac))
* [[IOPLT-224](https://pagopa.atlassian.net/browse/IOPLT-224),[IOPLT-231](https://pagopa.atlassian.net/browse/IOPLT-231)] Upgrades to latest DS library version and migrates components affected ([#5204](https://github.com/pagopa/io-app/issues/5204)) ([9e3fcc3](https://github.com/pagopa/io-app/commit/9e3fcc3f9e7be3b84d7e6e08118d9f77ed3798da))


### Bug Fixes

* [[IOBP-388](https://pagopa.atlassian.net/browse/IOBP-388)] Android back button while success outcome payment screen showed ([#5203](https://github.com/pagopa/io-app/issues/5203)) ([65564fa](https://github.com/pagopa/io-app/commit/65564fab06abff280c32e456dd2b7f0707dbddbe))
* [[IOPID-878](https://pagopa.atlassian.net/browse/IOPID-878)] Provide a more meaningful feedback on IdPs' 403 HTTP error ([#5183](https://github.com/pagopa/io-app/issues/5183)) ([c102cd6](https://github.com/pagopa/io-app/commit/c102cd6133260cf72ecc286add2f6a400262598a))


### Chores

* [[IOBP-334](https://pagopa.atlassian.net/browse/IOBP-334)] Add `productPagoPA` icon to pagoPA notice pay action in barcode scan screen ([#5194](https://github.com/pagopa/io-app/issues/5194)) ([ffd5fdc](https://github.com/pagopa/io-app/commit/ffd5fdcbb7a86c068530aaa315ce22153350a0aa)), closes [/github.com/pagopa/io-app/compare/master...IOBP-334-add-pagopa-icon-in-barcode-scan-bottom-sheet#diff-12570b34029e534a64b24f1cb81383d99557273c4b2f34ad4ced82685fa017f6](https://github.com/pagopa//github.com/pagopa/io-app/compare/master...IOBP-334-add-pagopa-icon-in-barcode-scan-bottom-sheet/issues/diff-12570b34029e534a64b24f1cb81383d99557273c4b2f34ad4ced82685fa017f6)
* [[IOPID-1103](https://pagopa.atlassian.net/browse/IOPID-1103)] Enable/Deploy/Disable FL in production ([#5207](https://github.com/pagopa/io-app/issues/5207)) ([d2eeef6](https://github.com/pagopa/io-app/commit/d2eeef6360c88c518bef3b27a205d46888b49245))

## [2.46.0-rc.1](https://github.com/pagopa/io-app/compare/2.46.0-rc.0...2.46.0-rc.1) (2023-11-08)


### Features

* [[IOCOM-571](https://pagopa.atlassian.net/browse/IOCOM-571)] Remove `pnNoticesF24Enabled` feature flag ([#5202](https://github.com/pagopa/io-app/issues/5202)) ([eec078a](https://github.com/pagopa/io-app/commit/eec078ac093ee39268efdd24121e220216ce8d16))
* [[IOPLT-224](https://pagopa.atlassian.net/browse/IOPLT-224),[IOPLT-231](https://pagopa.atlassian.net/browse/IOPLT-231)] Upgrades to latest DS library version and migrates components affected ([#5204](https://github.com/pagopa/io-app/issues/5204)) ([9e3fcc3](https://github.com/pagopa/io-app/commit/9e3fcc3f9e7be3b84d7e6e08118d9f77ed3798da))


### Bug Fixes

* [[IOBP-388](https://pagopa.atlassian.net/browse/IOBP-388)] Android back button while success outcome payment screen showed ([#5203](https://github.com/pagopa/io-app/issues/5203)) ([65564fa](https://github.com/pagopa/io-app/commit/65564fab06abff280c32e456dd2b7f0707dbddbe))


### Chores

* [[IOBP-334](https://pagopa.atlassian.net/browse/IOBP-334)] Add `productPagoPA` icon to pagoPA notice pay action in barcode scan screen ([#5194](https://github.com/pagopa/io-app/issues/5194)) ([ffd5fdc](https://github.com/pagopa/io-app/commit/ffd5fdcbb7a86c068530aaa315ce22153350a0aa)), closes [/github.com/pagopa/io-app/compare/master...IOBP-334-add-pagopa-icon-in-barcode-scan-bottom-sheet#diff-12570b34029e534a64b24f1cb81383d99557273c4b2f34ad4ced82685fa017f6](https://github.com/pagopa//github.com/pagopa/io-app/compare/master...IOBP-334-add-pagopa-icon-in-barcode-scan-bottom-sheet/issues/diff-12570b34029e534a64b24f1cb81383d99557273c4b2f34ad4ced82685fa017f6)
* enable FL in production ([1828975](https://github.com/pagopa/io-app/commit/1828975ab22979b4fdc03e2dfa179656d099df26))

## [2.46.0-rc.0](https://github.com/pagopa/io-app/compare/2.45.0-rc.0...2.46.0-rc.0) (2023-11-07)


### Features

* [[IOBP-201](https://pagopa.atlassian.net/browse/IOBP-201),[IOBP-284](https://pagopa.atlassian.net/browse/IOBP-284)] New wallet success outcome handling ([#5155](https://github.com/pagopa/io-app/issues/5155)) ([e06259d](https://github.com/pagopa/io-app/commit/e06259db73c717f0284e33b3b2c91f5792fe7d15))
* [[IOCOM-457](https://pagopa.atlassian.net/browse/IOCOM-457)] Navigate to the attachment preview screen ([#5167](https://github.com/pagopa/io-app/issues/5167)) ([c12d1c4](https://github.com/pagopa/io-app/commit/c12d1c4efc594ee07fd890881f0fe050f8eae0d9))
* [[IOCOM-460](https://pagopa.atlassian.net/browse/IOCOM-460)] Analytics events for PN multiple payments ([#5198](https://github.com/pagopa/io-app/issues/5198)) ([e4f031c](https://github.com/pagopa/io-app/commit/e4f031c910f73f9c4098eaee6cbd02aea08972d4))
* [[IOCOM-461](https://pagopa.atlassian.net/browse/IOCOM-461)] Add F24 Mixpanel events ([#5193](https://github.com/pagopa/io-app/issues/5193)) ([297f457](https://github.com/pagopa/io-app/commit/297f457a1776a729f06797bf1b096366437961c7))
* [[IOCOM-499](https://pagopa.atlassian.net/browse/IOCOM-499)] SEND selected payment update after selection ([#5176](https://github.com/pagopa/io-app/issues/5176)) ([6db4a19](https://github.com/pagopa/io-app/commit/6db4a1922009b7ba397370c48a6d78bddc875906))
* [[IOCOM-642](https://pagopa.atlassian.net/browse/IOCOM-642)] Handle of ONGOING status on SEND's payments ([#5177](https://github.com/pagopa/io-app/issues/5177)) ([3cf093c](https://github.com/pagopa/io-app/commit/3cf093c0bf3c5f21b245df8e73ec7413ac1d5410))
* [[IOCOM-643](https://pagopa.atlassian.net/browse/IOCOM-643)] Back to SEND message screen upon successful payment completion ([#5182](https://github.com/pagopa/io-app/issues/5182)) ([5316f06](https://github.com/pagopa/io-app/commit/5316f0660b8a200469a7d91f5bda5f74bb240b64))
* [[IOCOM-657](https://pagopa.atlassian.net/browse/IOCOM-657)] Remove payments' bottom sheet reference in cancelled SEND message ([#5190](https://github.com/pagopa/io-app/issues/5190)) ([e58b66e](https://github.com/pagopa/io-app/commit/e58b66e8fe179d33cf5543391305057c358e9e68))
* [[IOCOM-658](https://pagopa.atlassian.net/browse/IOCOM-658)] Remove the F24 section on cancelled SEND message ([#5191](https://github.com/pagopa/io-app/issues/5191)) ([d664ad1](https://github.com/pagopa/io-app/commit/d664ad152b2441e9e684f9887569ccb7fb110c29))
* [[IOPID-1062](https://pagopa.atlassian.net/browse/IOPID-1062)] Change copy ([#5171](https://github.com/pagopa/io-app/issues/5171)) ([8ffc192](https://github.com/pagopa/io-app/commit/8ffc192695bd7e857246a7f623bfa5cec225268b))
* [[IOPID-296](https://pagopa.atlassian.net/browse/IOPID-296)] Update the generate nonce and set it as mandatory ([#5196](https://github.com/pagopa/io-app/issues/5196)) ([293759d](https://github.com/pagopa/io-app/commit/293759dcafec53b5db524ba7bc647be9084e26bb))
* [[IOPLT-136](https://pagopa.atlassian.net/browse/IOPLT-136)] `HeaderSecondLevel` integration through react-navigation ([#5028](https://github.com/pagopa/io-app/issues/5028)) ([a66f7fc](https://github.com/pagopa/io-app/commit/a66f7fcfe24ee5ffed6f7b0ca6ee8133a94d025f))
* [[IOPLT-43](https://pagopa.atlassian.net/browse/IOPLT-43)] Increase iOS target version to deprecate faulty builds ([#5195](https://github.com/pagopa/io-app/issues/5195)) ([f2128b2](https://github.com/pagopa/io-app/commit/f2128b28e2f360cf34995c73c7a0b576068620ec))
* **Firma con IO:** [[SFEQS-1058](https://pagopa.atlassian.net/browse/SFEQS-1058)] Update `io-backend` definitions to `v13.19.1` ([#5179](https://github.com/pagopa/io-app/issues/5179)) ([b59793d](https://github.com/pagopa/io-app/commit/b59793d3c550da15213c2f24bef2f904b5269d78))


### Bug Fixes

* [[IOBP-332](https://pagopa.atlassian.net/browse/IOBP-332)] Add correct pictograms to camera permission view in barcode scan screen ([#5188](https://github.com/pagopa/io-app/issues/5188)) ([db026c4](https://github.com/pagopa/io-app/commit/db026c476e817f99f070fb80a7f4784a1813f329)), closes [1#diff-1e4e400edd0a8debdd16a6c728d260d849b977083ea5aa108a5ba43ce25ac4c2](https://github.com/pagopa/1/issues/diff-1e4e400edd0a8debdd16a6c728d260d849b977083ea5aa108a5ba43ce25ac4c2) [1#diff-052d138722206aca70841ca9fe25e4ab0c8cc2266e26bc7e1b872dd97208e689](https://github.com/pagopa/1/issues/diff-052d138722206aca70841ca9fe25e4ab0c8cc2266e26bc7e1b872dd97208e689)
* [[IOBP-384](https://pagopa.atlassian.net/browse/IOBP-384)] Header transaction summary safe area view ([#5186](https://github.com/pagopa/io-app/issues/5186)) ([243ea9d](https://github.com/pagopa/io-app/commit/243ea9d2902b0a64f039a02a596e64aa2afdb300))
* [IOBP-386, IOBP-374] CTA transaction summary padding on Android ([#5185](https://github.com/pagopa/io-app/issues/5185)) ([02ad1d2](https://github.com/pagopa/io-app/commit/02ad1d26dfb95f6fc7c9e704569d0c3f13ae5938))
* [[IOBP-397](https://pagopa.atlassian.net/browse/IOBP-397)] CGN e2e tests ([#5205](https://github.com/pagopa/io-app/issues/5205)) ([6311fd2](https://github.com/pagopa/io-app/commit/6311fd209993e8f3e8ef27a7c48d2556e00a8431))
* [[IOPID-1090](https://pagopa.atlassian.net/browse/IOPID-1090)] Fix e2e pin creation ([#5201](https://github.com/pagopa/io-app/issues/5201)) ([0c5c54f](https://github.com/pagopa/io-app/commit/0c5c54fdde4a01d2be3b26c49dfe4c3a6b05c532))


### Chores

* [[IOAPPFD0-182](https://pagopa.atlassian.net/browse/IOAPPFD0-182)] Add `outline` variant to the `Badge` component ([#5180](https://github.com/pagopa/io-app/issues/5180)) ([a10850c](https://github.com/pagopa/io-app/commit/a10850cc1a306fe9a7d4ac8502a6def529c4c1e3))
* [[IOAPPFD0-183](https://pagopa.atlassian.net/browse/IOAPPFD0-183)] Add placeholder to the `Avatar` component ([#5181](https://github.com/pagopa/io-app/issues/5181)) ([6897bb8](https://github.com/pagopa/io-app/commit/6897bb81d4988182bde2b4f3b35c099b01774928))
* [[IOBP-341](https://pagopa.atlassian.net/browse/IOBP-341)] Update IDPayPaymentCodeInputScreen to use new DS components ([#5136](https://github.com/pagopa/io-app/issues/5136)) ([a738fb1](https://github.com/pagopa/io-app/commit/a738fb16b295687806be49035941c98de68c773a))
* [[IOBP-363](https://pagopa.atlassian.net/browse/IOBP-363)] Add ID Pay reward type info in initiative details screen ([#5175](https://github.com/pagopa/io-app/issues/5175)) ([c3ee966](https://github.com/pagopa/io-app/commit/c3ee966f19f647a4397cd3281e4a7aa7dbe9bc77))
* [[IOBP-380](https://pagopa.atlassian.net/browse/IOBP-380)] New idpay error handling DTOs ([#5187](https://github.com/pagopa/io-app/issues/5187)) ([8498c71](https://github.com/pagopa/io-app/commit/8498c71dcb7729a20f92258190c4983ca9a68f95))
* [[IOBP-387](https://pagopa.atlassian.net/browse/IOBP-387)] Disable scan feature if barcode screen is loading ([#5184](https://github.com/pagopa/io-app/issues/5184)) ([e2f8139](https://github.com/pagopa/io-app/commit/e2f81393a18f5f8a5d419c99df4f94dc650024ec)), closes [1#diff-12570b34029e534a64b24f1cb81383d99557273c4b2f34ad4ced82685fa017f6](https://github.com/pagopa/1/issues/diff-12570b34029e534a64b24f1cb81383d99557273c4b2f34ad4ced82685fa017f6) [1#diff-eaf783c2cc9816aca220690082f4ba077df5954553a99078eb5e3faec9bd4b27](https://github.com/pagopa/1/issues/diff-eaf783c2cc9816aca220690082f4ba077df5954553a99078eb5e3faec9bd4b27) [1#diff-627f530afb8e81f8849fbfbfa2ee5ece0434bdbe062355178c9df587151a9513](https://github.com/pagopa/1/issues/diff-627f530afb8e81f8849fbfbfa2ee5ece0434bdbe062355178c9df587151a9513)
* [[IOPID-1075](https://pagopa.atlassian.net/browse/IOPID-1075)] Remove what's new bottomsheet ([#5172](https://github.com/pagopa/io-app/issues/5172)) ([92111cd](https://github.com/pagopa/io-app/commit/92111cdc4d9ab91bfc2d230a8e0689076dbc0c82))
* [[IOPID-897](https://pagopa.atlassian.net/browse/IOPID-897)] Change IDP screen visualization ([#5157](https://github.com/pagopa/io-app/issues/5157)) ([7c48962](https://github.com/pagopa/io-app/commit/7c489622c5555ba939834dbb6fd974cd15b33c5e))

## [2.45.0-rc.0](https://github.com/pagopa/io-app/compare/2.44.0-rc.3...2.45.0-rc.0) (2023-10-31)


### Features

* [[IOBP-199](https://pagopa.atlassian.net/browse/IOBP-199),[IOBP-304](https://pagopa.atlassian.net/browse/IOBP-304),[IOBP-306](https://pagopa.atlassian.net/browse/IOBP-306)] Wallet onboarding select payment method ([#5137](https://github.com/pagopa/io-app/issues/5137)) ([5d4d707](https://github.com/pagopa/io-app/commit/5d4d707b78eef85416a543625459d392a25891d4))
* [[IOCOM-428](https://pagopa.atlassian.net/browse/IOCOM-428)] Add category field in `UIAttachment` ([#5121](https://github.com/pagopa/io-app/issues/5121)) ([d23128b](https://github.com/pagopa/io-app/commit/d23128b0f9d10f699af39f71024a56903559586f))
* [[IOCOM-435](https://pagopa.atlassian.net/browse/IOCOM-435)] Add polling for download F24 attachments ([#5149](https://github.com/pagopa/io-app/issues/5149)) ([1b9188b](https://github.com/pagopa/io-app/commit/1b9188b5c0cf8126cea86fc198ff5e888f36125f))
* [[IOCOM-450](https://pagopa.atlassian.net/browse/IOCOM-450),[IOCOM-449](https://pagopa.atlassian.net/browse/IOCOM-449),[IOCOM-508](https://pagopa.atlassian.net/browse/IOCOM-508)] Bottom sheet for multiple payments on SEND message details screen ([#5153](https://github.com/pagopa/io-app/issues/5153)) ([c5a8e47](https://github.com/pagopa/io-app/commit/c5a8e472d131771299ad728ffe5b6d45163938ac))
* [[IOCOM-453](https://pagopa.atlassian.net/browse/IOCOM-453)] Add F24 section on SEND message screen ([#5156](https://github.com/pagopa/io-app/issues/5156)) ([3bed895](https://github.com/pagopa/io-app/commit/3bed895abad5d10a6fe4abc1251d31bd9f52d666))
* [[IOCOM-455](https://pagopa.atlassian.net/browse/IOCOM-455)] Add bottom sheet for multiple F24  ([#5161](https://github.com/pagopa/io-app/issues/5161)) ([3fd5362](https://github.com/pagopa/io-app/commit/3fd53626429e100d18fdbf7977276d0e78a29d1a))
* [[IOCOM-505](https://pagopa.atlassian.net/browse/IOCOM-505)] Multiple payments on SEND message screen ([#5152](https://github.com/pagopa/io-app/issues/5152)) ([59c112e](https://github.com/pagopa/io-app/commit/59c112e51dd8d12e01720af01eba7e5054c823ad))
* [[IOCOM-624](https://pagopa.atlassian.net/browse/IOCOM-624)] Multiple paid payments on cancelled PN message ([#5139](https://github.com/pagopa/io-app/issues/5139)) ([e0e5638](https://github.com/pagopa/io-app/commit/e0e56386728ab6c3f245d06ac3bc33b9dfc14545))
* [[IOPID-971](https://pagopa.atlassian.net/browse/IOPID-971),[IOPID-1074](https://pagopa.atlassian.net/browse/IOPID-1074)]  Add IntesiGroup IdP local reference ([#5122](https://github.com/pagopa/io-app/issues/5122)) ([2e1b344](https://github.com/pagopa/io-app/commit/2e1b34413406d3d61300ddca64cd5d35f594be9c))


### Bug Fixes

* [[IABT-1498](https://pagopa.atlassian.net/browse/IABT-1498)] Fix crash on android build and align app version ([#5158](https://github.com/pagopa/io-app/issues/5158)) ([3954bd8](https://github.com/pagopa/io-app/commit/3954bd8b4a376d3bbd10dc12d74e0031fd7889ce))
* [[IOBP-292](https://pagopa.atlassian.net/browse/IOBP-292)] Idpay details monitoring payment method count not handling voiceover correctly ([#5129](https://github.com/pagopa/io-app/issues/5129)) ([5a2b812](https://github.com/pagopa/io-app/commit/5a2b812ab9bf95a4bd73c1ef657905830d24407d))
* [[IOBP-336](https://pagopa.atlassian.net/browse/IOBP-336)] Fix file upload modal in barcodes scan screen ([#5123](https://github.com/pagopa/io-app/issues/5123)) ([c941938](https://github.com/pagopa/io-app/commit/c94193814c9ee2ec453f00e97e00153cc22954bf))
* [[IOBP-360](https://pagopa.atlassian.net/browse/IOBP-360)] Fix dates format in ID Pay benificiary details screen ([#5162](https://github.com/pagopa/io-app/issues/5162)) ([908ca28](https://github.com/pagopa/io-app/commit/908ca2875b3e4515312d6039a3fac4b35db7988a)), closes [1#diff-763f13f0b9f72e4763aa758664939937121a62cc637c86ff29bfe6f41ab7d56](https://github.com/pagopa/1/issues/diff-763f13f0b9f72e4763aa758664939937121a62cc637c86ff29bfe6f41ab7d56)
* [[IOBP-364](https://pagopa.atlassian.net/browse/IOBP-364)] Disable gesture in ID Pay onboarding completed screen ([#5154](https://github.com/pagopa/io-app/issues/5154)) ([be80fe0](https://github.com/pagopa/io-app/commit/be80fe0fd707b275e81edef7661c1056ac7884bc)), closes [1#diff-01b5ae5ce43bd13eb4995f7b94f39e84f2b77491d85513f111a2582d06e06115](https://github.com/pagopa/1/issues/diff-01b5ae5ce43bd13eb4995f7b94f39e84f2b77491d85513f111a2582d06e06115)


### Chores

* [[IOAPPFD0-178](https://pagopa.atlassian.net/browse/IOAPPFD0-178)] Partially remove local properties from `IOStyles` ([#5140](https://github.com/pagopa/io-app/issues/5140)) ([9bba118](https://github.com/pagopa/io-app/commit/9bba118540c1f52745bb87c9c0088eff6fc2728e))
* [[IOBP-147](https://pagopa.atlassian.net/browse/IOBP-147)] Add QR Code Mixpanel analytics events ([#5099](https://github.com/pagopa/io-app/issues/5099)) ([b1427a1](https://github.com/pagopa/io-app/commit/b1427a15830e0ca8cabd01ee8a8a6115583ffd41))
* [[IOBP-269](https://pagopa.atlassian.net/browse/IOBP-269)] Removal of residue nativeBase imports from wallet flows ([#5068](https://github.com/pagopa/io-app/issues/5068)) ([55f9fee](https://github.com/pagopa/io-app/commit/55f9fee227da55d451a06b89088f1621c2ca2fba))
* [[IOBP-270](https://pagopa.atlassian.net/browse/IOBP-270),[IOBP-369](https://pagopa.atlassian.net/browse/IOBP-369)] Remove direct-referenced native-base components into CGN screens ([#5063](https://github.com/pagopa/io-app/issues/5063)) ([efc732d](https://github.com/pagopa/io-app/commit/efc732da5f0a65c6e5dfbdc697e55335e78b92c4))
* [[IOBP-340](https://pagopa.atlassian.net/browse/IOBP-340)] Add loading state to `BarcodeScanBaseScreenComponent` ([#5166](https://github.com/pagopa/io-app/issues/5166)) ([479fde8](https://github.com/pagopa/io-app/commit/479fde8b3a5dbcaa3bce52184973b8d4cc10a966)), closes [1#diff-9a7ca968e85405f3c0468404c3d7592a8f243f9ea801afb6ff5f2f6ee6073](https://github.com/pagopa/1/issues/diff-9a7ca968e85405f3c0468404c3d7592a8f243f9ea801afb6ff5f2f6ee6073) [1#diff-1e4e400edd0a8debdd16a6c728d260d849b977083ea5aa108a5ba43ce25ac4c2](https://github.com/pagopa/1/issues/diff-1e4e400edd0a8debdd16a6c728d260d849b977083ea5aa108a5ba43ce25ac4c2) [1#diff-f9a213668da7a0880622ac4d0690f61c85abd9d961b6b1c05baafdf0717b5957](https://github.com/pagopa/1/issues/diff-f9a213668da7a0880622ac4d0690f61c85abd9d961b6b1c05baafdf0717b5957) [1#diff-36bd07843535011c4a091fd48fba32d133ba39986aa714dbe03a54332c1803a1](https://github.com/pagopa/1/issues/diff-36bd07843535011c4a091fd48fba32d133ba39986aa714dbe03a54332c1803a1) [1#diff-12570b34029e534a64b24f1cb81383d99557273c4b2f34ad4ced82685fa017f6](https://github.com/pagopa/1/issues/diff-12570b34029e534a64b24f1cb81383d99557273c4b2f34ad4ced82685fa017f6) [1#diff-eaf783c2cc9816aca220690082f4ba077df5954553a99078eb5e3faec9bd4b27](https://github.com/pagopa/1/issues/diff-eaf783c2cc9816aca220690082f4ba077df5954553a99078eb5e3faec9bd4b27) [1#diff-627f530afb8e81f8849fbfbfa2ee5ece0434bdbe062355178c9df587151a9513](https://github.com/pagopa/1/issues/diff-627f530afb8e81f8849fbfbfa2ee5ece0434bdbe062355178c9df587151a9513) [/github.com/pagopa/io-app/pull/5166/files#diff-df9889d94972386628b359910ce7aa1909a30d8a8d95b7931cf68fdc46499483](https://github.com/pagopa//github.com/pagopa/io-app/pull/5166/files/issues/diff-df9889d94972386628b359910ce7aa1909a30d8a8d95b7931cf68fdc46499483)
* [[IOBP-366](https://pagopa.atlassian.net/browse/IOBP-366)] Fix`IOToast` import in `TransactionSummaryScreen` ([#5151](https://github.com/pagopa/io-app/issues/5151)) ([1ef8a55](https://github.com/pagopa/io-app/commit/1ef8a55986a37e3202e33c54bed535d8f6325b95)), closes [1#diff-47963200ba53ae60a3a94216a88c5409031afb1579f67ffd44ba8a4b381909a5](https://github.com/pagopa/1/issues/diff-47963200ba53ae60a3a94216a88c5409031afb1579f67ffd44ba8a4b381909a5)
* [[IOCOM-626](https://pagopa.atlassian.net/browse/IOCOM-626)] Update API definitions ([#5145](https://github.com/pagopa/io-app/issues/5145)) ([106af0b](https://github.com/pagopa/io-app/commit/106af0b5e47cd2874372b564fa7bcaf1497a4c0a))
* [[IOPID-966](https://pagopa.atlassian.net/browse/IOPID-966)] L2 Locked Access ([#5148](https://github.com/pagopa/io-app/issues/5148)) ([6142a46](https://github.com/pagopa/io-app/commit/6142a46797c111ab016686025e6bc7915bef9c68))

## [2.44.0-rc.4](https://github.com/pagopa/io-app/compare/2.44.0-rc.3...2.44.0-rc.4) (2023-10-24)


### Bug Fixes

* [[IABT-1498](https://pagopa.atlassian.net/browse/IABT-1498)] Fix crash on Android ([c8f9ab2](https://github.com/pagopa/io-app/commit/c8f9ab27a1aaffaa6e4da01b26f8b42057d057fa))

## [2.44.0-rc.3](https://github.com/pagopa/io-app/compare/2.44.0-rc.2...2.44.0-rc.3) (2023-10-19)


### Features

* [[IOCOM-429](https://pagopa.atlassian.net/browse/IOCOM-429),[IOCOM-433](https://pagopa.atlassian.net/browse/IOCOM-433)] PN Multiple Payments: actions, reducer and sagas ([#5112](https://github.com/pagopa/io-app/issues/5112)) ([d925b5f](https://github.com/pagopa/io-app/commit/d925b5f3d3b3d7570fe4e655552058614ef5099f))


### Chores

* [[IOPID-938](https://pagopa.atlassian.net/browse/IOPID-938)] Opt-in screen ([#5096](https://github.com/pagopa/io-app/issues/5096)) ([dd37aef](https://github.com/pagopa/io-app/commit/dd37aef688c57ae97c6f32cb942f3a3042c56c84))
* [[PE-479](https://pagopa.atlassian.net/browse/PE-479)] New CGN logo ([#5089](https://github.com/pagopa/io-app/issues/5089)) ([a9ffc6a](https://github.com/pagopa/io-app/commit/a9ffc6a8894c6bb05e6e2af1d4cfc315709ab558))

## [2.44.0-rc.2](https://github.com/pagopa/io-app/compare/2.44.0-rc.0...2.44.0-rc.2) (2023-10-17)


### Features

* [[IOCOM-610](https://pagopa.atlassian.net/browse/IOCOM-610)] Add the new `ModuleAttachment` component ([#5101](https://github.com/pagopa/io-app/issues/5101)) ([3606446](https://github.com/pagopa/io-app/commit/36064464eb4e7de1e22e8349fd1cef6a9d13ef67))


### Bug Fixes

* [[IABT-1494](https://pagopa.atlassian.net/browse/IABT-1494)] Fix camera not working on Android devices ([#5105](https://github.com/pagopa/io-app/issues/5105)) ([0b7a683](https://github.com/pagopa/io-app/commit/0b7a68368d1c9c24fd80189a55c83f93239d4e04))
* [[IOBP-243](https://pagopa.atlassian.net/browse/IOBP-243)] Fix `TransactionList` a11y ([#5128](https://github.com/pagopa/io-app/issues/5128)) ([6fc0866](https://github.com/pagopa/io-app/commit/6fc0866032935af9389eee3b081d78b0a9bdf508))
* [IOBP-290 , IOBP-289] Voiceover fixes in BarcodeScanScreen ([#5120](https://github.com/pagopa/io-app/issues/5120)) ([10b0d10](https://github.com/pagopa/io-app/commit/10b0d102e7396432898fa7419f441df0bdfa7f6b))
* [[IOBP-296](https://pagopa.atlassian.net/browse/IOBP-296)] A11y reading acronyms in idpay code onboarding screen ([#5127](https://github.com/pagopa/io-app/issues/5127)) ([a695707](https://github.com/pagopa/io-app/commit/a6957075ee458f7eedee6fa19208609cbd99aebd))
* [[IOBP-330](https://pagopa.atlassian.net/browse/IOBP-330)] Fix manual input modal in Barcode Scan screen ([#5106](https://github.com/pagopa/io-app/issues/5106)) ([48d40c7](https://github.com/pagopa/io-app/commit/48d40c766bdb117b03271f26d6f24d9bbe7b21fd)), closes [1#diff-12570b34029e534a64b24f1cb81383d99557273c4b2f34ad4ced82685fa017f6](https://github.com/pagopa/1/issues/diff-12570b34029e534a64b24f1cb81383d99557273c4b2f34ad4ced82685fa017f6)
* [[IOBP-331](https://pagopa.atlassian.net/browse/IOBP-331)] Remove torch button in Barcode Scan screen if camera permission is not granted ([#5107](https://github.com/pagopa/io-app/issues/5107)) ([c683b66](https://github.com/pagopa/io-app/commit/c683b66f2ebc765bb8e6f9133ed91f7e41e73de8)), closes [1#diff-1e4e400edd0a8debdd16a6c728d260d849b977083ea5aa108a5ba43ce25ac4c2](https://github.com/pagopa/1/issues/diff-1e4e400edd0a8debdd16a6c728d260d849b977083ea5aa108a5ba43ce25ac4c2)
* [[IOCOM-611](https://pagopa.atlassian.net/browse/IOCOM-611)] Fix properties on `OPEN_MESSAGE` mixpanel event  ([#5104](https://github.com/pagopa/io-app/issues/5104)) ([eb6d343](https://github.com/pagopa/io-app/commit/eb6d3436143f93fdc2df0e8149833d75420a6446))
* [[IOCOM-622](https://pagopa.atlassian.net/browse/IOCOM-622)] Fix padding around the `StatusContent` component on Android ([#5125](https://github.com/pagopa/io-app/issues/5125)) ([1b29c50](https://github.com/pagopa/io-app/commit/1b29c50ef174aee841a9eeda37410c01aab26526))
* removes the require loop on navigators definition ([#5110](https://github.com/pagopa/io-app/issues/5110)) ([1cee8ce](https://github.com/pagopa/io-app/commit/1cee8cea662817a90799611b9d2a39844b51bafc))


### Chores

* [[IOAPPFD0-167](https://pagopa.atlassian.net/browse/IOAPPFD0-167)] Add the new `LogoPaymentCard` component to the Design System ([#5077](https://github.com/pagopa/io-app/issues/5077)) ([b1e0585](https://github.com/pagopa/io-app/commit/b1e058522a6095cc423c5a0fbd4ddacbfc393559))
* [[IOAPPFD0-170](https://pagopa.atlassian.net/browse/IOAPPFD0-170)] Run `remove_unused_locales` script ([#5074](https://github.com/pagopa/io-app/issues/5074)) ([84ddbdf](https://github.com/pagopa/io-app/commit/84ddbdf3ae9d32232aba8bee0aee5c497154364e))
* [[IOAPPFD0-171](https://pagopa.atlassian.net/browse/IOAPPFD0-171)] Add the new `LoadingSpinner` to the Design System ([#5100](https://github.com/pagopa/io-app/issues/5100)) ([dc54b29](https://github.com/pagopa/io-app/commit/dc54b29087ea8e0850e8fb3dfc749c45343ecd9b))
* [[IOAPPFD0-172](https://pagopa.atlassian.net/browse/IOAPPFD0-172)] Add `loading` state to the `ButtonSolid` component ([#5102](https://github.com/pagopa/io-app/issues/5102)) ([3b28745](https://github.com/pagopa/io-app/commit/3b28745abdc3c7c7221777e10190457487b4833f))
* [[IOAPPFD0-174](https://pagopa.atlassian.net/browse/IOAPPFD0-174)] Add the new `LoadingIndicator` component ([#5111](https://github.com/pagopa/io-app/issues/5111)) ([af80467](https://github.com/pagopa/io-app/commit/af804676e364541ebed0c34b054f76dc2a40cb55))
* [[IOBP-282](https://pagopa.atlassian.net/browse/IOBP-282),[IOBP-287](https://pagopa.atlassian.net/browse/IOBP-287),[IOBP-303](https://pagopa.atlassian.net/browse/IOBP-303)] Restyling transaction summary screen ([#5069](https://github.com/pagopa/io-app/issues/5069)) ([32ccb48](https://github.com/pagopa/io-app/commit/32ccb484951a218cfab908e264fa5222a872c2b3))
* [[IOBP-333](https://pagopa.atlassian.net/browse/IOBP-333)] Add sorting for pagoPA payment notices to barcodes choice screen ([#5108](https://github.com/pagopa/io-app/issues/5108)) ([7633bb0](https://github.com/pagopa/io-app/commit/7633bb0581cacabf0a62800df7952393fe032a84)), closes [1#diff-df9889d94972386628b359910ce7aa1909a30d8a8d95b7931cf68fdc46499483](https://github.com/pagopa/1/issues/diff-df9889d94972386628b359910ce7aa1909a30d8a8d95b7931cf68fdc46499483)
* [[IOPID-999](https://pagopa.atlassian.net/browse/IOPID-999)] Enable FL in production ([#5118](https://github.com/pagopa/io-app/issues/5118)) ([7684fdf](https://github.com/pagopa/io-app/commit/7684fdfc561b298e37705afa5df6a7e9051ec278))

## [2.44.0-rc.1](https://github.com/pagopa/io-app/compare/2.44.0-rc.0...2.44.0-rc.1) (2023-10-16)


### Features

* [[IOCOM-610](https://pagopa.atlassian.net/browse/IOCOM-610)] Add the new `ModuleAttachment` component ([#5101](https://github.com/pagopa/io-app/issues/5101)) ([3606446](https://github.com/pagopa/io-app/commit/36064464eb4e7de1e22e8349fd1cef6a9d13ef67))


### Bug Fixes

* [[IABT-1494](https://pagopa.atlassian.net/browse/IABT-1494)] Fix camera not working on Android devices ([#5105](https://github.com/pagopa/io-app/issues/5105)) ([0b7a683](https://github.com/pagopa/io-app/commit/0b7a68368d1c9c24fd80189a55c83f93239d4e04))
* [[IOCOM-611](https://pagopa.atlassian.net/browse/IOCOM-611)] Fix properties on `OPEN_MESSAGE` mixpanel event  ([#5104](https://github.com/pagopa/io-app/issues/5104)) ([eb6d343](https://github.com/pagopa/io-app/commit/eb6d3436143f93fdc2df0e8149833d75420a6446))
* removes the require loop on navigators definition ([#5110](https://github.com/pagopa/io-app/issues/5110)) ([1cee8ce](https://github.com/pagopa/io-app/commit/1cee8cea662817a90799611b9d2a39844b51bafc))


### Chores

* [[IOAPPFD0-171](https://pagopa.atlassian.net/browse/IOAPPFD0-171)] Add the new `LoadingSpinner` to the Design System ([#5100](https://github.com/pagopa/io-app/issues/5100)) ([dc54b29](https://github.com/pagopa/io-app/commit/dc54b29087ea8e0850e8fb3dfc749c45343ecd9b))
* [[IOAPPFD0-172](https://pagopa.atlassian.net/browse/IOAPPFD0-172)] Add `loading` state to the `ButtonSolid` component ([#5102](https://github.com/pagopa/io-app/issues/5102)) ([3b28745](https://github.com/pagopa/io-app/commit/3b28745abdc3c7c7221777e10190457487b4833f))
* [[IOAPPFD0-174](https://pagopa.atlassian.net/browse/IOAPPFD0-174)] Add the new `LoadingIndicator` component ([#5111](https://github.com/pagopa/io-app/issues/5111)) ([af80467](https://github.com/pagopa/io-app/commit/af804676e364541ebed0c34b054f76dc2a40cb55))
* [[IOBP-282](https://pagopa.atlassian.net/browse/IOBP-282),[IOBP-287](https://pagopa.atlassian.net/browse/IOBP-287),[IOBP-303](https://pagopa.atlassian.net/browse/IOBP-303)] Restyling transaction summary screen ([#5069](https://github.com/pagopa/io-app/issues/5069)) ([32ccb48](https://github.com/pagopa/io-app/commit/32ccb484951a218cfab908e264fa5222a872c2b3))
* enable FL in production ([c6fe290](https://github.com/pagopa/io-app/commit/c6fe290b01615395918e16e35ff776e2873bb303))

## [2.44.0-rc.0](https://github.com/pagopa/io-app/compare/2.43.0-rc.3...2.44.0-rc.0) (2023-10-12)


### Features

* [[IOBP-124](https://pagopa.atlassian.net/browse/IOBP-124)] Add new layout in pagoPA barcode scan screen ([#4856](https://github.com/pagopa/io-app/issues/4856)) ([851c2c9](https://github.com/pagopa/io-app/commit/851c2c9bfcfeeaabd362e0763332d64f8d921eb3))
* [[IOBP-170](https://pagopa.atlassian.net/browse/IOBP-170)] Add multiple pagoPA barcode choice screen ([#4915](https://github.com/pagopa/io-app/issues/4915)) ([ebececa](https://github.com/pagopa/io-app/commit/ebececa523d3c822992432c6f1c13ffdce218b1d))
* [[IOBP-66](https://pagopa.atlassian.net/browse/IOBP-66)] Add scan button in home bottom navigation ([#4771](https://github.com/pagopa/io-app/issues/4771)) ([56564a9](https://github.com/pagopa/io-app/commit/56564a9b013cac7e2363ab321ac06782d5cabee3))
* [[IOCOM-570](https://pagopa.atlassian.net/browse/IOCOM-570)] Remove `newPnMessageDetailsEnabled` feature flag ([#5090](https://github.com/pagopa/io-app/issues/5090)) ([ef669bd](https://github.com/pagopa/io-app/commit/ef669bd459e775c5dd1088c68f909827f467f5ba))
* [[IOCOM-572](https://pagopa.atlassian.net/browse/IOCOM-572)] Add `pnNoticesF24Enabled` feature flag ([#5091](https://github.com/pagopa/io-app/issues/5091)) ([0bcb285](https://github.com/pagopa/io-app/commit/0bcb28536b24ac181e4f2475bc95d72ddeb8aebe))
* [[IOPID-742](https://pagopa.atlassian.net/browse/IOPID-742)] New email validation screens added ([#5014](https://github.com/pagopa/io-app/issues/5014)) ([4c4a81b](https://github.com/pagopa/io-app/commit/4c4a81be278550b86a94b605dd8885ae7eacca33))


### Bug Fixes

* [[IOBP-305](https://pagopa.atlassian.net/browse/IOBP-305)] Add missing icons for instrument operations of type `IDPAYCODE` ([#5084](https://github.com/pagopa/io-app/issues/5084)) ([279ec18](https://github.com/pagopa/io-app/commit/279ec1867906b462e62a01d5af89fa9718a0c59f)), closes [/github.com/pagopa/io-app/compare/master...IOBP-305-add-missing-operations-icon-in-idpay-timeline#diff-bf0f0c12b0c8396401a112111f50ecd7d00a22d176641c354e3880e3879cbd51](https://github.com/pagopa//github.com/pagopa/io-app/compare/master...IOBP-305-add-missing-operations-icon-in-idpay-timeline/issues/diff-bf0f0c12b0c8396401a112111f50ecd7d00a22d176641c354e3880e3879cbd51)


### Chores

* [[IOAPPFD0-164](https://pagopa.atlassian.net/browse/IOAPPFD0-164)] Remove local `Selection` components ([#5056](https://github.com/pagopa/io-app/issues/5056)) ([b25c9c3](https://github.com/pagopa/io-app/commit/b25c9c358748ad362c0120d3bd4d3b8c71977546))
* [[IOAPPFD0-165](https://pagopa.atlassian.net/browse/IOAPPFD0-165)] Remove local `Avatar` component ([#5058](https://github.com/pagopa/io-app/issues/5058)) ([1c14283](https://github.com/pagopa/io-app/commit/1c14283d3de286788fb5dacf9ffa2c7fba96ff21))
* [[IOAPPFD0-166](https://pagopa.atlassian.net/browse/IOAPPFD0-166)] Remove local `Alert` component ([#5059](https://github.com/pagopa/io-app/issues/5059)) ([c273896](https://github.com/pagopa/io-app/commit/c2738962659866a67f2717ab07d4b0b1c9dedf0e))
* [[IOBP-281](https://pagopa.atlassian.net/browse/IOBP-281)] Add unit tests for IdPay Code feature ([#5065](https://github.com/pagopa/io-app/issues/5065)) ([af471ff](https://github.com/pagopa/io-app/commit/af471ff94ceda2399ecea28a6b55f320ed71b5fc))
* [[IOPID-894](https://pagopa.atlassian.net/browse/IOPID-894)] Fast login opt-in BL ([#5046](https://github.com/pagopa/io-app/issues/5046)) ([4182b11](https://github.com/pagopa/io-app/commit/4182b11a602ddc15bb8f531057c113db84787d7e))
* upgrades prettier to latest v2 ([#5080](https://github.com/pagopa/io-app/issues/5080)) ([85026df](https://github.com/pagopa/io-app/commit/85026dfd447c2d253bbf6e9a39b7ef14adb5e518))

## [2.43.0-rc.3](https://github.com/pagopa/io-app/compare/2.43.0-rc.2...2.43.0-rc.3) (2023-10-06)


### Bug Fixes

* [[IOBP-286](https://pagopa.atlassian.net/browse/IOBP-286)] Fix ID Pay instruments and unsubscription bottom sheets ([#5079](https://github.com/pagopa/io-app/issues/5079)) ([b443834](https://github.com/pagopa/io-app/commit/b44383442a0b2a8eaf93f5eea5a35c77455c98ca)), closes [1#diff-7bcfebf445dd9574f6d78c786ca8832a4559e3ce28dbb5d9d540de80a64ba8](https://github.com/pagopa/1/issues/diff-7bcfebf445dd9574f6d78c786ca8832a4559e3ce28dbb5d9d540de80a64ba8) [1#diff-7a2a5467f073e83a63b580443c564027a011c278100741fc17914d098862f0f3](https://github.com/pagopa/1/issues/diff-7a2a5467f073e83a63b580443c564027a011c278100741fc17914d098862f0f3)
* [[IOBP-288](https://pagopa.atlassian.net/browse/IOBP-288),[IOBP-299](https://pagopa.atlassian.net/browse/IOBP-299)] ID Pay details screen refactoring ([#5076](https://github.com/pagopa/io-app/issues/5076)) ([3ed6d35](https://github.com/pagopa/io-app/commit/3ed6d35ce05b57416d781413fddc051a65b1aa69))
* [[IOBP-300](https://pagopa.atlassian.net/browse/IOBP-300)] Add missing bottom sheets to ID Pay CIE screens ([#5073](https://github.com/pagopa/io-app/issues/5073)) ([5f05dc8](https://github.com/pagopa/io-app/commit/5f05dc80aeaa37674bfb13bb9e0f873010a00cfc)), closes [1#diff-d707cf1d996ad8193c4fb386857e18e3f1defbfe49e1820b361fd7cd9b357403](https://github.com/pagopa/1/issues/diff-d707cf1d996ad8193c4fb386857e18e3f1defbfe49e1820b361fd7cd9b357403) [1#diff-5d3cac3615ea6808724da600cc5f2ef90e9d7edc7576ef59e6c3ed70e2dcf5e8](https://github.com/pagopa/1/issues/diff-5d3cac3615ea6808724da600cc5f2ef90e9d7edc7576ef59e6c3ed70e2dcf5e8) [1#diff-620aa154164c40e64860e6757c936488097a73b82ec7a5a21cee93c6055bc6](https://github.com/pagopa/1/issues/diff-620aa154164c40e64860e6757c936488097a73b82ec7a5a21cee93c6055bc6)
* **Firma con IO:** [[FCIA-77](https://pagopa.atlassian.net/browse/FCIA-77)] Update birthdate format in data sharing screen ([#5078](https://github.com/pagopa/io-app/issues/5078)) ([72e7acf](https://github.com/pagopa/io-app/commit/72e7acf4f98ab49144f324829270f2aff567d2dc))

## [2.43.0-rc.2](https://github.com/pagopa/io-app/compare/2.43.0-rc.1...2.43.0-rc.2) (2023-10-05)


### Features

* [[IOPLT-178](https://pagopa.atlassian.net/browse/IOPLT-178)] Persist experimental context value ([#5064](https://github.com/pagopa/io-app/issues/5064)) ([76003dd](https://github.com/pagopa/io-app/commit/76003ddc4a1ddb4e67a81b7e96e40cda9d57e30c))


### Bug Fixes

* [[IOBP-285](https://pagopa.atlassian.net/browse/IOBP-285)] Fix navigation on IdPay CIE code failure ([#5067](https://github.com/pagopa/io-app/issues/5067)) ([aecd427](https://github.com/pagopa/io-app/commit/aecd42713b679344a1f61c0e01a5106f4a7ba82e)), closes [/github.com/pagopa/io-app/pull/5067/files#diff-d707cf1d996ad8193c4fb386857e18e3f1defbfe49e1820b361fd7cd9b357403](https://github.com/pagopa//github.com/pagopa/io-app/pull/5067/files/issues/diff-d707cf1d996ad8193c4fb386857e18e3f1defbfe49e1820b361fd7cd9b357403)


### Chores

* [[IOAPPFD0-160](https://pagopa.atlassian.net/browse/IOAPPFD0-160)] Update CGN components to use `Icon` component, instead of local SVG file ([#5044](https://github.com/pagopa/io-app/issues/5044)) ([e21b583](https://github.com/pagopa/io-app/commit/e21b5830e192bb8160956fe5067c9305fd1264f7))
* [[IOAPPFD0-169](https://pagopa.atlassian.net/browse/IOAPPFD0-169)] Add `[@dmnplb](https://github.com/dmnplb)` as code owner of the DS section ([#5070](https://github.com/pagopa/io-app/issues/5070)) ([9ff0eac](https://github.com/pagopa/io-app/commit/9ff0eac2b6968361f5a3556ec2c032fd0a5ef47e))
* [[IOCOM-579](https://pagopa.atlassian.net/browse/IOCOM-579)] Replace the new pictograms with the old ones in the `PreconditionBottomSheet` ([#5075](https://github.com/pagopa/io-app/issues/5075)) ([801ce3a](https://github.com/pagopa/io-app/commit/801ce3afdb9adc2dc37b7554079b4a701a18f858))

## [2.43.0-rc.1](https://github.com/pagopa/io-app/compare/2.43.0-rc.0...2.43.0-rc.1) (2023-10-03)


### Features

* [[IOBP-224](https://pagopa.atlassian.net/browse/IOBP-224)] IDPay discount initiative payment method ([#4983](https://github.com/pagopa/io-app/issues/4983)) ([42ab2d1](https://github.com/pagopa/io-app/commit/42ab2d158acdd336ec69c6f33e80cefb1cc60de5))
* [[IOBP-234](https://pagopa.atlassian.net/browse/IOBP-234),[IOBP-233](https://pagopa.atlassian.net/browse/IOBP-233)] IdPay code onboarding screen ([#5001](https://github.com/pagopa/io-app/issues/5001)) ([b1e6449](https://github.com/pagopa/io-app/commit/b1e6449afd5365ba6b7575b3ca45310d3084fdbb))
* [[IOBP-279](https://pagopa.atlassian.net/browse/IOBP-279)] IDPay code reset entry in profile screen  ([#5051](https://github.com/pagopa/io-app/issues/5051)) ([40c3f6f](https://github.com/pagopa/io-app/commit/40c3f6ffffea76f762e95ca30fcfd78aa95eb419))
* [[IOBP-80](https://pagopa.atlassian.net/browse/IOBP-80)] Add torch button to QRCode scan screen header ([#4726](https://github.com/pagopa/io-app/issues/4726)) ([6777275](https://github.com/pagopa/io-app/commit/67772758f2a2595375278e07c003db8e512bbe7c))


### Bug Fixes

* [[IABT-1493](https://pagopa.atlassian.net/browse/IABT-1493)] Apply patch to fix camera crash on iPhone 15 ([#5049](https://github.com/pagopa/io-app/issues/5049)) ([0c9e840](https://github.com/pagopa/io-app/commit/0c9e840614a3f99c0a412513d2205e480d9e8c46))
* [[IOBP-95](https://pagopa.atlassian.net/browse/IOBP-95)] Fix ultra wide angle camera being used in barcode scan screen ([#5060](https://github.com/pagopa/io-app/issues/5060)) ([c0f41c5](https://github.com/pagopa/io-app/commit/c0f41c511fa4d2df17be76b6fb6e69996680d0f2))
* [[IOCOM-576](https://pagopa.atlassian.net/browse/IOCOM-576)] Backend specs aligned to fix failed payments decoding ([#5066](https://github.com/pagopa/io-app/issues/5066)) ([72b1dad](https://github.com/pagopa/io-app/commit/72b1dadbc8469ec5a8c0279ca34025f4f46d7a72))


### Chores

* [[IOAPPFD0-158](https://pagopa.atlassian.net/browse/IOAPPFD0-158)] Remove local `ModuleIDP` and `ModulePaymentNotice` components ([#5038](https://github.com/pagopa/io-app/issues/5038)) ([71d1df2](https://github.com/pagopa/io-app/commit/71d1df2b99d0e00d00e9cce10a4e8f63b5638e18))
* [[IOAPPFD0-159](https://pagopa.atlassian.net/browse/IOAPPFD0-159)] Remove local `Banner` component ([#5043](https://github.com/pagopa/io-app/issues/5043)) ([7af29f2](https://github.com/pagopa/io-app/commit/7af29f2ff5cc36c0701408513db6c1143e66182b))
* [[IOAPPFD0-161](https://pagopa.atlassian.net/browse/IOAPPFD0-161)] Remove local `ListItem…` components ([#5045](https://github.com/pagopa/io-app/issues/5045)) ([89822ec](https://github.com/pagopa/io-app/commit/89822ecb630a0a28bea9bc4b354a322f565ea1df))
* [[IOAPPFD0-162](https://pagopa.atlassian.net/browse/IOAPPFD0-162)] Remove legacy `BlockButtons` from the Design System ([#5050](https://github.com/pagopa/io-app/issues/5050)) ([787aeb1](https://github.com/pagopa/io-app/commit/787aeb18c0294579436750dd4fa3f51de6233eb5))
* [[IOAPPFD0-163](https://pagopa.atlassian.net/browse/IOAPPFD0-163)] Remove local `ButtonExtendedOutline` component ([#5054](https://github.com/pagopa/io-app/issues/5054)) ([d75c30d](https://github.com/pagopa/io-app/commit/d75c30d05ed7b3ed6bbe826234b3998b94141ce4))
* [[IOBP-185](https://pagopa.atlassian.net/browse/IOBP-185),[IOBP-271](https://pagopa.atlassian.net/browse/IOBP-271)] Use `ListItemSwitch` in IdPay components ([#5047](https://github.com/pagopa/io-app/issues/5047)) ([fa92327](https://github.com/pagopa/io-app/commit/fa923270eda2d8246ca38fbe18151cee5dcc9408))
* [[IOBP-236](https://pagopa.atlassian.net/browse/IOBP-236)] Banner pay with CIE into IDPay discount initiative ([#5005](https://github.com/pagopa/io-app/issues/5005)) ([2e90981](https://github.com/pagopa/io-app/commit/2e909819b4586b555d0555e239440062c442cd32))
* [[IOBP-256](https://pagopa.atlassian.net/browse/IOBP-256)] Implements IdPay code flow with redux-saga ([#4995](https://github.com/pagopa/io-app/issues/4995)) ([4b8ccc9](https://github.com/pagopa/io-app/commit/4b8ccc9ab7eb5f5db5c73231b68d865abbccb343))
* [[IOBP-262](https://pagopa.atlassian.net/browse/IOBP-262)] Update IdPay API definitions ([#4994](https://github.com/pagopa/io-app/issues/4994)) ([15a9c93](https://github.com/pagopa/io-app/commit/15a9c93af08862be50b8a006068c22b122b94800))
* [[IOBP-267](https://pagopa.atlassian.net/browse/IOBP-267)] Remove native-base from IdPay components ([#5012](https://github.com/pagopa/io-app/issues/5012)) ([3f02543](https://github.com/pagopa/io-app/commit/3f02543ee582cefc8a2cf4cab2ce85f2576a08f8))
* [[IOBP-277](https://pagopa.atlassian.net/browse/IOBP-277)] ListItemAction update in codeRenewScreen ([#5034](https://github.com/pagopa/io-app/issues/5034)) ([ea0e424](https://github.com/pagopa/io-app/commit/ea0e42485979c36ccb4670d1cab08bb8722c6d42))
* [[IOPID-882](https://pagopa.atlassian.net/browse/IOPID-882)] MP initialization refactoring ([#5036](https://github.com/pagopa/io-app/issues/5036)) ([18438d6](https://github.com/pagopa/io-app/commit/18438d66c3d10b97f28b6cffd5864d98c049d477))

## [2.43.0-rc.0](https://github.com/pagopa/io-app/compare/2.42.0-rc.1...2.43.0-rc.0) (2023-09-27)


### Features

* [[IOBP-229](https://pagopa.atlassian.net/browse/IOBP-229)] Idpay code onboarding outcome screens ([#4980](https://github.com/pagopa/io-app/issues/4980)) ([4a87c58](https://github.com/pagopa/io-app/commit/4a87c58081082c2ba5cb587a46c86a8daf9ada87))
* [[IOBP-235](https://pagopa.atlassian.net/browse/IOBP-235)]  Addition of  idpay code display screen ([#4992](https://github.com/pagopa/io-app/issues/4992)) ([1896cde](https://github.com/pagopa/io-app/commit/1896cdee1c61f93d82f6c790e5da43f597096369))
* [[IOBP-236](https://pagopa.atlassian.net/browse/IOBP-236)] IDPay CIE how it works bottom sheet ([#4982](https://github.com/pagopa/io-app/issues/4982)) ([f5b8115](https://github.com/pagopa/io-app/commit/f5b8115c6ffca7db2d2da150450f95a9e04fbc32))
* [[IOBP-264](https://pagopa.atlassian.net/browse/IOBP-264)] Addition of idpay code regeneration screen and beginning of flow ([#5011](https://github.com/pagopa/io-app/issues/5011)) ([d72d5b6](https://github.com/pagopa/io-app/commit/d72d5b69b5a14668307622d8665c0db5ac83c1c9))
* [[IOCOM-512](https://pagopa.atlassian.net/browse/IOCOM-512)] Add the `OPEN_MESSAGE` mixpanel event ([#5008](https://github.com/pagopa/io-app/issues/5008)) ([8343bc3](https://github.com/pagopa/io-app/commit/8343bc3b77c590ff0ddeebe43a3768f3287f0027))
* [[IOCOM-548](https://pagopa.atlassian.net/browse/IOCOM-548)] Tracking properties on PN_UX_SUCCESS event to track cancelled PN notification ([#5016](https://github.com/pagopa/io-app/issues/5016)) ([8b3aa60](https://github.com/pagopa/io-app/commit/8b3aa607e37ab911f2a0314416444e91c4cd2d69))
* [[IOCOM-555](https://pagopa.atlassian.net/browse/IOCOM-555)] Replace `FullReceivedNotification` with the autogenerated one ([#5024](https://github.com/pagopa/io-app/issues/5024)) ([1ff4c91](https://github.com/pagopa/io-app/commit/1ff4c9154950e4a44c9b654c1eb8363e927a0a3f))
* [[IOCOM-559](https://pagopa.atlassian.net/browse/IOCOM-559)] Enable the PN flag for cancelled notification's handling ([#5037](https://github.com/pagopa/io-app/issues/5037)) ([f12053a](https://github.com/pagopa/io-app/commit/f12053a29e6854b576d73ac0a27eb881d78f61fc))
* **Firma con IO:** [[SFEQS-1894](https://pagopa.atlassian.net/browse/SFEQS-1894)] Add signature field static info tooltip with the definition of unfair clause ([#4973](https://github.com/pagopa/io-app/issues/4973)) ([88e1c3e](https://github.com/pagopa/io-app/commit/88e1c3ead1f59705c91cfb671a97dcd920f51d8c))


### Bug Fixes

* [[IABT-1489](https://pagopa.atlassian.net/browse/IABT-1489)] Mismatch in expireDate field on Payment Method details page ([#5000](https://github.com/pagopa/io-app/issues/5000)) ([52c6b5d](https://github.com/pagopa/io-app/commit/52c6b5da407a9aabb21aa016603b83968e092466))


### Chores

* [[IOAPPFD0-144](https://pagopa.atlassian.net/browse/IOAPPFD0-144)] Add `IconContained` example to DS ([#5025](https://github.com/pagopa/io-app/issues/5025)) ([6ef4abb](https://github.com/pagopa/io-app/commit/6ef4abbd3940550e9a689bebd597450e9cdba35f))
* [[IOAPPFD0-148](https://pagopa.atlassian.net/browse/IOAPPFD0-148)] Remove local `IconButton…` components ([#4986](https://github.com/pagopa/io-app/issues/4986)) ([6c12d5e](https://github.com/pagopa/io-app/commit/6c12d5ed659f7a92d9ee4fad7cb332f52deecb83))
* [[IOAPPFD0-149](https://pagopa.atlassian.net/browse/IOAPPFD0-149)] Add full dark mode support to the DS section ([#4988](https://github.com/pagopa/io-app/issues/4988)) ([4e27c01](https://github.com/pagopa/io-app/commit/4e27c0125897a91b959b61a1dadeb0715b2b19ca))
* [[IOAPPFD0-152](https://pagopa.atlassian.net/browse/IOAPPFD0-152)] Update `Design System` pages to reflect the latest developments ([#4998](https://github.com/pagopa/io-app/issues/4998)) ([6848b7e](https://github.com/pagopa/io-app/commit/6848b7e82750de235076007d6898b2ae58d31cf8))
* [[IOAPPFD0-153](https://pagopa.atlassian.net/browse/IOAPPFD0-153)] Remove `@react-navigation/drawer` dependency ([#4999](https://github.com/pagopa/io-app/issues/4999)) ([f967c63](https://github.com/pagopa/io-app/commit/f967c63f7430f79160036ab4a432b698da80cbcb))
* [[IOAPPFD0-155](https://pagopa.atlassian.net/browse/IOAPPFD0-155)] Add color mode support to the pictograms ([#5023](https://github.com/pagopa/io-app/issues/5023)) ([ede3abe](https://github.com/pagopa/io-app/commit/ede3abe59b7e3aa5587da6b963b195f809d82862))
* [[IOBP-150](https://pagopa.atlassian.net/browse/IOBP-150)] Add identification request in IdPay transaction authorization ([#5006](https://github.com/pagopa/io-app/issues/5006)) ([78c3c56](https://github.com/pagopa/io-app/commit/78c3c561662cdd03cb01bb96f7965a7f7a5b3237))
* [[IOBP-215](https://pagopa.atlassian.net/browse/IOBP-215)] Unused locales scripts ([#4967](https://github.com/pagopa/io-app/issues/4967)) ([3ffc301](https://github.com/pagopa/io-app/commit/3ffc301e4078367b1caf9bbde63fbbf085b4f56a))
* [[IOBP-266](https://pagopa.atlassian.net/browse/IOBP-266)] IDPay configuration wallet instruments filter ([#5026](https://github.com/pagopa/io-app/issues/5026)) ([83c3b9d](https://github.com/pagopa/io-app/commit/83c3b9d2f2f691c14032c78b8e8b05d4343acbb6))
* [[IOCOM-549](https://pagopa.atlassian.net/browse/IOCOM-549)] Display the `dueDate` in the transaction summary ([#5003](https://github.com/pagopa/io-app/issues/5003)) ([d186b17](https://github.com/pagopa/io-app/commit/d186b17a8e15f541ed8dda7f4a9ffe70a779f05a))

## [2.42.0-rc.1](https://github.com/pagopa/io-app/compare/2.42.0-rc.0...2.42.0-rc.1) (2023-09-19)


### Features

* **Firma con IO:** [[SFEQS-1976](https://pagopa.atlassian.net/browse/SFEQS-1976)] Handle 401 status code adding fast login wrapper ([#4935](https://github.com/pagopa/io-app/issues/4935)) ([47bb1c5](https://github.com/pagopa/io-app/commit/47bb1c5f6f10493ba2ccd33062692d58ec243e2f))
* [[IOCOM-497](https://pagopa.atlassian.net/browse/IOCOM-497)] PN cancelled message UI ([#4970](https://github.com/pagopa/io-app/issues/4970)) ([dac2fe9](https://github.com/pagopa/io-app/commit/dac2fe996b8759cf9fed954177db14d21e0ef4c1))
* [[IOCOM-498](https://pagopa.atlassian.net/browse/IOCOM-498)] Payment UI on a PN cancelled message ([#4977](https://github.com/pagopa/io-app/issues/4977)) ([3703fa5](https://github.com/pagopa/io-app/commit/3703fa51cbfc483751a67498623092e144b098c9))
* [[IOCOM-522](https://pagopa.atlassian.net/browse/IOCOM-522)] Paid payments details' screen for a cancelled PN message ([#4987](https://github.com/pagopa/io-app/issues/4987)) ([46d8347](https://github.com/pagopa/io-app/commit/46d83476986a827d784f2362b6cb890340d38e11))
* [[IOCOM-528](https://pagopa.atlassian.net/browse/IOCOM-528)] Add check on minimum app version for PN ([#4975](https://github.com/pagopa/io-app/issues/4975)) ([630c594](https://github.com/pagopa/io-app/commit/630c5945ec213287611be92eebd8d235c3309a9f))
* [[IOPID-652](https://pagopa.atlassian.net/browse/IOPID-652)] Biometric educational ([#4971](https://github.com/pagopa/io-app/issues/4971)) ([6bb82ff](https://github.com/pagopa/io-app/commit/6bb82ffd3df69fffa1667428b4a8ea987e88c009))
* [[IOPID-666](https://pagopa.atlassian.net/browse/IOPID-666)] FL missing pin logout flow ([#4968](https://github.com/pagopa/io-app/issues/4968)) ([a0f92a0](https://github.com/pagopa/io-app/commit/a0f92a08f2f766259e9316333a9006d8d91aac8e))
* [[IOPID-686](https://pagopa.atlassian.net/browse/IOPID-686)] EmailAlreadyUsed Modal ([#4953](https://github.com/pagopa/io-app/issues/4953)) ([a33ee15](https://github.com/pagopa/io-app/commit/a33ee15685521b74927c10fbeb733b545735c873))
* [[IOPID-687](https://pagopa.atlassian.net/browse/IOPID-687)] ValidateEmail Modal ([#4946](https://github.com/pagopa/io-app/issues/4946)) ([b7b0f1e](https://github.com/pagopa/io-app/commit/b7b0f1e6cf4afeb023a9fd440672f6f63e178ddc))


### Bug Fixes

* [[IOBP-248](https://pagopa.atlassian.net/browse/IOBP-248)] Fix IDPay decoded barcodes max length in barcode scan screen ([#4989](https://github.com/pagopa/io-app/issues/4989)) ([de3817d](https://github.com/pagopa/io-app/commit/de3817d150d955e1f4b38895b590f7f5361e0088))
* [[IOCOM-480](https://pagopa.atlassian.net/browse/IOCOM-480)] Various fixes for reported anomalies on PN mixpanel events ([#4963](https://github.com/pagopa/io-app/issues/4963)) ([018796a](https://github.com/pagopa/io-app/commit/018796a5c46dfb8ca3c253b80f83a5ffdc8dad2e))


### Chores

* [[IOAPPFD0-142](https://pagopa.atlassian.net/browse/IOAPPFD0-142)] Remove local visual style references from the codebase ([#4956](https://github.com/pagopa/io-app/issues/4956)) ([66db085](https://github.com/pagopa/io-app/commit/66db0859933c204f8caf6f590c6fe8c9fc9a7596))
* [[IOAPPFD0-146](https://pagopa.atlassian.net/browse/IOAPPFD0-146)] Add the new `IODSExperimentalContextProvider` to the main app, remove local `Button…` components ([#4978](https://github.com/pagopa/io-app/issues/4978)) ([93e664f](https://github.com/pagopa/io-app/commit/93e664f14cd819082edb0647bfc8e290a43bc18c))
* [[IOBP-255](https://pagopa.atlassian.net/browse/IOBP-255)] Flatter IDPay folder structure ([#4990](https://github.com/pagopa/io-app/issues/4990)) ([3ccce0a](https://github.com/pagopa/io-app/commit/3ccce0ad3fbfa9f4518e8cb883741ad9dedaf361))

## [2.42.0-rc.0](https://github.com/pagopa/io-app/compare/2.41.0-rc.1...2.42.0-rc.0) (2023-09-13)


### Features

* [[IOCOM-448](https://pagopa.atlassian.net/browse/IOCOM-448)] Add Module payment notice ([#4947](https://github.com/pagopa/io-app/issues/4947)) ([4e6a7da](https://github.com/pagopa/io-app/commit/4e6a7dac932f016ca1ac751a3560a6b23ca4abee))
* [[IOCOM-496](https://pagopa.atlassian.net/browse/IOCOM-496)] Cancelled message data on PN message ([#4966](https://github.com/pagopa/io-app/issues/4966)) ([258a46c](https://github.com/pagopa/io-app/commit/258a46cc7907e29e1be9128a54bb3d90b17ac307))


### Bug Fixes

* [[IOBP-211](https://pagopa.atlassian.net/browse/IOBP-211)] Infinite loader if list of initiatives is an error ([#4954](https://github.com/pagopa/io-app/issues/4954)) ([6886562](https://github.com/pagopa/io-app/commit/6886562d2d6a554ffebec19902e467e209ef428b))
* [[IOBP-219](https://pagopa.atlassian.net/browse/IOBP-219)] Initiative list into card details ([#4960](https://github.com/pagopa/io-app/issues/4960)) ([db88916](https://github.com/pagopa/io-app/commit/db88916093a0dc0a379da9cdc563fee00563deb8))


### Chores

* [[IOAPPFD0-140](https://pagopa.atlassian.net/browse/IOAPPFD0-140)] Remove `PictogramSection` from the codebase ([#4944](https://github.com/pagopa/io-app/issues/4944)) ([8e8ccbd](https://github.com/pagopa/io-app/commit/8e8ccbd16c56c306896ed3f92dbcd6c3749cb96d))
* [[IOAPPFD0-141](https://pagopa.atlassian.net/browse/IOAPPFD0-141)] Update `README` to include `io-app-design-system` reference ([#4952](https://github.com/pagopa/io-app/issues/4952)) ([92caa21](https://github.com/pagopa/io-app/commit/92caa2163a2fb4126c093aa1cbf7414859351288))
* [[IOAPPFD0-145](https://pagopa.atlassian.net/browse/IOAPPFD0-145)] Add the new `PictogramBleed` component ([#4972](https://github.com/pagopa/io-app/issues/4972)) ([54941a3](https://github.com/pagopa/io-app/commit/54941a354aaa3a641f2c7cda2ed318706da6b508))
* [[IOBP-195](https://pagopa.atlassian.net/browse/IOBP-195)] Dynamic padding to bottom sheet into PDNDAcceptance screen ([#4955](https://github.com/pagopa/io-app/issues/4955)) ([fc61eff](https://github.com/pagopa/io-app/commit/fc61eff2816d7bf5fd0c4dc552b48bc541c74cf5))
* [[IOBP-206](https://pagopa.atlassian.net/browse/IOBP-206)] Remove Satispay flows ([#4950](https://github.com/pagopa/io-app/issues/4950)) ([b3bcf0d](https://github.com/pagopa/io-app/commit/b3bcf0d40d85c3ca07050a1574182b17cf63d3f3))
* [[IOBP-218](https://pagopa.atlassian.net/browse/IOBP-218)] Add LogoPaymentWithFallback to AvailableInitiativesListScreen ([#4959](https://github.com/pagopa/io-app/issues/4959)) ([5723d2f](https://github.com/pagopa/io-app/commit/5723d2f7a560a647927a95e2012efad3776dbda2))
* [[IOBP-244](https://pagopa.atlassian.net/browse/IOBP-244)] Addition of IDPAY CODE playground  ([#4979](https://github.com/pagopa/io-app/issues/4979)) ([dd0a302](https://github.com/pagopa/io-app/commit/dd0a30245316cc592292c85c6294ca0f5a6a2abb))
* [[IOPID-654](https://pagopa.atlassian.net/browse/IOPID-654)] Change insert new email screen ([#4958](https://github.com/pagopa/io-app/issues/4958)) ([2c08146](https://github.com/pagopa/io-app/commit/2c081463d1255c28766b37d095adcbbb490b9644))

## [2.41.0-rc.1](https://github.com/pagopa/io-app/compare/2.41.0-rc.0...2.41.0-rc.1) (2023-09-05)


### Features

* [[IOCOM-447](https://pagopa.atlassian.net/browse/IOCOM-447)] Add local feature flag for the redesign of the PN message detail ([#4941](https://github.com/pagopa/io-app/issues/4941)) ([807cac7](https://github.com/pagopa/io-app/commit/807cac72c6ba8ff7e69d4ddd2bee416590510a28))


### Bug Fixes

* [[IOCOM-395](https://pagopa.atlassian.net/browse/IOCOM-395)] Proper handling of NOTIFICATION_MESSAGE_TAP analytics' event ([#4902](https://github.com/pagopa/io-app/issues/4902)) ([b33106e](https://github.com/pagopa/io-app/commit/b33106e3da513d6e897847cb2e2214f6e441d11a))
* [[IOCOM-411](https://pagopa.atlassian.net/browse/IOCOM-411)] Fix overflowing text in notification preview in opt-in screen ([#4911](https://github.com/pagopa/io-app/issues/4911)) ([1bee9db](https://github.com/pagopa/io-app/commit/1bee9dba47f5aab933ada23b35eac6820fe6bc26))


### Chores

* [[IOBP-163](https://pagopa.atlassian.net/browse/IOBP-163)] Handle 401 status code in IDPay flows (Fast Login) ([#4859](https://github.com/pagopa/io-app/issues/4859)) ([2e33498](https://github.com/pagopa/io-app/commit/2e334988c575ad9c37fe35665226297b27630b6b))
* [[IOBP-208](https://pagopa.atlassian.net/browse/IOBP-208)] Removal of pagoBancomat onboarding  ([#4945](https://github.com/pagopa/io-app/issues/4945)) ([c3a651c](https://github.com/pagopa/io-app/commit/c3a651c297cd77b8646b40afca802dee12d88edc))
* [[IOPID-444](https://pagopa.atlassian.net/browse/IOPID-444)] Updated fast login what's new ([#4942](https://github.com/pagopa/io-app/issues/4942)) ([a8f7bae](https://github.com/pagopa/io-app/commit/a8f7bae28ee3c60bd6799fb894f5233c5aec23dd))
* [[IOPID-670](https://pagopa.atlassian.net/browse/IOPID-670),[IOPID-714](https://pagopa.atlassian.net/browse/IOPID-714)] Fix EIC login flow + EIC dev server login local FF ([#4948](https://github.com/pagopa/io-app/issues/4948)) ([3703f39](https://github.com/pagopa/io-app/commit/3703f39f46ba008d718445151dcb9d8244121c0c))

## [2.41.0-rc.0](https://github.com/pagopa/io-app/compare/2.40.0-rc.4...2.41.0-rc.0) (2023-09-01)


### Chores

* [[IOBP-187](https://pagopa.atlassian.net/browse/IOBP-187),[IOBP-188](https://pagopa.atlassian.net/browse/IOBP-188),[IOBP-189](https://pagopa.atlassian.net/browse/IOBP-189),[IOBP-190](https://pagopa.atlassian.net/browse/IOBP-190),[IOBP-191](https://pagopa.atlassian.net/browse/IOBP-191)] A11y fixes in payment method details ([#4936](https://github.com/pagopa/io-app/issues/4936)) ([904be99](https://github.com/pagopa/io-app/commit/904be9935a4f5335f3d3cbbe0398bff99d041b1a))

## [2.40.0-rc.4](https://github.com/pagopa/io-app/compare/2.40.0-rc.3...2.40.0-rc.4) (2023-08-31)


### Features

* [[IOBP-179](https://pagopa.atlassian.net/browse/IOBP-179)] Decode multiple barcodes from document/image ([#4905](https://github.com/pagopa/io-app/issues/4905)) ([f3100b2](https://github.com/pagopa/io-app/commit/f3100b2659d3a6e2b458e97c7f56ca84fde42502))


### Bug Fixes

* [[IOPLT-131](https://pagopa.atlassian.net/browse/IOPLT-131)] Fixes the problem on dark mode for components ([#4908](https://github.com/pagopa/io-app/issues/4908)) ([3ba75c5](https://github.com/pagopa/io-app/commit/3ba75c5d969827e583933209dbf221e936dae623))


### Chores

* [[IAI-279](https://pagopa.atlassian.net/browse/IAI-279)] Completely remove `IconFont` references from the codebase ([#4919](https://github.com/pagopa/io-app/issues/4919)) ([1ca3391](https://github.com/pagopa/io-app/commit/1ca3391d14591262b214b59292bffc7856c8b9e7))
* [[IOAPPFD0-133](https://pagopa.atlassian.net/browse/IOAPPFD0-133)] Remove the pagoPA test indicator from the first level header ([#4890](https://github.com/pagopa/io-app/issues/4890)) ([b0f29ee](https://github.com/pagopa/io-app/commit/b0f29eef359582b7dcd0b86bc939a3664d55404b))
* [[IOAPPFD0-134](https://pagopa.atlassian.net/browse/IOAPPFD0-134)] Add the new `AccordionItem` to the Design System playground ([#4938](https://github.com/pagopa/io-app/issues/4938)) ([b9e0768](https://github.com/pagopa/io-app/commit/b9e076816de082bf014df6f36b411b27137fe1f6))
* [[IOAPPFD0-138](https://pagopa.atlassian.net/browse/IOAPPFD0-138)] Enable higher refresh rates on ProMotion displays (iOS) ([#4922](https://github.com/pagopa/io-app/issues/4922)) ([b957615](https://github.com/pagopa/io-app/commit/b957615baf71cf5ef3f685f122cb77fcaa6bc85f))
* [[IOBP-155](https://pagopa.atlassian.net/browse/IOBP-155)] Change title typography into legacy `ListItemTransaction` ([#4933](https://github.com/pagopa/io-app/issues/4933)) ([260c0a7](https://github.com/pagopa/io-app/commit/260c0a76934cb5d7927c2feb728f4d1f56cfac26))
* [[IOBP-162](https://pagopa.atlassian.net/browse/IOBP-162)] Addition of banner in bancomat and cobadge details screens ([#4917](https://github.com/pagopa/io-app/issues/4917)) ([1d12088](https://github.com/pagopa/io-app/commit/1d120889b263ec655db8698f41c3dac0dd57c943))
* [[IOBP-178](https://pagopa.atlassian.net/browse/IOBP-178),[IOBP-184](https://pagopa.atlassian.net/browse/IOBP-184)] Native Base dismissal into `IDPayInitiativesListComponents` ([#4923](https://github.com/pagopa/io-app/issues/4923)) ([9de63c9](https://github.com/pagopa/io-app/commit/9de63c9cdbc7ea1c7651254ba6bc8abf1854770a))
* [[IOBP-183](https://pagopa.atlassian.net/browse/IOBP-183)] Missing non-experimental ds in payment method details ([#4926](https://github.com/pagopa/io-app/issues/4926)) ([29b618f](https://github.com/pagopa/io-app/commit/29b618f0bb07d319d11923b8b6fbc788c0c61426))
* [[IOPID-656](https://pagopa.atlassian.net/browse/IOPID-656)] Add a Mixpanel event in case of Assertion Ref ID error ([#4927](https://github.com/pagopa/io-app/issues/4927)) ([d88fe9c](https://github.com/pagopa/io-app/commit/d88fe9c73a6c4c1286420c9845f15d09cbbdf579))

## [2.40.0-rc.3](https://github.com/pagopa/io-app/compare/2.40.0-rc.2...2.40.0-rc.3) (2023-08-22)


### Bug Fixes

* [[IABT-1488](https://pagopa.atlassian.net/browse/IABT-1488)] Fix crash on Android 6 when checking for notifications' permission ([#4921](https://github.com/pagopa/io-app/issues/4921)) ([9d5e34e](https://github.com/pagopa/io-app/commit/9d5e34e40b766ac80ab62729b67f93b54b1616d8))
* [[IOCOM-479](https://pagopa.atlassian.net/browse/IOCOM-479)] Strings for NSPhotoLibraryAddUsageDescription permission ([#4903](https://github.com/pagopa/io-app/issues/4903)) ([96b0531](https://github.com/pagopa/io-app/commit/96b0531c9e9001d2261d49348f878c0fbc3e679f))


### Chores

* [[IOAPPFD0-135](https://pagopa.atlassian.net/browse/IOAPPFD0-135)] Completely remove `dynamicSubHeader` reference from `DarkLayout` ([#4901](https://github.com/pagopa/io-app/issues/4901)) ([9ec583c](https://github.com/pagopa/io-app/commit/9ec583cb6831b6a2c449d25e9a3988e87f448fa3))
* [[IOAPPFD0-136](https://pagopa.atlassian.net/browse/IOAPPFD0-136)] Remove dead assets ([#4916](https://github.com/pagopa/io-app/issues/4916)) ([6c0072b](https://github.com/pagopa/io-app/commit/6c0072b48401494951e2315864b213ad23f46eca))
* [[IOAPPFD0-137](https://pagopa.atlassian.net/browse/IOAPPFD0-137)] Remove unused `Chooser…` components ([#4918](https://github.com/pagopa/io-app/issues/4918)) ([569d1c8](https://github.com/pagopa/io-app/commit/569d1c8c1fb4a140c0182c55ec01c5d87bbe86fb))
* [[IOBP-161](https://pagopa.atlassian.net/browse/IOBP-161)] New design for payment methods details page aside from credit ([#4904](https://github.com/pagopa/io-app/issues/4904)) ([7f80a5b](https://github.com/pagopa/io-app/commit/7f80a5bb5cca743f47ae941b27813372975c6417))
* [[IOBP-166](https://pagopa.atlassian.net/browse/IOBP-166)] Add `Alert` feedback into expired payment methods detail ([#4873](https://github.com/pagopa/io-app/issues/4873)) ([0d54619](https://github.com/pagopa/io-app/commit/0d546192fd016d5e3ece141ad5f0c1238b2ffcb4))
* [[IOBP-168](https://pagopa.atlassian.net/browse/IOBP-168),[IOBP-167](https://pagopa.atlassian.net/browse/IOBP-167)] Toasts messages and native alert for delete payment method confirmation ([#4871](https://github.com/pagopa/io-app/issues/4871)) ([a6f7ac8](https://github.com/pagopa/io-app/commit/a6f7ac8e13edd188ad13b5f4f78bff1c68f545cb))
* [[IOPID-361](https://pagopa.atlassian.net/browse/IOPID-361)] Delete isLollipopEnabledSelector ([#4893](https://github.com/pagopa/io-app/issues/4893)) ([d8b49c2](https://github.com/pagopa/io-app/commit/d8b49c2b585e2a45715ca8019f96a3cc3c8db404))
* [[IOPID-599](https://pagopa.atlassian.net/browse/IOPID-599)] Change text and image of onboarding thankyou page  ([#4913](https://github.com/pagopa/io-app/issues/4913)) ([9a97977](https://github.com/pagopa/io-app/commit/9a9797731ad090c484faec77ed67a9278e1e2620))

## [2.40.0-rc.2](https://github.com/pagopa/io-app/compare/2.40.0-rc.0...2.40.0-rc.2) (2023-08-09)


### Features

* [[IOCOM-364](https://pagopa.atlassian.net/browse/IOCOM-364),[IOCOM-234](https://pagopa.atlassian.net/browse/IOCOM-234)] Optimisations on multiple renderings of messages' section ([#4860](https://github.com/pagopa/io-app/issues/4860)) ([cb47a21](https://github.com/pagopa/io-app/commit/cb47a21614643532ca8a510dfd6091e846d6039e))
* [[IOPLT-108](https://pagopa.atlassian.net/browse/IOPLT-108)] Migrating typography components from Design System ([#4851](https://github.com/pagopa/io-app/issues/4851)) ([fde87ed](https://github.com/pagopa/io-app/commit/fde87ed88ec3adb393134aa939e21430c26175d2))
* [[IOPLT-109](https://pagopa.atlassian.net/browse/IOPLT-109)] Replaces icons with `@pagopa/io-app-design-system` ([#4855](https://github.com/pagopa/io-app/issues/4855)) ([1fa50a2](https://github.com/pagopa/io-app/commit/1fa50a2a5cdf1bd35842f27ad8774af4f79df153))
* [[IOPLT-117](https://pagopa.atlassian.net/browse/IOPLT-117)] Migrating buttons components from design system ([#4869](https://github.com/pagopa/io-app/issues/4869)) ([7325cc9](https://github.com/pagopa/io-app/commit/7325cc994679489473ed4b1bc9910177bb7ae1b9))
* [[IOPLT-118](https://pagopa.atlassian.net/browse/IOPLT-118)] Migrating Alert from Design System ([#4870](https://github.com/pagopa/io-app/issues/4870)) ([b1fa9db](https://github.com/pagopa/io-app/commit/b1fa9db7ad237284a42dd76f0673ce206c6931df))
* [[IOPLT-119](https://pagopa.atlassian.net/browse/IOPLT-119)] Migrating list item components ([#4877](https://github.com/pagopa/io-app/issues/4877)) ([58f2ffc](https://github.com/pagopa/io-app/commit/58f2ffc044b4d65be430d510ceafe0301eb568e1))
* [[IOPLT-120](https://pagopa.atlassian.net/browse/IOPLT-120)] Migrates Badges and tags component to `@pagopa/io-app-design-system` library ([#4874](https://github.com/pagopa/io-app/issues/4874)) ([828d177](https://github.com/pagopa/io-app/commit/828d17736ca37364e1f86275e567baed2d72553e))
* [[IOPLT-121](https://pagopa.atlassian.net/browse/IOPLT-121)] Migrating Radio, Switch and Checkbox components from Design System ([#4878](https://github.com/pagopa/io-app/issues/4878)) ([eaba26f](https://github.com/pagopa/io-app/commit/eaba26fe8969c844a25f3f800621753b9893a29b))


### Bug Fixes

* [[IOCOM-472](https://pagopa.atlassian.net/browse/IOCOM-472)] Fix canOpenUrl on Android which was not taking the host parameter into account ([#4887](https://github.com/pagopa/io-app/issues/4887)) ([9d01993](https://github.com/pagopa/io-app/commit/9d01993e2f06149262e5eac41cfdd16c5c170ba0))
* [[IOCOM-476](https://pagopa.atlassian.net/browse/IOCOM-476)] Fix app opening from a tap on push notification on Android ([#4898](https://github.com/pagopa/io-app/issues/4898)) ([e07f65c](https://github.com/pagopa/io-app/commit/e07f65c9b9922be9ab183d0bf0f720a83e87e6dc))
* [[IOCOM-478](https://pagopa.atlassian.net/browse/IOCOM-478)] Fix regression on message opening from push notification with app in background and no identification ([#4899](https://github.com/pagopa/io-app/issues/4899)) ([6d86aca](https://github.com/pagopa/io-app/commit/6d86aca680953e837f7157e6168748001f4e696e))
* [[IOPLT-127](https://pagopa.atlassian.net/browse/IOPLT-127)] Fixes list item transaction on sperimental visualization enabled ([#4894](https://github.com/pagopa/io-app/issues/4894)) ([99294bb](https://github.com/pagopa/io-app/commit/99294bbd54d51b5758ce374e3127393c52f591ce))


### Chores

* [[IOBP-160](https://pagopa.atlassian.net/browse/IOBP-160)] New design for credit card detail screen ([#4867](https://github.com/pagopa/io-app/issues/4867)) ([b1b4911](https://github.com/pagopa/io-app/commit/b1b49110ade91ba321d44473b5d6b80dd817fc61))
* [[IOBP-172](https://pagopa.atlassian.net/browse/IOBP-172)] Remove help text into wallet home page ([#4875](https://github.com/pagopa/io-app/issues/4875)) ([b1af565](https://github.com/pagopa/io-app/commit/b1af5654b60e3f11a9bdca48f9bd26f1ca03120b))
* [[IOBP-173](https://pagopa.atlassian.net/browse/IOBP-173)] Add IDPay transaction already authorized failure screen ([#4885](https://github.com/pagopa/io-app/issues/4885)) ([9b0f6ac](https://github.com/pagopa/io-app/commit/9b0f6aca2ced9dd1bd464ec9821769259e6ace4b))
* [[IOBP-174](https://pagopa.atlassian.net/browse/IOBP-174)] New `OperationResultScreenContent` component ([#4880](https://github.com/pagopa/io-app/issues/4880)) ([8a233ce](https://github.com/pagopa/io-app/commit/8a233ce763773b50530746983b0c66a42ccb9233))
* [[PE-459](https://pagopa.atlassian.net/browse/PE-459)] Edit CGN opportunities label ([#4886](https://github.com/pagopa/io-app/issues/4886)) ([01ff356](https://github.com/pagopa/io-app/commit/01ff356c0ddb698145df03ade21a718ac2616857))
* Clean-up Podfile.lock ([#4881](https://github.com/pagopa/io-app/issues/4881)) ([8437224](https://github.com/pagopa/io-app/commit/8437224f6c61584ace2e6d2573cd143bf033db14))

## [2.40.0-rc.1](https://github.com/pagopa/io-app/compare/2.40.0-rc.0...2.40.0-rc.1) (2023-08-02)


### Features

* [[IOPLT-108](https://pagopa.atlassian.net/browse/IOPLT-108)] Migrating typography components from Design System ([#4851](https://github.com/pagopa/io-app/issues/4851)) ([fde87ed](https://github.com/pagopa/io-app/commit/fde87ed88ec3adb393134aa939e21430c26175d2))
* [[IOPLT-117](https://pagopa.atlassian.net/browse/IOPLT-117)] Migrating buttons components from design system ([#4869](https://github.com/pagopa/io-app/issues/4869)) ([7325cc9](https://github.com/pagopa/io-app/commit/7325cc994679489473ed4b1bc9910177bb7ae1b9))


### Chores

* Disable iOS deploy ([6bc0186](https://github.com/pagopa/io-app/commit/6bc0186e2213ce57cdae06de54897874faebb423))
* Enable fast login in prod ([007dc1a](https://github.com/pagopa/io-app/commit/007dc1ae09876af27ef44da84fc4494beaba60b4))

## [2.40.0-rc.0](https://github.com/pagopa/io-app/compare/2.39.0-rc.4...2.40.0-rc.0) (2023-08-01)


### Features

* [[IOBP-139](https://pagopa.atlassian.net/browse/IOBP-139),[IOBP-135](https://pagopa.atlassian.net/browse/IOBP-135)] New wallet onboarding webview handling ([#4810](https://github.com/pagopa/io-app/issues/4810)) ([b14a28b](https://github.com/pagopa/io-app/commit/b14a28bad77d9354bcd5e26928143508dd825846))
* [[IOCOM-380](https://pagopa.atlassian.net/browse/IOCOM-380)] Update mixpanel opt-in events ([#4834](https://github.com/pagopa/io-app/issues/4834)) ([0a2c6dc](https://github.com/pagopa/io-app/commit/0a2c6dcb40696118f31fcfa52563d632653d6cc5))
* [[IOCOM-381](https://pagopa.atlassian.net/browse/IOCOM-381),[IOCOM-366](https://pagopa.atlassian.net/browse/IOCOM-366)] Update mixpanel third-party events ([#4844](https://github.com/pagopa/io-app/issues/4844)) ([8976f75](https://github.com/pagopa/io-app/commit/8976f756b95f6dd09152ac7d7a4283df78170351))
* [[IOCOM-396](https://pagopa.atlassian.net/browse/IOCOM-396)] Update `README.md` ([#4852](https://github.com/pagopa/io-app/issues/4852)) ([cabdd6b](https://github.com/pagopa/io-app/commit/cabdd6b7fc6410816e4d0fc883d15afd0eac0258))
* [[IOPID-440](https://pagopa.atlassian.net/browse/IOPID-440)] Add IPZS UAT Switch ([#4842](https://github.com/pagopa/io-app/issues/4842)) ([cc9948e](https://github.com/pagopa/io-app/commit/cc9948edb857c82e1dc5a8f93a9d8568a0198046))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1662](https://pagopa.atlassian.net/browse/SFEQS-1662),[SFEQS-1707](https://pagopa.atlassian.net/browse/SFEQS-1707),[SFEQS-1688](https://pagopa.atlassian.net/browse/SFEQS-1688)] Use saga to draw signature fields ([#4687](https://github.com/pagopa/io-app/issues/4687)) ([306e4f4](https://github.com/pagopa/io-app/commit/306e4f43007c8b9138659bc446c7d34e5cd1ac68))
* [[IOBP-156](https://pagopa.atlassian.net/browse/IOBP-156)] Fix bug in initiative details screen ([#4843](https://github.com/pagopa/io-app/issues/4843)) ([e369195](https://github.com/pagopa/io-app/commit/e3691951cc2ce4adf6d63c7a152764b522f54766))
* [[IOBP-158](https://pagopa.atlassian.net/browse/IOBP-158)] Removal of municipality icons in wallet transactions ([#4853](https://github.com/pagopa/io-app/issues/4853)) ([3a4ff32](https://github.com/pagopa/io-app/commit/3a4ff322d33030b4341554fd6d757320dbb4c906))
* [[IOBP-98](https://pagopa.atlassian.net/browse/IOBP-98)] Add barcode scan result feedback ([#4840](https://github.com/pagopa/io-app/issues/4840)) ([36ed148](https://github.com/pagopa/io-app/commit/36ed1481c817297b5f2fb9832ad2b8bc5a0fcbee))
* [[PE-443](https://pagopa.atlassian.net/browse/PE-443)] Hide address copy button for merchant with allNationalAddresses ([#4818](https://github.com/pagopa/io-app/issues/4818)) ([85d9fb4](https://github.com/pagopa/io-app/commit/85d9fb4e3dce8612bae4326a6773e4b685e3a680))
* Remove native login comment ([#4850](https://github.com/pagopa/io-app/issues/4850)) ([1e856da](https://github.com/pagopa/io-app/commit/1e856da364cdf3776212ef5df8b8e19e50d1ce42))


### Chores

* [[IOAPPFD0-130](https://pagopa.atlassian.net/browse/IOAPPFD0-130)] Add `AnimatedMessageCheckbox` ([#4821](https://github.com/pagopa/io-app/issues/4821)) ([07842bf](https://github.com/pagopa/io-app/commit/07842bfdb5dc9829b5f1c6c67d33eb81cba1b2a3))
* [[IOAPPFD0-131](https://pagopa.atlassian.net/browse/IOAPPFD0-131)] Add a new basic version of the `HeaderSecondLevel` component ([#4835](https://github.com/pagopa/io-app/issues/4835)) ([4c0d47d](https://github.com/pagopa/io-app/commit/4c0d47d97dbe1ba0f69f67699b53e53a9e6fd304))
* **deps:** bump certifi from 2023.5.7 to 2023.7.22 in /scripts/check_cie_button_exists ([#4837](https://github.com/pagopa/io-app/issues/4837)) ([a4a6124](https://github.com/pagopa/io-app/commit/a4a612460ea6d96ab6b4531de86a83640e6bfaf5))
* **deps:** bump certifi from 2023.5.7 to 2023.7.22 in /scripts/check_urls ([#4838](https://github.com/pagopa/io-app/issues/4838)) ([3b31a6f](https://github.com/pagopa/io-app/commit/3b31a6fe435266f7f912d3711a49391be8172979))
* [[IOAPPFD0-125](https://pagopa.atlassian.net/browse/IOAPPFD0-125)] Fix `Divider` rendering issue on Android devices ([#4768](https://github.com/pagopa/io-app/issues/4768)) ([70618c3](https://github.com/pagopa/io-app/commit/70618c3b4c3453edfafcd8c595f71fcfb1378642))
* [[IOAPPFD0-126](https://pagopa.atlassian.net/browse/IOAPPFD0-126)] Add the new `GradientScrollView` and `GradientBottomActions` components ([#4777](https://github.com/pagopa/io-app/issues/4777)) ([2984497](https://github.com/pagopa/io-app/commit/2984497b1c7200020f509d0c9f3004a7c1b5294f))
* [[IOBP-130](https://pagopa.atlassian.net/browse/IOBP-130)] A11y for transactions with negative amount ([#4839](https://github.com/pagopa/io-app/issues/4839)) ([650d914](https://github.com/pagopa/io-app/commit/650d914870bc8cbba0cbf45e3fdc2fb528be19d2))
* [[IOBP-141](https://pagopa.atlassian.net/browse/IOBP-141)] Fix CGN_MERCHANT_DETAILS scrollView padding ([#4831](https://github.com/pagopa/io-app/issues/4831)) ([2582b97](https://github.com/pagopa/io-app/commit/2582b970fc6f10ed3977cb4438cfb4fcef89575b))
* [[IOBP-144](https://pagopa.atlassian.net/browse/IOBP-144)] Add new `TabNavigation` component ([#4828](https://github.com/pagopa/io-app/issues/4828)) ([d001fb4](https://github.com/pagopa/io-app/commit/d001fb46ca2618aec5d11859330cda6792370e7d))
* [[IOBP-97](https://pagopa.atlassian.net/browse/IOBP-97)] Add `TabNavigation` component to barcode scan screen ([#4841](https://github.com/pagopa/io-app/issues/4841)) ([0c6fc07](https://github.com/pagopa/io-app/commit/0c6fc07c3be215445e1b47a0eac74af0724c5a0d))
* [[IOPID-516](https://pagopa.atlassian.net/browse/IOPID-516)] FL deploy workflow ([#4817](https://github.com/pagopa/io-app/issues/4817)) ([e02d8d7](https://github.com/pagopa/io-app/commit/e02d8d7904e0a1ff7def89adaba1e33f018d5ec0))

## [2.39.0-rc.5](https://github.com/pagopa/io-app/compare/2.39.0-rc.4...2.39.0-rc.5) (2023-07-27)


### Features

* [[IOCOM-380](https://pagopa.atlassian.net/browse/IOCOM-380)] Update mixpanel opt-in events ([#4834](https://github.com/pagopa/io-app/issues/4834)) ([0a2c6dc](https://github.com/pagopa/io-app/commit/0a2c6dcb40696118f31fcfa52563d632653d6cc5))


### Bug Fixes

* [[IOBP-156](https://pagopa.atlassian.net/browse/IOBP-156)] Fix bug in initiative details screen ([#4843](https://github.com/pagopa/io-app/issues/4843)) ([e369195](https://github.com/pagopa/io-app/commit/e3691951cc2ce4adf6d63c7a152764b522f54766))
* [[IOBP-98](https://pagopa.atlassian.net/browse/IOBP-98)] Add barcode scan result feedback ([#4840](https://github.com/pagopa/io-app/issues/4840)) ([36ed148](https://github.com/pagopa/io-app/commit/36ed1481c817297b5f2fb9832ad2b8bc5a0fcbee))


### Chores

* [[IOAPPFD0-125](https://pagopa.atlassian.net/browse/IOAPPFD0-125)] Fix `Divider` rendering issue on Android devices ([#4768](https://github.com/pagopa/io-app/issues/4768)) ([70618c3](https://github.com/pagopa/io-app/commit/70618c3b4c3453edfafcd8c595f71fcfb1378642))
* [[IOBP-130](https://pagopa.atlassian.net/browse/IOBP-130)] A11y for transactions with negative amount ([#4839](https://github.com/pagopa/io-app/issues/4839)) ([650d914](https://github.com/pagopa/io-app/commit/650d914870bc8cbba0cbf45e3fdc2fb528be19d2))
* [[IOBP-141](https://pagopa.atlassian.net/browse/IOBP-141)] Fix CGN_MERCHANT_DETAILS scrollView padding ([#4831](https://github.com/pagopa/io-app/issues/4831)) ([2582b97](https://github.com/pagopa/io-app/commit/2582b970fc6f10ed3977cb4438cfb4fcef89575b))
* [[IOBP-144](https://pagopa.atlassian.net/browse/IOBP-144)] Add new `TabNavigation` component ([#4828](https://github.com/pagopa/io-app/issues/4828)) ([d001fb4](https://github.com/pagopa/io-app/commit/d001fb46ca2618aec5d11859330cda6792370e7d))
* [[IOBP-97](https://pagopa.atlassian.net/browse/IOBP-97)] Add `TabNavigation` component to barcode scan screen ([#4841](https://github.com/pagopa/io-app/issues/4841)) ([0c6fc07](https://github.com/pagopa/io-app/commit/0c6fc07c3be215445e1b47a0eac74af0724c5a0d))
* Add fast login deploy flow ([d3615d7](https://github.com/pagopa/io-app/commit/d3615d787d1f5493311dcea21567c870051ea6e8))
* cange tag regexp ([7cf10f4](https://github.com/pagopa/io-app/commit/7cf10f4543be9b58b33ade1c2208edaba3e42aff))
* Enable fast login local FF ([16be83a](https://github.com/pagopa/io-app/commit/16be83a193015b770ee3bcf88e613abbed1b8216))

## [2.39.0-rc.4](https://github.com/pagopa/io-app/compare/2.39.0-rc.3...2.39.0-rc.4) (2023-07-26)


### Features

* [[IOCOM-375](https://pagopa.atlassian.net/browse/IOCOM-375)] Add `android.permission.POST_NOTIFICATIONS` permission ([#4807](https://github.com/pagopa/io-app/issues/4807)) ([1bdd571](https://github.com/pagopa/io-app/commit/1bdd571d62dd41f65f0e74f359cc1c4390289868))
* [[IOCOM-377](https://pagopa.atlassian.net/browse/IOCOM-377)] Asking notification permission on Android 13 and higher ([#4825](https://github.com/pagopa/io-app/issues/4825)) ([54cbce5](https://github.com/pagopa/io-app/commit/54cbce5157d7284c75266f2fb17d17432f2dfcec))
* [[IOCOM-378](https://pagopa.atlassian.net/browse/IOCOM-378)] Update of the instruction list in the `OnboardingNotificationsInfoScreenConsent` ([#4832](https://github.com/pagopa/io-app/issues/4832)) ([d5c457f](https://github.com/pagopa/io-app/commit/d5c457f0e52aae194bc8e36027ab11f19a13eb00))


### Bug Fixes

* [[IOPID-498](https://pagopa.atlassian.net/browse/IOPID-498)] Added function to set language on startup ([#4823](https://github.com/pagopa/io-app/issues/4823)) ([22351b4](https://github.com/pagopa/io-app/commit/22351b426ddcef76ae8394b3f37dfb1a8184abc7))


### Chores

* [[IOAPPFD0-127](https://pagopa.atlassian.net/browse/IOAPPFD0-127)] Add new toast notification component ([#4791](https://github.com/pagopa/io-app/issues/4791)) ([b225bf2](https://github.com/pagopa/io-app/commit/b225bf2daf404a4524ddc5fc284bfc1abf069a2f))
* [[IOBP-140](https://pagopa.atlassian.net/browse/IOBP-140)] Fix fruition and onboarding status dates in IDPay initiative details screen ([#4800](https://github.com/pagopa/io-app/issues/4800)) ([df23045](https://github.com/pagopa/io-app/commit/df23045cce52fe59891049e4b890a9f3baf56b72))
* [[IOBP-142](https://pagopa.atlassian.net/browse/IOBP-142)] Removal of NativeBase in InitiativeSettings ([#4827](https://github.com/pagopa/io-app/issues/4827)) ([2fccb55](https://github.com/pagopa/io-app/commit/2fccb55395abfd3cacf7e81862e6c1378cd7eb31))
* [[IOBP-143](https://pagopa.atlassian.net/browse/IOBP-143)] Add new `TabItem` component ([#4822](https://github.com/pagopa/io-app/issues/4822)) ([a8f7008](https://github.com/pagopa/io-app/commit/a8f7008662ce0263283487b96e293e579b8bdbbc))
* Fix react-native-vision-camera ([#4833](https://github.com/pagopa/io-app/issues/4833)) ([85bc6dc](https://github.com/pagopa/io-app/commit/85bc6dc103223fd7c863c6c77148a4df607e3fd4))
* **deps:** bump aiohttp from 3.8.4 to 3.8.5 in /scripts/check_urls ([#4824](https://github.com/pagopa/io-app/issues/4824)) ([fa136e5](https://github.com/pagopa/io-app/commit/fa136e57e5127229b27e315e9a6f1fd0b3067dba))
* **deps:** bump word-wrap from 1.2.3 to 1.2.5 ([#4830](https://github.com/pagopa/io-app/issues/4830)) ([a8b33cc](https://github.com/pagopa/io-app/commit/a8b33cc7be6385d81a02eae71751007c9c3177a7)), closes [jonschlinkert/word-wrap#24](https://github.com/jonschlinkert/word-wrap/issues/24) [jonschlinkert/word-wrap#41](https://github.com/jonschlinkert/word-wrap/issues/41) [jonschlinkert/word-wrap#33](https://github.com/jonschlinkert/word-wrap/issues/33) [jonschlinkert/word-wrap#42](https://github.com/jonschlinkert/word-wrap/issues/42) [jonschlinkert/word-wrap#24](https://github.com/jonschlinkert/word-wrap/issues/24) [jonschlinkert/word-wrap#41](https://github.com/jonschlinkert/word-wrap/issues/41) [jonschlinkert/word-wrap#33](https://github.com/jonschlinkert/word-wrap/issues/33) [#42](https://github.com/pagopa/io-app/issues/42) [#41](https://github.com/pagopa/io-app/issues/41)
* [[IOPID-517](https://pagopa.atlassian.net/browse/IOPID-517)] Fix what's new persistence ([#4829](https://github.com/pagopa/io-app/issues/4829)) ([d67b37f](https://github.com/pagopa/io-app/commit/d67b37f4ad5748cf46d47bfc511ae76da36475d6))

## [2.39.0-rc.3](https://github.com/pagopa/io-app/compare/2.39.0-rc.2...2.39.0-rc.3) (2023-07-21)


### Features

* [[IOBP-137](https://pagopa.atlassian.net/browse/IOBP-137)] Add barcode scan camera marker animation ([#4798](https://github.com/pagopa/io-app/issues/4798)) ([b915224](https://github.com/pagopa/io-app/commit/b9152244ba96f1e26220f903ba4ad226caada309))
* [[IOCOM-383](https://pagopa.atlassian.net/browse/IOCOM-383)] Add system icons ([#4803](https://github.com/pagopa/io-app/issues/4803)) ([48ec8fe](https://github.com/pagopa/io-app/commit/48ec8fe98131bc8bac7d2433f5eeb27e2d249194))
* [[IOPID-442](https://pagopa.atlassian.net/browse/IOPID-442),[IOPID-443](https://pagopa.atlassian.net/browse/IOPID-443),[IOPID-481](https://pagopa.atlassian.net/browse/IOPID-481),[IOPID-482](https://pagopa.atlassian.net/browse/IOPID-482),[IOPID-483](https://pagopa.atlassian.net/browse/IOPID-483),[IOPID-484](https://pagopa.atlassian.net/browse/IOPID-484)] FL follow up ([#4799](https://github.com/pagopa/io-app/issues/4799)) ([f6b7056](https://github.com/pagopa/io-app/commit/f6b7056fb81bcf66ff764cdfe69a3e64e02ca198))
* [[IOPLT-46](https://pagopa.atlassian.net/browse/IOPLT-46)] Sets Android target sdk to 33 ([#4780](https://github.com/pagopa/io-app/issues/4780)) ([86438b2](https://github.com/pagopa/io-app/commit/86438b2b823847bc36c88bdb6645b81faad48236))


### Bug Fixes

* [[IOBP-134](https://pagopa.atlassian.net/browse/IOBP-134)] Add navigation to initiative details after IDPay transaction authorization ([#4793](https://github.com/pagopa/io-app/issues/4793)) ([2d0e773](https://github.com/pagopa/io-app/commit/2d0e77331a43f827315dddd2cda1867497e36c6c)), closes [1#diff-130a75c56f991ea3cc1e3857a98c902845fe2d9f1cc7fc10b17e98fd24769557](https://github.com/pagopa/1/issues/diff-130a75c56f991ea3cc1e3857a98c902845fe2d9f1cc7fc10b17e98fd24769557)
* [[IOBP-145](https://pagopa.atlassian.net/browse/IOBP-145)] Fix navigation after IDPay transaction authorization ([#4826](https://github.com/pagopa/io-app/issues/4826)) ([cd612ab](https://github.com/pagopa/io-app/commit/cd612aba67b00a60138d6a1a0a4601866957545c))
* [[IOPID-515](https://pagopa.atlassian.net/browse/IOPID-515)] Mixpanel opt-in not saved on slow devices ([#4812](https://github.com/pagopa/io-app/issues/4812)) ([7abccb1](https://github.com/pagopa/io-app/commit/7abccb1a4d8afc8179f22d433c72919c4ccec4bd))


### Chores

* [[IOAPPFD0-128](https://pagopa.atlassian.net/browse/IOAPPFD0-128)] Add `action` prop to the `SwitchListItem` ([#4801](https://github.com/pagopa/io-app/issues/4801)) ([155477c](https://github.com/pagopa/io-app/commit/155477c2cf6ee7ab2b89d49edff1e406df9ab69f))
* [[IOAPPFD0-129](https://pagopa.atlassian.net/browse/IOAPPFD0-129)] Remove extra space from `ListItem…` components ([#4809](https://github.com/pagopa/io-app/issues/4809)) ([8e6841b](https://github.com/pagopa/io-app/commit/8e6841b802000da131653349fb5844c3a950184d))
* [[IOBP-136](https://pagopa.atlassian.net/browse/IOBP-136)] Implementation of new lIst item in wallet transactions ([#4802](https://github.com/pagopa/io-app/issues/4802)) ([60ace46](https://github.com/pagopa/io-app/commit/60ace46b26f095d271a8985945890a9577587d17))
* [[IOBP-138](https://pagopa.atlassian.net/browse/IOBP-138)] Replace legacy bottom sheets ([#4808](https://github.com/pagopa/io-app/issues/4808)) ([d6cf12a](https://github.com/pagopa/io-app/commit/d6cf12a453fbbc3317aad9ab8fa9fc684a1dba11))
* [[IOPID-499](https://pagopa.atlassian.net/browse/IOPID-499)]  Change the keyId format in the Lollipop Playground to be compliant with the new spec ([#4806](https://github.com/pagopa/io-app/issues/4806)) ([860c919](https://github.com/pagopa/io-app/commit/860c9192f2161a0452b2d3c7df5eb7a86efff8bc))
* [[PE-442](https://pagopa.atlassian.net/browse/PE-442)] Change CGN details text labels ([#4814](https://github.com/pagopa/io-app/issues/4814)) ([61cee63](https://github.com/pagopa/io-app/commit/61cee63eff386f97459cdf9f1839338c8deafcdb))
* Add bundleInDebug gradle parameter ([#4804](https://github.com/pagopa/io-app/issues/4804)) ([8f53044](https://github.com/pagopa/io-app/commit/8f53044601a9eff5600c97fbd2825345971d54ab))

## [2.39.0-rc.2](https://github.com/pagopa/io-app/compare/2.39.0-rc.1...2.39.0-rc.2) (2023-07-18)


### Features

* [[IOBP-119](https://pagopa.atlassian.net/browse/IOBP-119)] Add global barcode scan screen ([#4767](https://github.com/pagopa/io-app/issues/4767)) ([201d8b7](https://github.com/pagopa/io-app/commit/201d8b7341c0c5ee4555a6c2753338642d4cd3b4))
* [[IOBP-120](https://pagopa.atlassian.net/browse/IOBP-120)] Add pagoPA notice decoding to global barcode scan screen ([#4769](https://github.com/pagopa/io-app/issues/4769)) ([fbd644f](https://github.com/pagopa/io-app/commit/fbd644f873854a1e467f8c3148adc55534606488))
* [[IOCOM-270](https://pagopa.atlassian.net/browse/IOCOM-270)] FIMS cookie clearing when leaving the FIMS webview ([#4757](https://github.com/pagopa/io-app/issues/4757)) ([50a6342](https://github.com/pagopa/io-app/commit/50a63422b4498b170c012ac76da2916a59b96300))
* [[IOCOM-363](https://pagopa.atlassian.net/browse/IOCOM-363)] Add Mixpanel PN events ([#4789](https://github.com/pagopa/io-app/issues/4789)) ([d559242](https://github.com/pagopa/io-app/commit/d559242a423f621ae7c78eb8abb150e1b484c2be))


### Bug Fixes

* [[IOCOM-358](https://pagopa.atlassian.net/browse/IOCOM-358)] IOS button label changed to 'Open or Share' on PDF preview ([#4797](https://github.com/pagopa/io-app/issues/4797)) ([eb7c603](https://github.com/pagopa/io-app/commit/eb7c603a5c8be78b3b132cb48133f8958627628d))
* [[IOPID-473](https://pagopa.atlassian.net/browse/IOPID-473)] Fix CTA position in the `FingerprintScreen` component ([#4794](https://github.com/pagopa/io-app/issues/4794)) ([b5c9557](https://github.com/pagopa/io-app/commit/b5c9557305c3ee2999ffc0f6b313d0d3804e582f))
* [[IOPID-485](https://pagopa.atlassian.net/browse/IOPID-485)] Fix nested `ScrollView` error in the `IdpSelectionScreen` ([#4796](https://github.com/pagopa/io-app/issues/4796)) ([49ec298](https://github.com/pagopa/io-app/commit/49ec298cebf7e9d4f2cacf2bd84978a40f0f7a75))
* `useLegacyIOBottomSheetModal` bottom padding regression ([#4792](https://github.com/pagopa/io-app/issues/4792)) ([6b7faff](https://github.com/pagopa/io-app/commit/6b7faffd1dd9361c947620f283dc85347ee5b9b5))


### Chores

* [[IOBP-111](https://pagopa.atlassian.net/browse/IOBP-111),[IOBP-116](https://pagopa.atlassian.net/browse/IOBP-116)] Addition of LogoPaymentHuge and usage in new Cards components ([#4781](https://github.com/pagopa/io-app/issues/4781)) ([f06fa73](https://github.com/pagopa/io-app/commit/f06fa73654ff843fc78dea0ce5abf83fcf86df65))
* **deps:** bump semver from 5.7.1 to 5.7.2 ([#4761](https://github.com/pagopa/io-app/issues/4761)) ([0f19842](https://github.com/pagopa/io-app/commit/0f19842419555d43725a16831a4cf71242847e93))
* [[IOBP-110](https://pagopa.atlassian.net/browse/IOBP-110),[IOBP-114](https://pagopa.atlassian.net/browse/IOBP-114)] New wallet payment methods cards ([#4759](https://github.com/pagopa/io-app/issues/4759)) ([b6a33fe](https://github.com/pagopa/io-app/commit/b6a33fe89705f78b65cd45d39403694a7aa1937c))
* [[IOPID-417](https://pagopa.atlassian.net/browse/IOPID-417)] Enable FL production FF" ([#4788](https://github.com/pagopa/io-app/issues/4788)) ([c78b072](https://github.com/pagopa/io-app/commit/c78b0725ec69cdc356b7d5b9d91f35056e7d0f09)), closes [pagopa/io-app#4785](https://github.com/pagopa/io-app/issues/4785)

## [2.39.0-rc.1](https://github.com/pagopa/io-app/compare/2.39.0-rc.0...2.39.0-rc.1) (2023-07-14)


### Bug Fixes

* [[IOBP-127](https://pagopa.atlassian.net/browse/IOBP-127)] Add swipe back gesture navigation in transaction code input screen ([#4787](https://github.com/pagopa/io-app/issues/4787)) ([69d50c3](https://github.com/pagopa/io-app/commit/69d50c374db50b73c799859c5348320eb3390cab)), closes [/github.com/pagopa/io-app/pull/4787/files#diff-db3bd7a286b3c1c1c1d256147d82387d23b714bafaba4d9ceba25a685bd2c27](https://github.com/pagopa//github.com/pagopa/io-app/pull/4787/files/issues/diff-db3bd7a286b3c1c1c1d256147d82387d23b714bafaba4d9ceba25a685bd2c27)
* [[IOBP-128](https://pagopa.atlassian.net/browse/IOBP-128)] Fix bottom sheet padding regression ([#4784](https://github.com/pagopa/io-app/issues/4784)) ([ec10a12](https://github.com/pagopa/io-app/commit/ec10a12229b7e5217bc1240230afe445414d9f4f))


### Chores

* [[IOBP-123](https://pagopa.atlassian.net/browse/IOBP-123)] New list item transaction into IDPay timeline ([#4778](https://github.com/pagopa/io-app/issues/4778)) ([36ee59f](https://github.com/pagopa/io-app/commit/36ee59f0212ce87e240ba9b2cea4327fa3d08d64))
* [[IOPID-417](https://pagopa.atlassian.net/browse/IOPID-417)] Enable FL production FF ([#4785](https://github.com/pagopa/io-app/issues/4785)) ([9b756b9](https://github.com/pagopa/io-app/commit/9b756b94faab419e59b32b97f6d26be0eb5de301))

## [2.39.0-rc.0](https://github.com/pagopa/io-app/compare/2.38.0-rc.1...2.39.0-rc.0) (2023-07-13)


### Features

* [[IOBP-72](https://pagopa.atlassian.net/browse/IOBP-72)] Add QRCode read from file ([#4732](https://github.com/pagopa/io-app/issues/4732)) ([5811bb9](https://github.com/pagopa/io-app/commit/5811bb92decfc8881bcaf0ae70e0f78da09bd263))
* [[IOPID-284](https://pagopa.atlassian.net/browse/IOPID-284)] First Fast Login old user + What's new ([#4774](https://github.com/pagopa/io-app/issues/4774)) ([3a51dab](https://github.com/pagopa/io-app/commit/3a51dab720f745d82265a4021f93527095f61a04))
* [[IOPID-285](https://pagopa.atlassian.net/browse/IOPID-285)] First (Fast) login - new user ([#4730](https://github.com/pagopa/io-app/issues/4730)) ([2da92a4](https://github.com/pagopa/io-app/commit/2da92a4423a9853f8a8f93c91d8e2a7593097323))
* [[IOPID-316](https://pagopa.atlassian.net/browse/IOPID-316)] FL Refinement ([#4731](https://github.com/pagopa/io-app/issues/4731)) ([18c2ce6](https://github.com/pagopa/io-app/commit/18c2ce6d6a1b147436308c96b34e7a160ae6df8d))


### Bug Fixes

* [[IOBP-126](https://pagopa.atlassian.net/browse/IOBP-126)] Rename AUTHORIZED transaction status ([#4782](https://github.com/pagopa/io-app/issues/4782)) ([28e9516](https://github.com/pagopa/io-app/commit/28e95165fbb937b8d84d3ff5f503e9d1a4f2f389))
* [[IOPID-422](https://pagopa.atlassian.net/browse/IOPID-422),[IOPID-435](https://pagopa.atlassian.net/browse/IOPID-435)] First onboarding bug/FastLogin what's new ([#4779](https://github.com/pagopa/io-app/issues/4779)) ([9482c0b](https://github.com/pagopa/io-app/commit/9482c0bae7b6030f2f8c29901b5533821562af74))
* **Firma con IO:** [[SFEQS-1881](https://pagopa.atlassian.net/browse/SFEQS-1881)] Enable annotations for QTSP ToS documents ([#4765](https://github.com/pagopa/io-app/issues/4765)) ([5c50f24](https://github.com/pagopa/io-app/commit/5c50f2476040b1e60c5d85326cc1cfc3accbcfdd))
* [[IOBP-117](https://pagopa.atlassian.net/browse/IOBP-117)] Remove "in progress" state handling for AUTHORIZED transactions ([#4762](https://github.com/pagopa/io-app/issues/4762)) ([7d5d394](https://github.com/pagopa/io-app/commit/7d5d39488b78d8879d0e7386abef87120434caf1))


### Chores

* [[IOAPPFD0-120](https://pagopa.atlassian.net/browse/IOAPPFD0-120)] Add the new `HeaderFirstLevel` component ([#4728](https://github.com/pagopa/io-app/issues/4728)) ([14e4af3](https://github.com/pagopa/io-app/commit/14e4af3430d07c33d0abbb5fd885d590e2138436))
* [[IOAPPFD0-122](https://pagopa.atlassian.net/browse/IOAPPFD0-122)] Remove legacy icons from the main header ([#4748](https://github.com/pagopa/io-app/issues/4748)) ([64db459](https://github.com/pagopa/io-app/commit/64db45902d052df1d1d6162263863191e63bc799))
* [[IOAPPFD0-124](https://pagopa.atlassian.net/browse/IOAPPFD0-124)] Add fullscreen modal presentation screen ([#4756](https://github.com/pagopa/io-app/issues/4756)) ([c095800](https://github.com/pagopa/io-app/commit/c095800483607e92fe81c4fe753511f4b368e19a))
* [[IOBP-121](https://pagopa.atlassian.net/browse/IOBP-121)] CGN Card bottom white border glitch ([#4766](https://github.com/pagopa/io-app/issues/4766)) ([0b80e86](https://github.com/pagopa/io-app/commit/0b80e86cb379a803f0d5f33102a127ae60d9c009))
* [[IOBP-122](https://pagopa.atlassian.net/browse/IOBP-122)] Available initiatives label alignment  ([#4770](https://github.com/pagopa/io-app/issues/4770)) ([9075b91](https://github.com/pagopa/io-app/commit/9075b9131508dedd1a414628cd28144d64b1814e))
* [[IOBP-125](https://pagopa.atlassian.net/browse/IOBP-125)] `ListItemTransaction` refinements ([#4776](https://github.com/pagopa/io-app/issues/4776)) ([5c149e7](https://github.com/pagopa/io-app/commit/5c149e77a44ce401af9a9116737e262990f9467b))
* [[IOBP-99](https://pagopa.atlassian.net/browse/IOBP-99)] Cashback entry point removal ([#4729](https://github.com/pagopa/io-app/issues/4729)) ([4dee0f3](https://github.com/pagopa/io-app/commit/4dee0f371285d47c8736d05a1f14d7add296a5c0))
* [[IOPID-417](https://pagopa.atlassian.net/browse/IOPID-417)] Disable getNonce in production (not yet implemented) ([#4763](https://github.com/pagopa/io-app/issues/4763)) ([71f51c1](https://github.com/pagopa/io-app/commit/71f51c1f856073b009173b2ec8d4d4bca447e3f7))

## [2.38.0-rc.1](https://github.com/pagopa/io-app/compare/2.38.0-rc.0...2.38.0-rc.1) (2023-07-08)


### Bug Fixes

* [[IOPID-389](https://pagopa.atlassian.net/browse/IOPID-389)] Clear session cookies at CIE login start on Android ([#4755](https://github.com/pagopa/io-app/issues/4755)) ([893c773](https://github.com/pagopa/io-app/commit/893c773931fb7b3abc0f0e93b0c1745f3d6cf92f))

## [2.38.0-rc.0](https://github.com/pagopa/io-app/compare/2.37.0-rc.1...2.38.0-rc.0) (2023-07-07)


### Features

* [[IOCOM-345](https://pagopa.atlassian.net/browse/IOCOM-345)] Updated header for FIMS screen ([#4742](https://github.com/pagopa/io-app/issues/4742)) ([389f45a](https://github.com/pagopa/io-app/commit/389f45a785fefb32c44728f8fd25b1bf4264fd8a)), closes [/github.com/pagopa/io-dev-api-server/blob/e3ac6784acecbb5ad80a44dfc7777f80946dcab5/src/payloads/backend.ts#L45](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/e3ac6784acecbb5ad80a44dfc7777f80946dcab5/src/payloads/backend.ts/issues/L45)
* [[IOCOM-346](https://pagopa.atlassian.net/browse/IOCOM-346)] Handling of setTitle event emitted by the FIMS WebView ([#4744](https://github.com/pagopa/io-app/issues/4744)) ([09f8aa6](https://github.com/pagopa/io-app/commit/09f8aa66a14e53cda45f180a2f435874cd8bafd2))
* [[IOCOM-347](https://pagopa.atlassian.net/browse/IOCOM-347)] Handling of events emitted by the FIMS WebView ([#4749](https://github.com/pagopa/io-app/issues/4749)) ([26e575b](https://github.com/pagopa/io-app/commit/26e575b5bc1d3effab554d7803731a3db9ccef9f))


### Bug Fixes

* [[IOPID-388](https://pagopa.atlassian.net/browse/IOPID-388)] Shared data security info URL is broken ([#4754](https://github.com/pagopa/io-app/issues/4754)) ([2800106](https://github.com/pagopa/io-app/commit/2800106f472173b5ddc3228c2b7563bd2c485ef0))


### Chores

* [[IOAPPFD0-123](https://pagopa.atlassian.net/browse/IOAPPFD0-123)] Update payment logos ([#4751](https://github.com/pagopa/io-app/issues/4751)) ([d484bb9](https://github.com/pagopa/io-app/commit/d484bb963d797eb2c2253dbbbbbbcaf33f4cd9d8))
* [[IOBP-101](https://pagopa.atlassian.net/browse/IOBP-101)] Remove co-badge cards entry points ([#4743](https://github.com/pagopa/io-app/issues/4743)) ([0a53027](https://github.com/pagopa/io-app/commit/0a53027060e67d836d7c3bc1bed720fb149459d8))
* [[IOBP-106](https://pagopa.atlassian.net/browse/IOBP-106)] Add business name in IDPay transaction item ([#4752](https://github.com/pagopa/io-app/issues/4752)) ([aafb650](https://github.com/pagopa/io-app/commit/aafb65078b191ef0bd7c597a57959dedba18661c))

## [2.37.0-rc.1](https://github.com/pagopa/io-app/compare/2.37.0-rc.0...2.37.0-rc.1) (2023-07-05)


### Bug Fixes

* [[IOPID-377](https://pagopa.atlassian.net/browse/IOPID-377)] iOS crash while reading CIE with NFC ([#4746](https://github.com/pagopa/io-app/issues/4746)) ([a843ac4](https://github.com/pagopa/io-app/commit/a843ac43bf6e4622790a5e90e39a6483e04da5a5))

## [2.37.0-rc.0](https://github.com/pagopa/io-app/compare/2.36.0-rc.2...2.37.0-rc.0) (2023-07-04)


### Features

* [[IOPID-287](https://pagopa.atlassian.net/browse/IOPID-287)] Add fast login server specs ([#4713](https://github.com/pagopa/io-app/issues/4713)) ([9f76ca9](https://github.com/pagopa/io-app/commit/9f76ca96907206756997ed4842eb2c5e83c6096b))


### Bug Fixes

* [[IOAPPFD0-119](https://pagopa.atlassian.net/browse/IOAPPFD0-119)] Turn off the dark mode, except in the Design System section ([#4723](https://github.com/pagopa/io-app/issues/4723)) ([ca6e870](https://github.com/pagopa/io-app/commit/ca6e870db790a5b6e1f97a0f36480fd0a3ec826c))
* [[IOBP-59](https://pagopa.atlassian.net/browse/IOBP-59)] Update discount-type beneficiary details page  ([#4719](https://github.com/pagopa/io-app/issues/4719)) ([37de56c](https://github.com/pagopa/io-app/commit/37de56cf52862150e3f48d482b5f495cec3aeb57))


### Chores

* [[IOAPPFD0-110](https://pagopa.atlassian.net/browse/IOAPPFD0-110)] Add the new `NativeSwitch` and relative `SwitchListItem` components ([#4672](https://github.com/pagopa/io-app/issues/4672)) ([0ec2537](https://github.com/pagopa/io-app/commit/0ec25371f1c2635101570716f515e48a0c24a948))
* [[IOAPPFD0-112](https://pagopa.atlassian.net/browse/IOAPPFD0-112)] Fix `Banner` spacing of the smaller size ([#4716](https://github.com/pagopa/io-app/issues/4716)) ([9d8664f](https://github.com/pagopa/io-app/commit/9d8664fb2cff82cd964b208a9041a87e463aff32))
* [[IOAPPFD0-114](https://pagopa.atlassian.net/browse/IOAPPFD0-114)] Add screen archetypes for testing purposes ([#4683](https://github.com/pagopa/io-app/issues/4683)) ([8f64f2f](https://github.com/pagopa/io-app/commit/8f64f2f53f4b4916cfdefd8d4566be0dde33843c))
* [[IOAPPFD0-116](https://pagopa.atlassian.net/browse/IOAPPFD0-116)] Add the new `Tag` component ([#4693](https://github.com/pagopa/io-app/issues/4693)) ([3cdcaf4](https://github.com/pagopa/io-app/commit/3cdcaf4f3759d6c6ac71edaf3c0cb9c77d9af90e))
* [[IOAPPFD0-117](https://pagopa.atlassian.net/browse/IOAPPFD0-117)] Add the new `Badge` component ([#4715](https://github.com/pagopa/io-app/issues/4715)) ([02c2672](https://github.com/pagopa/io-app/commit/02c26726ecf602728bd4cd71fd57c927446df77a))
* [[IOAPPFD0-118](https://pagopa.atlassian.net/browse/IOAPPFD0-118)] Add the new `ListItemIDP` component ([#4725](https://github.com/pagopa/io-app/issues/4725)) ([5db614a](https://github.com/pagopa/io-app/commit/5db614a91e5f6c5d27110eaeddf00cddbdb613a5))
* [[IOAPPFD0-121](https://pagopa.atlassian.net/browse/IOAPPFD0-121)] Add new `AppVersion` component ([#4740](https://github.com/pagopa/io-app/issues/4740)) ([e2a2d79](https://github.com/pagopa/io-app/commit/e2a2d796210e05eb99c45c3f84a00dc322d1ff53))
* [[IOBP-73](https://pagopa.atlassian.net/browse/IOBP-73)] Addition of payment survey banner ([#4698](https://github.com/pagopa/io-app/issues/4698)) ([39fd9bb](https://github.com/pagopa/io-app/commit/39fd9bbceb4809c1cdf2c3a68661c603c0507a90))
* [[IOBP-74](https://pagopa.atlassian.net/browse/IOBP-74)] Transaction list item redesign ([#4710](https://github.com/pagopa/io-app/issues/4710)) ([d19b41a](https://github.com/pagopa/io-app/commit/d19b41a85ad212243536d3a7f7c0ccde2d7d181d))
* [[IOBP-77](https://pagopa.atlassian.net/browse/IOBP-77)] Remove entry point of PagoBANCOMAT flow ([#4737](https://github.com/pagopa/io-app/issues/4737)) ([9e1e8ad](https://github.com/pagopa/io-app/commit/9e1e8adfde24d3ff04be9e77e7692ae7c742492d))
* [[IOBP-96](https://pagopa.atlassian.net/browse/IOBP-96)] Add deep-link handling workaround in QRCode scan screen ([#4718](https://github.com/pagopa/io-app/issues/4718)) ([a3ec636](https://github.com/pagopa/io-app/commit/a3ec636669e6568b3fac5a557b6c9789fe192680))
* [[IOPID-359](https://pagopa.atlassian.net/browse/IOPID-359)] First onboarding refactor ([#4720](https://github.com/pagopa/io-app/issues/4720)) ([776a0b9](https://github.com/pagopa/io-app/commit/776a0b94ea9736c129803890704217de8404c311))

## [2.36.0-rc.2](https://github.com/pagopa/io-app/compare/2.36.0-rc.1...2.36.0-rc.2) (2023-06-27)


### Features

* [[IOBP-76](https://pagopa.atlassian.net/browse/IOBP-76)] Add IDPay transaction cancellation ([#4696](https://github.com/pagopa/io-app/issues/4696)) ([6051da0](https://github.com/pagopa/io-app/commit/6051da0be847c1518795f3597a33ee3ad920d6d5)), closes [/github.com/pagopa/io-app/pull/4696/files#diff-13523f24396fea11f6aa4e54f4550223619cc436304b69e0de32772019e1089](https://github.com/pagopa//github.com/pagopa/io-app/pull/4696/files/issues/diff-13523f24396fea11f6aa4e54f4550223619cc436304b69e0de32772019e1089) [/github.com/pagopa/io-app/pull/4696/files#diff-13a0efdb2dfe2a5ba04e61cae49a65059b02ec0790ea78f640cbd80b601d5580](https://github.com/pagopa//github.com/pagopa/io-app/pull/4696/files/issues/diff-13a0efdb2dfe2a5ba04e61cae49a65059b02ec0790ea78f640cbd80b601d5580)
* [[IOBP-9](https://pagopa.atlassian.net/browse/IOBP-9)] Add IDPay transaction QRCode scan screen ([#4681](https://github.com/pagopa/io-app/issues/4681)) ([02280ca](https://github.com/pagopa/io-app/commit/02280ca0195d1fb8f2d2b775788eea87479358c0))
* [[IOCOM-328](https://pagopa.atlassian.net/browse/IOCOM-328)] FIMS handling of iosso:// protocol ([#4700](https://github.com/pagopa/io-app/issues/4700)) ([ecbf852](https://github.com/pagopa/io-app/commit/ecbf8526914603cc96134ab7359319aa7fb76e95))
* [[IOCOM-329](https://pagopa.atlassian.net/browse/IOCOM-329)] FIMS cookie ([#4701](https://github.com/pagopa/io-app/issues/4701)) ([c128461](https://github.com/pagopa/io-app/commit/c128461993c998152ce5bf0b9430f3bd57491cee))
* [[IOCOM-330](https://pagopa.atlassian.net/browse/IOCOM-330)] Enable FIMS in production ([#4702](https://github.com/pagopa/io-app/issues/4702)) ([5e57fb0](https://github.com/pagopa/io-app/commit/5e57fb0ab629a75d4bd685ebfd102df177b996e5))
* [[IOPID-317](https://pagopa.atlassian.net/browse/IOPID-317)] Fast login user interaction ([#4679](https://github.com/pagopa/io-app/issues/4679)) ([5cc274d](https://github.com/pagopa/io-app/commit/5cc274df09cd5e15989c181cdba3633c9f273c4a))
* **Firma con IO:** [[SFEQS-1684](https://pagopa.atlassian.net/browse/SFEQS-1684)] Add cancelled FCI request screen ([#4663](https://github.com/pagopa/io-app/issues/4663)) ([fd6c39f](https://github.com/pagopa/io-app/commit/fd6c39f030f97c62f828c43d66852cb2283911bc))


### Bug Fixes

* [[IOAPPFD0-115](https://pagopa.atlassian.net/browse/IOAPPFD0-115)] Fix UI regression of `IOBadge` in payment capability screen ([#4684](https://github.com/pagopa/io-app/issues/4684)) ([c333e95](https://github.com/pagopa/io-app/commit/c333e950294e9c17b2da19fbebc53b76cd6d0b76))
* [[IOCOM-326](https://pagopa.atlassian.net/browse/IOCOM-326)] PN copy changes ([#4709](https://github.com/pagopa/io-app/issues/4709)) ([d6635a3](https://github.com/pagopa/io-app/commit/d6635a390e3a0e618f5e70dcaefd955d88b9410f))
* fix failing CGN E2E tests ([#4673](https://github.com/pagopa/io-app/issues/4673)) ([9d51d00](https://github.com/pagopa/io-app/commit/9d51d008330ee6eaafe6a39d4d8f3dc58143ab45))


### Chores

* [[IOBP-92](https://pagopa.atlassian.net/browse/IOBP-92)] Update IDPay API specifications ([#4707](https://github.com/pagopa/io-app/issues/4707)) ([a7c6f1d](https://github.com/pagopa/io-app/commit/a7c6f1d5eac4725b243ddccc2236190a9b3dab09))

## [2.36.0-rc.1](https://github.com/pagopa/io-app/compare/2.36.0-rc.0...2.36.0-rc.1) (2023-06-22)


### Features

* [[IOPID-315](https://pagopa.atlassian.net/browse/IOPID-315)] LV at startup ([#4694](https://github.com/pagopa/io-app/issues/4694)) ([04aca14](https://github.com/pagopa/io-app/commit/04aca142092fc5ae89b6cb3e6489fc7ab5296fe2))


### Bug Fixes

* [[IOBP-58](https://pagopa.atlassian.net/browse/IOBP-58)] Fix onboarding failure screen ([#4697](https://github.com/pagopa/io-app/issues/4697)) ([7e4bdb7](https://github.com/pagopa/io-app/commit/7e4bdb7d15d7de7d23a1f1ec920657cd0abb601c))


### Chores

* [[IOBP-68](https://pagopa.atlassian.net/browse/IOBP-68)] IDPay transaction authorization failure screen ([#4695](https://github.com/pagopa/io-app/issues/4695)) ([f5f0e78](https://github.com/pagopa/io-app/commit/f5f0e7875cd07deb43e397bdac9eccf4f5b3b1f0))

## [2.36.0-rc.0](https://github.com/pagopa/io-app/compare/2.35.0-rc.1...2.36.0-rc.0) (2023-06-20)


### Features

* [[IOBP-6](https://pagopa.atlassian.net/browse/IOBP-6)] Addition of pre-error mapping IDPay post-auth screens ([#4682](https://github.com/pagopa/io-app/issues/4682)) ([34cba40](https://github.com/pagopa/io-app/commit/34cba408a45bbd80c32ed87971eb3d0f3ae47f86))
* [[IOBP-70](https://pagopa.atlassian.net/browse/IOBP-70)] Addition of idpay payment auth page ([#4680](https://github.com/pagopa/io-app/issues/4680)) ([fd30bc0](https://github.com/pagopa/io-app/commit/fd30bc0d09861a1f4223ba440e3d995387a4c40f))
* [[IOPID-311](https://pagopa.atlassian.net/browse/IOPID-311),[IOPID-312](https://pagopa.atlassian.net/browse/IOPID-312)] Pin policy ([#4688](https://github.com/pagopa/io-app/issues/4688)) ([17ef422](https://github.com/pagopa/io-app/commit/17ef422d66e25ba0e8624022fcd1292b25724f4c))
* [[PE-413](https://pagopa.atlassian.net/browse/PE-413)] Add icon button to copy EYCA card number and change of EYCA refs website ([#4689](https://github.com/pagopa/io-app/issues/4689)) ([5efce78](https://github.com/pagopa/io-app/commit/5efce786887549d8aab3ca45913a81114cb44fb3))


### Bug Fixes

* [[IOBP-84](https://pagopa.atlassian.net/browse/IOBP-84)] Fix visual glitches on Android devices ([#4686](https://github.com/pagopa/io-app/issues/4686)) ([e97f2cf](https://github.com/pagopa/io-app/commit/e97f2cff1793001ad6ae5514d65f324c612fad1a)), closes [/github.com/pagopa/io-app/pull/4686/files#diff-be49b25519dc58654607509a01e652550612d663b69e725bc1755cd3af893e3](https://github.com/pagopa//github.com/pagopa/io-app/pull/4686/files/issues/diff-be49b25519dc58654607509a01e652550612d663b69e725bc1755cd3af893e3) [/github.com/pagopa/io-app/pull/4686/files#diff-a572623e06de55ed1f5b04ac7f6652a612c500ca7fd00b72dd24e0a42eb1ed30](https://github.com/pagopa//github.com/pagopa/io-app/pull/4686/files/issues/diff-a572623e06de55ed1f5b04ac7f6652a612c500ca7fd00b72dd24e0a42eb1ed30) [/github.com/pagopa/io-app/pull/4686/files#diff-f7ee97294ece37f95074427629a1371d562c1362a66ce188ad0a7a7f5a4ecd37](https://github.com/pagopa//github.com/pagopa/io-app/pull/4686/files/issues/diff-f7ee97294ece37f95074427629a1371d562c1362a66ce188ad0a7a7f5a4ecd37) [/github.com/pagopa/io-app/pull/4686/files#diff-9563abc84afa7963c9e7003f0a06e705c88a054a17493935ab917e899dd9d135](https://github.com/pagopa//github.com/pagopa/io-app/pull/4686/files/issues/diff-9563abc84afa7963c9e7003f0a06e705c88a054a17493935ab917e899dd9d135)
* [[IOBP-87](https://pagopa.atlassian.net/browse/IOBP-87)] Fix IDPay transaction code format ([#4692](https://github.com/pagopa/io-app/issues/4692)) ([4ca792d](https://github.com/pagopa/io-app/commit/4ca792d9be4b8b73996bbea5e60bc314c5c7c33c))
* [[IOPLT-24](https://pagopa.atlassian.net/browse/IOPLT-24)] Fixes wrong behaviour on padding with a footer ([#4691](https://github.com/pagopa/io-app/issues/4691)) ([1e8c4f2](https://github.com/pagopa/io-app/commit/1e8c4f23ca767094d99e1d57d3c2fbd77c4d374e))
* **Firma con IO:** [[SFEQS-1258](https://pagopa.atlassian.net/browse/SFEQS-1258)] Disable PDF annotation  ([#4690](https://github.com/pagopa/io-app/issues/4690)) ([4651168](https://github.com/pagopa/io-app/commit/46511686758dbf48ceafe01fa5e99cab3861c5b4))


### Chores

* [[IOAPPFD0-104](https://pagopa.atlassian.net/browse/IOAPPFD0-104)] Add `RadioListItem` and `RadioGroup` components ([#4653](https://github.com/pagopa/io-app/issues/4653)) ([80a74ad](https://github.com/pagopa/io-app/commit/80a74adc4184e97047c8e58ab5617ec6c105d063))
* [[IOAPPFD0-105](https://pagopa.atlassian.net/browse/IOAPPFD0-105)] Add the new `focused` state icons to the main navbar ([#4657](https://github.com/pagopa/io-app/issues/4657)) ([6e4f0e7](https://github.com/pagopa/io-app/commit/6e4f0e714a6a0b253a2ec3ebb2d5cd7f20da86b8))
* [[IOAPPFD0-111](https://pagopa.atlassian.net/browse/IOAPPFD0-111)] Visual improvements to the bottom sheet ([#4676](https://github.com/pagopa/io-app/issues/4676)) ([0521d9e](https://github.com/pagopa/io-app/commit/0521d9eca4bf4f046a0a1588397b625341f0aae3))
* Removes changelog content prior to 2.0.0 version ([bd52614](https://github.com/pagopa/io-app/commit/bd52614db7ff73c9f2954529b719e985c76c30e2))

## [2.35.0-rc.1](https://github.com/pagopa/io-app/compare/2.35.0-rc.0...2.35.0-rc.1) (2023-06-13)


### Features

* [[IOBP-30](https://pagopa.atlassian.net/browse/IOBP-30)] Add manual code input for IDPay payment authorization ([#4664](https://github.com/pagopa/io-app/issues/4664)) ([f100bbb](https://github.com/pagopa/io-app/commit/f100bbb28fb0a939a7fee16376b69b894e240e35))
* [[IOBP-54](https://pagopa.atlassian.net/browse/IOBP-54),[IOBP-55](https://pagopa.atlassian.net/browse/IOBP-55)] Add discount-type transactions in timeline ([#4658](https://github.com/pagopa/io-app/issues/4658)) ([d5489f1](https://github.com/pagopa/io-app/commit/d5489f1d78809198371771dc1dd3a3282dadf516))
* [[IOBP-61](https://pagopa.atlassian.net/browse/IOBP-61)] IDPay QR Code payment scaffolding ([#4654](https://github.com/pagopa/io-app/issues/4654)) ([4a1397e](https://github.com/pagopa/io-app/commit/4a1397e4258009fa374c3f81442ee6a68fec6afb))
* [[IOBP-67](https://pagopa.atlassian.net/browse/IOBP-67)] Add IDPay payment authorization deep link handling ([#4669](https://github.com/pagopa/io-app/issues/4669)) ([dd6d4bd](https://github.com/pagopa/io-app/commit/dd6d4bd3dc38e65a32d6348746e88b588d35c4bc))
* [[IOCOM-140](https://pagopa.atlassian.net/browse/IOCOM-140)] Remove "paginated" in messages naming convention ([#4674](https://github.com/pagopa/io-app/issues/4674)) ([6cbbf4c](https://github.com/pagopa/io-app/commit/6cbbf4c80c82020e8e1e3f6fcfaf1bd16413a581))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1568](https://pagopa.atlassian.net/browse/SFEQS-1568)] Clear FCI state when user reset pin during signing flow ([#4677](https://github.com/pagopa/io-app/issues/4677)) ([b32aeb9](https://github.com/pagopa/io-app/commit/b32aeb97817182974f3b1ce3ec35211c17c36fce))
* **Firma con IO:** [[SFEQS-1665](https://pagopa.atlassian.net/browse/SFEQS-1665)] Update accessibilityLabel ([#4675](https://github.com/pagopa/io-app/issues/4675)) ([96663c3](https://github.com/pagopa/io-app/commit/96663c3404b71c662825daa3ecc2e6954fccf106))
* [[IOAPPFD0-113](https://pagopa.atlassian.net/browse/IOAPPFD0-113)] Removal of detrimental style from ListItem ([#4678](https://github.com/pagopa/io-app/issues/4678)) ([943665e](https://github.com/pagopa/io-app/commit/943665e9d01b7189e584acf8ac3f080e39898854))


### Chores

* [[IOAPPFD0-102](https://pagopa.atlassian.net/browse/IOAPPFD0-102)] Add new `AnimatedCheckbox`, `CheckboxLabel` and `CheckboxListItem` components ([#4650](https://github.com/pagopa/io-app/issues/4650)) ([6210aa5](https://github.com/pagopa/io-app/commit/6210aa58fd832e79065be2e97deede74ad3f7b5b))
* [[IOAPPFD0-108](https://pagopa.atlassian.net/browse/IOAPPFD0-108)] Add the new `Avatar` component ([#4667](https://github.com/pagopa/io-app/issues/4667)) ([916fb45](https://github.com/pagopa/io-app/commit/916fb45bb94aff98b1128da3156d13190c018375))
* remove deep links that do not work from README.md ([#4685](https://github.com/pagopa/io-app/issues/4685)) ([47a1cff](https://github.com/pagopa/io-app/commit/47a1cff10d4ff801988f75fc77f7e94d3142e3db))

## [2.35.0-rc.0](https://github.com/pagopa/io-app/compare/2.34.0-rc.2...2.35.0-rc.0) (2023-06-06)


### Features

* [[IOBP-49](https://pagopa.atlassian.net/browse/IOBP-49)] Discount initiatives unsubscription ([#4670](https://github.com/pagopa/io-app/issues/4670)) ([64d86ae](https://github.com/pagopa/io-app/commit/64d86ae8b28fe3812de47ce8938664785e5f892d))
* [[IOCOM-253](https://pagopa.atlassian.net/browse/IOCOM-253),[IOCOM-259](https://pagopa.atlassian.net/browse/IOCOM-259)] Refactor `lollipopFetch` to extract and export the signature creation ([#4659](https://github.com/pagopa/io-app/issues/4659)) ([8558a0a](https://github.com/pagopa/io-app/commit/8558a0aef706465ebbff42dfdf6325d153f42e7c))
* [[IOCOM-253](https://pagopa.atlassian.net/browse/IOCOM-253),[IOCOM-261](https://pagopa.atlassian.net/browse/IOCOM-261)] Lollipop signature on attachment download endpoint ([#4668](https://github.com/pagopa/io-app/issues/4668)) ([b76f4bf](https://github.com/pagopa/io-app/commit/b76f4bf9bf31228914d2304894cf955100d926c5))
* [[IOCOM-257](https://pagopa.atlassian.net/browse/IOCOM-257)] Added lollipop headers to third-party endpoints ([#4662](https://github.com/pagopa/io-app/issues/4662)) ([221a403](https://github.com/pagopa/io-app/commit/221a40324c28f952a891ed97aef003bf5aab248a))
* [[IOPID-251](https://pagopa.atlassian.net/browse/IOPID-251)] New pin policy ([#4655](https://github.com/pagopa/io-app/issues/4655)) ([4b95f94](https://github.com/pagopa/io-app/commit/4b95f94db54be1c6f375c7ea3c8583b8cc4a29df)), closes [/github.com/pagopa/io-app/pull/4655/files#diff-8ff3154db08bb871f25bd90b86f2f0326669fd6e6df5ba5ce5857002c3e30ce1](https://github.com/pagopa//github.com/pagopa/io-app/pull/4655/files/issues/diff-8ff3154db08bb871f25bd90b86f2f0326669fd6e6df5ba5ce5857002c3e30ce1) [/github.com/pagopa/io-app/pull/4655/files#diff-72667aa8b163df337e6c8e23a0b77eb8f5e77e84905591c99330b78721ef4793](https://github.com/pagopa//github.com/pagopa/io-app/pull/4655/files/issues/diff-72667aa8b163df337e6c8e23a0b77eb8f5e77e84905591c99330b78721ef4793)
* [[IOPLT-6](https://pagopa.atlassian.net/browse/IOPLT-6)] Extend bottom-sheet creator ([#4631](https://github.com/pagopa/io-app/issues/4631)) ([151aaff](https://github.com/pagopa/io-app/commit/151aaff12b42296245a1e26936487966dd1f9078))


### Bug Fixes

* [[IABT-1417](https://pagopa.atlassian.net/browse/IABT-1417)] Native Login ([#4601](https://github.com/pagopa/io-app/issues/4601)) ([50b8b3e](https://github.com/pagopa/io-app/commit/50b8b3e8e2a4b6f615507445c9d145b7be461c98))
* [[IOAPPFD0-109](https://pagopa.atlassian.net/browse/IOAPPFD0-109)] Fix UI regression of the `Paid` badge in the message list ([#4665](https://github.com/pagopa/io-app/issues/4665)) ([c8e6a33](https://github.com/pagopa/io-app/commit/c8e6a33c3deb008bbb21be0c0c63072637d632f5))
* [[IOBP-69](https://pagopa.atlassian.net/browse/IOBP-69)] Fix long IDPay initiatives names in wallet cards ([#4671](https://github.com/pagopa/io-app/issues/4671)) ([50c68fd](https://github.com/pagopa/io-app/commit/50c68fd4d46f209c7aaffefe3607855c4594f27c))
* [[IOCOM-251](https://pagopa.atlassian.net/browse/IOCOM-251)] Fixing loading state of message precondition on Android ([#4652](https://github.com/pagopa/io-app/issues/4652)) ([c7a2b4b](https://github.com/pagopa/io-app/commit/c7a2b4ba22556b01871f35b0bf52b6b7871b0c94))
* **Firma con IO:** [[SFEQS-1638](https://pagopa.atlassian.net/browse/SFEQS-1638)] Fix json parse error unmanaged ([#4583](https://github.com/pagopa/io-app/issues/4583)) ([f8918b4](https://github.com/pagopa/io-app/commit/f8918b40228f48e70065e967723d79183c828d89))


### Chores

* [[IOAPPFD0-98](https://pagopa.atlassian.net/browse/IOAPPFD0-98)] Add the new `Banner` component ([#4607](https://github.com/pagopa/io-app/issues/4607)) ([d9a5670](https://github.com/pagopa/io-app/commit/d9a567056ece1a2a6d3bdf7857f59ca076ae6774))
* **Firma con IO:** [[SFEQS-1706](https://pagopa.atlassian.net/browse/SFEQS-1706)] Refactor ErrorComponent to use pictograms ([#4666](https://github.com/pagopa/io-app/issues/4666)) ([77014f5](https://github.com/pagopa/io-app/commit/77014f5e924eac4f15fab3d3129b26cec5f75b8c))
* [[IOAPPFD0-106](https://pagopa.atlassian.net/browse/IOAPPFD0-106)] Add the new `emptyArchive` and `umbrellaNew` pictograms ([#4660](https://github.com/pagopa/io-app/issues/4660)) ([7b1e33b](https://github.com/pagopa/io-app/commit/7b1e33bd7d67672f279ad0789650a9a724913e5e))
* [[IOAPPFD0-107](https://pagopa.atlassian.net/browse/IOAPPFD0-107)] Update main app grid with new side margin ([#4661](https://github.com/pagopa/io-app/issues/4661)) ([770992c](https://github.com/pagopa/io-app/commit/770992ce399020320060968d93da8518f77d3552))
* [[IOAPPFD0-99](https://pagopa.atlassian.net/browse/IOAPPFD0-99)] Make the entire `Alert` pressable when `action` is set ([#4616](https://github.com/pagopa/io-app/issues/4616)) ([1c5b07c](https://github.com/pagopa/io-app/commit/1c5b07c09790555d20b243a543d4cc0b8f9cd5e4))

## [2.34.0-rc.2](https://github.com/pagopa/io-app/compare/2.34.0-rc.1...2.34.0-rc.2) (2023-05-29)


### Features

* [[IOPID-205](https://pagopa.atlassian.net/browse/IOPID-205)] CIE-SPID Deprecated info ([#4656](https://github.com/pagopa/io-app/issues/4656)) ([4d09ded](https://github.com/pagopa/io-app/commit/4d09dedef2a6feabda33731479f784c65caba886))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1680](https://pagopa.atlassian.net/browse/SFEQS-1680)] Fix ux success event adding missing properties ([#4633](https://github.com/pagopa/io-app/issues/4633)) ([d9d731d](https://github.com/pagopa/io-app/commit/d9d731db558de1aaaf12bf2b9d8d560bada1fc8d))
* [[IOBP-36](https://pagopa.atlassian.net/browse/IOBP-36),[IOBP-37](https://pagopa.atlassian.net/browse/IOBP-37)] Remove read status from transactions ([#4646](https://github.com/pagopa/io-app/issues/4646)) ([5572611](https://github.com/pagopa/io-app/commit/557261157cbff253be3c707e4f40ebfec806f5b7))
* [[IOBP-38](https://pagopa.atlassian.net/browse/IOBP-38),[IOBP-39](https://pagopa.atlassian.net/browse/IOBP-39)] Increase size limit for transaction list in wallet  ([#4648](https://github.com/pagopa/io-app/issues/4648)) ([47dff68](https://github.com/pagopa/io-app/commit/47dff68b616091e390a649f4c15fcd326ffcacde))


### Chores

* [[IOAPPFD0-101](https://pagopa.atlassian.net/browse/IOAPPFD0-101)] Add the new `ListItemAction` component ([#4634](https://github.com/pagopa/io-app/issues/4634)) ([fa32526](https://github.com/pagopa/io-app/commit/fa32526f583774c73a251305e57bc86856c887ec))
* [[IOBP-50](https://pagopa.atlassian.net/browse/IOBP-50)] Added new error pictogram in transaction details ([#4649](https://github.com/pagopa/io-app/issues/4649)) ([52c5de9](https://github.com/pagopa/io-app/commit/52c5de99bf7051b20254cfc3869069f62624d9e2))
* [[IOPID-243](https://pagopa.atlassian.net/browse/IOPID-243)] Add local and remote FF for fast and native login ([#4651](https://github.com/pagopa/io-app/issues/4651)) ([9dd1f97](https://github.com/pagopa/io-app/commit/9dd1f97c07c26ec42ffe15f720f582c59f5f6bae)), closes [/github.com/pagopa/io-app/pull/4651/files#diff-74dd9d08974aed4457940214a64b43ce175d062d74e72309b003f02c24f98b30](https://github.com/pagopa//github.com/pagopa/io-app/pull/4651/files/issues/diff-74dd9d08974aed4457940214a64b43ce175d062d74e72309b003f02c24f98b30) [/github.com/pagopa/io-app/pull/4651/files#diff-48f73ea2653e45c41f31afc2d42dfde14d8caf26d8dd24d3d2a81a52604f4cb6](https://github.com/pagopa//github.com/pagopa/io-app/pull/4651/files/issues/diff-48f73ea2653e45c41f31afc2d42dfde14d8caf26d8dd24d3d2a81a52604f4cb6) [/github.com/pagopa/io-app/pull/4651/files#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519](https://github.com/pagopa//github.com/pagopa/io-app/pull/4651/files/issues/diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519) [/github.com/pagopa/io-app/pull/4651/files#diff-0f5e4629af7b77f0b21af3a54fe1d4d21314eb44c8a54193316d9d80ba2654](https://github.com/pagopa//github.com/pagopa/io-app/pull/4651/files/issues/diff-0f5e4629af7b77f0b21af3a54fe1d4d21314eb44c8a54193316d9d80ba2654) [/github.com/pagopa/io-app/pull/4651/files#diff-77b2bc00cdd44900b86f533de9771b38b7d79e0e7dbfedf5b3119ca11b1d6](https://github.com/pagopa//github.com/pagopa/io-app/pull/4651/files/issues/diff-77b2bc00cdd44900b86f533de9771b38b7d79e0e7dbfedf5b3119ca11b1d6) [/github.com/pagopa/io-app/pull/4651/files#diff-4184bb1097ce53f8a3e5f22be9786a1303502e948d1c3016c17bb6cc7ef184f6](https://github.com/pagopa//github.com/pagopa/io-app/pull/4651/files/issues/diff-4184bb1097ce53f8a3e5f22be9786a1303502e948d1c3016c17bb6cc7ef184f6) [/github.com/pagopa/io-app/pull/4651/files#diff-5da0f6684e8f402fce1941a4ed4bde7c83d04e2c7769fdda96f9d61e8adfcaf6](https://github.com/pagopa//github.com/pagopa/io-app/pull/4651/files/issues/diff-5da0f6684e8f402fce1941a4ed4bde7c83d04e2c7769fdda96f9d61e8adfcaf6) [/github.com/pagopa/io-app/pull/4651/files#diff-b7193eff79bd4f250120cd35c1623de04b1d1212d4a1b1aa0ca449f9c9b9823](https://github.com/pagopa//github.com/pagopa/io-app/pull/4651/files/issues/diff-b7193eff79bd4f250120cd35c1623de04b1d1212d4a1b1aa0ca449f9c9b9823) [/github.com/pagopa/io-app/pull/4651/files#diff-164bd382961cc4552dea2afabb89bc07bf7c2b20e3ab109f344be2474fa40b1](https://github.com/pagopa//github.com/pagopa/io-app/pull/4651/files/issues/diff-164bd382961cc4552dea2afabb89bc07bf7c2b20e3ab109f344be2474fa40b1) [/github.com/pagopa/io-dev-api-server/blob/482d4da8e19d49a0a0caaebe9942e4b53ca6f1d9/src/payloads/backend.ts#L94](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/482d4da8e19d49a0a0caaebe9942e4b53ca6f1d9/src/payloads/backend.ts/issues/L94)

## [2.34.0-rc.1](https://github.com/pagopa/io-app/compare/2.34.0-rc.0...2.34.0-rc.1) (2023-05-24)


### Features

* **Firma con IO:** [[SFEQS-1630](https://pagopa.atlassian.net/browse/SFEQS-1630)] Add context based assistance ([#4635](https://github.com/pagopa/io-app/issues/4635)) ([87fad94](https://github.com/pagopa/io-app/commit/87fad94e57e12370b93b72ba075dec33c1606b3f))
* [[IOBP-48](https://pagopa.atlassian.net/browse/IOBP-48)] Discount initiative details update ([#4647](https://github.com/pagopa/io-app/issues/4647)) ([f19848c](https://github.com/pagopa/io-app/commit/f19848c16ffcfd1719a876224dae246e9660a1de))
* **Firma con IO:** [[SFEQS-1265](https://pagopa.atlassian.net/browse/SFEQS-1265)] Add the signing flow without signature fields ([#4608](https://github.com/pagopa/io-app/issues/4608)) ([79f73a8](https://github.com/pagopa/io-app/commit/79f73a8ce8a3abc5dc078e049ea1f61d29c853ee))


### Bug Fixes

* [[IABT-1478](https://pagopa.atlassian.net/browse/IABT-1478)] Fix visual regression of the `CgnMerchantsDiscountItem` component ([#4621](https://github.com/pagopa/io-app/issues/4621)) ([b7785fd](https://github.com/pagopa/io-app/commit/b7785fd8ff3fe327b7c4510309acca374bab07af))
* [[IOBP-31](https://pagopa.atlassian.net/browse/IOBP-31)] Fix privacy button in IDPay beneficiary details screen ([#4637](https://github.com/pagopa/io-app/issues/4637)) ([4ec6f60](https://github.com/pagopa/io-app/commit/4ec6f609733ec73383dda3e37c3ef37ecdd94262))
* [[IOBP-43](https://pagopa.atlassian.net/browse/IOBP-43)] Removed now deprecated privative cards code ([#4615](https://github.com/pagopa/io-app/issues/4615)) ([b81de31](https://github.com/pagopa/io-app/commit/b81de31337f1355a365c57b833693f407c10ca8d))
* [[IOBP-51](https://pagopa.atlassian.net/browse/IOBP-51)] Fix IDPay initiative budget info in details screen ([#4639](https://github.com/pagopa/io-app/issues/4639)) ([dc745bd](https://github.com/pagopa/io-app/commit/dc745bd504e876458f30f7fc6cc830d219537889))
* [[IOBP-53](https://pagopa.atlassian.net/browse/IOBP-53)] Fix IDPay initiative bonus counters ([#4640](https://github.com/pagopa/io-app/issues/4640)) ([c391ebf](https://github.com/pagopa/io-app/commit/c391ebf12de80692debdfad37dd7bdc89228e5bc))


### Chores

* [[IOAPPFD0-94](https://pagopa.atlassian.net/browse/IOAPPFD0-94)] Remove legacy icons ([#4579](https://github.com/pagopa/io-app/issues/4579)) ([865d08c](https://github.com/pagopa/io-app/commit/865d08c7beb3fd29f15a11fd0beee093f6eb0c47))
* add autoverify true property to intent-filter app link ([#4643](https://github.com/pagopa/io-app/issues/4643)) ([9d013ef](https://github.com/pagopa/io-app/commit/9d013ef6c5a0b3cd730585091589d1c47122b766))
* **deps:** bump requests from 2.26.0 to 2.31.0 in /scripts/check_cie_button_exists ([#4641](https://github.com/pagopa/io-app/issues/4641)) ([3450b49](https://github.com/pagopa/io-app/commit/3450b49cfa869dca92d1d5cc2c451cd02bdaed20))
* **deps:** bump requests from 2.26.0 to 2.31.0 in /scripts/check_urls ([#4642](https://github.com/pagopa/io-app/issues/4642)) ([c6432f9](https://github.com/pagopa/io-app/commit/c6432f9c71748572c7d52a525dee2ef717b26f1d))
* [[IOAPPFD0-103](https://pagopa.atlassian.net/browse/IOAPPFD0-103)] Focus of `ListItemNav` when touch ends ([#4644](https://github.com/pagopa/io-app/issues/4644)) ([6407cd0](https://github.com/pagopa/io-app/commit/6407cd02862d3fc8499a52be9672268b4c64426a))
* [[IOAPPFD0-95](https://pagopa.atlassian.net/browse/IOAPPFD0-95)] Add the new `ListItemInfoCopy` component ([#4584](https://github.com/pagopa/io-app/issues/4584)) ([6eb807e](https://github.com/pagopa/io-app/commit/6eb807eb93f85963556d9921b7d2a272e4c12687))

## [2.34.0-rc.0](https://github.com/pagopa/io-app/compare/2.33.0-rc.1...2.34.0-rc.0) (2023-05-23)


### Features

* [[IOBP-7](https://pagopa.atlassian.net/browse/IOBP-7)] Add details screen for Discount type initiatives ([#4630](https://github.com/pagopa/io-app/issues/4630)) ([a1897e7](https://github.com/pagopa/io-app/commit/a1897e76388b596caa57d2946e46b7442a0182d6))
* [[IOCOM-136](https://pagopa.atlassian.net/browse/IOCOM-136)] Shared component across MessagesHomeTabNavigator ([#4613](https://github.com/pagopa/io-app/issues/4613)) ([e25a123](https://github.com/pagopa/io-app/commit/e25a123dc295d0554945be8e91bf8b18f0764d19))
* [[IOCOM-138](https://pagopa.atlassian.net/browse/IOCOM-138)] Remove MVL ([#4614](https://github.com/pagopa/io-app/issues/4614)) ([313bfe1](https://github.com/pagopa/io-app/commit/313bfe1ae175a5b5629047b04a7c0a51db9c0c96))
* [[IOCOM-144](https://pagopa.atlassian.net/browse/IOCOM-144)] RptId calculation extraction from the PnMessageDetails component ([#4624](https://github.com/pagopa/io-app/issues/4624)) ([988b9fb](https://github.com/pagopa/io-app/commit/988b9fb3dd494d508330e1fe56368c158f6a3f85))
* [[IOCOM-174](https://pagopa.atlassian.net/browse/IOCOM-174)] Grouping of messages, PN and service/notification analytics events ([#4623](https://github.com/pagopa/io-app/issues/4623)) ([3a77557](https://github.com/pagopa/io-app/commit/3a775572d8f969c0cd0c8ddb6b0039041b03458d))


### Bug Fixes

* [[IABT-1480](https://pagopa.atlassian.net/browse/IABT-1480)] Fix UnsupportedDeviceScreen when shown as modal, tag 2.33.0-rc.2, bump Android minSdk from 21 to 23 ([#4636](https://github.com/pagopa/io-app/issues/4636)) ([9d6d406](https://github.com/pagopa/io-app/commit/9d6d406b9ceb63b67b82410fe3cde53e9733549b))
* **Firma con IO:** [[SFEQS-1604](https://pagopa.atlassian.net/browse/SFEQS-1604)] Add pagination to PDF components ([#4617](https://github.com/pagopa/io-app/issues/4617)) ([282c07c](https://github.com/pagopa/io-app/commit/282c07c5f8546cfbb60744bacd14c816e43714b3))
* **Firma con IO:** [[SFEQS-1672](https://pagopa.atlassian.net/browse/SFEQS-1672)] Fix analytics event category and type ([#4622](https://github.com/pagopa/io-app/issues/4622)) ([56cb6dd](https://github.com/pagopa/io-app/commit/56cb6dd960b84bcc86a2312a5f5e964912fc34a6))
* [[IABT-1479](https://pagopa.atlassian.net/browse/IABT-1479)] Fix failing E2E tests ([#4629](https://github.com/pagopa/io-app/issues/4629)) ([c0c5371](https://github.com/pagopa/io-app/commit/c0c5371d3caca8dde8d636faae911531322f0c18))
* [[IOBP-42](https://pagopa.atlassian.net/browse/IOBP-42)] Removal of privative methods from UI ([#4611](https://github.com/pagopa/io-app/issues/4611)) ([bcb5c55](https://github.com/pagopa/io-app/commit/bcb5c553b92f386ff1fba97bb5c39f774d804056))
* [[IOBP-47](https://pagopa.atlassian.net/browse/IOBP-47)] Small ui regression in idpay unsubscription flow ([#4628](https://github.com/pagopa/io-app/issues/4628)) ([c3539fd](https://github.com/pagopa/io-app/commit/c3539fdc658258e17e094df6a30fe86ab0feb735))
* fix missing changelog on testflight app ([#4626](https://github.com/pagopa/io-app/issues/4626)) ([7702202](https://github.com/pagopa/io-app/commit/77022029157d2ce520034af3d4cec58c196d729a))
* Fixes not working alpha promotion on release workflow for android ([#4620](https://github.com/pagopa/io-app/issues/4620)) ([3bfee6c](https://github.com/pagopa/io-app/commit/3bfee6cbf49d9a41a260daf729c5bc5418e265d1))


### Chores

* [[IOAPPFD0-100](https://pagopa.atlassian.net/browse/IOAPPFD0-100)] Add the new generic `ListItemInfo` component ([#4632](https://github.com/pagopa/io-app/issues/4632)) ([6c54746](https://github.com/pagopa/io-app/commit/6c54746573bf9e22725a7454b2b579580846c822))
* [[IOAPPFD0-92](https://pagopa.atlassian.net/browse/IOAPPFD0-92)] Add the new icons to the main Navbar ([#4573](https://github.com/pagopa/io-app/issues/4573)) ([dc2ade3](https://github.com/pagopa/io-app/commit/dc2ade3b96300c4829c9bf8dd53ff050213b46e9))
* [[IOAPPFD0-96](https://pagopa.atlassian.net/browse/IOAPPFD0-96)] Update typographic styles of the new `Alert` component ([#4597](https://github.com/pagopa/io-app/issues/4597)) ([f012794](https://github.com/pagopa/io-app/commit/f0127940558a92523b693c0b897323325f2d75dd))
* [[IOPID-192](https://pagopa.atlassian.net/browse/IOPID-192)] CIE 409 errors ([#4619](https://github.com/pagopa/io-app/issues/4619)) ([1c64d6c](https://github.com/pagopa/io-app/commit/1c64d6c0dd6f149bd166d39b3f4bb0c73b5511b2)), closes [/github.com/pagopa/io-app/pull/4619/files#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519) [/github.com/pagopa/io-app/pull/4619/files#diff-eb0dafddc14b9bf7689c3ee821d1b5c30202a8077cb4e24288e90195318816f3](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-eb0dafddc14b9bf7689c3ee821d1b5c30202a8077cb4e24288e90195318816f3) [/github.com/pagopa/io-app/pull/4619/files#diff-a773fe09de09754a0f2fee0057f3e318b00c8049f8cf69b09d23377752208e3](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-a773fe09de09754a0f2fee0057f3e318b00c8049f8cf69b09d23377752208e3) [/github.com/pagopa/io-app/pull/4619/files#diff-bb861bbccfb56860f135b447d8c9bd3e37efade177c2bb0415eed7fa83d5e737](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-bb861bbccfb56860f135b447d8c9bd3e37efade177c2bb0415eed7fa83d5e737) [/github.com/pagopa/io-app/pull/4619/files#diff-44907fc1c12ff2d67ec321ae2e6d086c1f47f734764a16255b1ff8ceb93b6ce9](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-44907fc1c12ff2d67ec321ae2e6d086c1f47f734764a16255b1ff8ceb93b6ce9) [/github.com/pagopa/io-app/pull/4619/files#diff-6bfad00007ef648f2949fb0a533dd4797c761f331e8a0cd31ccb14dc0923bcc5](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-6bfad00007ef648f2949fb0a533dd4797c761f331e8a0cd31ccb14dc0923bcc5) [/github.com/pagopa/io-app/pull/4619/files#diff-38a556108890cad3c4d7a4e811cce916ddc46594c4edc0e73b6b6ff585635e7](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-38a556108890cad3c4d7a4e811cce916ddc46594c4edc0e73b6b6ff585635e7) [/github.com/pagopa/io-app/pull/4619/files#diff-7eb65dbbe0c949778f920804fe110695b3983cdcac71d5600e870100b231630](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-7eb65dbbe0c949778f920804fe110695b3983cdcac71d5600e870100b231630) [/github.com/pagopa/io-app/pull/4619/files#diff-7301c8b01c6d8ff8e124e10e550a623fffedf96fa7251055b5c8092095c6af0](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-7301c8b01c6d8ff8e124e10e550a623fffedf96fa7251055b5c8092095c6af0) [/github.com/pagopa/io-app/pull/4619/files#diff-f54ddab5813a42b9135c11cbd42b931854b83272a0763ec2fd2b759f8ede6f09](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-f54ddab5813a42b9135c11cbd42b931854b83272a0763ec2fd2b759f8ede6f09) [/github.com/pagopa/io-app/pull/4619/files#diff-42db30685d69d36c270f8b986b1e400960ab1c85ec3e9a79f8eecf2007ee8c89](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-42db30685d69d36c270f8b986b1e400960ab1c85ec3e9a79f8eecf2007ee8c89) [/github.com/pagopa/io-app/pull/4619/files#diff-89c251a9a9539e3470c6001c13917f0881272bfa692f61bdc4a6f191b0435fa3](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-89c251a9a9539e3470c6001c13917f0881272bfa692f61bdc4a6f191b0435fa3) [/github.com/pagopa/io-app/pull/4619/files#diff-a425aab9658df7526ca2afd44dfd12ab19227f77c49e80436ef35388f2266627](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-a425aab9658df7526ca2afd44dfd12ab19227f77c49e80436ef35388f2266627) [/github.com/pagopa/io-app/pull/4619/files#diff-a66c588312e074ecef0c31f39668b6097c22fd8745e765b489150f3c9d165c5](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-a66c588312e074ecef0c31f39668b6097c22fd8745e765b489150f3c9d165c5) [/github.com/pagopa/io-app/pull/4619/files#diff-a773fe09de09754a0f2fee0057f3e318b00c8049f8cf69b09d23377752208e3](https://github.com/pagopa//github.com/pagopa/io-app/pull/4619/files/issues/diff-a773fe09de09754a0f2fee0057f3e318b00c8049f8cf69b09d23377752208e3)
* **deps:** bump nunjucks from 3.2.3 to 3.2.4 ([#4559](https://github.com/pagopa/io-app/issues/4559)) ([a6f5d7a](https://github.com/pagopa/io-app/commit/a6f5d7a8c1d9834291b4963ba433f64f8d77950a))
* **deps:** bump vm2 from 3.9.17 to 3.9.19 ([#4612](https://github.com/pagopa/io-app/issues/4612)) ([dd7956d](https://github.com/pagopa/io-app/commit/dd7956da00637a61265d1120ee7adfe8cd1b5f80))
* [[IOPID-194](https://pagopa.atlassian.net/browse/IOPID-194)] Add "iologin" URLScheme to WebView whitelist ([#4596](https://github.com/pagopa/io-app/issues/4596)) ([309e71b](https://github.com/pagopa/io-app/commit/309e71b94b733e7937a0380e478c3cc5c07a4e1c))

## [2.33.0-rc.2](https://github.com/pagopa/io-app/compare/2.33.0-rc.1...2.33.0-rc.2) (2023-05-19)

## [2.33.0-rc.1](https://github.com/pagopa/io-app/compare/2.33.0-rc.0...2.33.0-rc.1) (2023-05-17)


### Features

* [[IOPLT-13](https://pagopa.atlassian.net/browse/IOPLT-13)] Increment Android versionCode on new version bump ([#4618](https://github.com/pagopa/io-app/issues/4618)) ([337ada2](https://github.com/pagopa/io-app/commit/337ada20510dba93c745bb8fb82147eaf1114b6a))


### Chores

* [[IOAPPFD0-83](https://pagopa.atlassian.net/browse/IOAPPFD0-83)] Add the new `ListItemNav` and `ListItemNavAlert` components ([#4551](https://github.com/pagopa/io-app/issues/4551)) ([614f777](https://github.com/pagopa/io-app/commit/614f777f293b7d29dff8d287647cec3f7a438301))

## [2.33.0-rc.0](https://github.com/pagopa/io-app/compare/2.32.0-rc.1...2.33.0-rc.0) (2023-05-16)


### Features

* [[IOCOM-145](https://pagopa.atlassian.net/browse/IOCOM-145)] Pn preferences removal ([#4591](https://github.com/pagopa/io-app/issues/4591)) ([2ae5328](https://github.com/pagopa/io-app/commit/2ae5328b176ed04ebe4594dc4d725b92e0328d94))
* [[IOCOM-211](https://pagopa.atlassian.net/browse/IOCOM-211)] Tests on workerMessagePrecondition ([#4605](https://github.com/pagopa/io-app/issues/4605)) ([fd052a9](https://github.com/pagopa/io-app/commit/fd052a991d0dbfc2bff72a97eff31cb29ed7d5c9))
* [[IOPLT-10](https://pagopa.atlassian.net/browse/IOPLT-10)] Migrate weekly job from Circle CI to GitHub Actions ([#4602](https://github.com/pagopa/io-app/issues/4602)) ([56a0cb9](https://github.com/pagopa/io-app/commit/56a0cb9a39b8c6d59fc6d1e58c5cf6bce42910c6))
* [[IOPLT-7](https://pagopa.atlassian.net/browse/IOPLT-7)] Migrate e2e tests to Github Actions ([#4593](https://github.com/pagopa/io-app/issues/4593)) ([b5c64f2](https://github.com/pagopa/io-app/commit/b5c64f2c21f74b5956c301c38002f3bb70b876ef))
* [[IOPLT-9](https://pagopa.atlassian.net/browse/IOPLT-9)] Migrate release workflow ([#4609](https://github.com/pagopa/io-app/issues/4609)) ([40a2bb4](https://github.com/pagopa/io-app/commit/40a2bb4f6235d1963c7d27c4588239c2dcbb5172))
* **Firma con IO:** [[SFEQS-1661](https://pagopa.atlassian.net/browse/SFEQS-1661)] Edit signature fields order ([#4604](https://github.com/pagopa/io-app/issues/4604)) ([b15303b](https://github.com/pagopa/io-app/commit/b15303b905553a9720c1e363416d5ad6bce95b56))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1342](https://pagopa.atlassian.net/browse/SFEQS-1342)] Update abort signature flow bottom sheet copy ([#4603](https://github.com/pagopa/io-app/issues/4603)) ([79cac3a](https://github.com/pagopa/io-app/commit/79cac3a8c377b54d75fe749c81e46438d1c9b104))


### Chores

* **Firma con IO:** [[SFEQS-1648](https://pagopa.atlassian.net/browse/SFEQS-1648)] Refactor FCI polling action ([#4599](https://github.com/pagopa/io-app/issues/4599)) ([70a055e](https://github.com/pagopa/io-app/commit/70a055eb14e8ab348450aba7d368a085b8fd95f1))
* **Firma con IO:** [[SFEQS-1650](https://pagopa.atlassian.net/browse/SFEQS-1650)] Remove unused action ([#4594](https://github.com/pagopa/io-app/issues/4594)) ([1bcbefc](https://github.com/pagopa/io-app/commit/1bcbefc7d2046b7a4a58a0dfc9a9c878f62b349e))
* **release:** 2.33.0-rc.0 ([d420a98](https://github.com/pagopa/io-app/commit/d420a98693e0ea89052f016833eda855e4307fe8))
* [[IAI-237](https://pagopa.atlassian.net/browse/IAI-237)] Replace `IconFont` with the `Icon` component ([#4502](https://github.com/pagopa/io-app/issues/4502)) ([3af2b04](https://github.com/pagopa/io-app/commit/3af2b049a760089bb0dda405842498c8c4613405))
* [[IOAPPFD0-97](https://pagopa.atlassian.net/browse/IOAPPFD0-97)] Update README.md ([#4598](https://github.com/pagopa/io-app/issues/4598)) ([bdbb053](https://github.com/pagopa/io-app/commit/bdbb05363480053b611a9003953beb9c59b58e7e))

## [2.32.0-rc.0](https://github.com/pagopa/io-app/compare/2.31.0-rc.3...2.32.0-rc.0) (2023-05-09)


### Features

* **Firma con IO:** [[SFEQS-1326](https://pagopa.atlassian.net/browse/SFEQS-1326)] Update copy data sharing screen ([#4590](https://github.com/pagopa/io-app/issues/4590)) ([be145e9](https://github.com/pagopa/io-app/commit/be145e929beacc001cc1f97853a8d9334fc9331b))
* [[IODPAY-175](https://pagopa.atlassian.net/browse/IODPAY-175)] Add IDPay initiative details screen ([#4574](https://github.com/pagopa/io-app/issues/4574)) ([65cae8a](https://github.com/pagopa/io-app/commit/65cae8a2e564d1f9783f866de1267d5f9c7ea6b4))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1649](https://pagopa.atlassian.net/browse/SFEQS-1649)] Update FCI events adding type and category properties ([#4592](https://github.com/pagopa/io-app/issues/4592)) ([1170973](https://github.com/pagopa/io-app/commit/117097371bb737f94987a4b7ba0468318f4c2f41))
* [[IAI-277](https://pagopa.atlassian.net/browse/IAI-277)] Fix text alignment of the Messages' empty state component ([#4586](https://github.com/pagopa/io-app/issues/4586)) ([6250580](https://github.com/pagopa/io-app/commit/62505801cc8b4519d0e87812972e3bd83ff0ddc0))
* [[IOAPPFD0-63](https://pagopa.atlassian.net/browse/IOAPPFD0-63)] Add husky git-hook manager with pre-commit and pre-push hooks ([#4488](https://github.com/pagopa/io-app/issues/4488)) ([a992327](https://github.com/pagopa/io-app/commit/a992327258634e00dd53e75dff30d56bcd7dae4b))


### Chores

* [[IAI-265](https://pagopa.atlassian.net/browse/IAI-265)] Refactor `IOBadge` with new variants · Remove the NativeBase `Badge` ([#4337](https://github.com/pagopa/io-app/issues/4337)) ([675091c](https://github.com/pagopa/io-app/commit/675091c161c2c0a1037209ad5c8a6a6ba73193b8))
* [[IOAPPFD0-85](https://pagopa.atlassian.net/browse/IOAPPFD0-85)] Add the new `ButtonLink` component ([#4553](https://github.com/pagopa/io-app/issues/4553)) ([54d38c0](https://github.com/pagopa/io-app/commit/54d38c028ea0b81774a2ba207d13bbb11c24ad44))
* [[IOAPPFD0-86](https://pagopa.atlassian.net/browse/IOAPPFD0-86)] Add the new `IconButton`, rename the old one to `IconButtonContained` ([#4555](https://github.com/pagopa/io-app/issues/4555)) ([0c8159e](https://github.com/pagopa/io-app/commit/0c8159ed159aaa47c697f5bd7fdb744cca84801e))
* [[IOAPPFD0-93](https://pagopa.atlassian.net/browse/IOAPPFD0-93)] Add the new `FeatureInfo` component ([#4576](https://github.com/pagopa/io-app/issues/4576)) ([8071b3c](https://github.com/pagopa/io-app/commit/8071b3ca9f1fcc5e1fee360c90f763cb8b176874))
* [[IODPAY-207](https://pagopa.atlassian.net/browse/IODPAY-207)] Move initiatives from instrument refresh logic in saga ([#4587](https://github.com/pagopa/io-app/issues/4587)) ([351bf33](https://github.com/pagopa/io-app/commit/351bf33171d9df29c710d44b693ed956073c1692))
* [[IOPID-188](https://pagopa.atlassian.net/browse/IOPID-188)] Added level parameter to getIdpLoginUri ([#4589](https://github.com/pagopa/io-app/issues/4589)) ([7cffffd](https://github.com/pagopa/io-app/commit/7cffffde6dca21c0c0e3de1c54ceed81cfa849a3))
* Autodetect node binary when using node versions manager ([#4374](https://github.com/pagopa/io-app/issues/4374)) ([4ce809d](https://github.com/pagopa/io-app/commit/4ce809d16482d7b1fa88e4df62beb98db73db359))

## [2.31.0-rc.3](https://github.com/pagopa/io-app/compare/2.31.0-rc.2...2.31.0-rc.3) (2023-05-04)


### Bug Fixes

* [[IABT-1473](https://pagopa.atlassian.net/browse/IABT-1473)] Fix contextual help when user is not authenticated ([#4585](https://github.com/pagopa/io-app/issues/4585)) ([c094044](https://github.com/pagopa/io-app/commit/c0940441a1605f26574ef6507c2c158b4370cf43))


### Chores

* [[IODPAY-216](https://pagopa.atlassian.net/browse/IODPAY-216)] Add onboarding PDND criteria values ([#4558](https://github.com/pagopa/io-app/issues/4558)) ([0758907](https://github.com/pagopa/io-app/commit/0758907efc58f5d9c3d0eaa0289d18ec25f08e87))

## [2.31.0-rc.2](https://github.com/pagopa/io-app/compare/2.31.0-rc.1...2.31.0-rc.2) (2023-05-03)


### Features

* **Firma con IO:** [[SFEQS-1378](https://pagopa.atlassian.net/browse/SFEQS-1378)] Update main app navigator stack to enable FCI deeplink ([#4568](https://github.com/pagopa/io-app/issues/4568)) ([0326230](https://github.com/pagopa/io-app/commit/03262307c64b04320d665ae3eaf0aaa194b1a688))
* **Firma con IO:** [[SFEQS-1576](https://pagopa.atlassian.net/browse/SFEQS-1576)] Update router screen to render error based on the response status code ([#4566](https://github.com/pagopa/io-app/issues/4566)) ([da3cf0b](https://github.com/pagopa/io-app/commit/da3cf0ba74610669615c235f504c329aa4d5fc7a)), closes [/github.com/pagopa/io-dev-api-server/blob/e5363f1a9afb60ccb0488b5bb708437d23eb8682/src/routers/features/fci/index.ts#L29](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/e5363f1a9afb60ccb0488b5bb708437d23eb8682/src/routers/features/fci/index.ts/issues/L29)
* **Firma con IO:** [[SFEQS-800](https://pagopa.atlassian.net/browse/SFEQS-800)] Add mixpanel FCI events ([#4570](https://github.com/pagopa/io-app/issues/4570)) ([8e1a539](https://github.com/pagopa/io-app/commit/8e1a5395bebc4a78df0369fc21a6ceea205bab1a))
* [[IOCOM-172](https://pagopa.atlassian.net/browse/IOCOM-172),[IOCOM-173](https://pagopa.atlassian.net/browse/IOCOM-173),[IOCOM-179](https://pagopa.atlassian.net/browse/IOCOM-179)] Display remote precondition before opening the message details ([#4565](https://github.com/pagopa/io-app/issues/4565)) ([86b9d20](https://github.com/pagopa/io-app/commit/86b9d2057c3ce6be625b5348d9e2d24712a1e991)), closes [/github.com/pagopa/io-dev-api-server/blob/IOCOM-171-remote-bottom-sheet-message/src/config.ts#L131](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/IOCOM-171-remote-bottom-sheet-message/src/config.ts/issues/L131) [/github.com/pagopa/io-dev-api-server/blob/IOCOM-171-remote-bottom-sheet-message/src/config.ts#L78](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/IOCOM-171-remote-bottom-sheet-message/src/config.ts/issues/L78)
* **IDPay:** [[IODPAY-171](https://pagopa.atlassian.net/browse/IODPAY-171)] IDPay initiative unsubscription ([#4462](https://github.com/pagopa/io-app/issues/4462)) ([c3c2f67](https://github.com/pagopa/io-app/commit/c3c2f675ebeb0efca9a3c9a9ddfb0ab1e1f555ef))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1635](https://pagopa.atlassian.net/browse/SFEQS-1635)] Fix mixpanel events action ([#4580](https://github.com/pagopa/io-app/issues/4580)) ([e1e534c](https://github.com/pagopa/io-app/commit/e1e534c665c11df9dbac2d26f6e88d69f9ccc577))
* **IDPay:** [[IODPAY-149](https://pagopa.atlassian.net/browse/IODPAY-149),[IODPAY-138](https://pagopa.atlassian.net/browse/IODPAY-138),[IODPAY-139](https://pagopa.atlassian.net/browse/IODPAY-139),[IODPAY-142](https://pagopa.atlassian.net/browse/IODPAY-142),[IODPAY-184](https://pagopa.atlassian.net/browse/IODPAY-184)] Show operation details bottom sheet from timeline ([#4370](https://github.com/pagopa/io-app/issues/4370)) ([d6dc1de](https://github.com/pagopa/io-app/commit/d6dc1def8b84a101772ff76b511c5d0169dfc4ff))
* [[IABT-1471](https://pagopa.atlassian.net/browse/IABT-1471)] Update ZenDesk SDKs to support iOS 16 ([#4577](https://github.com/pagopa/io-app/issues/4577)) ([d67f147](https://github.com/pagopa/io-app/commit/d67f1471717cdbde05482c38970bd8008fba94c5))


### Chores

* **IDPay:** [[IODPAY-196](https://pagopa.atlassian.net/browse/IODPAY-196)] Update new initiative placeholder screen ([#4578](https://github.com/pagopa/io-app/issues/4578)) ([b3f1259](https://github.com/pagopa/io-app/commit/b3f1259027906717c1e74ef4354fa9710d324f53))
* [[IOAPPFD0-81](https://pagopa.atlassian.net/browse/IOAPPFD0-81)] Update README.md ([#4528](https://github.com/pagopa/io-app/issues/4528)) ([4262807](https://github.com/pagopa/io-app/commit/426280728f887928246a90a8c13739ec390946fe))
* **IDPay:** [[IODPAY-195](https://pagopa.atlassian.net/browse/IODPAY-195)] New IDPay bonus card in wallet ([#4554](https://github.com/pagopa/io-app/issues/4554)) ([080aecc](https://github.com/pagopa/io-app/commit/080aecce3cc564e7db1e20328823e04621daed2f))
* **IDPay:** [[IODPAY-223](https://pagopa.atlassian.net/browse/IODPAY-223)] Initiative details screen refactoring ([#4581](https://github.com/pagopa/io-app/issues/4581)) ([46eb50a](https://github.com/pagopa/io-app/commit/46eb50a289aa9ddfa86d6a060da3f0043c19062f))
* [[IOAPPFD0-64](https://pagopa.atlassian.net/browse/IOAPPFD0-64)] Enable deep-link handling in react-navigation ([#4152](https://github.com/pagopa/io-app/issues/4152)) ([563bafe](https://github.com/pagopa/io-app/commit/563bafec9141cb87607e950c5c242949701df1ce))
* **IDPay:** [[IODPAY-221](https://pagopa.atlassian.net/browse/IODPAY-221)] Update IDPay API definition to v2.52.1 ([#4575](https://github.com/pagopa/io-app/issues/4575)) ([0a4cc8d](https://github.com/pagopa/io-app/commit/0a4cc8d7b05165cd5091a9340ffa00d368956245))

## [2.31.0-rc.1](https://github.com/pagopa/io-app/compare/2.31.0-rc.0...2.31.0-rc.1) (2023-04-27)


### Features

* [[IOCOM-164](https://pagopa.atlassian.net/browse/IOCOM-164)] Replaces custom types and decoders on io-backend client ([#4546](https://github.com/pagopa/io-app/issues/4546)) ([49d0f9b](https://github.com/pagopa/io-app/commit/49d0f9b833986b64c9e23f19ef4f1a3f76f67c1b))
* **IDPay:** [[IODPAY-116](https://pagopa.atlassian.net/browse/IODPAY-116)] Add info modal in IBAN landing screen ([#4556](https://github.com/pagopa/io-app/issues/4556)) ([4719766](https://github.com/pagopa/io-app/commit/4719766b6aa5dbde640e875cf37c8c93e7efb204))


### Bug Fixes

* **IDPay:** [[IODPAY-192](https://pagopa.atlassian.net/browse/IODPAY-192)] Wrong copy in initiativeDetails' "lastUpdated" ([#4569](https://github.com/pagopa/io-app/issues/4569)) ([3ce719b](https://github.com/pagopa/io-app/commit/3ce719b4cd0296537860309c21a07eae698ea414))
* [[IOAPPFD0-91](https://pagopa.atlassian.net/browse/IOAPPFD0-91)] Message sender details not wrapping ([#4567](https://github.com/pagopa/io-app/issues/4567)) ([fe664f6](https://github.com/pagopa/io-app/commit/fe664f6f2abcbce558353b9f6640dd9df0436037))
* **IDPay:** [[IODPAY-212](https://pagopa.atlassian.net/browse/IODPAY-212)] "Tap to scroll" floating button in IDPay onboarding screen ([#4541](https://github.com/pagopa/io-app/issues/4541)) ([da01632](https://github.com/pagopa/io-app/commit/da0163209d8fca1b98fd19c3ca34f763bc2f1441))
* **IDPay:** [[IODPAY-217](https://pagopa.atlassian.net/browse/IODPAY-217)] Fix IDPay initiative settings component skeleton ([#4564](https://github.com/pagopa/io-app/issues/4564)) ([13fbb19](https://github.com/pagopa/io-app/commit/13fbb19b5817de680d873ed206a784fbbb54e7e2))
* [[IOAPPFD0-89](https://pagopa.atlassian.net/browse/IOAPPFD0-89)] Update slack channel of CIE iOS button check ([#4562](https://github.com/pagopa/io-app/issues/4562)) ([3a2ea1d](https://github.com/pagopa/io-app/commit/3a2ea1dad45b980ba35187e807178e3f9e3b008d))


### Chores

* [[IOAPPFD0-80](https://pagopa.atlassian.net/browse/IOAPPFD0-80)] Upgrades react-native to 0.69.9 ([#4514](https://github.com/pagopa/io-app/issues/4514)) ([75c44c4](https://github.com/pagopa/io-app/commit/75c44c44ed7b38c4fa320fa6d21c22e64d9e4f6a))
* [[IOPID-167](https://pagopa.atlassian.net/browse/IOPID-167)] TestAuthenticationScreen UI Refinement ([#4571](https://github.com/pagopa/io-app/issues/4571)) ([db35afe](https://github.com/pagopa/io-app/commit/db35afe7f31dd9ed098d5c75ec0d119e84dfd7c8)), closes [/github.com/pagopa/io-app/pull/4571/files#diff-b215994f68a368f1dc322f668b2937aeede527cbaa9242f10a9896526d1982](https://github.com/pagopa//github.com/pagopa/io-app/pull/4571/files/issues/diff-b215994f68a368f1dc322f668b2937aeede527cbaa9242f10a9896526d1982) [/github.com/pagopa/io-app/pull/4571/files#diff-7d599e5ee6dea19a2231e4a0e43ca1cc92d8d9680a2c6d7390e44999da2baf10](https://github.com/pagopa//github.com/pagopa/io-app/pull/4571/files/issues/diff-7d599e5ee6dea19a2231e4a0e43ca1cc92d8d9680a2c6d7390e44999da2baf10) [/github.com/pagopa/io-app/pull/4571/files#diff-54190256bc3cfec139b2b7e5e70c221f05d09fa8c9650ec95a3b38f6c9c36d91](https://github.com/pagopa//github.com/pagopa/io-app/pull/4571/files/issues/diff-54190256bc3cfec139b2b7e5e70c221f05d09fa8c9650ec95a3b38f6c9c36d91) [/github.com/pagopa/io-app/pull/4571/files#diff-8f675a5e21b9a99d7ec5d3e2bb2cf950abb463a4e0e9525b5286035567ca87a8](https://github.com/pagopa//github.com/pagopa/io-app/pull/4571/files/issues/diff-8f675a5e21b9a99d7ec5d3e2bb2cf950abb463a4e0e9525b5286035567ca87a8) [/github.com/pagopa/io-app/pull/4571/files#diff-6286d90afa4e0d1ffb5531596558295d753f7b1d0831d4d1e8448eef9d90fd32](https://github.com/pagopa//github.com/pagopa/io-app/pull/4571/files/issues/diff-6286d90afa4e0d1ffb5531596558295d753f7b1d0831d4d1e8448eef9d90fd32) [/github.com/pagopa/io-app/pull/4571/files#diff-67816cf28cc48675238d98a2f9eb645014f1c8c4dd5cea88c7cb6478056a274](https://github.com/pagopa//github.com/pagopa/io-app/pull/4571/files/issues/diff-67816cf28cc48675238d98a2f9eb645014f1c8c4dd5cea88c7cb6478056a274)
* **Firma con IO:** [[SFEQS-1629](https://pagopa.atlassian.net/browse/SFEQS-1629)] Add zendesk fci custom field id ([#4572](https://github.com/pagopa/io-app/issues/4572)) ([6994fb2](https://github.com/pagopa/io-app/commit/6994fb27828850a5a3236ca3b3cf30806002180b))
* **IDPay:** [[IODPAY-214](https://pagopa.atlassian.net/browse/IODPAY-214)] IDPay Initiative status labels in details screen ([#4557](https://github.com/pagopa/io-app/issues/4557)) ([ab0b594](https://github.com/pagopa/io-app/commit/ab0b594bb46e2ecac039fc9695726cd7ed4b7872))

## [2.31.0-rc.0](https://github.com/pagopa/io-app/compare/2.30.0-rc.2...2.31.0-rc.0) (2023-04-21)


### Bug Fixes

* [[IOAPPFD0-87](https://pagopa.atlassian.net/browse/IOAPPFD0-87)] CIE iOS button check in CircleCI ([#4560](https://github.com/pagopa/io-app/issues/4560)) ([37f0f87](https://github.com/pagopa/io-app/commit/37f0f87155876e6a3b56399f0cb5f5907e24ef98))
* [[IOAPPFD0-88](https://pagopa.atlassian.net/browse/IOAPPFD0-88)] Keychain error event tracked without reason parameter ([#4561](https://github.com/pagopa/io-app/issues/4561)) ([ad1e6ba](https://github.com/pagopa/io-app/commit/ad1e6bade2ac970ac3e9534b1fdc5ee2da5235fe))
* **IDPay:** [[IODPAY-102](https://pagopa.atlassian.net/browse/IODPAY-102)] Add service info header in IDPay onboarding screen ([#4536](https://github.com/pagopa/io-app/issues/4536)) ([fafc222](https://github.com/pagopa/io-app/commit/fafc2223f964827a767167da60146ea449b21c2c))
* **IDPay:** [[IODPAY-102](https://pagopa.atlassian.net/browse/IODPAY-102)] Add service info header in IDPay onboarding screen ([#4536](https://github.com/pagopa/io-app/issues/4536)) ([c767f60](https://github.com/pagopa/io-app/commit/c767f60e88ee3102bd515a9ea926a5f71641783c))
* **IDPay:** [[IODPAY-131](https://pagopa.atlassian.net/browse/IODPAY-131)] Add ToS and privacy links in onboarding screen ([#4535](https://github.com/pagopa/io-app/issues/4535)) ([ffb37b1](https://github.com/pagopa/io-app/commit/ffb37b16056fbfa56c9d70170138a35d8af215a1))
* **IDPay:** [[IODPAY-179](https://pagopa.atlassian.net/browse/IODPAY-179),[IODPAY-180](https://pagopa.atlassian.net/browse/IODPAY-180)] Add support for gesture navigation in IDPay screens ([#4496](https://github.com/pagopa/io-app/issues/4496)) ([7646673](https://github.com/pagopa/io-app/commit/764667346b7b6e401748d13cade157165af2a9a3)), closes [/github.com/pagopa/io-app/pull/4496/files#diff-0dc7659813959cbc98d6bc40b91064d21bd75497ce8e4ee693f7edc1364522d9](https://github.com/pagopa//github.com/pagopa/io-app/pull/4496/files/issues/diff-0dc7659813959cbc98d6bc40b91064d21bd75497ce8e4ee693f7edc1364522d9) [/github.com/pagopa/io-app/pull/4496/files#diff-4a7124c38069898da2f4f3be7be79f02e4e9dda5586f5653d8cd4a2c0e88c0a4](https://github.com/pagopa//github.com/pagopa/io-app/pull/4496/files/issues/diff-4a7124c38069898da2f4f3be7be79f02e4e9dda5586f5653d8cd4a2c0e88c0a4) [/github.com/pagopa/io-app/pull/4496/files#diff-01b5ae5ce43bd13eb4995f7b94f39e84f2b77491d85513f111a2582d06e06115](https://github.com/pagopa//github.com/pagopa/io-app/pull/4496/files/issues/diff-01b5ae5ce43bd13eb4995f7b94f39e84f2b77491d85513f111a2582d06e06115) [/github.com/pagopa/io-app/pull/4496/files#diff-8ffd33dd28dd9183ce57e6c092f399f95ee4843340c184fe84f0659ed9a1b66](https://github.com/pagopa//github.com/pagopa/io-app/pull/4496/files/issues/diff-8ffd33dd28dd9183ce57e6c092f399f95ee4843340c184fe84f0659ed9a1b66) [/github.com/pagopa/io-app/pull/4496/files#diff-8a18070c46b39fbc529f59f2aa7470cc7515377c28243bfa0a0ace8ab7dfc26](https://github.com/pagopa//github.com/pagopa/io-app/pull/4496/files/issues/diff-8a18070c46b39fbc529f59f2aa7470cc7515377c28243bfa0a0ace8ab7dfc26) [/github.com/pagopa/io-app/pull/4496/files#diff-22cbb26b3f180921c8f7d1d86041c6270e1999f2f26163896a19ee3d80ad5c9](https://github.com/pagopa//github.com/pagopa/io-app/pull/4496/files/issues/diff-22cbb26b3f180921c8f7d1d86041c6270e1999f2f26163896a19ee3d80ad5c9) [/github.com/pagopa/io-app/pull/4496/files#diff-901fe4cd9014838a5f330338e00a7407e2163892d29ca5b564b2e9a98c61005](https://github.com/pagopa//github.com/pagopa/io-app/pull/4496/files/issues/diff-901fe4cd9014838a5f330338e00a7407e2163892d29ca5b564b2e9a98c61005) [/github.com/pagopa/io-app/pull/4496/files#diff-db9ceb1e0e2403ec9e630d9d576d9f3c8b920b4673c89f09fd4eced4643a65](https://github.com/pagopa//github.com/pagopa/io-app/pull/4496/files/issues/diff-db9ceb1e0e2403ec9e630d9d576d9f3c8b920b4673c89f09fd4eced4643a65) [/github.com/pagopa/io-app/pull/4496/files#diff-d338097022fceafc817f7828f772391496fdc78a90f24646044c665e8ba2bb67](https://github.com/pagopa//github.com/pagopa/io-app/pull/4496/files/issues/diff-d338097022fceafc817f7828f772391496fdc78a90f24646044c665e8ba2bb67) [/github.com/pagopa/io-app/pull/4496/files#diff-1af1026b4e387e27a8b35f3923bfeb5400e10f3b01e86a831ad5df8ebee9d0d7](https://github.com/pagopa//github.com/pagopa/io-app/pull/4496/files/issues/diff-1af1026b4e387e27a8b35f3923bfeb5400e10f3b01e86a831ad5df8ebee9d0d7)
* **IDPay:** [[IODPAY-189](https://pagopa.atlassian.net/browse/IODPAY-189)] Fix long names in IDPay initiative details screen ([#4537](https://github.com/pagopa/io-app/issues/4537)) ([8c5de95](https://github.com/pagopa/io-app/commit/8c5de951f683ae3f1f1a1e83e005f011e3806d43))
* **IDPay:** [[IODPAY-211](https://pagopa.atlassian.net/browse/IODPAY-211)] Update IDPay API specs ([#4532](https://github.com/pagopa/io-app/issues/4532)) ([f7deb01](https://github.com/pagopa/io-app/commit/f7deb01b298d86cf1f4a13c5d41fd0c429cdf38a))


### Chores

* [[IOPID-94](https://pagopa.atlassian.net/browse/IOPID-94)] Add Lollipop Playground ([#4545](https://github.com/pagopa/io-app/issues/4545)) ([51b4ec8](https://github.com/pagopa/io-app/commit/51b4ec891d905954ed4c947c3d435de5abf31026)), closes [/github.com/pagopa/io-app/pull/4545/files#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519](https://github.com/pagopa//github.com/pagopa/io-app/pull/4545/files/issues/diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519) [/github.com/pagopa/io-app/pull/4545/files#diff-f74e1d5ec082224b0319d628738f4276acd718325ec8adf1b024edcf831d054](https://github.com/pagopa//github.com/pagopa/io-app/pull/4545/files/issues/diff-f74e1d5ec082224b0319d628738f4276acd718325ec8adf1b024edcf831d054) [/github.com/pagopa/io-app/pull/4545/files#diff-d1d3dd0d4f65dbaffcc58b5b41f71abc080812ff110a7195addc8c960392163](https://github.com/pagopa//github.com/pagopa/io-app/pull/4545/files/issues/diff-d1d3dd0d4f65dbaffcc58b5b41f71abc080812ff110a7195addc8c960392163) [/github.com/pagopa/io-app/pull/4545/files#diff-7177b8ec63fef44a3ace9d084515adeefd1a8979d89f9cc3030989173797799](https://github.com/pagopa//github.com/pagopa/io-app/pull/4545/files/issues/diff-7177b8ec63fef44a3ace9d084515adeefd1a8979d89f9cc3030989173797799) [/github.com/pagopa/io-app/pull/4545/files#diff-fde597880587bbd6b7df5084df5a2bb4020db9a4d14f00b29967f3faf58ad7a1](https://github.com/pagopa//github.com/pagopa/io-app/pull/4545/files/issues/diff-fde597880587bbd6b7df5084df5a2bb4020db9a4d14f00b29967f3faf58ad7a1) [/github.com/pagopa/io-app/pull/4545/files#diff-f3f50220ac440ed85361a813ef5aff2d66dc324b38c8d47f9de541651342fb41](https://github.com/pagopa//github.com/pagopa/io-app/pull/4545/files/issues/diff-f3f50220ac440ed85361a813ef5aff2d66dc324b38c8d47f9de541651342fb41) [/github.com/pagopa/io-app/pull/4545/files#diff-950467b6141738ddf5a35aa966af7ea9731f4f70825f4fcf2e3d62f33f7ac547](https://github.com/pagopa//github.com/pagopa/io-app/pull/4545/files/issues/diff-950467b6141738ddf5a35aa966af7ea9731f4f70825f4fcf2e3d62f33f7ac547) [/github.com/pagopa/io-app/pull/4545/files#diff-de3c1a64bcc8fdca4c8dbc5d62dba36c8c5ded27255052ecc6526e614b1e8f5](https://github.com/pagopa//github.com/pagopa/io-app/pull/4545/files/issues/diff-de3c1a64bcc8fdca4c8dbc5d62dba36c8c5ded27255052ecc6526e614b1e8f5)
* Update profile app info URLs ([#4544](https://github.com/pagopa/io-app/issues/4544)) ([e310246](https://github.com/pagopa/io-app/commit/e310246ebc110c8d6f06d2a71fa43a08106686a2))
* **deps:** bump vm2 from 3.9.11 to 3.9.17 ([#4552](https://github.com/pagopa/io-app/issues/4552)) ([c66b281](https://github.com/pagopa/io-app/commit/c66b2811da8e07f0744d569c12cdd8c7e305f37c)), closes [patriksimek/vm2#516](https://github.com/patriksimek/vm2/issues/516) [patriksimek/vm2#515](https://github.com/patriksimek/vm2/issues/515) [#506](https://github.com/pagopa/io-app/issues/506) [#505](https://github.com/pagopa/io-app/issues/505)
* **deps:** bump xml2js from 0.4.23 to 0.5.0 ([#4525](https://github.com/pagopa/io-app/issues/4525)) ([20054cd](https://github.com/pagopa/io-app/commit/20054cda7ecd6d05d87617972f6e134abf955a6a))
* **IDPay:** [[IODPAY-177](https://pagopa.atlassian.net/browse/IODPAY-177)] Add ability to enroll multiple instrument concurrently ([#4471](https://github.com/pagopa/io-app/issues/4471)) ([cc6311e](https://github.com/pagopa/io-app/commit/cc6311ea6fc0402d95f327061666239597fd7ca3))
* **IDPay:** [[IODPAY-194](https://pagopa.atlassian.net/browse/IODPAY-194)] Add skeleton in IDPay initiative details screen ([#4548](https://github.com/pagopa/io-app/issues/4548)) ([ff5b391](https://github.com/pagopa/io-app/commit/ff5b3918fbcc8b54ef84b7d110331261e224d1f5))
* **IDPay:** [[IODPAY-213](https://pagopa.atlassian.net/browse/IODPAY-213)] Add skeleton in IDPay initiative operation list screen ([#4550](https://github.com/pagopa/io-app/issues/4550)) ([270c4ad](https://github.com/pagopa/io-app/commit/270c4ad4553f07cd81b03d30ab2de206113655d1))
* [[IOAPPFD0-82](https://pagopa.atlassian.net/browse/IOAPPFD0-82)] Add `Icon` to the new `ButtonSolid` and `ButtonOutline` components ([#4542](https://github.com/pagopa/io-app/issues/4542)) ([f8dc09e](https://github.com/pagopa/io-app/commit/f8dc09e8bde70a830ec93bb8a29740f7a282efaf))

## [2.30.0-rc.2](https://github.com/pagopa/io-app/compare/2.30.0-rc.1...2.30.0-rc.2) (2023-04-18)


### Features

* **Firma con IO:** [[SFEQS-1460](https://pagopa.atlassian.net/browse/SFEQS-1460)] Add signature requests list screen ([#4533](https://github.com/pagopa/io-app/issues/4533)) ([f41b9c3](https://github.com/pagopa/io-app/commit/f41b9c31baa5ede98b0e696caf1ef210d34d8ded))
* **Firma con IO:** [[SFEQS-1461](https://pagopa.atlassian.net/browse/SFEQS-1461)] Adds Zendesk permission label to handle request about FCI issue ([#4527](https://github.com/pagopa/io-app/issues/4527)) ([ed6bb1d](https://github.com/pagopa/io-app/commit/ed6bb1da6bdfa7de90f678d7c85ce1fdc8682ef9))
* **Firma con IO:** [[SFEQS-1462](https://pagopa.atlassian.net/browse/SFEQS-1462)] Update Error component introducing retry and assistance CTA ([#4529](https://github.com/pagopa/io-app/issues/4529)) ([ecce429](https://github.com/pagopa/io-app/commit/ecce4299893251923ea89188cc002fd46288486f))
* **Firma con IO:** [[SFEQS-1536](https://pagopa.atlassian.net/browse/SFEQS-1536)] Add a modal screen to show the signature field on the document ([#4498](https://github.com/pagopa/io-app/issues/4498)) ([d613657](https://github.com/pagopa/io-app/commit/d613657ec798615fc4c4fd455e8f752518bb81a7))
* **Firma con IO:** [[SFEQS-1591](https://pagopa.atlassian.net/browse/SFEQS-1591)] Add signature requests list store and reducer ([#4516](https://github.com/pagopa/io-app/issues/4516)) ([dab271d](https://github.com/pagopa/io-app/commit/dab271d359a0460ebc423177d752f8246c7be827))
* **Firma con IO:** [[SFEQS-1595](https://pagopa.atlassian.net/browse/SFEQS-1595)] Refactor screens of the signing flow ([#4547](https://github.com/pagopa/io-app/issues/4547)) ([0145b3f](https://github.com/pagopa/io-app/commit/0145b3fc896cb8c71005b38c7318730d4732890c))
* [[IOCOM-133](https://pagopa.atlassian.net/browse/IOCOM-133)] Replaces custom PN activation decoder with autogenerated one ([#4540](https://github.com/pagopa/io-app/issues/4540)) ([a276bb1](https://github.com/pagopa/io-app/commit/a276bb140698d329aaf91e03f20916184dff4ff6))
* [[IOPID-142](https://pagopa.atlassian.net/browse/IOPID-142)] Remove IntesaID and update fallback IdP list and FAQs ([#4538](https://github.com/pagopa/io-app/issues/4538)) ([78c3fc0](https://github.com/pagopa/io-app/commit/78c3fc0d7c101a57f7622e603fd2ec846e4d7b0f)), closes [/github.com/pagopa/io-app/pull/4538/files#diff-b497c511ebcce245d32a97d61f147ce3bf39ff56a0f81c2d18f0372f1d231](https://github.com/pagopa//github.com/pagopa/io-app/pull/4538/files/issues/diff-b497c511ebcce245d32a97d61f147ce3bf39ff56a0f81c2d18f0372f1d231) [/github.com/pagopa/io-app/pull/4538/files#diff-f37f4a885f214ce178190c11459eeb758497fc053dcb09be14a920ddf398f768](https://github.com/pagopa//github.com/pagopa/io-app/pull/4538/files/issues/diff-f37f4a885f214ce178190c11459eeb758497fc053dcb09be14a920ddf398f768) [/github.com/pagopa/io-app/pull/4538/files#diff-47fdda432bd31e39ac31a763f8b9f22be178c46f5dde9b191004853f14eae75](https://github.com/pagopa//github.com/pagopa/io-app/pull/4538/files/issues/diff-47fdda432bd31e39ac31a763f8b9f22be178c46f5dde9b191004853f14eae75) [/github.com/pagopa/io-app/pull/4538/files#diff-86de343215580a033b60cfdf4e433b37976081c16ce6a15b5e0398d5bd5de453](https://github.com/pagopa//github.com/pagopa/io-app/pull/4538/files/issues/diff-86de343215580a033b60cfdf4e433b37976081c16ce6a15b5e0398d5bd5de453) [/github.com/pagopa/io-app/pull/4538/files#diff-12b47cc1018a227a24dbea5a8e63915abe2a579d2b8d8cd64b24ff123538d9e0](https://github.com/pagopa//github.com/pagopa/io-app/pull/4538/files/issues/diff-12b47cc1018a227a24dbea5a8e63915abe2a579d2b8d8cd64b24ff123538d9e0)
* **Firma con IO:** [[SFEQS-1592](https://pagopa.atlassian.net/browse/SFEQS-1592)] Add signature requests list saga ([#4517](https://github.com/pagopa/io-app/issues/4517)) ([c59fb39](https://github.com/pagopa/io-app/commit/c59fb392bd5d61fea9e199f5f53a9d9886e7d3cf))


### Bug Fixes

* [[IABT-1456](https://pagopa.atlassian.net/browse/IABT-1456)] Update lollipop migration ([#4549](https://github.com/pagopa/io-app/issues/4549)) ([5025e2b](https://github.com/pagopa/io-app/commit/5025e2b4e5c6fc9920d9d549c7ede26bd5104eef))
* **Firma con IO:** [[SFEQS-1493](https://pagopa.atlassian.net/browse/SFEQS-1493)] Use right pictogram for request already signed ([#4521](https://github.com/pagopa/io-app/issues/4521)) ([fa24754](https://github.com/pagopa/io-app/commit/fa2475474a372909d4db7746e2759706fd2b0d2f))
* **IDPay:** [[IODPAY-106](https://pagopa.atlassian.net/browse/IODPAY-106)] Added DPR link to bool prerequisites screen ([#4487](https://github.com/pagopa/io-app/issues/4487)) ([cc06231](https://github.com/pagopa/io-app/commit/cc06231514a615cca959329841e2752daa345428))
* **IDPay:** [[IODPAY-122](https://pagopa.atlassian.net/browse/IODPAY-122)] Fix instrument enrollment CTA loading state ([#4518](https://github.com/pagopa/io-app/issues/4518)) ([8557521](https://github.com/pagopa/io-app/commit/8557521e10949c5203adee6f7876896efec85b8d))
* **IDPay:** [[IODPAY-188](https://pagopa.atlassian.net/browse/IODPAY-188),[IODPAY-208](https://pagopa.atlassian.net/browse/IODPAY-208)] Fix scroll view in IDPay initiative details screen ([#4524](https://github.com/pagopa/io-app/issues/4524)) ([a853aca](https://github.com/pagopa/io-app/commit/a853aca450e4dc3d48f4394c1a6e82beff96362b))
* **IDPay:** [[IODPAY-193](https://pagopa.atlassian.net/browse/IODPAY-193)] Missing I18n key for network error in initiative details screen ([#4510](https://github.com/pagopa/io-app/issues/4510)) ([9a15dd2](https://github.com/pagopa/io-app/commit/9a15dd217ae262be116ba49050a0b6f81e364b30))
* **IDPay:** [[IODPAY-198](https://pagopa.atlassian.net/browse/IODPAY-198)] Unnecessary api calls in credit card details ([#4493](https://github.com/pagopa/io-app/issues/4493)) ([c779aa4](https://github.com/pagopa/io-app/commit/c779aa48d1376ef2a16aa336a30261449c2dd897))
* **IDPay:** [[IODPAY-209](https://pagopa.atlassian.net/browse/IODPAY-209)] Dirty data in card details screen ([#4531](https://github.com/pagopa/io-app/issues/4531)) ([ad7197c](https://github.com/pagopa/io-app/commit/ad7197c1988c861f44b8f2831d8094472f5025bd))


### Chores

* [[IA-906](https://pagopa.atlassian.net/browse/IA-906)] Update `tosVersion` to `4.5` ([#4534](https://github.com/pagopa/io-app/issues/4534)) ([d2d3272](https://github.com/pagopa/io-app/commit/d2d3272e73fcd00939ec6b98790d0364362def2d))
* **Firma con IO:** [[SFEQS-1233](https://pagopa.atlassian.net/browse/SFEQS-1233)] Update to use RNBlobUtil and to improve performance on downloading activity ([#4434](https://github.com/pagopa/io-app/issues/4434)) ([f5529a3](https://github.com/pagopa/io-app/commit/f5529a365eb4e29905e552897daf7d62681e9cf5))
* **Firma con IO:** [[SFEQS-1589](https://pagopa.atlassian.net/browse/SFEQS-1589)] Update FCI definitions introducing dossier title and signature requests list ([#4515](https://github.com/pagopa/io-app/issues/4515)) ([26b1f5d](https://github.com/pagopa/io-app/commit/26b1f5d5c108b68c6eb0d9517c644e0049b4e42c))
* **Firma con IO:** [[SFEQS-1600](https://pagopa.atlassian.net/browse/SFEQS-1600)] Added english translation ([#4539](https://github.com/pagopa/io-app/issues/4539)) ([7134068](https://github.com/pagopa/io-app/commit/7134068f3e04e092663e2ccc2d9ba0039744e9b5))
* **Firma con IO:** [[SFEQS-1608](https://pagopa.atlassian.net/browse/SFEQS-1608)] Update locales for clauses type ([#4543](https://github.com/pagopa/io-app/issues/4543)) ([4bcae30](https://github.com/pagopa/io-app/commit/4bcae303f8d1b9825f389846b37fe3f226a3c5b3))

## [2.30.0-rc.1](https://github.com/pagopa/io-app/compare/2.30.0-rc.0...2.30.0-rc.1) (2023-04-06)


### Features

* **IDPay:** [[IODPAY-206](https://pagopa.atlassian.net/browse/IODPAY-206)] IDPay Onboarding playground redesign ([#4506](https://github.com/pagopa/io-app/issues/4506)) ([98c015c](https://github.com/pagopa/io-app/commit/98c015cf885905ba2c8f1dca613fd1d327e1f1c0))


### Bug Fixes

* [[IABT-1452](https://pagopa.atlassian.net/browse/IABT-1452)] Test account login loop ([#4512](https://github.com/pagopa/io-app/issues/4512)) ([f0866a9](https://github.com/pagopa/io-app/commit/f0866a9d0397d2b1d696ecd981c878bd5e3bfa81))
* [[IAI-275](https://pagopa.atlassian.net/browse/IAI-275)] Fix `BaseHeader` UI regression ([#4519](https://github.com/pagopa/io-app/issues/4519)) ([80c3469](https://github.com/pagopa/io-app/commit/80c34697e0eb5b85f68820434a39681b4294d725))


### Chores

* [[IAI-217](https://pagopa.atlassian.net/browse/IAI-217)] Replace legacy `Text` components with the new ones ([#4321](https://github.com/pagopa/io-app/issues/4321)) ([17b2dbd](https://github.com/pagopa/io-app/commit/17b2dbd182342508e168c647c7166499be78f3e8))
* [[IOAPPFD0-22](https://pagopa.atlassian.net/browse/IOAPPFD0-22)] Remove isOnboardingCompleted deprecated utility ([#4303](https://github.com/pagopa/io-app/issues/4303)) ([c405a36](https://github.com/pagopa/io-app/commit/c405a36cc2066ce81d331c750f1f1e4ad989cd0e))
* [IOAPPFD0-67,IOAPPFD0-66] Add mixpanel event for keychain get failure ([#4494](https://github.com/pagopa/io-app/issues/4494)) ([25cf3bf](https://github.com/pagopa/io-app/commit/25cf3bf18c5aa98a5b2a6af7480b1d640b6e25b1))

## [2.30.0-rc.0](https://github.com/pagopa/io-app/compare/2.29.0-rc.4...2.30.0-rc.0) (2023-04-04)


### Features

* **Firma con IO:** [[SFEQS-1044](https://pagopa.atlassian.net/browse/SFEQS-1044)] Add bottom sheet to check/activate service preferences ([#4508](https://github.com/pagopa/io-app/issues/4508)) ([8e8cd78](https://github.com/pagopa/io-app/commit/8e8cd78e35bfa9732939699882d73bc9f3a69d2a))
* **IDPay:** [[IODPAY-172](https://pagopa.atlassian.net/browse/IODPAY-172)] Details page alert component ([#4444](https://github.com/pagopa/io-app/issues/4444)) ([c23c86e](https://github.com/pagopa/io-app/commit/c23c86e882835dbf129c463371af1f17c1e47ab2))


### Bug Fixes

* [IABT-1443,IOAPPFD0-60] Invalid characters when pasting OFC ([#4480](https://github.com/pagopa/io-app/issues/4480)) ([09d2e78](https://github.com/pagopa/io-app/commit/09d2e789225d880cf30b684983b831a88e1e2b7b))
* [[IOAPPFD0-74](https://pagopa.atlassian.net/browse/IOAPPFD0-74)] Fix regression on multiple attachment selection not working on PN ([#4501](https://github.com/pagopa/io-app/issues/4501)) ([3724ac1](https://github.com/pagopa/io-app/commit/3724ac1e12d992f30e417bd45961a2f0f0a50fa0))
* [[LLK-71](https://pagopa.atlassian.net/browse/LLK-71)] Fix test login ([#4509](https://github.com/pagopa/io-app/issues/4509)) ([f4af3d5](https://github.com/pagopa/io-app/commit/f4af3d557f59798783d7bc694bc4be4d314ed6ca))
* **IDPay:** [[IODPAY-124](https://pagopa.atlassian.net/browse/IODPAY-124)] Fix scroll behavior in instrument and IBAN enrollment screen ([#4497](https://github.com/pagopa/io-app/issues/4497)) ([bbbab94](https://github.com/pagopa/io-app/commit/bbbab947f67f968574413bd6cd68f14f0649621a)), closes [/github.com/pagopa/io-app/pull/4497/files#diff-e57ad3d99b7dbdc319850166ea2e2c79d356a9c9ebfa3606c0ed51d139289157](https://github.com/pagopa//github.com/pagopa/io-app/pull/4497/files/issues/diff-e57ad3d99b7dbdc319850166ea2e2c79d356a9c9ebfa3606c0ed51d139289157) [/github.com/pagopa/io-app/pull/4497/files#diff-a48aa011cee1d767d43c266ca5f3006ab59ff7aa05d1eee291f2866fbfb39085](https://github.com/pagopa//github.com/pagopa/io-app/pull/4497/files/issues/diff-a48aa011cee1d767d43c266ca5f3006ab59ff7aa05d1eee291f2866fbfb39085)
* **IDPay:** [[IODPAY-191](https://pagopa.atlassian.net/browse/IODPAY-191)] InitiativesList scroll  ([#4500](https://github.com/pagopa/io-app/issues/4500)) ([9f68416](https://github.com/pagopa/io-app/commit/9f68416f9cb42775527da838a48c91a452092e68))


### Chores

* [[IOAPPFD0-75](https://pagopa.atlassian.net/browse/IOAPPFD0-75)] Add public key thumbprint in Profile debug info ([#4504](https://github.com/pagopa/io-app/issues/4504)) ([dab9ae6](https://github.com/pagopa/io-app/commit/dab9ae655d36a31574e2eaf19adf9bfab79cf18b)), closes [/github.com/pagopa/io-app/pull/4504/files#diff-e70e8137cd500fa6551b90da08d74031c1c74ef09f7b414cdbec642e72acbf4](https://github.com/pagopa//github.com/pagopa/io-app/pull/4504/files/issues/diff-e70e8137cd500fa6551b90da08d74031c1c74ef09f7b414cdbec642e72acbf4) [/github.com/pagopa/io-app/pull/4504/files#diff-c62d0c1b763402b50132882e178a733c55d5dc599fb1cc6f4d41bf3680decd9](https://github.com/pagopa//github.com/pagopa/io-app/pull/4504/files/issues/diff-c62d0c1b763402b50132882e178a733c55d5dc599fb1cc6f4d41bf3680decd9) [/github.com/pagopa/io-app/pull/4504/files#diff-f54ddab5813a42b9135c11cbd42b931854b83272a0763ec2fd2b759f8ede6f09](https://github.com/pagopa//github.com/pagopa/io-app/pull/4504/files/issues/diff-f54ddab5813a42b9135c11cbd42b931854b83272a0763ec2fd2b759f8ede6f09) [/github.com/pagopa/io-app/pull/4504/files#diff-f54ddab5813a42b9135c11cbd42b931854b83272a0763ec2fd2b759f8ede6f09](https://github.com/pagopa//github.com/pagopa/io-app/pull/4504/files/issues/diff-f54ddab5813a42b9135c11cbd42b931854b83272a0763ec2fd2b759f8ede6f09) [/github.com/pagopa/io-app/pull/4504/files#diff-de3c1a64bcc8fdca4c8dbc5d62dba36c8c5ded27255052ecc6526e614b1e8f5](https://github.com/pagopa//github.com/pagopa/io-app/pull/4504/files/issues/diff-de3c1a64bcc8fdca4c8dbc5d62dba36c8c5ded27255052ecc6526e614b1e8f5)
* [[IOAPPFD0-76](https://pagopa.atlassian.net/browse/IOAPPFD0-76)] Update status colours used in the new `Alert` component ([#4505](https://github.com/pagopa/io-app/issues/4505)) ([6b0e9ab](https://github.com/pagopa/io-app/commit/6b0e9aba3dd4078f849d9778584ef071ba72afa3))
* [[IOAPPFD0-77](https://pagopa.atlassian.net/browse/IOAPPFD0-77)] Update new icons, add new ones ([#4511](https://github.com/pagopa/io-app/issues/4511)) ([205d21b](https://github.com/pagopa/io-app/commit/205d21b874ea94d7132e77e497a01528eee10daf))
* [[IOAPPFD0-79](https://pagopa.atlassian.net/browse/IOAPPFD0-79)] update e2e test for manual payments ([#4513](https://github.com/pagopa/io-app/issues/4513)) ([7351a16](https://github.com/pagopa/io-app/commit/7351a16fbb7653a83377be5d947bf158d66096ca))
* **Firma con IO:** [[SFEQS-1509](https://pagopa.atlassian.net/browse/SFEQS-1509)] Refactor using auto generated client ([#4482](https://github.com/pagopa/io-app/issues/4482)) ([39a14c6](https://github.com/pagopa/io-app/commit/39a14c6d6b0858860598dda6810854a70bd98abe))
* **Firma con IO:** [[SFEQS-1578](https://pagopa.atlassian.net/browse/SFEQS-1578)] Update FCI definitions ([#4507](https://github.com/pagopa/io-app/issues/4507)) ([1ca568d](https://github.com/pagopa/io-app/commit/1ca568ddb9cbf9d8555414a5bf9d203d932a20da))

## [2.29.0-rc.4](https://github.com/pagopa/io-app/compare/2.29.0-rc.3...2.29.0-rc.4) (2023-03-30)


### Features

* [[IA-186](https://pagopa.atlassian.net/browse/IA-186)] Scroll to top ([#4422](https://github.com/pagopa/io-app/issues/4422)) ([b60e9fb](https://github.com/pagopa/io-app/commit/b60e9fbc1940978ee61a8c2b807bffcdad5c4389))
* **Firma con IO:** [[SFEQS-1275](https://pagopa.atlassian.net/browse/SFEQS-1275)] Update error screens copy ([#4484](https://github.com/pagopa/io-app/issues/4484)) ([76be53b](https://github.com/pagopa/io-app/commit/76be53b42570df3eb20e26b60edd1509f6e34e35))
* [[IGP-99](https://pagopa.atlassian.net/browse/IGP-99)] Refactor `useAttachmentDownload` ([#4486](https://github.com/pagopa/io-app/issues/4486)) ([bf6a418](https://github.com/pagopa/io-app/commit/bf6a418db3bcf0ebd61314b59f77e1635c2aa362))


### Bug Fixes

* [[IAI-273](https://pagopa.atlassian.net/browse/IAI-273)] Fix UI regression that occurred in the `BaseHeader` component ([#4490](https://github.com/pagopa/io-app/issues/4490)) ([6fdd9ce](https://github.com/pagopa/io-app/commit/6fdd9ce597f0e230508a9daf435db2055081c991))
* **IDPay:** [[IODPAY-115](https://pagopa.atlassian.net/browse/IODPAY-115)] New placeholder in IBAN onboarding page ([#4483](https://github.com/pagopa/io-app/issues/4483)) ([15d9998](https://github.com/pagopa/io-app/commit/15d9998e66c48e9993b75ffa9a1b3e4befd54b77))


### Chores

* [[IOAPPFD0-45](https://pagopa.atlassian.net/browse/IOAPPFD0-45)] Add next iteration of the current buttons ([#4435](https://github.com/pagopa/io-app/issues/4435)) ([24d2d1b](https://github.com/pagopa/io-app/commit/24d2d1b7f01e2041f8d9c9ceb8d243debe2b10e9))
* [[IOAPPFD0-62](https://pagopa.atlassian.net/browse/IOAPPFD0-62)] Add the new `Haptic Feedback` page to the Design System ([#4485](https://github.com/pagopa/io-app/issues/4485)) ([6974424](https://github.com/pagopa/io-app/commit/6974424ff826dec331167e0c0979c24b6c8b5fdc))
* [[IOAPPFD0-69](https://pagopa.atlassian.net/browse/IOAPPFD0-69)] Update Readme with latest ruby and bundler versions ([#4492](https://github.com/pagopa/io-app/issues/4492)) ([917982e](https://github.com/pagopa/io-app/commit/917982ea3125940a0f2a6b6e4f06635386147f07))
* [[IOAPPFD0-73](https://pagopa.atlassian.net/browse/IOAPPFD0-73)] Add updated Podfile.lock ([#4499](https://github.com/pagopa/io-app/issues/4499)) ([4c7a4b3](https://github.com/pagopa/io-app/commit/4c7a4b398bd882ec7419d9ac58604096bce71801))
* [[LLK-63](https://pagopa.atlassian.net/browse/LLK-63)] LolliPoP login code refactored to share common functionalities ([#4453](https://github.com/pagopa/io-app/issues/4453)) ([424b2e2](https://github.com/pagopa/io-app/commit/424b2e24767e40041ca47aeffa31f4b2e9578f04))
* [[LLK-66](https://pagopa.atlassian.net/browse/LLK-66)] LP key login flow ([#4468](https://github.com/pagopa/io-app/issues/4468)) ([ca9e9f1](https://github.com/pagopa/io-app/commit/ca9e9f123c68f16ac67061a0f5316fd444c0d588))

## [2.29.0-rc.3](https://github.com/pagopa/io-app/compare/2.29.0-rc.2...2.29.0-rc.3) (2023-03-28)


### Bug Fixes

* **IDPay:** [[IODPAY-197](https://pagopa.atlassian.net/browse/IODPAY-197)] Fix infinite loading in card detail ([#4491](https://github.com/pagopa/io-app/issues/4491)) ([6be1070](https://github.com/pagopa/io-app/commit/6be10709e4db4818ebac5a7c07835aab54f732e0))

## [2.29.0-rc.2](https://github.com/pagopa/io-app/compare/2.29.0-rc.1...2.29.0-rc.2) (2023-03-28)


### Chores

* [[IOAPPFD0-61](https://pagopa.atlassian.net/browse/IOAPPFD0-61)] Fix an error during beta IPA upload using xCode 14.2 on fastlane's pilot step ([#4489](https://github.com/pagopa/io-app/issues/4489)) ([002e6ff](https://github.com/pagopa/io-app/commit/002e6ff9259fa8ed75326a6dd6f381d516ebfaad))

## [2.29.0-rc.1](https://github.com/pagopa/io-app/compare/2.29.0-rc.0...2.29.0-rc.1) (2023-03-27)


### Features

* **Firma con IO:** [[SFEQS-1402](https://pagopa.atlassian.net/browse/SFEQS-1402)] Generic error component refactoring with copy updates ([#4389](https://github.com/pagopa/io-app/issues/4389)) ([47572d6](https://github.com/pagopa/io-app/commit/47572d6f2faa766bfebd9a9239a85ed2fb304028))
* **Firma con IO:** [[SFEQS-1519](https://pagopa.atlassian.net/browse/SFEQS-1519)] Add metadata reducer ([#4457](https://github.com/pagopa/io-app/issues/4457)) ([5fe897f](https://github.com/pagopa/io-app/commit/5fe897fbbfa240b14a5d3034df39cbd033b3960f))
* **Firma con IO:** [[SFEQS-1520](https://pagopa.atlassian.net/browse/SFEQS-1520)] Update client with metadata ([#4473](https://github.com/pagopa/io-app/issues/4473)) ([3ffb5db](https://github.com/pagopa/io-app/commit/3ffb5db07d32da34fefee7a0d06ae7ee5c2a735e))
* **Firma con IO:** [[SFEQS-1535](https://pagopa.atlassian.net/browse/SFEQS-1535)] Update main FCI saga with metadata request ([#4475](https://github.com/pagopa/io-app/issues/4475)) ([102bd7e](https://github.com/pagopa/io-app/commit/102bd7ecf204b833459818d1e322a469cda1c5a2))


### Bug Fixes

* **IDPay:** [[IODPAY-183](https://pagopa.atlassian.net/browse/IODPAY-183)] Singular for payment methods i18n in initiative details page  ([#4479](https://github.com/pagopa/io-app/issues/4479)) ([0c299ab](https://github.com/pagopa/io-app/commit/0c299aba9df1fc3e2bcf92185775c4c79ba2dd5a))


### Chores

* [[IOAPPFD0-53](https://pagopa.atlassian.net/browse/IOAPPFD0-53)] Add the new icon set ([#4474](https://github.com/pagopa/io-app/issues/4474)) ([11b6e7a](https://github.com/pagopa/io-app/commit/11b6e7a809b7ae61edabb353d07ad6a32416dfc8))
* [[IOAPPFD0-61](https://pagopa.atlassian.net/browse/IOAPPFD0-61)] CircleCI iOS build upgraded to use xCode 14.2.0 ([#4481](https://github.com/pagopa/io-app/issues/4481)) ([1b10410](https://github.com/pagopa/io-app/commit/1b10410715d6f90becb2cfc53824060fcbb754dd))

## [2.29.0-rc.0](https://github.com/pagopa/io-app/compare/2.28.0-rc.2...2.29.0-rc.0) (2023-03-23)


### Features

* [[IGP-83](https://pagopa.atlassian.net/browse/IGP-83)] Fix "share" button label being trimmed on some Android devices ([#4477](https://github.com/pagopa/io-app/issues/4477)) ([26dca55](https://github.com/pagopa/io-app/commit/26dca5588801b9d0a08805420060ba19f6806b47))
* **Firma con IO:** [[SFEQS-1058](https://pagopa.atlassian.net/browse/SFEQS-1058)] Add email validation hook ([#4470](https://github.com/pagopa/io-app/issues/4470)) ([087efb8](https://github.com/pagopa/io-app/commit/087efb821c74124a7601e71aed3d0f776378b876))
* **IDPay:** [[IODPAY-110](https://pagopa.atlassian.net/browse/IODPAY-110)] Initiative card redesign ([#4436](https://github.com/pagopa/io-app/issues/4436)) ([02d2276](https://github.com/pagopa/io-app/commit/02d227695841c40fc475a540fc06fed22e893fcd))
* **IDPay:** [[IODPAY-129](https://pagopa.atlassian.net/browse/IODPAY-129)] Enable initiatives from instrument detail ([#4352](https://github.com/pagopa/io-app/issues/4352)) ([8ef5ee9](https://github.com/pagopa/io-app/commit/8ef5ee9d77b2cd3939fb0e8b112f8398e393b335))
* **IDPay:** [[IODPAY-162](https://pagopa.atlassian.net/browse/IODPAY-162)] Add instruments status polling in initiative configuration steps ([#4416](https://github.com/pagopa/io-app/issues/4416)) ([6dcdf0d](https://github.com/pagopa/io-app/commit/6dcdf0d8d4db044152a29b0e0478e2472dc1225c))
* [[IGP-97](https://pagopa.atlassian.net/browse/IGP-97)] Disclaimer removal before a document preview ([#4464](https://github.com/pagopa/io-app/issues/4464)) ([574bb61](https://github.com/pagopa/io-app/commit/574bb6155fd290bcd590eea468918b3c2a206e14))


### Bug Fixes

* [[IABT-1447](https://pagopa.atlassian.net/browse/IABT-1447)] Restore: services logos not updating on Android devices ([#4469](https://github.com/pagopa/io-app/issues/4469)) ([68cc342](https://github.com/pagopa/io-app/commit/68cc342f9ab05d4ac2f7667e80c97ad5604b5da8)), closes [pagopa/io-app#4465](https://github.com/pagopa/io-app/issues/4465)
* **IDPay:** [[IODPAY-173](https://pagopa.atlassian.net/browse/IODPAY-173)] Fix IDPay timeline operation amount sign ([#4440](https://github.com/pagopa/io-app/issues/4440)) ([b609b58](https://github.com/pagopa/io-app/commit/b609b58a405860d0552e9d8da5bd7cc94ce579e3))


### Chores

* [[IAI-264](https://pagopa.atlassian.net/browse/IAI-264)] Remove NativeBase's `View` component ([#4306](https://github.com/pagopa/io-app/issues/4306)) ([0cf951b](https://github.com/pagopa/io-app/commit/0cf951b35d6f0ed926914bff62f7e5ec4f8fd1ff))
* [[IAI-272](https://pagopa.atlassian.net/browse/IAI-272)] Remove extra space at the end of the `Messages` main screen ([#4476](https://github.com/pagopa/io-app/issues/4476)) ([b975885](https://github.com/pagopa/io-app/commit/b975885a0a2204192c2184d231a7671ea9d1c50f))
* [[IOAPPFD0-55](https://pagopa.atlassian.net/browse/IOAPPFD0-55)] Tests on ToS ([#4466](https://github.com/pagopa/io-app/issues/4466)) ([a25d33e](https://github.com/pagopa/io-app/commit/a25d33ed76f605a31ba03347beb7d7e6832bdecf))
* [[IOAPPFD0-59](https://pagopa.atlassian.net/browse/IOAPPFD0-59)] Add the new `Divider` component ([#4478](https://github.com/pagopa/io-app/issues/4478)) ([e727679](https://github.com/pagopa/io-app/commit/e727679000472d24196062988d77f2f8559800a4))

## [2.28.0-rc.2](https://github.com/pagopa/io-app/compare/2.28.0-rc.1...2.28.0-rc.2) (2023-03-17)


### Bug Fixes

* [[IABT-1447](https://pagopa.atlassian.net/browse/IABT-1447)] Revert: services logos not updating on Android devices ([#4465](https://github.com/pagopa/io-app/issues/4465)) ([c04db75](https://github.com/pagopa/io-app/commit/c04db757fe8737451040422bf2f99f1c0e060d3c)), closes [pagopa/io-app#4458](https://github.com/pagopa/io-app/issues/4458)
* [[IABT-1447](https://pagopa.atlassian.net/browse/IABT-1447)] Services logos not updating on Android devices ([#4458](https://github.com/pagopa/io-app/issues/4458)) ([1ebbd38](https://github.com/pagopa/io-app/commit/1ebbd38c24e42d7e6d569abfee11e6dafddb3bed))
* [[IOAPPFD0-50](https://pagopa.atlassian.net/browse/IOAPPFD0-50)] Crash when navigating out of a WebView on Android ([#4460](https://github.com/pagopa/io-app/issues/4460)) ([384f833](https://github.com/pagopa/io-app/commit/384f833e9f49713df5c97fb0afeffb6a720c81c8)), closes [/github.com/react-native-webview/react-native-webview/issues/811#issuecomment-570813204](https://github.com/pagopa//github.com/react-native-webview/react-native-webview/issues/811/issues/issuecomment-570813204)
* [[IOAPPFD0-54](https://pagopa.atlassian.net/browse/IOAPPFD0-54)] Refactor WebView style on `LocalServicesWebView` ([#4463](https://github.com/pagopa/io-app/issues/4463)) ([8e20797](https://github.com/pagopa/io-app/commit/8e20797442b23ceff5dafc6b0c637182e344f732))


### Chores

* [[IOAPPFD0-49](https://pagopa.atlassian.net/browse/IOAPPFD0-49)] Add dark mode support to the `Design System` section ([#4455](https://github.com/pagopa/io-app/issues/4455)) ([e26a040](https://github.com/pagopa/io-app/commit/e26a040dd721d41f18d1ba2c2f180dd98942358e))
* [[LLK-60](https://pagopa.atlassian.net/browse/LLK-60)] Key Generation info removed in favour of direct analytics ([#4443](https://github.com/pagopa/io-app/issues/4443)) ([bb70186](https://github.com/pagopa/io-app/commit/bb70186ff80b5caccfda5ab0688fc4d4c5fcd6f4))

## [2.28.0-rc.1](https://github.com/pagopa/io-app/compare/2.28.0-rc.0...2.28.0-rc.1) (2023-03-14)


### Bug Fixes

* **Firma con IO:** [[SFEQS-1512](https://pagopa.atlassian.net/browse/SFEQS-1512)] Update file digest to use array buffer ([#4454](https://github.com/pagopa/io-app/issues/4454)) ([a17e97a](https://github.com/pagopa/io-app/commit/a17e97a35c2b9db9d2d6b8a4bc60485eaf97398c))
* [[IABT-1438](https://pagopa.atlassian.net/browse/IABT-1438)] Implements zendesk Custom fields for payment log ([#4431](https://github.com/pagopa/io-app/issues/4431)) ([5244c6e](https://github.com/pagopa/io-app/commit/5244c6ead22a63e8af381f823d0d579cdbee1b26))
* [[IABT-1440](https://pagopa.atlassian.net/browse/IABT-1440)] Fixes loading when opening zendesk reports list ([#4438](https://github.com/pagopa/io-app/issues/4438)) ([6100d6d](https://github.com/pagopa/io-app/commit/6100d6de54e5450fcea16f6f27574fb6654bfc7e))
* **Firma con IO:** [[SFEQS-1511](https://pagopa.atlassian.net/browse/SFEQS-1511)] Fix body on create signature request ([#4450](https://github.com/pagopa/io-app/issues/4450)) ([96ee9bd](https://github.com/pagopa/io-app/commit/96ee9bd3bdfa160c5b0dfb799fdff8a574593e34))
* [[IOAPPFD0-47](https://pagopa.atlassian.net/browse/IOAPPFD0-47)] Remove extra properties from new buttons ([#4447](https://github.com/pagopa/io-app/issues/4447)) ([f4095f1](https://github.com/pagopa/io-app/commit/f4095f1e25377c1dabfdcc6f78703fc0e74b1468))
* **Firma con IO:** [[SFEQS-1437](https://pagopa.atlassian.net/browse/SFEQS-1437)] Fix empty attributes when document to sign not has signature fields or coordinates ([#4445](https://github.com/pagopa/io-app/issues/4445)) ([a0b6980](https://github.com/pagopa/io-app/commit/a0b6980b7599672afe0323151373c5df098cd35f))


### Chores

* [[LLK-62](https://pagopa.atlassian.net/browse/LLK-62)] Added signBody config ([#4452](https://github.com/pagopa/io-app/issues/4452)) ([14539a1](https://github.com/pagopa/io-app/commit/14539a1b5694fbe70e7dcab97098d3b4bfb5233e))
* [[LLK-64](https://pagopa.atlassian.net/browse/LLK-64)] OriginalUrl and other parameters aligned to standard ([#4451](https://github.com/pagopa/io-app/issues/4451)) ([b10112b](https://github.com/pagopa/io-app/commit/b10112bbf08a101d2718e4ec0e587c4c0595d676))
* **deps:** bump @sideway/formula from 3.0.0 to 3.0.1 ([#4446](https://github.com/pagopa/io-app/issues/4446)) ([bfdddf8](https://github.com/pagopa/io-app/commit/bfdddf862a797ff5e9b2047b44f969b95e302b4c))
* **Firma con IO:** [[SFEQS-1508](https://pagopa.atlassian.net/browse/SFEQS-1508)] Update fci definitions ([#4449](https://github.com/pagopa/io-app/issues/4449)) ([4352a95](https://github.com/pagopa/io-app/commit/4352a9594ef260b9eccde6f17d50a29f3355fb7a))
* [[IOAPPFD0-48](https://pagopa.atlassian.net/browse/IOAPPFD0-48)] Remove shuffled archived message from E2E tests ([#4448](https://github.com/pagopa/io-app/issues/4448)) ([a52a255](https://github.com/pagopa/io-app/commit/a52a255038a49fbe36a75e97a5192ee4be6cf95d))
* **deps:** bump minimatch from 3.0.4 to 3.1.2 ([#4439](https://github.com/pagopa/io-app/issues/4439)) ([fcbc9b5](https://github.com/pagopa/io-app/commit/fcbc9b595134d7021e24497d21a48e62b443c4b8))
* [[LLK-59](https://pagopa.atlassian.net/browse/LLK-59)] Store LolliPoP public key into in-memory redux store  ([#4437](https://github.com/pagopa/io-app/issues/4437)) ([263782d](https://github.com/pagopa/io-app/commit/263782db4daf30fe3ec5439f5ed842b6317c6aa4))
* [[LLK-61](https://pagopa.atlassian.net/browse/LLK-61)] The "signature" header value has a wrong format ([#4441](https://github.com/pagopa/io-app/issues/4441)) ([65b0019](https://github.com/pagopa/io-app/commit/65b0019540077d0fc721c33f884d4e19aa1c6af2))

## [2.28.0-rc.0](https://github.com/pagopa/io-app/compare/2.27.0-rc.4...2.28.0-rc.0) (2023-03-09)


### Features

* **Firma con IO:** [[SFEQS-1253](https://pagopa.atlassian.net/browse/SFEQS-1253)] Update signature fields with accessibility ([#4423](https://github.com/pagopa/io-app/issues/4423)) ([30cef80](https://github.com/pagopa/io-app/commit/30cef805842171b841e402816b5d529a800184c4))
* **IDPay:** [[IODPAY-168](https://pagopa.atlassian.net/browse/IODPAY-168)] Prerequisites check error mapping in onboarding flow ([#4428](https://github.com/pagopa/io-app/issues/4428)) ([9ced654](https://github.com/pagopa/io-app/commit/9ced65403fda04fed083cec8ade42ee8146fba1b))
* **IDPay:** Replace local IDPay feature flag with switch control ([#4399](https://github.com/pagopa/io-app/issues/4399)) ([faf265b](https://github.com/pagopa/io-app/commit/faf265b82ca49851713c85f171f5caf207d39459))
* [[IOAPPCIT-30](https://pagopa.atlassian.net/browse/IOAPPCIT-30)] HTTP signature integration ([#4304](https://github.com/pagopa/io-app/issues/4304)) ([244590a](https://github.com/pagopa/io-app/commit/244590a8bda9a73cfd83dcefc51bb4bb7b7b5eeb))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1489](https://pagopa.atlassian.net/browse/SFEQS-1489)] Update footer on document preview component with right label ([#4433](https://github.com/pagopa/io-app/issues/4433)) ([ba12162](https://github.com/pagopa/io-app/commit/ba121624ac1c7c5759f4663c1141d58aad36b5e8))


### Chores

* [[IOAPPFD0-44](https://pagopa.atlassian.net/browse/IOAPPFD0-44)] Add the new basic theme variables ([#4432](https://github.com/pagopa/io-app/issues/4432)) ([c5a0af3](https://github.com/pagopa/io-app/commit/c5a0af370a5629584e6cdc2bae533326466c04cf))
* **Firma con IO:** [[SFEQS-1452](https://pagopa.atlassian.net/browse/SFEQS-1452)] Update signing saga to use Lollipop ([#4410](https://github.com/pagopa/io-app/issues/4410)) ([6a88659](https://github.com/pagopa/io-app/commit/6a8865988cc02a2c4ecd65d6c85854db616683db))
* **IDPay:** [[IODPAY-152](https://pagopa.atlassian.net/browse/IODPAY-152)] IDPay client refactoring with merged API definitions ([#4379](https://github.com/pagopa/io-app/issues/4379)) ([3666d00](https://github.com/pagopa/io-app/commit/3666d00767903dbd6554c79c553d5d01fefdea0e))
* [[IOAPPFD0-43](https://pagopa.atlassian.net/browse/IOAPPFD0-43)] Add new toggle to enable preview of new design system ([#4427](https://github.com/pagopa/io-app/issues/4427)) ([0b36e4b](https://github.com/pagopa/io-app/commit/0b36e4bddc9c83369ea221bd9187afb777a5de5e))

## [2.27.0-rc.4](https://github.com/pagopa/io-app/compare/2.27.0-rc.3...2.27.0-rc.4) (2023-03-03)


### Features

* **IDPay:** [[IODPAY-99](https://pagopa.atlassian.net/browse/IODPAY-99),[IODPAY-130](https://pagopa.atlassian.net/browse/IODPAY-130)] IDPay onboarding failures handling ([#4343](https://github.com/pagopa/io-app/issues/4343)) ([32c8af5](https://github.com/pagopa/io-app/commit/32c8af56d0433c5c3f460d87cc3a5678c680514d))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1293](https://pagopa.atlassian.net/browse/SFEQS-1293)] Update main title style for all screens ([#4419](https://github.com/pagopa/io-app/issues/4419)) ([91069ed](https://github.com/pagopa/io-app/commit/91069edbe42770fb1ee4d0d1e0ac8cbb731898cd))


### Chores

* [[LLK-57](https://pagopa.atlassian.net/browse/LLK-57)] Fix unsupported device banner visibility ([#4429](https://github.com/pagopa/io-app/issues/4429)) ([89d1762](https://github.com/pagopa/io-app/commit/89d17626ccc00b65eafacad225e2b2588f88eefa))
* [[LLK-57](https://pagopa.atlassian.net/browse/LLK-57)] Fix unsupported device banner visibility (missing part) ([#4430](https://github.com/pagopa/io-app/issues/4430)) ([1f585f5](https://github.com/pagopa/io-app/commit/1f585f5b34d4911f198b986d664e346b1bcd7cc3))

## [2.27.0-rc.3](https://github.com/pagopa/io-app/compare/2.27.0-rc.2...2.27.0-rc.3) (2023-03-02)


### Features

* [[LLK-49](https://pagopa.atlassian.net/browse/LLK-49)] Add section status banner for unsupported devices ([#4405](https://github.com/pagopa/io-app/issues/4405)) ([c61f288](https://github.com/pagopa/io-app/commit/c61f28801077388879281747b9bb93d33a7972bb))


### Bug Fixes

* [[IABT-1436](https://pagopa.atlassian.net/browse/IABT-1436)] Change the background activity timeout ([#4424](https://github.com/pagopa/io-app/issues/4424)) ([b102fa3](https://github.com/pagopa/io-app/commit/b102fa3caf3f156ac8d2234cea87a987bb67ffff))


### Chores

* [[IAI-271](https://pagopa.atlassian.net/browse/IAI-271)] Delete separate Icon sets ([#4425](https://github.com/pagopa/io-app/issues/4425)) ([442bd13](https://github.com/pagopa/io-app/commit/442bd13a3bce17362147dc7ca86f3f8841e0f1af))
* [[IOAPPFD0-39](https://pagopa.atlassian.net/browse/IOAPPFD0-39)] Add temporary dark mode color palette ([#4408](https://github.com/pagopa/io-app/issues/4408)) ([5c35ba3](https://github.com/pagopa/io-app/commit/5c35ba3b75d781174e1c427f5f5ca972fb766100))
* [[LLK-29](https://pagopa.atlassian.net/browse/LLK-29)] Login with crypto key (CIE) ([#4353](https://github.com/pagopa/io-app/issues/4353)) ([019aa36](https://github.com/pagopa/io-app/commit/019aa365d1d5e71d1602c8ed980a4fd452f26961)), closes [/github.com/pagopa/io-app/blob/1f7c7da656b64c1c3a77be0ef92d9f759e7b0582/.env.production#L81](https://github.com/pagopa//github.com/pagopa/io-app/blob/1f7c7da656b64c1c3a77be0ef92d9f759e7b0582/.env.production/issues/L81)

## [2.27.0-rc.2](https://github.com/pagopa/io-app/compare/2.27.0-rc.1...2.27.0-rc.2) (2023-03-01)


### Bug Fixes

* **IDPay:** [[IODPAY-133](https://pagopa.atlassian.net/browse/IODPAY-133)] Fix PDND prerequisites screen list item UI ([#4420](https://github.com/pagopa/io-app/issues/4420)) ([0190155](https://github.com/pagopa/io-app/commit/0190155756a3712e2d93f8d8f0fc31c7c964630a))


### Chores

* **IDPay:** [[IODPAY-167](https://pagopa.atlassian.net/browse/IODPAY-167)] Show amount on PAID_REFUND operation ([#4426](https://github.com/pagopa/io-app/issues/4426)) ([c642ef2](https://github.com/pagopa/io-app/commit/c642ef2f82df721991a3d1bb26aec2ade819b036))
* [[LLK-55](https://pagopa.atlassian.net/browse/LLK-55)] Removed user-agent during Spid login ([#4418](https://github.com/pagopa/io-app/issues/4418)) ([1c1c7f7](https://github.com/pagopa/io-app/commit/1c1c7f7cc149f0538a18b26ebf2ee3d19ecb6171))
* **IDPay:** [[IODPAY-163](https://pagopa.atlassian.net/browse/IODPAY-163)] Copy changes ([#4421](https://github.com/pagopa/io-app/issues/4421)) ([3806d2a](https://github.com/pagopa/io-app/commit/3806d2a868394274815ebd3375be8e76320f3ad6))

## [2.27.0-rc.1](https://github.com/pagopa/io-app/compare/2.27.0-rc.0...2.27.0-rc.1) (2023-02-28)


### Features

* [[IOAPPCIT-47](https://pagopa.atlassian.net/browse/IOAPPCIT-47)] Regenerate public key on IdP login flow during retry ([#4403](https://github.com/pagopa/io-app/issues/4403)) ([1b4be52](https://github.com/pagopa/io-app/commit/1b4be52d0e62c9257c6119c0bbad3ffd3d06b2b4))


### Bug Fixes

* [[IABT-1433](https://pagopa.atlassian.net/browse/IABT-1433)] Unwanted tab-bar shadow Android ([#4387](https://github.com/pagopa/io-app/issues/4387)) ([4569407](https://github.com/pagopa/io-app/commit/45694070df154012d3ab52e5b9ff39c1a4f96098))
* **Firma con IO:** [[SFEQS-1317](https://pagopa.atlassian.net/browse/SFEQS-1317)] Add item separator to tos screen ([#4417](https://github.com/pagopa/io-app/issues/4417)) ([f02250b](https://github.com/pagopa/io-app/commit/f02250b5eaadc16f39c3dab8217f32b149e7b9e4))
* **IDPay:** [[IODPAY-160](https://pagopa.atlassian.net/browse/IODPAY-160)] Update ListItem import to follow design ([#4412](https://github.com/pagopa/io-app/issues/4412)) ([98e4fa8](https://github.com/pagopa/io-app/commit/98e4fa8533dbc70a1ccc96de72c6c076140f7464))
* [[IABT-1429](https://pagopa.atlassian.net/browse/IABT-1429)] QR code library updated ([#4406](https://github.com/pagopa/io-app/issues/4406)) ([ab1d571](https://github.com/pagopa/io-app/commit/ab1d571a49c63b9d3b08c49fe8d8464e17adb5b7))
* [[IABT-1435](https://pagopa.atlassian.net/browse/IABT-1435)] Fix unwrap text info box ([#4407](https://github.com/pagopa/io-app/issues/4407)) ([efb9a0b](https://github.com/pagopa/io-app/commit/efb9a0b1cf5077738434267804196cf7751ab15a))


### Chores

* [[IAI-268](https://pagopa.atlassian.net/browse/IAI-268)] Add the new native component `ButtonOutline` ([#4363](https://github.com/pagopa/io-app/issues/4363)) ([fb3fb89](https://github.com/pagopa/io-app/commit/fb3fb89ef69f8bd97863972e3b49f6e5d5579c1a))
* [[IAI-269](https://pagopa.atlassian.net/browse/IAI-269)] Add the new `IconButton` and `IconButtonSolid` components ([#4375](https://github.com/pagopa/io-app/issues/4375)) ([7771cf9](https://github.com/pagopa/io-app/commit/7771cf97cfb7c634cd478781635b1f509773ae02))
* [[IAI-270](https://pagopa.atlassian.net/browse/IAI-270)] Bump version of react-native-vision-camera from 2.15.1 to 2.15.4 ([#4409](https://github.com/pagopa/io-app/issues/4409)) ([6413057](https://github.com/pagopa/io-app/commit/641305714e264f483f572a41c8379b2637626a06))

## [2.27.0-rc.0](https://github.com/pagopa/io-app/compare/2.26.0-rc.3...2.27.0-rc.0) (2023-02-23)


### Features

* **IDPay:** [[IODPAY-103](https://pagopa.atlassian.net/browse/IODPAY-103)] InitiativeDetailsScreen requires scrolling ([#4354](https://github.com/pagopa/io-app/issues/4354)) ([5a20217](https://github.com/pagopa/io-app/commit/5a20217a66b6668684ef25d84d9af6c69eac7cd5))
* [[IA-362](https://pagopa.atlassian.net/browse/IA-362),[IA-383](https://pagopa.atlassian.net/browse/IA-383)] Accessibility: fixed organization's fiscal code copy button  ([#4347](https://github.com/pagopa/io-app/issues/4347)) ([dba196f](https://github.com/pagopa/io-app/commit/dba196fc1100ef65521ec6ad7e365ad272b45c71))
* [[IGP-88](https://pagopa.atlassian.net/browse/IGP-88)] New feedback message displayed while loading the document ([#4386](https://github.com/pagopa/io-app/issues/4386)) ([53daac3](https://github.com/pagopa/io-app/commit/53daac305245eba8eef730b6e1e7d26c87d6eb2e))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1398](https://pagopa.atlassian.net/browse/SFEQS-1398)] Update style in document navigation bar ([#4383](https://github.com/pagopa/io-app/issues/4383)) ([bd05241](https://github.com/pagopa/io-app/commit/bd052416e9c525f29e5ee1ed55fb318595318c6a))
* **IDPay:** [[IODPAY-104](https://pagopa.atlassian.net/browse/IODPAY-104),[IODPAY-105](https://pagopa.atlassian.net/browse/IODPAY-105)] Fix IDPay onboarding self declaration toggles ([#4393](https://github.com/pagopa/io-app/issues/4393)) ([7c191c8](https://github.com/pagopa/io-app/commit/7c191c85b3e95a9d1efc980e5d88e4ccee605d80))
* **IDPay:** [[IODPAY-114](https://pagopa.atlassian.net/browse/IODPAY-114),[IODPAY-155](https://pagopa.atlassian.net/browse/IODPAY-155),[IODPAY-156](https://pagopa.atlassian.net/browse/IODPAY-156)] New IBAN pages refactor ([#4401](https://github.com/pagopa/io-app/issues/4401)) ([75344cf](https://github.com/pagopa/io-app/commit/75344cff9aa4a3829c6e53951997aeb1de26b623))
* **IDPay:** [[IODPAY-119](https://pagopa.atlassian.net/browse/IODPAY-119),[IODPAY-120](https://pagopa.atlassian.net/browse/IODPAY-120)] Fix instruments enrollment UI not following design ([#4369](https://github.com/pagopa/io-app/issues/4369)) ([66efa29](https://github.com/pagopa/io-app/commit/66efa294c4deddae87ea95babf5f2d9533120e22))
* **IDPay:** [[IODPAY-123](https://pagopa.atlassian.net/browse/IODPAY-123)] Fix loading state for instrument toggles ([#4390](https://github.com/pagopa/io-app/issues/4390)) ([99f40d1](https://github.com/pagopa/io-app/commit/99f40d17001a0d1430750313173757161210dcc2))
* **IDPay:** [[IODPAY-147](https://pagopa.atlassian.net/browse/IODPAY-147),[IODPAY-135](https://pagopa.atlassian.net/browse/IODPAY-135),[IODPAY-128](https://pagopa.atlassian.net/browse/IODPAY-128)] Refactor list item design ([#4365](https://github.com/pagopa/io-app/issues/4365)) ([b89f50e](https://github.com/pagopa/io-app/commit/b89f50e8527ee0c8699eded077191bfef9b98866))
* **IDPay:** [[IODPAY-157](https://pagopa.atlassian.net/browse/IODPAY-157)] Add correct amount to initiative card ([#4402](https://github.com/pagopa/io-app/issues/4402)) ([2ab23cc](https://github.com/pagopa/io-app/commit/2ab23cc839a43f42f090ee69185baff597fb2c45))
* **IDPay:** [[IODPAY-159](https://pagopa.atlassian.net/browse/IODPAY-159)] Show loader when enrollment request in progress ([#4404](https://github.com/pagopa/io-app/issues/4404)) ([257ec2c](https://github.com/pagopa/io-app/commit/257ec2cf8e30f0c1370856e862d6fcabb07d3e20))


### Chores

* [[IAI-267](https://pagopa.atlassian.net/browse/IAI-267)] Add the new native component `ButtonSolid` ([#4356](https://github.com/pagopa/io-app/issues/4356)) ([16bfdf9](https://github.com/pagopa/io-app/commit/16bfdf99eb30eec47e4734630ff4d6c2b3d9f824))
* [[IOAPPFD0-34](https://pagopa.atlassian.net/browse/IOAPPFD0-34)] Add the new `ContentWrapper` component ([#4382](https://github.com/pagopa/io-app/issues/4382)) ([fb3843e](https://github.com/pagopa/io-app/commit/fb3843e41304c8faa49ddb89b6601fbe315bc9e9))
* [[IOAPPFD0-35](https://pagopa.atlassian.net/browse/IOAPPFD0-35)] Add the new `Alert` component ([#4392](https://github.com/pagopa/io-app/issues/4392)) ([9adce2a](https://github.com/pagopa/io-app/commit/9adce2af12c3781aed643fb559a92a262a085ab0))
* [[IOAPPFD0-37](https://pagopa.atlassian.net/browse/IOAPPFD0-37)] Update spacing scale ([#4398](https://github.com/pagopa/io-app/issues/4398)) ([2b7d72c](https://github.com/pagopa/io-app/commit/2b7d72c9a91f2bed5e61df268f2d9f2b17170431))
* [[LLK-35](https://pagopa.atlassian.net/browse/LLK-35)] Add mixpanel events for Lollipop failure ([#4400](https://github.com/pagopa/io-app/issues/4400)) ([85f3b9d](https://github.com/pagopa/io-app/commit/85f3b9dd24d0b67b2dc3c2546a31674835e0cd21))

## [2.26.0-rc.3](https://github.com/pagopa/io-app/compare/2.26.0-rc.2...2.26.0-rc.3) (2023-02-17)


### Bug Fixes

* [[IOAPPCIT-46](https://pagopa.atlassian.net/browse/IOAPPCIT-46)] Fixes the missing PosteID rapid access missing choice on IdP credential screen ([#4391](https://github.com/pagopa/io-app/issues/4391)) ([a4e38ff](https://github.com/pagopa/io-app/commit/a4e38ffafe6ab53af98f0a953c17c3fb85d3a2f9))
* **Firma con IO:** [[SFEQS-1231](https://pagopa.atlassian.net/browse/SFEQS-1231)] Update copy on abort bottom sheet ([#4342](https://github.com/pagopa/io-app/issues/4342)) ([a33f0cb](https://github.com/pagopa/io-app/commit/a33f0cbcbdeb5bb052e98f3185c9e0c826cf35b3))

## [2.26.0-rc.2](https://github.com/pagopa/io-app/compare/2.26.0-rc.1...2.26.0-rc.2) (2023-02-16)


### Features

* [[IOAPPCIT-27](https://pagopa.atlassian.net/browse/IOAPPCIT-27)] Login with crypto key ([#4351](https://github.com/pagopa/io-app/issues/4351)) ([df9f182](https://github.com/pagopa/io-app/commit/df9f18209903ebc047d6dcdbb84fda312692999f))
* [[LLK-34](https://pagopa.atlassian.net/browse/LLK-34)] Bump minor TOS version ([#4388](https://github.com/pagopa/io-app/issues/4388)) ([aab4ffc](https://github.com/pagopa/io-app/commit/aab4ffce893c3a6f076ac223957a360faad68cb4))


### Bug Fixes

* **IDPay:** [[IODPAY-136](https://pagopa.atlassian.net/browse/IODPAY-136),[IODPAY-137](https://pagopa.atlassian.net/browse/IODPAY-137),[IODPAY-140](https://pagopa.atlassian.net/browse/IODPAY-140)] Fix operation details display issues ([#4364](https://github.com/pagopa/io-app/issues/4364)) ([a4fa7d8](https://github.com/pagopa/io-app/commit/a4fa7d88e1c8c849d07d1c7ebe82d125d93e768a))
* [[IABT-1365](https://pagopa.atlassian.net/browse/IABT-1365)]  Fixed translation keys displayed when the archived messages list is empty ([#4359](https://github.com/pagopa/io-app/issues/4359)) ([0d4d215](https://github.com/pagopa/io-app/commit/0d4d2157451a65feffd91f50bfa6e980dc889ba3))
* [[IABT-1383](https://pagopa.atlassian.net/browse/IABT-1383)] Email already in use - bug ([#4366](https://github.com/pagopa/io-app/issues/4366)) ([8427275](https://github.com/pagopa/io-app/commit/84272759e7cc19675c7d8d685185195d7d0d38ee))
* [[IABT-1426](https://pagopa.atlassian.net/browse/IABT-1426)] Fix new CIE read on Android ([#4380](https://github.com/pagopa/io-app/issues/4380)) ([6a2c19a](https://github.com/pagopa/io-app/commit/6a2c19a07ee1e5bd679c273b3e71a7c092b91e62))
* **IDPay:** [[IODPAY-132](https://pagopa.atlassian.net/browse/IODPAY-132)] Added initiative name in PDNDprerequisites screen ([#4371](https://github.com/pagopa/io-app/issues/4371)) ([2ff4aab](https://github.com/pagopa/io-app/commit/2ff4aab46a93b923b0ca67d360c69cc4ca74a489))
* **IDPay:** [[IODPAY-150](https://pagopa.atlassian.net/browse/IODPAY-150)] Fix onboarding flow for whitelist initiative ([#4377](https://github.com/pagopa/io-app/issues/4377)) ([2888e71](https://github.com/pagopa/io-app/commit/2888e7129295fde2969d3c276dcf58f2b7fe997b))


### Chores

* [[LLK-37](https://pagopa.atlassian.net/browse/LLK-37)] Support key uniqueness on retries ([#4381](https://github.com/pagopa/io-app/issues/4381)) ([4e2a174](https://github.com/pagopa/io-app/commit/4e2a17411008a6ac09fc0c57e598a159bd473edf))
* **IDPay:** [[IODPAY-151](https://pagopa.atlassian.net/browse/IODPAY-151)] Fix IBAN change issue ([#4376](https://github.com/pagopa/io-app/issues/4376)) ([dc31b4d](https://github.com/pagopa/io-app/commit/dc31b4df3edac3a9ae827a14172cedcb36598cd7))
* [[IOAPPFD0-33](https://pagopa.atlassian.net/browse/IOAPPFD0-33)] Add the new color palette ([#4378](https://github.com/pagopa/io-app/issues/4378)) ([64537c4](https://github.com/pagopa/io-app/commit/64537c4bc649574f8c8934923d330080ce44cae8))

## [2.26.0-rc.1](https://github.com/pagopa/io-app/compare/2.26.0-rc.0...2.26.0-rc.1) (2023-02-10)


### Bug Fixes

* **IDPay:** [[IODPAY-148](https://pagopa.atlassian.net/browse/IODPAY-148)] Serialization bug in multivaluePrerequisites ([#4368](https://github.com/pagopa/io-app/issues/4368)) ([45e26c9](https://github.com/pagopa/io-app/commit/45e26c993440af9a1ab5aefec458fa2bfb863df8))

## [2.26.0-rc.0](https://github.com/pagopa/io-app/compare/2.25.0-rc.2...2.26.0-rc.0) (2023-02-09)


### Features

* [[IA-362](https://pagopa.atlassian.net/browse/IA-362),[IA-363](https://pagopa.atlassian.net/browse/IA-363),[IA-364](https://pagopa.atlassian.net/browse/IA-364),[IA-319](https://pagopa.atlassian.net/browse/IA-319)] -- Carousel accessibility ([#4345](https://github.com/pagopa/io-app/issues/4345)) ([923f8cc](https://github.com/pagopa/io-app/commit/923f8cc1a8e8d043e36bd52c0726848feddad7b2))
* [[IA-362](https://pagopa.atlassian.net/browse/IA-362),[IA-367](https://pagopa.atlassian.net/browse/IA-367)] -- Accessibility doesn't recognise CIE/SPID login button ([#4346](https://github.com/pagopa/io-app/issues/4346)) ([e773d82](https://github.com/pagopa/io-app/commit/e773d822c3a82a2bebd533effb528dd1b43f6aeb))
* [[IA-362](https://pagopa.atlassian.net/browse/IA-362),[IA-369](https://pagopa.atlassian.net/browse/IA-369)] Accessibility: unlock code forgotten not recognised as button ([#4349](https://github.com/pagopa/io-app/issues/4349)) ([c8a1e59](https://github.com/pagopa/io-app/commit/c8a1e59dce1d6406c904a2b3eb9b29a65d581006))
* [[IA-362](https://pagopa.atlassian.net/browse/IA-362),[IA-389](https://pagopa.atlassian.net/browse/IA-389),[IA-344](https://pagopa.atlassian.net/browse/IA-344)] Added accessibility support to switch components. ([#4350](https://github.com/pagopa/io-app/issues/4350)) ([d55929e](https://github.com/pagopa/io-app/commit/d55929e3c4264ffb3ef5ff727a7ed07b247fc010))
* [[IOAPPCIT-38](https://pagopa.atlassian.net/browse/IOAPPCIT-38)] Crypto key pair refactoring ([#4326](https://github.com/pagopa/io-app/issues/4326)) ([6573577](https://github.com/pagopa/io-app/commit/65735776216e87aac8933133f7dc00e727d6a75a)), closes [/github.com/pagopa/io-dev-api-server/blob/42c26404cb3dfe68f6726b9f6027b24cb0699baf/src/payloads/backend.ts#L79](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/42c26404cb3dfe68f6726b9f6027b24cb0699baf/src/payloads/backend.ts/issues/L79)
* **IDPay:** [IODPAY-76, IODPAY-92] Inclusion of multivalue selfPrerequisites flow ([#4323](https://github.com/pagopa/io-app/issues/4323)) ([e83d382](https://github.com/pagopa/io-app/commit/e83d382ccadadeee30daefdfa944a380962e5ae8))


### Bug Fixes

* **IDPay:** [[IODPAY-126](https://pagopa.atlassian.net/browse/IODPAY-126)] Fix `IbanEnrollmentScreen` with correct buttons and title ([#4355](https://github.com/pagopa/io-app/issues/4355)) ([43b2547](https://github.com/pagopa/io-app/commit/43b2547bd8810c9a21b8f6f496c8a8b70d694e2a))
* **IDPay:** [[IODPAY-134](https://pagopa.atlassian.net/browse/IODPAY-134)] TransactionsList padding problem ([#4362](https://github.com/pagopa/io-app/issues/4362)) ([de30be3](https://github.com/pagopa/io-app/commit/de30be359e2aaf04982a288c794b169d07ecbbc8))
* [[IABT-1204](https://pagopa.atlassian.net/browse/IABT-1204)] Remove legacy `darkGray` and `gray` buttons ([#4341](https://github.com/pagopa/io-app/issues/4341)) ([45896c6](https://github.com/pagopa/io-app/commit/45896c632319097bb053f0ea8a6cdb621afad43f))
* [[IABT-1389](https://pagopa.atlassian.net/browse/IABT-1389)] On Android IdP logo never refresh when it's changed ([#4360](https://github.com/pagopa/io-app/issues/4360)) ([b58957c](https://github.com/pagopa/io-app/commit/b58957cd97f247d63c211e2afdc83d0e909a3dc1))
* **Firma con IO:** [[SFEQS-1369](https://pagopa.atlassian.net/browse/SFEQS-1369)] Update file path for Android to fix the PDF preview and download actions ([#4357](https://github.com/pagopa/io-app/issues/4357)) ([1d55230](https://github.com/pagopa/io-app/commit/1d5523074ff9116cddf6b22862a562b101a7f103))
* [[IABT-1432](https://pagopa.atlassian.net/browse/IABT-1432)] Fix UI regression in the `Add Payment Method` screen ([#4361](https://github.com/pagopa/io-app/issues/4361)) ([54af69e](https://github.com/pagopa/io-app/commit/54af69ed32b6d54e684dfd3d84c0b1848a606453))
* **Firma con IO:** [[SFEQS-1232](https://pagopa.atlassian.net/browse/SFEQS-1232)] Required signature clauses are now auto selected and not editable by the user  ([#4328](https://github.com/pagopa/io-app/issues/4328)) ([90aaf6d](https://github.com/pagopa/io-app/commit/90aaf6d5e3086b2748a405da5a2c7e84091e5c86))
* **Firma con IO:** [[SFEQS-1248](https://pagopa.atlassian.net/browse/SFEQS-1248)] Update documents navigation bar behavior ([#4332](https://github.com/pagopa/io-app/issues/4332)) ([f7cfe5c](https://github.com/pagopa/io-app/commit/f7cfe5c0e81cadb5ceb9b207343c5f34f94a3dc2))


### Chores

* [[IAI-258](https://pagopa.atlassian.net/browse/IAI-258)] Add SVG pictograms to transaction error screens ([#4283](https://github.com/pagopa/io-app/issues/4283)) ([d2d69ed](https://github.com/pagopa/io-app/commit/d2d69ed49d36461e4f96e1e1af36cd674ac5fea8))
* **IDPay:** [[IODPAY-93](https://pagopa.atlassian.net/browse/IODPAY-93)] IDPay configuration machine tests ([#4327](https://github.com/pagopa/io-app/issues/4327)) ([162e528](https://github.com/pagopa/io-app/commit/162e528d01f6abcecfca562e58eb551122483b1d))

## [2.25.0-rc.2](https://github.com/pagopa/io-app/compare/2.25.0-rc.1...2.25.0-rc.2) (2023-02-02)


### Features

* [[IOAPPCIT-41](https://pagopa.atlassian.net/browse/IOAPPCIT-41),[IABT-1427](https://pagopa.atlassian.net/browse/IABT-1427),[IABT-1428](https://pagopa.atlassian.net/browse/IABT-1428)] Adds Zendesk permission label and distincted flow for Add Card issue ([#4334](https://github.com/pagopa/io-app/issues/4334)) ([5b029fa](https://github.com/pagopa/io-app/commit/5b029fa92582fe19410ea1de2a8e530bcf580b96))
* [IOAPPCOM-44, IOAPPCOM-47, IOAPPCOM-49, IOAPPCOM-52] Support for attachments on standard messages ([#4320](https://github.com/pagopa/io-app/issues/4320)) ([76abcdf](https://github.com/pagopa/io-app/commit/76abcdf2fca776eadccf05388e8b24e3cb672ac1))
* [[IOAPPCOM-44](https://pagopa.atlassian.net/browse/IOAPPCOM-44),[IOAPPCOM-46](https://pagopa.atlassian.net/browse/IOAPPCOM-46)] Mixpanel events for third party message attachments ([#4333](https://github.com/pagopa/io-app/issues/4333)) ([0e5484c](https://github.com/pagopa/io-app/commit/0e5484c1b41c94da307587aabe0d4b27111ae486))
* **Firma con IO:** [[SFEQS-1330](https://pagopa.atlassian.net/browse/SFEQS-1330)] Update copy in QTSP clauses screen ([#4330](https://github.com/pagopa/io-app/issues/4330)) ([d098c78](https://github.com/pagopa/io-app/commit/d098c788fa201f5f170df152316cdf828e6e212e))
* **IDPay:** [[IODPAY-78](https://pagopa.atlassian.net/browse/IODPAY-78)] Show operation details bottom sheet in initiative timeline ([#4313](https://github.com/pagopa/io-app/issues/4313)) ([45233f0](https://github.com/pagopa/io-app/commit/45233f02762e96c76f36f8f25550d968af3ca68c))
* **IDPay:** [[IODPAY-79](https://pagopa.atlassian.net/browse/IODPAY-79)] Add instruments list check in IDPay initiative configuration ([#4290](https://github.com/pagopa/io-app/issues/4290)) ([1dd6e4b](https://github.com/pagopa/io-app/commit/1dd6e4beac479d17acf2d8c07ddd1fc31ab8dce2))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1249](https://pagopa.atlassian.net/browse/SFEQS-1249)] Add check on signature request expired or the days for consultation have passed ([#4307](https://github.com/pagopa/io-app/issues/4307)) ([e90b573](https://github.com/pagopa/io-app/commit/e90b57317016a871f42bbae9ae1427e1f7ad2309))
* **Firma con IO:** [[SFEQS-1354](https://pagopa.atlassian.net/browse/SFEQS-1354)] Add rounding to daysBetweenDate ([#4340](https://github.com/pagopa/io-app/issues/4340)) ([1bd537b](https://github.com/pagopa/io-app/commit/1bd537bc495fa53fc13592fc6c971dd0fb95f34c))
* **IDPay:** [[IODPAY-94](https://pagopa.atlassian.net/browse/IODPAY-94)] Addition of error handling for instruments and iban list load failure ([#4324](https://github.com/pagopa/io-app/issues/4324)) ([6c7b313](https://github.com/pagopa/io-app/commit/6c7b313dc9252a904c079e77552d2d0b0b7aa1e9))
* **IDPay:** [[IODPAY-96](https://pagopa.atlassian.net/browse/IODPAY-96)] Added i18n for the onboarding flow ([#4335](https://github.com/pagopa/io-app/issues/4335)) ([5b8718b](https://github.com/pagopa/io-app/commit/5b8718b72a060be0af2f5ee9788c5976c77db33c))


### Chores

* **deps:** Bump ua-parser-js from 0.7.31 to 0.7.33 ([#4331](https://github.com/pagopa/io-app/issues/4331)) ([4fa88fd](https://github.com/pagopa/io-app/commit/4fa88fdeff6b8f8e7c8209eac1559b9ca6cbd3ef))

## [2.25.0-rc.1](https://github.com/pagopa/io-app/compare/2.25.0-rc.0...2.25.0-rc.1) (2023-01-27)


### Features

* **IDPay:** [[IODPAY-95](https://pagopa.atlassian.net/browse/IODPAY-95)] Add IDPay test/env switch ([#4329](https://github.com/pagopa/io-app/issues/4329)) ([1b25653](https://github.com/pagopa/io-app/commit/1b2565332a03c506e528d6310bfe3ff5adf2461a))
* [[IOAPPCIT-33](https://pagopa.atlassian.net/browse/IOAPPCIT-33)] Refactor `IdpsGrid` to enable TeamSystem ID ([#4314](https://github.com/pagopa/io-app/issues/4314)) ([39236e7](https://github.com/pagopa/io-app/commit/39236e703e4525e8cfec562f9beea04251d449f6))
* **IDPay:** [[IODPAY-83](https://pagopa.atlassian.net/browse/IODPAY-83)] Revert instrument state if enrollment modal is dismissed ([#4316](https://github.com/pagopa/io-app/issues/4316)) ([c5c88a0](https://github.com/pagopa/io-app/commit/c5c88a009e9209610607af77fe986b766fb94da0))


### Chores

* [[IAI-263](https://pagopa.atlassian.net/browse/IAI-263)] Removal of the NativeBase's `Spacer` ([#4302](https://github.com/pagopa/io-app/issues/4302)) ([e18a303](https://github.com/pagopa/io-app/commit/e18a303c25122d35f57c13d525bb25e024e689bc))
* [[IOAPPCOM-42](https://pagopa.atlassian.net/browse/IOAPPCOM-42)] Add mixpanel events for Premium ([#4293](https://github.com/pagopa/io-app/issues/4293)) ([4f59094](https://github.com/pagopa/io-app/commit/4f5909470c7af1a71b62c920e9a2fb889d4f9f46))

## [2.25.0-rc.0](https://github.com/pagopa/io-app/compare/2.24.0-rc.2...2.25.0-rc.0) (2023-01-24)


### Features

* **IDPay:** [[IODPAY-77](https://pagopa.atlassian.net/browse/IODPAY-77)] Addition of paginated operation list ([#4294](https://github.com/pagopa/io-app/issues/4294)) ([94213a5](https://github.com/pagopa/io-app/commit/94213a57c20c09caa07491ce3fffebcf69a1e9d5))


### Chores

* **deps:** bump fast-json-patch from 3.0.0-1 to 3.1.1 ([#4267](https://github.com/pagopa/io-app/issues/4267)) ([488aeb3](https://github.com/pagopa/io-app/commit/488aeb3421d81885e6b193bea3bd70d13d915cfa))
* **deps:** bump json5 from 1.0.1 to 1.0.2 ([#4281](https://github.com/pagopa/io-app/issues/4281)) ([00f0558](https://github.com/pagopa/io-app/commit/00f0558120908be3b6c2665f842ebf94c459d4c5))
* [IOAPPFD0-18,IOAPPFD0-23] Fix e2e tests ([#4318](https://github.com/pagopa/io-app/issues/4318)) ([884ea94](https://github.com/pagopa/io-app/commit/884ea949ef02cea6957b839bb04c0d555af00ba6)), closes [/github.com/pagopa/io-app/blob/7938ce2ffe15c9ec294f37650ff867fc16ddf9b4/.circleci/config.yml#L535](https://github.com/pagopa//github.com/pagopa/io-app/blob/7938ce2ffe15c9ec294f37650ff867fc16ddf9b4/.circleci/config.yml/issues/L535)
* **deps:** bump activesupport from 6.1.6.1 to 6.1.7.1 ([#4309](https://github.com/pagopa/io-app/issues/4309)) ([8aa8464](https://github.com/pagopa/io-app/commit/8aa846439c31070d695c46a2b4adfcf31bbf2487))

## [2.24.0-rc.2](https://github.com/pagopa/io-app/compare/2.24.0-rc.1...2.24.0-rc.2) (2023-01-20)


### Chores

* **Firma con IO:** Enable FCI feature flag ([#4312](https://github.com/pagopa/io-app/issues/4312)) ([a84787b](https://github.com/pagopa/io-app/commit/a84787b9bfac41dbe2ec7884fb4fb2dd1f1044e2))

## [2.24.0-rc.1](https://github.com/pagopa/io-app/compare/2.24.0-rc.0...2.24.0-rc.1) (2023-01-20)


### Features

* **Firma con IO:** [[SFEQS-1301](https://pagopa.atlassian.net/browse/SFEQS-1301)] Using a new remote flag based on min app version supported by the feature ([#4291](https://github.com/pagopa/io-app/issues/4291)) ([b5ec480](https://github.com/pagopa/io-app/commit/b5ec4803fd9c1386715fe5ec87a59cddd3a129f0))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1252](https://pagopa.atlassian.net/browse/SFEQS-1252)] Update section header component in signature section list ([#4297](https://github.com/pagopa/io-app/issues/4297)) ([3a8a1dd](https://github.com/pagopa/io-app/commit/3a8a1dd1c291ebe181e32c5d799172f57a72d666))
* **Firma con IO:** [[SFEQS-1271](https://pagopa.atlassian.net/browse/SFEQS-1271)] Introducing URL polling to wait availability of filled document ([#4260](https://github.com/pagopa/io-app/issues/4260)) ([58cd02d](https://github.com/pagopa/io-app/commit/58cd02d4061a419bcb401d177a49acd564643145))
* **Firma con IO:** [[SFEQS-1281](https://pagopa.atlassian.net/browse/SFEQS-1281)] Add a flag to track PDF load completion ([#4273](https://github.com/pagopa/io-app/issues/4273)) ([4a1b4d6](https://github.com/pagopa/io-app/commit/4a1b4d6092a67176200547faac790dcd3d13cfb4))
* [[IABT-1394](https://pagopa.atlassian.net/browse/IABT-1394)] Removal of surplus info in transaction summary ([#4279](https://github.com/pagopa/io-app/issues/4279)) ([81b50d7](https://github.com/pagopa/io-app/commit/81b50d72ee2e33a102ae155d5931bb820e4563e2))
* **IDPay:** [[IODPAY-89](https://pagopa.atlassian.net/browse/IODPAY-89)] Updated iban yaml version ([#4301](https://github.com/pagopa/io-app/issues/4301)) ([7f85e21](https://github.com/pagopa/io-app/commit/7f85e21cc80e4f86ab11c0b6ec4d3d63c68a5080))


### Chores

* [[IAI-261](https://pagopa.atlassian.net/browse/IAI-261)] Add new `Spacer` component ([#4292](https://github.com/pagopa/io-app/issues/4292)) ([fe1d40f](https://github.com/pagopa/io-app/commit/fe1d40f00e56271e0309ca7ec41031ee0102301b))
* **IDPay:** [[IODPAY-90](https://pagopa.atlassian.net/browse/IODPAY-90)] Add `IdPayConfig` remote feature flag ([#4305](https://github.com/pagopa/io-app/issues/4305)) ([a5ee66c](https://github.com/pagopa/io-app/commit/a5ee66c0b8d3af03ed97584691c121d1baa6047d))
* [[IOAPPCIT-24](https://pagopa.atlassian.net/browse/IOAPPCIT-24)] Add a crypto key pair generation test at application startup. ([#4295](https://github.com/pagopa/io-app/issues/4295)) ([7938ce2](https://github.com/pagopa/io-app/commit/7938ce2ffe15c9ec294f37650ff867fc16ddf9b4)), closes [/github.com/pagopa/io-dev-api-server/blob/c9485701686abc0f47c4272f05d6fd5246a6cd7e/src/payloads/backend.ts#L78](https://github.com/pagopa//github.com/pagopa/io-dev-api-server/blob/c9485701686abc0f47c4272f05d6fd5246a6cd7e/src/payloads/backend.ts/issues/L78)
* **IDPay:** [[IODPAY-88](https://pagopa.atlassian.net/browse/IODPAY-88)] Add I18n for card activation status ([#4300](https://github.com/pagopa/io-app/issues/4300)) ([997c29d](https://github.com/pagopa/io-app/commit/997c29d11706ca3d4afda8006c6c82f9a84bcea7))
* [[IAI-262](https://pagopa.atlassian.net/browse/IAI-262)] Add `onDismiss` handler parameter to `useIOBottomSheetModal` ([#4298](https://github.com/pagopa/io-app/issues/4298)) ([1ecac3e](https://github.com/pagopa/io-app/commit/1ecac3e033aacb856cd03194ad426828d1678f65))

## [2.24.0-rc.0](https://github.com/pagopa/io-app/compare/2.23.0-rc.2...2.24.0-rc.0) (2023-01-13)


### Features

* **IDPay:** [[IODPAY-74](https://pagopa.atlassian.net/browse/IODPAY-74)] Add ability to remove payment instruments from an IDPay initiative ([#4282](https://github.com/pagopa/io-app/issues/4282)) ([151e397](https://github.com/pagopa/io-app/commit/151e397c7685b79e3a289cbea86d1b6dd4969e4d))
* [[IOAPPCOM-40](https://pagopa.atlassian.net/browse/IOAPPCOM-40)] Fix synchronization between in-memory state and stored one (after logout and login) ([#4278](https://github.com/pagopa/io-app/issues/4278)) ([427c894](https://github.com/pagopa/io-app/commit/427c894348d36c656b035af813bf26a132ad38b2))


### Bug Fixes

* [[IABT-1397](https://pagopa.atlassian.net/browse/IABT-1397)] Add custom error template for `PAA_PAGAMENTO_SCONOSCIUTO` ([#4280](https://github.com/pagopa/io-app/issues/4280)) ([bf5de6e](https://github.com/pagopa/io-app/commit/bf5de6e6a1f1fe0ccc1065bc559b8781e085c390))
* [[IABT-1422](https://pagopa.atlassian.net/browse/IABT-1422)] Fix the glitch in the Privacy screen ([#4271](https://github.com/pagopa/io-app/issues/4271)) ([4f3e4b3](https://github.com/pagopa/io-app/commit/4f3e4b37b339de2cf63938f7d5a1c73147c2e40e))
* [[IOAPPCIT-23](https://pagopa.atlassian.net/browse/IOAPPCIT-23)] Fix the glitch in the Download Profile screen ([#4288](https://github.com/pagopa/io-app/issues/4288)) ([c11e11d](https://github.com/pagopa/io-app/commit/c11e11dcd32055f0b83e25377cd1eef70f818a85))


### Chores

* **IDPay:** [[IODPAY-87](https://pagopa.atlassian.net/browse/IODPAY-87)] Enable/disable all IDPay routes based on IDPAY_ENABLED feature flag ([#4289](https://github.com/pagopa/io-app/issues/4289)) ([413c17c](https://github.com/pagopa/io-app/commit/413c17c4390466395ba1c8e6ebc32d173d519591))
* [[IAI-221](https://pagopa.atlassian.net/browse/IAI-221)] Add sublevel navigation to `Design System` page (former `UI Showroom`) ([#4275](https://github.com/pagopa/io-app/issues/4275)) ([22613c2](https://github.com/pagopa/io-app/commit/22613c20d0bd108f1641027063ec340233412b5c))
* [[IAI-259](https://pagopa.atlassian.net/browse/IAI-259)] Remove width limit applied to the text in the Services' metadata ([#4285](https://github.com/pagopa/io-app/issues/4285)) ([b2f6150](https://github.com/pagopa/io-app/commit/b2f6150eac25ae823c95187df7394a92eb2e15f2))
* **IDPay:** [[IODPAY-72](https://pagopa.atlassian.net/browse/IODPAY-72)] Add IDPay onboarding deeplink handling ([#4277](https://github.com/pagopa/io-app/issues/4277)) ([0747769](https://github.com/pagopa/io-app/commit/0747769a3dc0d23376d7b925ff487bf00c6dc430))
* [[IAI-253](https://pagopa.atlassian.net/browse/IAI-253)] List items' inventory ([#4246](https://github.com/pagopa/io-app/issues/4246)) ([8ae8c36](https://github.com/pagopa/io-app/commit/8ae8c364ab6f888f99600f9593ae09a9dbde7d5c))

## [2.23.0-rc.2](https://github.com/pagopa/io-app/compare/2.23.0-rc.1...2.23.0-rc.2) (2023-01-05)


### Features

* **IDPay:** [[IODPAY-67](https://pagopa.atlassian.net/browse/IODPAY-67)] Add IBAN enrollment to IDPay initiative configuration ([#4247](https://github.com/pagopa/io-app/issues/4247)) ([d76fd98](https://github.com/pagopa/io-app/commit/d76fd98bb407a8a828bb04ba8a54c32cdbae0eac))
* **IDPay:** [[IODPAY-70](https://pagopa.atlassian.net/browse/IODPAY-70)] Introduction of "add new iban" IDPAY pages ([#4270](https://github.com/pagopa/io-app/issues/4270)) ([761ed3e](https://github.com/pagopa/io-app/commit/761ed3e9783825f942e74ac35ab16906ae112001))


### Bug Fixes

* **Firma con IO:** [[SFEQS-1274](https://pagopa.atlassian.net/browse/SFEQS-1274)] Add padding between signature field title and related checkbox ([#4262](https://github.com/pagopa/io-app/issues/4262)) ([f4957e7](https://github.com/pagopa/io-app/commit/f4957e769b25799390e6478d40730a53fa9d9702))
* [[IABT-1415](https://pagopa.atlassian.net/browse/IABT-1415)] Not all accessibility information are spoken aloud to the user ([#4261](https://github.com/pagopa/io-app/issues/4261)) ([cd435d4](https://github.com/pagopa/io-app/commit/cd435d482d4b40cb9ebea9a835c84e780c10e6dc))
* [[IOAPPCIT-18](https://pagopa.atlassian.net/browse/IOAPPCIT-18),[IABT-1407](https://pagopa.atlassian.net/browse/IABT-1407)] "More info" link is not accessible on iOS through VoiceOver ([#4276](https://github.com/pagopa/io-app/issues/4276)) ([1a9cd1f](https://github.com/pagopa/io-app/commit/1a9cd1f3ab95b14f2d8cde0723a4c391d94db20d))
* [[IOAPPCIT-19](https://pagopa.atlassian.net/browse/IOAPPCIT-19),[IABT-1406](https://pagopa.atlassian.net/browse/IABT-1406)] It's not clear that the notification shown inside the onboarding push notification preference screen is only an example when read by accessibility tools ([#4274](https://github.com/pagopa/io-app/issues/4274)) ([1b54280](https://github.com/pagopa/io-app/commit/1b5428035843a905e08ce46a4f39f19288b82845))


### Chores

* [[IAI-255](https://pagopa.atlassian.net/browse/IAI-255)] Advice & Banners' inventory ([#4256](https://github.com/pagopa/io-app/issues/4256)) ([9dbe69a](https://github.com/pagopa/io-app/commit/9dbe69a726a5ccd06ec33c6cbf8a0e37613e1329))
* [[IAI-256](https://pagopa.atlassian.net/browse/IAI-256)] Removal of the smile at the page bottom ([#4259](https://github.com/pagopa/io-app/issues/4259)) ([028051a](https://github.com/pagopa/io-app/commit/028051a9d8baa40e3c0dbaed7d78f22984666bf8))
* [[IOAPPPEB-15](https://pagopa.atlassian.net/browse/IOAPPPEB-15)] Move common bonuses code to common folder ([#4269](https://github.com/pagopa/io-app/issues/4269)) ([74ad988](https://github.com/pagopa/io-app/commit/74ad98865430bdc58f9a0e8a31e73eb54f9b5c47))

## [2.23.0-rc.1](https://github.com/pagopa/io-app/compare/2.23.0-rc.0...2.23.0-rc.1) (2022-12-23)


### Features

* **IDPay:** [[IODPAY-56](https://pagopa.atlassian.net/browse/IODPAY-56)] Addition of initiative transaction timeline ([#4218](https://github.com/pagopa/io-app/issues/4218)) ([8e375a2](https://github.com/pagopa/io-app/commit/8e375a20bc3eca4118721c8979da94181ca06bc5))


### Bug Fixes

* cancel message ([#4258](https://github.com/pagopa/io-app/issues/4258)) ([d1d4ac1](https://github.com/pagopa/io-app/commit/d1d4ac105dc37318e4d794ddbaa0fae9875db0a4))
* **Firma con IO:** [[SFEQS-1264](https://pagopa.atlassian.net/browse/SFEQS-1264)] Update subtitle in data sharing screen ([#4249](https://github.com/pagopa/io-app/issues/4249)) ([b226d6f](https://github.com/pagopa/io-app/commit/b226d6f8e2287790008166bc105fddcb2f11036e))


### Chores

* **Firma con IO:** [[SFEQS-1230](https://pagopa.atlassian.net/browse/SFEQS-1230)] Add a new privacy tag link to support privacy url ([#4251](https://github.com/pagopa/io-app/issues/4251)) ([896cf6b](https://github.com/pagopa/io-app/commit/896cf6b37b9c7b56d0d671e4b21fd1f68df5806d))
* **IDPay:** Remove isIdPayEnabled prop from WalletHomeScreen ([#4254](https://github.com/pagopa/io-app/issues/4254)) ([b5c527a](https://github.com/pagopa/io-app/commit/b5c527a1c1157015e229fe871b3861bb8eabc70d))
* [[IA-854](https://pagopa.atlassian.net/browse/IA-854)] Added translations to jailbreak and root messages ([#4219](https://github.com/pagopa/io-app/issues/4219)) ([b86c42b](https://github.com/pagopa/io-app/commit/b86c42bd45d2f299ee3f043766e87d024ece77f8))
* [[IAI-219](https://pagopa.atlassian.net/browse/IAI-219)] Text fields' inventory ([#4250](https://github.com/pagopa/io-app/issues/4250)) ([f246033](https://github.com/pagopa/io-app/commit/f246033b4162e7f2a1866216962bf971a804d32a))
* [[IAI-252](https://pagopa.atlassian.net/browse/IAI-252)] Buttons' inventory ([#4241](https://github.com/pagopa/io-app/issues/4241)) ([6edb279](https://github.com/pagopa/io-app/commit/6edb279b4404b6abafbedaefa92d354068bac6aa))
* [[IAI-254](https://pagopa.atlassian.net/browse/IAI-254)] Toast notifications' inventory ([#4248](https://github.com/pagopa/io-app/issues/4248)) ([48dea57](https://github.com/pagopa/io-app/commit/48dea57a26d7e7180ac3a2a1874224730052a291))
* **IDPay:** IDPay initiative configuration machine refactoring ([#4240](https://github.com/pagopa/io-app/issues/4240)) ([c9f012e](https://github.com/pagopa/io-app/commit/c9f012e8861a0c104e7b38ce06170b8dd5c7b759))
* [[IOAPPCOM-18](https://pagopa.atlassian.net/browse/IOAPPCOM-18)] Remove unchanged references to Non-Paginated messages component ([#4233](https://github.com/pagopa/io-app/issues/4233)) ([6b1fd6e](https://github.com/pagopa/io-app/commit/6b1fd6e4c48bf98c8bbef8c7255a2ea00b4d47f3))
* [[IOAPPCOM-9](https://pagopa.atlassian.net/browse/IOAPPCOM-9)] Generalization of message attachments ([#4234](https://github.com/pagopa/io-app/issues/4234)) ([66e5898](https://github.com/pagopa/io-app/commit/66e58985b82ddc2e0acf6db00552d0475e1bb821))
* [[IOAPPFD0-10](https://pagopa.atlassian.net/browse/IOAPPFD0-10)] Startup saga, onboarding refactoring ([#4168](https://github.com/pagopa/io-app/issues/4168)) ([2b28791](https://github.com/pagopa/io-app/commit/2b2879179f29dc035e50599c8e061526723f1e92))

## [2.23.0-rc.0](https://github.com/pagopa/io-app/compare/2.22.0-rc.3...2.23.0-rc.0) (2022-12-20)


### Features

* **IDPay:** [[IODPAY-71](https://pagopa.atlassian.net/browse/IODPAY-71)] Add client and API definition for IDPay IBAN endpoints ([#4243](https://github.com/pagopa/io-app/issues/4243)) ([8b9a53b](https://github.com/pagopa/io-app/commit/8b9a53bb0ebc7093a2c12eb818ee43314d9955e5))


### Bug Fixes

* [[IOAPPCOM-16](https://pagopa.atlassian.net/browse/IOAPPCOM-16)] Message spinner from foreground push notification ([#4242](https://github.com/pagopa/io-app/issues/4242)) ([30e1e2a](https://github.com/pagopa/io-app/commit/30e1e2a61fc8d9919ef8eec52e78a71d4120bb24))


### Chores

* **Firma con IO:** [[SFEQS-1255](https://pagopa.atlassian.net/browse/SFEQS-1255)] Disable local feature flag ([#4245](https://github.com/pagopa/io-app/issues/4245)) ([cd51460](https://github.com/pagopa/io-app/commit/cd51460f4f415e1fd17dedad13c0654a879c9989))

## [2.22.0-rc.3](https://github.com/pagopa/io-app/compare/2.22.0-rc.2...2.22.0-rc.3) (2022-12-16)


### Chores

* **Firma con IO:** Activate FCI feature flag ([#4244](https://github.com/pagopa/io-app/issues/4244)) ([4c2eaea](https://github.com/pagopa/io-app/commit/4c2eaea6e240e195aa2c7a959ab249c295675ffd))

## [2.22.0-rc.2](https://github.com/pagopa/io-app/compare/2.21.0-rc.2...2.22.0-rc.2) (2022-12-16)


### Features

* **Firma con IO:** [[SFEQS-1060](https://pagopa.atlassian.net/browse/SFEQS-1060)] Add qtsp clauses and document preview screens ([#4222](https://github.com/pagopa/io-app/issues/4222)) ([90f0d7d](https://github.com/pagopa/io-app/commit/90f0d7d30b71cfaff777de8149324a06778c5458))
* **Firma con IO:** [[SFEQS-1165](https://pagopa.atlassian.net/browse/SFEQS-1165)] Add signing request with identification screen and thank you page ([#4239](https://github.com/pagopa/io-app/issues/4239)) ([1e02ce8](https://github.com/pagopa/io-app/commit/1e02ce8f28285aa0857a81ccc18a768717ad5e36))
* [[IGP-68](https://pagopa.atlassian.net/browse/IGP-68),[IOAPPCOM-33](https://pagopa.atlassian.net/browse/IOAPPCOM-33)] Message read status from push notification on stopped/killed application ([#4235](https://github.com/pagopa/io-app/issues/4235)) ([dbbf28b](https://github.com/pagopa/io-app/commit/dbbf28b4abbb51684931fa618dc477bc13980ac0))
* **IDPay:** [[IODPAY-61](https://pagopa.atlassian.net/browse/IODPAY-61)] Added paymentMethodChoice screen ([#4206](https://github.com/pagopa/io-app/issues/4206)) ([e49db68](https://github.com/pagopa/io-app/commit/e49db6866572ce2ea10bd3556c6c938cfa01fbd9))
* **IDPay:** [[IODPAY-66](https://pagopa.atlassian.net/browse/IODPAY-66)] Added padding between items in PDNDPrerequisites page ([ceab39b](https://github.com/pagopa/io-app/commit/ceab39bf47520645f9397cf9248931149550243f))


### Bug Fixes

* [[IOAPPCOM-13](https://pagopa.atlassian.net/browse/IOAPPCOM-13)] On iPhone 14 the CTA inside the message detail screen does not respect the Safe Area ([#4231](https://github.com/pagopa/io-app/issues/4231)) ([a92bc54](https://github.com/pagopa/io-app/commit/a92bc5482f4a223d68671c14ddc2184d83ebee6a))
* [[IOAPPCOM-35](https://pagopa.atlassian.net/browse/IOAPPCOM-35)] Fix bottom sheets not opening (on a PN message) ([#4237](https://github.com/pagopa/io-app/issues/4237)) ([d557142](https://github.com/pagopa/io-app/commit/d557142756ae1741e501e91d8430b53917fad8c3))
* **Firma con IO:** Fix FCI specs ([#4232](https://github.com/pagopa/io-app/issues/4232)) ([f5c9d6a](https://github.com/pagopa/io-app/commit/f5c9d6ac9c2be2ff9e2ee14892a518f15404c7a6))


### Chores

* **release:** 2.22.0-rc.1 ([e40d9f2](https://github.com/pagopa/io-app/commit/e40d9f2701e086c91df4c9ffe395d02bf3423ce4))
* [[IOAPPCOM-19](https://pagopa.atlassian.net/browse/IOAPPCOM-19)] Due date banner on prescription message detail is not aligned with the one on other messages' detail. ([#4236](https://github.com/pagopa/io-app/issues/4236)) ([b1c8fbf](https://github.com/pagopa/io-app/commit/b1c8fbfe2e2ecba2dddaaa33e122633afef2fcf9))
* **deps:** bump certifi in /scripts/check_cie_button_exists ([#4229](https://github.com/pagopa/io-app/issues/4229)) ([964bd35](https://github.com/pagopa/io-app/commit/964bd35fa1ad3ee1074a06b2fba5762b5c7d3fda))
* **deps:** bump certifi in /scripts/check_urls ([#4228](https://github.com/pagopa/io-app/issues/4228)) ([297e7ff](https://github.com/pagopa/io-app/commit/297e7ffc206bb432c69a7b26d5c32f56f53a92c3))
* **deps:** bump decode-uri-component from 0.2.0 to 0.2.2 ([#4215](https://github.com/pagopa/io-app/issues/4215)) ([1c4caa6](https://github.com/pagopa/io-app/commit/1c4caa6d964c292e2bcad0a3d7b3453bba59acb5))
* **deps:** bump express from 4.17.1 to 4.18.2 ([#4223](https://github.com/pagopa/io-app/issues/4223)) ([67b2c79](https://github.com/pagopa/io-app/commit/67b2c7913425313307bea5255ba281f0aec55b1b))
* **deps:** bump qs from 6.5.2 to 6.5.3 ([#4224](https://github.com/pagopa/io-app/issues/4224)) ([1b6cffc](https://github.com/pagopa/io-app/commit/1b6cffcc2962de7cc4b21e7d0e1e0c2e6099c743))
* **deps:** bump shell-quote from 1.7.2 to 1.7.4 ([#4140](https://github.com/pagopa/io-app/issues/4140)) ([22f8907](https://github.com/pagopa/io-app/commit/22f8907bc360e3025801bc841420157bd04d1f2d))
* **deps:** bump vm2 from 3.9.7 to 3.9.11 ([#4125](https://github.com/pagopa/io-app/issues/4125)) ([bf786ed](https://github.com/pagopa/io-app/commit/bf786ed5a68b7d4bc03236b3906e598903a7d75e))
* **release:** 2.22.0-rc.0 ([09f11de](https://github.com/pagopa/io-app/commit/09f11de4a50505c4d5e5542cd0cc33c51d9ad318))
* [[IOAPPPEB-8](https://pagopa.atlassian.net/browse/IOAPPPEB-8)] Move useHardwareBackButton to common folder ([#4230](https://github.com/pagopa/io-app/issues/4230)) ([55db2b2](https://github.com/pagopa/io-app/commit/55db2b28506789d5d36ae2d2e72989b2a3ad9c1b))

## [2.22.0-rc.1](https://github.com/pagopa/io-app/compare/2.22.0-rc.0...2.22.0-rc.1) (2022-12-15)


### Features

* **Firma con IO:** [[SFEQS-1060](https://pagopa.atlassian.net/browse/SFEQS-1060)] Add qtsp clauses and document preview screens ([#4222](https://github.com/pagopa/io-app/issues/4222)) ([90f0d7d](https://github.com/pagopa/io-app/commit/90f0d7d30b71cfaff777de8149324a06778c5458))
* [[IGP-68](https://pagopa.atlassian.net/browse/IGP-68),[IOAPPCOM-33](https://pagopa.atlassian.net/browse/IOAPPCOM-33)] Message read status from push notification on stopped/killed application ([#4235](https://github.com/pagopa/io-app/issues/4235)) ([dbbf28b](https://github.com/pagopa/io-app/commit/dbbf28b4abbb51684931fa618dc477bc13980ac0))


### Bug Fixes

* [[IOAPPCOM-13](https://pagopa.atlassian.net/browse/IOAPPCOM-13)] On iPhone 14 the CTA inside the message detail screen does not respect the Safe Area ([#4231](https://github.com/pagopa/io-app/issues/4231)) ([a92bc54](https://github.com/pagopa/io-app/commit/a92bc5482f4a223d68671c14ddc2184d83ebee6a))


### Chores

* [[IOAPPCOM-19](https://pagopa.atlassian.net/browse/IOAPPCOM-19)] Due date banner on prescription message detail is not aligned with the one on other messages' detail. ([#4236](https://github.com/pagopa/io-app/issues/4236)) ([b1c8fbf](https://github.com/pagopa/io-app/commit/b1c8fbfe2e2ecba2dddaaa33e122633afef2fcf9))

## [2.22.0-rc.0](https://github.com/pagopa/io-app/compare/2.21.0-rc.2...2.22.0-rc.0) (2022-12-14)


### Features

* **IDPay:** [[IODPAY-61](https://pagopa.atlassian.net/browse/IODPAY-61)] Added paymentMethodChoice screen ([#4206](https://github.com/pagopa/io-app/issues/4206)) ([e49db68](https://github.com/pagopa/io-app/commit/e49db6866572ce2ea10bd3556c6c938cfa01fbd9))
* **IDPay:** [[IODPAY-66](https://pagopa.atlassian.net/browse/IODPAY-66)] Added padding between items in PDNDPrerequisites page ([ceab39b](https://github.com/pagopa/io-app/commit/ceab39bf47520645f9397cf9248931149550243f))


### Bug Fixes

* [[IOAPPCOM-35](https://pagopa.atlassian.net/browse/IOAPPCOM-35)] Fix bottom sheets not opening (on a PN message) ([#4237](https://github.com/pagopa/io-app/issues/4237)) ([d557142](https://github.com/pagopa/io-app/commit/d557142756ae1741e501e91d8430b53917fad8c3))
* **Firma con IO:** Fix FCI specs ([#4232](https://github.com/pagopa/io-app/issues/4232)) ([f5c9d6a](https://github.com/pagopa/io-app/commit/f5c9d6ac9c2be2ff9e2ee14892a518f15404c7a6))


### Chores

* **deps:** bump certifi in /scripts/check_cie_button_exists ([#4229](https://github.com/pagopa/io-app/issues/4229)) ([964bd35](https://github.com/pagopa/io-app/commit/964bd35fa1ad3ee1074a06b2fba5762b5c7d3fda))
* **deps:** bump certifi in /scripts/check_urls ([#4228](https://github.com/pagopa/io-app/issues/4228)) ([297e7ff](https://github.com/pagopa/io-app/commit/297e7ffc206bb432c69a7b26d5c32f56f53a92c3))
* **deps:** bump decode-uri-component from 0.2.0 to 0.2.2 ([#4215](https://github.com/pagopa/io-app/issues/4215)) ([1c4caa6](https://github.com/pagopa/io-app/commit/1c4caa6d964c292e2bcad0a3d7b3453bba59acb5))
* **deps:** bump express from 4.17.1 to 4.18.2 ([#4223](https://github.com/pagopa/io-app/issues/4223)) ([67b2c79](https://github.com/pagopa/io-app/commit/67b2c7913425313307bea5255ba281f0aec55b1b))
* **deps:** bump qs from 6.5.2 to 6.5.3 ([#4224](https://github.com/pagopa/io-app/issues/4224)) ([1b6cffc](https://github.com/pagopa/io-app/commit/1b6cffcc2962de7cc4b21e7d0e1e0c2e6099c743))
* **deps:** bump shell-quote from 1.7.2 to 1.7.4 ([#4140](https://github.com/pagopa/io-app/issues/4140)) ([22f8907](https://github.com/pagopa/io-app/commit/22f8907bc360e3025801bc841420157bd04d1f2d))
* **deps:** bump vm2 from 3.9.7 to 3.9.11 ([#4125](https://github.com/pagopa/io-app/issues/4125)) ([bf786ed](https://github.com/pagopa/io-app/commit/bf786ed5a68b7d4bc03236b3906e598903a7d75e))
* [[IOAPPPEB-8](https://pagopa.atlassian.net/browse/IOAPPPEB-8)] Move useHardwareBackButton to common folder ([#4230](https://github.com/pagopa/io-app/issues/4230)) ([55db2b2](https://github.com/pagopa/io-app/commit/55db2b28506789d5d36ae2d2e72989b2a3ad9c1b))

## [2.21.0-rc.2](https://github.com/pagopa/io-app/compare/2.21.0-rc.1...2.21.0-rc.2) (2022-12-07)


### Features

* **Firma con IO:** [[SFEQS-1163](https://pagopa.atlassian.net/browse/SFEQS-1163)] Add user data sharing screen  ([#4213](https://github.com/pagopa/io-app/issues/4213)) ([5008f3c](https://github.com/pagopa/io-app/commit/5008f3c3e323e4449806ee8faba73f1a78522b21))
* **IDPay:** [[IODPAY-60](https://pagopa.atlassian.net/browse/IODPAY-60)] UI Refinements to Interop requirements' page + Add new outline button ([#4217](https://github.com/pagopa/io-app/issues/4217)) ([b996ea7](https://github.com/pagopa/io-app/commit/b996ea7bac405815839f93d9e5c4d2632272b631))


### Bug Fixes

* [[IABT-1403](https://pagopa.atlassian.net/browse/IABT-1403),[IOAPPCIT-9](https://pagopa.atlassian.net/browse/IOAPPCIT-9)] Birth date is wrong in fiscal code component ([#4197](https://github.com/pagopa/io-app/issues/4197)) ([7662cc4](https://github.com/pagopa/io-app/commit/7662cc4767f4822ce46f72c5ef03842f2cd433d8))
* [[IABT-1421](https://pagopa.atlassian.net/browse/IABT-1421)] Remove BPay bank references from the payment flow ([#4221](https://github.com/pagopa/io-app/issues/4221)) ([0ed1b85](https://github.com/pagopa/io-app/commit/0ed1b851be4a61160503fa0f3ec8fe693f40febf))
* [[IOAPPCIT-17](https://pagopa.atlassian.net/browse/IOAPPCIT-17)] Fixes the support request flow from a payment ([#4220](https://github.com/pagopa/io-app/issues/4220)) ([76cf804](https://github.com/pagopa/io-app/commit/76cf804063063604a1a14499dc6cad05d8156f95))
* [[IOAPPPEB-10](https://pagopa.atlassian.net/browse/IOAPPPEB-10)] Fix transaction success cases ([#4225](https://github.com/pagopa/io-app/issues/4225)) ([3a69897](https://github.com/pagopa/io-app/commit/3a698976b22afe3dfc621d58125df2e05798b1f1))


### Chores

* [[IAI-238](https://pagopa.atlassian.net/browse/IAI-238)] Add `LogoPayment…` components ([#4105](https://github.com/pagopa/io-app/issues/4105)) ([f86390f](https://github.com/pagopa/io-app/commit/f86390f50e75bf7eec46f5afc340925754cdcd9c))
* [[IOAPPCOM-28](https://pagopa.atlassian.net/browse/IOAPPCOM-28),[IOAPPCOM-29](https://pagopa.atlassian.net/browse/IOAPPCOM-29),[IOAPPCOM-30](https://pagopa.atlassian.net/browse/IOAPPCOM-30),[IOAPPCOM-31](https://pagopa.atlassian.net/browse/IOAPPCOM-31)] Copy amendment and push notification opt-in screen margins and scroll ([#4214](https://github.com/pagopa/io-app/issues/4214)) ([a472453](https://github.com/pagopa/io-app/commit/a4724534c9fcf4e808337e032753735b7d7a17e2))
* [[IOAPPCOM-7](https://pagopa.atlassian.net/browse/IOAPPCOM-7)] Replaces tabs with Navigation top tabs ([#4189](https://github.com/pagopa/io-app/issues/4189)) ([60d5f92](https://github.com/pagopa/io-app/commit/60d5f92bf1a4edc4ebdd88a79d97fe85d6842c2c))
* **IDPay:** [[IODPAY-65](https://pagopa.atlassian.net/browse/IODPAY-65)] Add IDPay Onboarding machine error handling and back navigation ([#4216](https://github.com/pagopa/io-app/issues/4216)) ([1d4595e](https://github.com/pagopa/io-app/commit/1d4595e148af5d4e28a6a5298e959bc2ddc7ba6e))

## [2.21.0-rc.1](https://github.com/pagopa/io-app/compare/2.21.0-rc.0...2.21.0-rc.1) (2022-12-01)


### Features

* **Firma con IO:** [[SFEQS-1053](https://pagopa.atlassian.net/browse/SFEQS-1053)] Add signature fields screen with clause selection and box drawing ([#4199](https://github.com/pagopa/io-app/issues/4199)) ([e978488](https://github.com/pagopa/io-app/commit/e978488f65cdc4a618e625977b96e28507c5c0e4))
* **IDPay:** [[IODPAY-63](https://pagopa.atlassian.net/browse/IODPAY-63)] Add machine steps to configure payment instruments  ([#4211](https://github.com/pagopa/io-app/issues/4211)) ([15949e7](https://github.com/pagopa/io-app/commit/15949e79eedca7956d8464b897af6e500c39a821))


### Bug Fixes

* [[IOAPPCOM-14](https://pagopa.atlassian.net/browse/IOAPPCOM-14)] Tests for iOS push notifications library integration ([#4208](https://github.com/pagopa/io-app/issues/4208)) ([7a63bff](https://github.com/pagopa/io-app/commit/7a63bffb1d7e10f52ca554b454b971383d6751dd))
* **IDPay:** Fix IDPay initiative cards visualization on Android ([#4212](https://github.com/pagopa/io-app/issues/4212)) ([74da5b7](https://github.com/pagopa/io-app/commit/74da5b78f1931d4e6bd21dca976173b3a223f2dd))


### Chores

* [[IA-895](https://pagopa.atlassian.net/browse/IA-895)] Show consent screen when show ticket CTA is pressed ([#4028](https://github.com/pagopa/io-app/issues/4028)) ([a160016](https://github.com/pagopa/io-app/commit/a16001609bf213f76afbf587c5b1b1ac0caf043c))
* [[IOAPPCOM-6](https://pagopa.atlassian.net/browse/IOAPPCOM-6)] Fix due date visibility on `DueDateBar` component. ([#4190](https://github.com/pagopa/io-app/issues/4190)) ([c3611b9](https://github.com/pagopa/io-app/commit/c3611b9f926a132a1bef2b47cc2fadc98992b56b))
* **Design system:** [[IAI-236](https://pagopa.atlassian.net/browse/IAI-236)] Add `Icon…` components ([#4104](https://github.com/pagopa/io-app/issues/4104)) ([b415c98](https://github.com/pagopa/io-app/commit/b415c98ff32db5a354648e9fb369f21778b92cd8))

## [2.21.0-rc.0](https://github.com/pagopa/io-app/compare/2.20.0-rc.2...2.21.0-rc.0) (2022-11-29)


### Features

* **IDPay:** [[IODPAY-45](https://pagopa.atlassian.net/browse/IODPAY-45)] Added BonusCardScreen ([#4192](https://github.com/pagopa/io-app/issues/4192)) ([5d2dd3e](https://github.com/pagopa/io-app/commit/5d2dd3e05600ce66b7d802feb3f9df5412f91627))
* **IDPay:** [[IODPAY-48](https://pagopa.atlassian.net/browse/IODPAY-48)] Add payment method association success screen ([#4198](https://github.com/pagopa/io-app/issues/4198)) ([1719f2f](https://github.com/pagopa/io-app/commit/1719f2fed54176264adce05529e296ff00568897))
* **IDPay:** [[IODPAY-62](https://pagopa.atlassian.net/browse/IODPAY-62)] Refactor i18n to follow new naming conventions ([#4205](https://github.com/pagopa/io-app/issues/4205)) ([bea4409](https://github.com/pagopa/io-app/commit/bea44091fb21ef4cd537ab1b76511d14ef18c8b8))


### Bug Fixes

* **IDPay:** Change IDPay initiative configuration status check ([#4204](https://github.com/pagopa/io-app/issues/4204)) ([d18b0ea](https://github.com/pagopa/io-app/commit/d18b0ea7db0505a53a9b5fe80411b563f4dec21e))
* [[IABT-1393](https://pagopa.atlassian.net/browse/IABT-1393)] Remove space in payment notice number insertion ([#4170](https://github.com/pagopa/io-app/issues/4170)) ([d33b4b1](https://github.com/pagopa/io-app/commit/d33b4b17e1f025d16f453ddd9383b3d20bbcbefe))


### Chores

* [[IOAPPFD0-17](https://pagopa.atlassian.net/browse/IOAPPFD0-17)] Change backend domain ([#4210](https://github.com/pagopa/io-app/issues/4210)) ([e37788a](https://github.com/pagopa/io-app/commit/e37788a92168748b9032b01addfb074d4d3d5aaa))

## [2.20.0-rc.2](https://github.com/pagopa/io-app/compare/2.20.0-rc.1...2.20.0-rc.2) (2022-11-23)


### Features

* **IDPay:** [[IODPAY-58](https://pagopa.atlassian.net/browse/IODPAY-58)] Refactor using Accept-Language schema (onboarding) ([#4196](https://github.com/pagopa/io-app/issues/4196)) ([8bc7889](https://github.com/pagopa/io-app/commit/8bc7889f5f61079086cd66b6f60cf5ce4d8e70a5))
* **IDPay:** [[IODPAY-59](https://pagopa.atlassian.net/browse/IODPAY-59)] Add initiative configuration intro screen ([#4191](https://github.com/pagopa/io-app/issues/4191)) ([0c4ed71](https://github.com/pagopa/io-app/commit/0c4ed71921cde3f4cef2bc1bc6a9f355239aab6c))


### Bug Fixes

* [[IABT-1405](https://pagopa.atlassian.net/browse/IABT-1405)] Solves the crash on iOS devices for QR code scanner from image ([#4193](https://github.com/pagopa/io-app/issues/4193)) ([127edc9](https://github.com/pagopa/io-app/commit/127edc9ef1197132708aa98f33002a4b74307a5d))
* [[IABT-1409](https://pagopa.atlassian.net/browse/IABT-1409)] Remove bank reference from Bancomat Pay cards ([#4186](https://github.com/pagopa/io-app/issues/4186)) ([6724c7f](https://github.com/pagopa/io-app/commit/6724c7f5b78e3fa6bae4bb23076d6f5c3f40a2a3))

## [2.20.0-rc.1](https://github.com/pagopa/io-app/compare/2.20.0-rc.0...2.20.0-rc.1) (2022-11-22)


### Features

* **Firma con IO:** [[SFEQS-1049](https://pagopa.atlassian.net/browse/SFEQS-1049)] Add documents screen with navigation bar ([#4180](https://github.com/pagopa/io-app/issues/4180)) ([6311242](https://github.com/pagopa/io-app/commit/63112420ef12a70524a1bda1eedb3b2c02773466))
* **IDPay:** [[IODPAY-43](https://pagopa.atlassian.net/browse/IODPAY-43)] Add initiatives cards in wallet screen ([#4181](https://github.com/pagopa/io-app/issues/4181)) ([1529b6b](https://github.com/pagopa/io-app/commit/1529b6b2e236c035e3e9e3d5381e4d0649b6ff06))
* **IDPay:** [[IODPAY-50](https://pagopa.atlassian.net/browse/IODPAY-50)] Implemented BottomSheetModal in PDNDPrerequisitesPage ([#4174](https://github.com/pagopa/io-app/issues/4174)) ([bf10782](https://github.com/pagopa/io-app/commit/bf107828a7561f5388a40d21f76495d436a507bf))
* **IDPay:** [[IODPAY-57](https://pagopa.atlassian.net/browse/IODPAY-57)] Create machine steps to start the initiative configuration ([#4187](https://github.com/pagopa/io-app/issues/4187)) ([36dbe01](https://github.com/pagopa/io-app/commit/36dbe01d0a7286077661803dc337ff61a6ef138e))


### Bug Fixes

* [[IABT-1319](https://pagopa.atlassian.net/browse/IABT-1319),[IOAPPCIT-8](https://pagopa.atlassian.net/browse/IOAPPCIT-8)] Local login notification scheduling removed ([#4172](https://github.com/pagopa/io-app/issues/4172)) ([1459f3e](https://github.com/pagopa/io-app/commit/1459f3e0a6ed1633c8d8e56df38eab6276da8410))
* [[IABT-1408](https://pagopa.atlassian.net/browse/IABT-1408),[IOAPPCOM-17](https://pagopa.atlassian.net/browse/IOAPPCOM-17)] Fixed toggles on Profile Preferences for Push Notifications Opt-in ([#4185](https://github.com/pagopa/io-app/issues/4185)) ([3f546e3](https://github.com/pagopa/io-app/commit/3f546e3afd436942f5b7aa27257ad8a4d9bdd342))
* [[IOAPPCOM-14](https://pagopa.atlassian.net/browse/IOAPPCOM-14)] Fix regression on Push Notification handling on iOS ([#4188](https://github.com/pagopa/io-app/issues/4188)) ([d976b79](https://github.com/pagopa/io-app/commit/d976b790ce22c606eb30190b95f3aa6c5a798df2))


### Chores

* [[IOAPPFD0-15](https://pagopa.atlassian.net/browse/IOAPPFD0-15)] Unlock react-devtools-core to enable profiling in rn-debugger ([#4178](https://github.com/pagopa/io-app/issues/4178)) ([bd78209](https://github.com/pagopa/io-app/commit/bd782099baa0704ea8d4ef1745c651803bf40216))
* **IDPay:** [[IODPAY-52](https://pagopa.atlassian.net/browse/IODPAY-52)] Add IDPay wallet API client ([#4179](https://github.com/pagopa/io-app/issues/4179)) ([f2689db](https://github.com/pagopa/io-app/commit/f2689db83339a47be3e2ce70115e92751fde83d8))
* [[IAI-235](https://pagopa.atlassian.net/browse/IAI-235)] Add `Pictogram` and `SectionPictogram` components ([#4102](https://github.com/pagopa/io-app/issues/4102)) ([802ae9d](https://github.com/pagopa/io-app/commit/802ae9d7f53043c2f5168c6d2ba3603ff6fc56ee))

## [2.20.0-rc.0](https://github.com/pagopa/io-app/compare/2.19.0-rc.4...2.20.0-rc.0) (2022-11-17)


### Features

* [[IOAPPCOM-3](https://pagopa.atlassian.net/browse/IOAPPCOM-3)] Add consent screen to manage push notifications ([#4147](https://github.com/pagopa/io-app/issues/4147)) ([627ef46](https://github.com/pagopa/io-app/commit/627ef46847c35ad8d8e3201ed9a7d7ab8b48a2d1))
* **Firma con IO:** [[SFEQS-1097](https://pagopa.atlassian.net/browse/SFEQS-1097)] Router screen for signature request ([#4166](https://github.com/pagopa/io-app/issues/4166)) ([f1d555f](https://github.com/pagopa/io-app/commit/f1d555f1c48835defcd524f4b36a27575c24fc71))
* [[IOAPPCOM-1](https://pagopa.atlassian.net/browse/IOAPPCOM-1)] Add preview flag on notification onboarding ([#4142](https://github.com/pagopa/io-app/issues/4142)) ([1d2bb7c](https://github.com/pagopa/io-app/commit/1d2bb7cbfa284c6af57c6b645abedb84fba4a5d1))
* **Firma con IO:** [[SFEQS-1073](https://pagopa.atlassian.net/browse/SFEQS-1073)] Actions and reducers ([#4165](https://github.com/pagopa/io-app/issues/4165)) ([4cc2a87](https://github.com/pagopa/io-app/commit/4cc2a87a79338afbcb661067d4c9315c01555fbb))


### Chores

* [[IAI-233](https://pagopa.atlassian.net/browse/IAI-233)] Remove deprecated NativeBase components related to typography ([#4093](https://github.com/pagopa/io-app/issues/4093)) ([eedea6d](https://github.com/pagopa/io-app/commit/eedea6d528b0857e77ef81c6cb09699ef6b4709f))
* [[IOAPPCOM-12](https://pagopa.atlassian.net/browse/IOAPPCOM-12)] Enables the FF and updates required tos version ([#4182](https://github.com/pagopa/io-app/issues/4182)) ([397df53](https://github.com/pagopa/io-app/commit/397df5391255ec0b218e9c862d2403ced4c00a84))
* **IDPay:** [[IODPAY-51](https://pagopa.atlassian.net/browse/IODPAY-51)] Avoid XState machine recreation on provider rerendering ([#4177](https://github.com/pagopa/io-app/issues/4177)) ([4d40393](https://github.com/pagopa/io-app/commit/4d40393b8699384c0602760ce02cde3530c1dcff))

## [2.19.0-rc.4](https://github.com/pagopa/io-app/compare/2.19.0-rc.3...2.19.0-rc.4) (2022-11-11)


### Features

* [[IOAPPPEB-7](https://pagopa.atlassian.net/browse/IOAPPPEB-7)] Fixes double API request ([#4175](https://github.com/pagopa/io-app/issues/4175)) ([b9c16ab](https://github.com/pagopa/io-app/commit/b9c16ab389a13def6aef44e5bdc03a0e77149cb7))

## [2.19.0-rc.3](https://github.com/pagopa/io-app/compare/2.19.0-rc.2...2.19.0-rc.3) (2022-11-11)


### Features

* [[IOAPPPEB-7](https://pagopa.atlassian.net/browse/IOAPPPEB-7)] Handles only the user activation status ([#4173](https://github.com/pagopa/io-app/issues/4173)) ([5b98af0](https://github.com/pagopa/io-app/commit/5b98af0168915f980bb4a5ae7f90240fce33a0bd))
* **IDPay:** [[IODPAY-4](https://pagopa.atlassian.net/browse/IODPAY-4)] Onboarding completion steps ([#4171](https://github.com/pagopa/io-app/issues/4171)) ([b62c7b5](https://github.com/pagopa/io-app/commit/b62c7b509197c6b351beafe84214fcdaf9f8406c))

## [2.19.0-rc.2](https://github.com/pagopa/io-app/compare/2.19.0-rc.1...2.19.0-rc.2) (2022-11-10)


### Features

* [[IOAPPPEB-6](https://pagopa.atlassian.net/browse/IOAPPPEB-6)] Filter mehods not in BPD or added by EXT channel ([#4169](https://github.com/pagopa/io-app/issues/4169)) ([664a29b](https://github.com/pagopa/io-app/commit/664a29bb1e5ab63da7b917d8f9093ed6f1a783a3))

## [2.19.0-rc.1](https://github.com/pagopa/io-app/compare/2.19.0-rc.0...2.19.0-rc.1) (2022-11-10)


### Features

* [[IOAPPPEB-4](https://pagopa.atlassian.net/browse/IOAPPPEB-4)] Handle new opt-in FF and adds the support to new linking ([#4164](https://github.com/pagopa/io-app/issues/4164)) ([45bf5fb](https://github.com/pagopa/io-app/commit/45bf5fbcf95cd20552b398f1a1016e0d728223dd))
* [[IOAPPPEB-5](https://pagopa.atlassian.net/browse/IOAPPPEB-5)] Fix navigation from cta issue ([#4167](https://github.com/pagopa/io-app/issues/4167)) ([5c867cb](https://github.com/pagopa/io-app/commit/5c867cbba77c7e2d6cf6749d6edd21bb01a9bf2e))
* **IDPay:** [[IODPAY-27](https://pagopa.atlassian.net/browse/IODPAY-27)] Add IDPay initiative details screen ([#4153](https://github.com/pagopa/io-app/issues/4153)) ([03e802c](https://github.com/pagopa/io-app/commit/03e802c869f87e53e62782ef2f338210998dfee2))
* **IDPay:** [[IODPAY-28](https://pagopa.atlassian.net/browse/IODPAY-28)] PDND prerequisite screen skeleton ([#4149](https://github.com/pagopa/io-app/issues/4149)) ([ed05968](https://github.com/pagopa/io-app/commit/ed059689c9189eee63f0645c49bf42da4d9aacda))
* **IDPay:** [[IODPAY-36](https://pagopa.atlassian.net/browse/IODPAY-36)] State machine accept ToS steps ([#4159](https://github.com/pagopa/io-app/issues/4159)) ([6228c4b](https://github.com/pagopa/io-app/commit/6228c4bb8dbfbf57ce852f8223a6e50a19f44cb3))
* **IDPay:** [[IODPAY-38](https://pagopa.atlassian.net/browse/IODPAY-38)] Retrieve required criteria machine steps ([#4161](https://github.com/pagopa/io-app/issues/4161)) ([8838f7d](https://github.com/pagopa/io-app/commit/8838f7db6b48313ff0f3869d4031c9963972f6b2))
* **IDPay:** [[IODPAY-39](https://pagopa.atlassian.net/browse/IODPAY-39)] Add Self Declarations screen ([#4162](https://github.com/pagopa/io-app/issues/4162)) ([524b46d](https://github.com/pagopa/io-app/commit/524b46df644cd57d6c1a3a7ac524857707d61469))
* [[IA-950](https://pagopa.atlassian.net/browse/IA-950)] Customize the UI of the opt-in screen for reminders notifications ([#4130](https://github.com/pagopa/io-app/issues/4130)) ([93a3f7d](https://github.com/pagopa/io-app/commit/93a3f7d5bd8ba7ee4f0eb5d4f92212df106e58ac))
* [[IOAPPCOM-2](https://pagopa.atlassian.net/browse/IOAPPCOM-2)] Add support for descriptive push notifications ([#4139](https://github.com/pagopa/io-app/issues/4139)) ([54697f9](https://github.com/pagopa/io-app/commit/54697f91a16dc80ef0fd5831c19fe8ff915b9b7e))
* [[IOAPPPEB-1](https://pagopa.atlassian.net/browse/IOAPPPEB-1)] Request Payment Methods OptIn fixes on copy and UI ([#4146](https://github.com/pagopa/io-app/issues/4146)) ([e98b70a](https://github.com/pagopa/io-app/commit/e98b70a2296e4b93b42c8670f8d97badf20b78cc))
* **IDPay:** [[IODPAY-40](https://pagopa.atlassian.net/browse/IODPAY-40)] Add consent steps to machine ([#4163](https://github.com/pagopa/io-app/issues/4163)) ([1982b58](https://github.com/pagopa/io-app/commit/1982b58dbd8ea6ed25e73988f6acd902cbb86a3d))


### Bug Fixes

* **Platform:** [[IOAPPFD0-12](https://pagopa.atlassian.net/browse/IOAPPFD0-12)] Fix Android bundling ([#4160](https://github.com/pagopa/io-app/issues/4160)) ([0a64a92](https://github.com/pagopa/io-app/commit/0a64a92815cbd755daed7777b99631d91c600bab))


### Chores

* **Firma con IO:** [[SFEQS-1072](https://pagopa.atlassian.net/browse/SFEQS-1072)] Add remote firma con io feature flag ([#4138](https://github.com/pagopa/io-app/issues/4138)) ([a8d9945](https://github.com/pagopa/io-app/commit/a8d994559c1b4f18e6bcd644286d0d8c3ba8c64a))
* [[IAI-231](https://pagopa.atlassian.net/browse/IAI-231)] Add `eslint-plugin-react-native` to detect unused style and/or bad practices ([#4081](https://github.com/pagopa/io-app/issues/4081)) ([cfa7198](https://github.com/pagopa/io-app/commit/cfa7198ce62f2b773ffe8f0e6b1e279dafd87de5))
* **IDPay:** [[IODPAY-37](https://pagopa.atlassian.net/browse/IODPAY-37)] Add tests for initiative steps ([#4155](https://github.com/pagopa/io-app/issues/4155)) ([59922b7](https://github.com/pagopa/io-app/commit/59922b742e4dfa1b5be3075e1fdb3a44e97bdd56))
* [[IAI-228](https://pagopa.atlassian.net/browse/IAI-228)] Remove/Update references to gradient values ([#4076](https://github.com/pagopa/io-app/issues/4076)) ([78fee39](https://github.com/pagopa/io-app/commit/78fee395647664c7779540c74582359a5cafa61b))
* **IDPay:** [[IDPAY-30](https://pagopa.atlassian.net/browse/IDPAY-30)] Create XState machine for IDPay Onboarding flow ([#4151](https://github.com/pagopa/io-app/issues/4151)) ([eea9ad4](https://github.com/pagopa/io-app/commit/eea9ad4c1b706889c1cb74ceab8819b6b0e1322f))
* **IDPay:** [[IDPAY-31](https://pagopa.atlassian.net/browse/IDPAY-31)] Generate IDPay onboarding types and client ([#4150](https://github.com/pagopa/io-app/issues/4150)) ([f35e73d](https://github.com/pagopa/io-app/commit/f35e73db7b9a0b654dc44fae797903c647b6ea8f))

## [2.19.0-rc.0](https://github.com/pagopa/io-app/compare/2.18.0-rc.7...2.19.0-rc.0) (2022-11-02)


### Features

* [[IA-949](https://pagopa.atlassian.net/browse/IA-949)] Present the opt-in screen for reminders during the onboarding ([#4132](https://github.com/pagopa/io-app/issues/4132)) ([9937afa](https://github.com/pagopa/io-app/commit/9937afa305a6d6f895129fa5cc2c964fa227840a))

## [2.18.0-rc.7](https://github.com/pagopa/io-app/compare/2.18.0-rc.6...2.18.0-rc.7) (2022-10-28)


### Chores

* [[IAI-232](https://pagopa.atlassian.net/browse/IAI-232)] Remove/Update references to color values ([#4075](https://github.com/pagopa/io-app/issues/4075)) ([fa22016](https://github.com/pagopa/io-app/commit/fa22016880aa89c0ff6c8c5e1ebd8d082a965aba))

## [2.18.0-rc.6](https://github.com/pagopa/io-app/compare/2.18.0-rc.5...2.18.0-rc.6) (2022-10-25)


### Chores

* [[IOAPPFD0-8](https://pagopa.atlassian.net/browse/IOAPPFD0-8)] Upgrade react-native-vision-camera to fix the build time error in Android ([#4145](https://github.com/pagopa/io-app/issues/4145)) ([4eabf8c](https://github.com/pagopa/io-app/commit/4eabf8c3e7c4a3c61beb09cd91804b0d9b0fbdd0))

## [2.18.0-rc.5](https://github.com/pagopa/io-app/compare/2.18.0-rc.4...2.18.0-rc.5) (2022-10-25)


### Chores

* [[IOAPPFD0-7](https://pagopa.atlassian.net/browse/IOAPPFD0-7)] Set the ruby version of android image on circleCI ([#4143](https://github.com/pagopa/io-app/issues/4143)) ([7a0747d](https://github.com/pagopa/io-app/commit/7a0747d556a0d809fe9ebf6492863a69e460f191))

## [2.18.0-rc.4](https://github.com/pagopa/io-app/compare/2.18.0-rc.3...2.18.0-rc.4) (2022-10-24)

## [2.18.0-rc.3](https://github.com/pagopa/io-app/compare/2.18.0-rc.2...2.18.0-rc.3) (2022-10-24)

## [2.18.0-rc.2](https://github.com/pagopa/io-app/compare/2.18.0-rc.1...2.18.0-rc.2) (2022-10-24)


### Features

* [[IA-945](https://pagopa.atlassian.net/browse/IA-945)] Add a screen to preferences to opt-in/out reminders notifications ([#4128](https://github.com/pagopa/io-app/issues/4128)) ([4703efe](https://github.com/pagopa/io-app/commit/4703efefc9a208b191f311e46cbd517984a97c51))


### Chores

* [[IOAPPFD0-7](https://pagopa.atlassian.net/browse/IOAPPFD0-7)] Updates the minor version of ruby to fix CI release workflows ([#4141](https://github.com/pagopa/io-app/issues/4141)) ([bf37098](https://github.com/pagopa/io-app/commit/bf37098b0e23bfa34a3536c5a4881497b4f70136))

## [2.18.0-rc.1](https://github.com/pagopa/io-app/compare/2.18.0-rc.0...2.18.0-rc.1) (2022-10-24)


### Features

* **Firma con IO:** [[SFEQS-884](https://pagopa.atlassian.net/browse/SFEQS-884)] Add FCI local feature flag ([#4063](https://github.com/pagopa/io-app/issues/4063)) ([d54e6e4](https://github.com/pagopa/io-app/commit/d54e6e45df3b024a77d9d3ffef8941b7b5ebcb59))
* [[IA-946](https://pagopa.atlassian.net/browse/IA-946)] Add the feature flag for enabling the reminders opt-in in app ([#4126](https://github.com/pagopa/io-app/issues/4126)) ([bf126c0](https://github.com/pagopa/io-app/commit/bf126c0a168a1362ef546b8e1fd7bb03aaa4ac5d))


### Bug Fixes

* [[IABT-1398](https://pagopa.atlassian.net/browse/IABT-1398),[IOAPPCOM-5](https://pagopa.atlassian.net/browse/IOAPPCOM-5)] Update Android Manifest with a flag required to save images to Camera Roll ([#4135](https://github.com/pagopa/io-app/issues/4135)) ([dca4f75](https://github.com/pagopa/io-app/commit/dca4f752a2efd2ed7d0bb6d6dbbb9b4a2448ca93))


### Chores

* [[IA-545](https://pagopa.atlassian.net/browse/IA-545)] Remove legacy code of messages without pagination ([#4123](https://github.com/pagopa/io-app/issues/4123)) ([5f06bc3](https://github.com/pagopa/io-app/commit/5f06bc3177b6053cfe051d7c2a1ce1864e943e38))
* [[IAI-152](https://pagopa.atlassian.net/browse/IAI-152)] Upgrade OnboardingNavigator to support react-navigation v5 ([#4122](https://github.com/pagopa/io-app/issues/4122)) ([15ae5f2](https://github.com/pagopa/io-app/commit/15ae5f21a9ed43a44b8f3916c379bd03f78a407f))
* [[IAI-192](https://pagopa.atlassian.net/browse/IAI-192)] Upgrade `react-native` to `0.69.5` ([#4103](https://github.com/pagopa/io-app/issues/4103)) ([11df37b](https://github.com/pagopa/io-app/commit/11df37bf1b6f20e5ffdf38dca1fa672099288d07))
* [[IOAPPFD0-3](https://pagopa.atlassian.net/browse/IOAPPFD0-3)] Next generation eu logo missing from splash ([#4137](https://github.com/pagopa/io-app/issues/4137)) ([2025491](https://github.com/pagopa/io-app/commit/2025491c20f4a4ef02406303c3800154e11632f2))

## [2.18.0-rc.0](https://github.com/pagopa/io-app/compare/2.17.0-rc.2...2.18.0-rc.0) (2022-10-11)

## [2.17.0-rc.2](https://github.com/pagopa/io-app/compare/2.17.0-rc.1...2.17.0-rc.2) (2022-10-07)

## [2.17.0-rc.1](https://github.com/pagopa/io-app/compare/2.17.0-rc.0...2.17.0-rc.1) (2022-09-28)


### Features

* [[IAI-183](https://pagopa.atlassian.net/browse/IAI-183)] Upgrade io-ts, fp-ts and codegen ([#4020](https://github.com/pagopa/io-app/issues/4020)) ([635fe19](https://github.com/pagopa/io-app/commit/635fe192b2964be1b0a16d8f32d6ba498f7b42ef))


### Chores

* [[IAI-151](https://pagopa.atlassian.net/browse/IAI-151)] Update Authentication navigator ([#4056](https://github.com/pagopa/io-app/issues/4056)) ([681a6aa](https://github.com/pagopa/io-app/commit/681a6aa1378eb36f8095a2ed424611e04bc9fe2b))
* [[IAI-164](https://pagopa.atlassian.net/browse/IAI-164)] Upgrade `WalletNavigator` to v5 ([#4097](https://github.com/pagopa/io-app/issues/4097)) ([9e6bfd1](https://github.com/pagopa/io-app/commit/9e6bfd101a3a981fff9729ed4a2e6d04127e6dda))
* [[IAI-246](https://pagopa.atlassian.net/browse/IAI-246)] Changes pagopPa UAT API URI ([#4124](https://github.com/pagopa/io-app/issues/4124)) ([a4f5003](https://github.com/pagopa/io-app/commit/a4f500324ae358758930305c608e005b05964260))

## [2.17.0-rc.0](https://github.com/pagopa/io-app/compare/2.16.0-rc.1...2.17.0-rc.0) (2022-09-27)

## [2.16.0-rc.1](https://github.com/pagopa/io-app/compare/2.16.0-rc.0...2.16.0-rc.1) (2022-09-23)


### Bug Fixes

* **Piattaforma Notifiche:** [[IAMVL-99](https://pagopa.atlassian.net/browse/IAMVL-99)] Attachment ID might not be unique per user ([#4119](https://github.com/pagopa/io-app/issues/4119)) ([7b17562](https://github.com/pagopa/io-app/commit/7b1756267894cfe60a71ff5702ff204f5976362f))


### Chores

* [[IA-927](https://pagopa.atlassian.net/browse/IA-927)] Allow to filter PSPs on poste_datamatrix_scan payment origin ([#4120](https://github.com/pagopa/io-app/issues/4120)) ([91d4090](https://github.com/pagopa/io-app/commit/91d4090f0903cc3abb400015a1cc2d5b3c3195df))

## [2.16.0-rc.0](https://github.com/pagopa/io-app/compare/2.15.0-rc.4...2.16.0-rc.0) (2022-09-20)

## [2.15.0-rc.4](https://github.com/pagopa/io-app/compare/2.15.0-rc.3...2.15.0-rc.4) (2022-09-14)

## [2.15.0-rc.3](https://github.com/pagopa/io-app/compare/2.15.0-rc.2...2.15.0-rc.3) (2022-09-12)


### Features

* [[IIP-103](https://pagopa.atlassian.net/browse/IIP-103)] Fix error message when attachment download fails ([#4114](https://github.com/pagopa/io-app/issues/4114)) ([9dd7ec6](https://github.com/pagopa/io-app/commit/9dd7ec63c61dbde6433c54b502860b36122beebf))

## [2.15.0-rc.2](https://github.com/pagopa/io-app/compare/2.15.0-rc.1...2.15.0-rc.2) (2022-09-12)


### Bug Fixes

* [[IA-928](https://pagopa.atlassian.net/browse/IA-928)] Fix tab bar safe area handling in iPhone 14 Pro ([#4113](https://github.com/pagopa/io-app/issues/4113)) ([e720e5e](https://github.com/pagopa/io-app/commit/e720e5e50f9e94edfdb2a3076f48488e743e7010))


### Chores

* **Piattaforma Notifiche:** [[IAMVL-98](https://pagopa.atlassian.net/browse/IAMVL-98)] Update PN backend types ([#4112](https://github.com/pagopa/io-app/issues/4112)) ([fa95686](https://github.com/pagopa/io-app/commit/fa956863d15e66583a749705b4e3e1b81ecc4e78))

## [2.15.0-rc.1](https://github.com/pagopa/io-app/compare/2.15.0-rc.0...2.15.0-rc.1) (2022-09-08)


### Features

* **Piattaforma Notifiche:** [[IAMVL-97](https://pagopa.atlassian.net/browse/IAMVL-97)] Track PN events to Mixpanel ([#4111](https://github.com/pagopa/io-app/issues/4111)) ([af27021](https://github.com/pagopa/io-app/commit/af27021c794424e92f709a9241a3b2a71670462a))


### Bug Fixes

* [[IABT-1386](https://pagopa.atlassian.net/browse/IABT-1386)] Fix the Android camera permissions request ([#4095](https://github.com/pagopa/io-app/issues/4095)) ([bf5bb81](https://github.com/pagopa/io-app/commit/bf5bb812f758a03b89ef9223c4c90fb3827b542b))


### Chores

* [[IA-926](https://pagopa.atlassian.net/browse/IA-926)] Enter with CIE: copy changes ([#4108](https://github.com/pagopa/io-app/issues/4108)) ([8a34e14](https://github.com/pagopa/io-app/commit/8a34e146c7a9c32edb7309bcba40574d3cda58a3))

## [2.15.0-rc.0](https://github.com/pagopa/io-app/compare/2.14.0-rc.6...2.15.0-rc.0) (2022-08-29)


### Features

* [[IIP-63](https://pagopa.atlassian.net/browse/IIP-63)] Change PDF preview error copy ([#4106](https://github.com/pagopa/io-app/issues/4106)) ([b8585fb](https://github.com/pagopa/io-app/commit/b8585fb26cb52534ca0f01a7c21c98148a6d4f43))
* **Piattaforma Notifiche:** [[IAMVL-89](https://pagopa.atlassian.net/browse/IAMVL-89)] Add a CTA for viewing a notification in the PN website ([#4088](https://github.com/pagopa/io-app/issues/4088)) ([1bc0b89](https://github.com/pagopa/io-app/commit/1bc0b89ca284f06179cc20b90b1f97167e2ff64b))


### Bug Fixes

* [[IA-827](https://pagopa.atlassian.net/browse/IA-827)] Message is still shown as unread after opening it ([#4096](https://github.com/pagopa/io-app/issues/4096)) ([6f8cc68](https://github.com/pagopa/io-app/commit/6f8cc68e0fde52a810c1120b3c291bc7afbb2f0c))


### Chores

* **Piattaforma Notifiche:** [[IAMVL-87](https://pagopa.atlassian.net/browse/IAMVL-87)] Enable PN in production ([#4107](https://github.com/pagopa/io-app/issues/4107)) ([87a75e4](https://github.com/pagopa/io-app/commit/87a75e4a7a4671893b8a0e43624e075d45aa5c8a))
* [[IAI-223](https://pagopa.atlassian.net/browse/IAI-223)] Pictograms and Illustrations' inventory ([#4101](https://github.com/pagopa/io-app/issues/4101)) ([723e236](https://github.com/pagopa/io-app/commit/723e236c4335eb924e5e6b50dcdadd7e389d537e))

## [2.14.0-rc.6](https://github.com/pagopa/io-app/compare/2.14.0-rc.5...2.14.0-rc.6) (2022-08-04)


### Bug Fixes

* [[IA-921](https://pagopa.atlassian.net/browse/IA-921)] Disable navigation gestures on Android ([#4094](https://github.com/pagopa/io-app/issues/4094)) ([e8ca902](https://github.com/pagopa/io-app/commit/e8ca90201748093390742104bec3e2ce4c644c59))
* [[IA-924](https://pagopa.atlassian.net/browse/IA-924)] Disable uppercase buttons on Android ([b6741d8](https://github.com/pagopa/io-app/commit/b6741d83d368aa74828870aa29ca48c8701982ca))
* [[IABT-1382](https://pagopa.atlassian.net/browse/IABT-1382)] Do not consider PPT_PAGAMENTO_DUPLICATO as error  ([#4098](https://github.com/pagopa/io-app/issues/4098)) ([d346aa1](https://github.com/pagopa/io-app/commit/d346aa11d161c1340352108df4127ac219dc735c))
* [[IABT-1385](https://pagopa.atlassian.net/browse/IABT-1385)] Fix transaction summary scrollbar ([#4091](https://github.com/pagopa/io-app/issues/4091)) ([555553b](https://github.com/pagopa/io-app/commit/555553b0ac04aa1b011eda9f637ff393684c9562))


### Chores

* [[IAI-173](https://pagopa.atlassian.net/browse/IAI-173),[IAI-174](https://pagopa.atlassian.net/browse/IAI-174)] Upgrades SiciliaVola Navigators ([#4084](https://github.com/pagopa/io-app/issues/4084)) ([37483d8](https://github.com/pagopa/io-app/commit/37483d860cb55c685346ff9d2ff39de4726b22b7))
* [[IAI-227](https://pagopa.atlassian.net/browse/IAI-227),[IAI-229](https://pagopa.atlassian.net/browse/IAI-229)] Remove/Update references to neutral color values ([#4062](https://github.com/pagopa/io-app/issues/4062)) ([feea850](https://github.com/pagopa/io-app/commit/feea85012279e545bc9b1902db8466f39b1ce565))

## [2.14.0-rc.5](https://github.com/pagopa/io-app/compare/2.14.0-rc.4...2.14.0-rc.5) (2022-07-29)


### Bug Fixes

* [[IA-922](https://pagopa.atlassian.net/browse/IA-922)] Prevent multiple navigations when opening a message ([#4092](https://github.com/pagopa/io-app/issues/4092)) ([19bcf6e](https://github.com/pagopa/io-app/commit/19bcf6e99c60e4fca8f6766f06a2e04fc57d2da0))

## [2.14.0-rc.4](https://github.com/pagopa/io-app/compare/2.14.0-rc.3...2.14.0-rc.4) (2022-07-28)


### Bug Fixes

* [[IA-838](https://pagopa.atlassian.net/browse/IA-838)] Automatically check for new messages on focus ([#4089](https://github.com/pagopa/io-app/issues/4089)) ([567a654](https://github.com/pagopa/io-app/commit/567a6546800f4e9f03dfbaa89968544387a4eafc))
* **Piattaforma Notifiche:** [[IAMVL-94](https://pagopa.atlassian.net/browse/IAMVL-94)] Do not open PN messages automatically from push notifications ([#4080](https://github.com/pagopa/io-app/issues/4080)) ([77b1f66](https://github.com/pagopa/io-app/commit/77b1f66aa9b64cc80c469997d44d135d44872efa))
* **Piattaforma Notifiche:** [[IAMVL-95](https://pagopa.atlassian.net/browse/IAMVL-95)] Fix PN service activation from CTA in message ([#4085](https://github.com/pagopa/io-app/issues/4085)) ([edb5132](https://github.com/pagopa/io-app/commit/edb5132668cb718361831608fed00ac939aac87b))


### Chores

* **Piattaforma Notifiche:** [[IAMVL-96](https://pagopa.atlassian.net/browse/IAMVL-96)] Disable PN feature flag ([#4090](https://github.com/pagopa/io-app/issues/4090)) ([0d8b4f3](https://github.com/pagopa/io-app/commit/0d8b4f340b3a04f41bfd9e766607299b603b846f))
* [[IAI-214](https://pagopa.atlassian.net/browse/IAI-214),[IAI-226](https://pagopa.atlassian.net/browse/IAI-226)] Color values inventory + Update references to white color ([#4057](https://github.com/pagopa/io-app/issues/4057)) ([95301c7](https://github.com/pagopa/io-app/commit/95301c704113859d7a0ab6f6cdff20473bee720e))
* **Piattaforma Notifiche:** [[IAMVL-88](https://pagopa.atlassian.net/browse/IAMVL-88)] Update copy of the PN message opening alert ([#4086](https://github.com/pagopa/io-app/issues/4086)) ([ae36bf1](https://github.com/pagopa/io-app/commit/ae36bf1d2e8e312007fd8ee117e6d1534fe3784e))
* **Piattaforma Notifiche:** [[IAMVL-90](https://pagopa.atlassian.net/browse/IAMVL-90)] Use PN remote config ([#4083](https://github.com/pagopa/io-app/issues/4083)) ([9648e5e](https://github.com/pagopa/io-app/commit/9648e5ee7f5f8e567e33cc4ea72000dc0ff3bb0c))
* [[IA-907](https://pagopa.atlassian.net/browse/IA-907)] Improved manual configuration disclaimer ([#4046](https://github.com/pagopa/io-app/issues/4046)) ([8276761](https://github.com/pagopa/io-app/commit/82767611a86cecbf9e860d543df91ecc9c5e9df1))
* [[IAI-145](https://pagopa.atlassian.net/browse/IAI-145)] Remove bpdTransactionsPaging feature flag and all the related references ([#4087](https://github.com/pagopa/io-app/issues/4087)) ([de92fa7](https://github.com/pagopa/io-app/commit/de92fa72a73165239e86795a7350b579d987ca3f))

## [2.14.0-rc.3](https://github.com/pagopa/io-app/compare/2.14.0-rc.2...2.14.0-rc.3) (2022-07-26)


### Bug Fixes

* [[IA-912](https://pagopa.atlassian.net/browse/IA-912)] Fix Android 12 push notifications ([#4073](https://github.com/pagopa/io-app/issues/4073)) ([554674f](https://github.com/pagopa/io-app/commit/554674f67636e66b64581a2f3622765849d4abb5))


### Chores

* [[IA-915](https://pagopa.atlassian.net/browse/IA-915)] Add `last_app_version` on every profile update request ([#4071](https://github.com/pagopa/io-app/issues/4071)) ([a8b5f32](https://github.com/pagopa/io-app/commit/a8b5f324d5927ce8ff45cf058a31b6cf61798424))
* [[IA-916](https://pagopa.atlassian.net/browse/IA-916)] Fix build errors on Apple silicon ([#4077](https://github.com/pagopa/io-app/issues/4077)) ([9b47d53](https://github.com/pagopa/io-app/commit/9b47d5341c1cd70c77f334ea67101462c340614d))
* [[IAI-154](https://pagopa.atlassian.net/browse/IAI-154)] Upgrades Services navigator to v5  ([#4067](https://github.com/pagopa/io-app/issues/4067)) ([d0c102c](https://github.com/pagopa/io-app/commit/d0c102c42b509f3ca0fe73d658b340d991165fa3))

## [2.14.0-rc.2](https://github.com/pagopa/io-app/compare/2.14.0-rc.1...2.14.0-rc.2) (2022-07-25)

## [2.14.0-rc.1](https://github.com/pagopa/io-app/compare/2.14.0-rc.0...2.14.0-rc.1) (2022-07-21)


### Features

* **Piattaforma Notifiche:** [[IAMVL-79](https://pagopa.atlassian.net/browse/IAMVL-79)] Fetch and show PN message details ([#4043](https://github.com/pagopa/io-app/issues/4043)) ([385ced5](https://github.com/pagopa/io-app/commit/385ced5d1d3514c7c26b2f0fc377f042eea1eecd))
* **Piattaforma Notifiche:** [[IAMVL-82](https://pagopa.atlassian.net/browse/IAMVL-82)] Handle attachments from PN message ([#4047](https://github.com/pagopa/io-app/issues/4047)) ([8baf87a](https://github.com/pagopa/io-app/commit/8baf87a81121b71deb2b7e075a01e1b288c049f5))
* **Piattaforma Notifiche:** [[IAMVL-83](https://pagopa.atlassian.net/browse/IAMVL-83)] Show the timeline in a PN message ([#4061](https://github.com/pagopa/io-app/issues/4061)) ([cd67f77](https://github.com/pagopa/io-app/commit/cd67f773b18b0da66f6f60a7b7d9450c92ef3833))
* **Piattaforma Notifiche:** [[IAMVL-84](https://pagopa.atlassian.net/browse/IAMVL-84)] Add support for PN custom activation flow ([#4069](https://github.com/pagopa/io-app/issues/4069)) ([01346c2](https://github.com/pagopa/io-app/commit/01346c215df37ae520d1fd7e38ae2fbfc79a6d6e))
* **Piattaforma Notifiche:** [[IAMVL-85](https://pagopa.atlassian.net/browse/IAMVL-85)] Add an internal link for activating PN from a CTA ([#4070](https://github.com/pagopa/io-app/issues/4070)) ([f49521e](https://github.com/pagopa/io-app/commit/f49521e57a1ebbc843e197d4a24f492d0084196b))
* [[IIP-83](https://pagopa.atlassian.net/browse/IIP-83)] Prevent user from disabling the warning when opening a PN message ([#4066](https://github.com/pagopa/io-app/issues/4066)) ([f55babc](https://github.com/pagopa/io-app/commit/f55babc812e508f0a3d9de1980056652d4c41a98))

## [2.14.0-rc.0](https://github.com/pagopa/io-app/compare/2.13.0-rc.3...2.14.0-rc.0) (2022-07-19)


### Bug Fixes

* **Carta Giovani Nazionale:** [[IOACGN-81](https://pagopa.atlassian.net/browse/IOACGN-81)] Fixes userAgeRange calculus ([#4054](https://github.com/pagopa/io-app/issues/4054)) ([85b4565](https://github.com/pagopa/io-app/commit/85b45652d556df6b4d33eb1eb253ce76268c705f))

## [2.13.0-rc.3](https://github.com/pagopa/io-app/compare/2.13.0-rc.2...2.13.0-rc.3) (2022-07-14)


### Features

* **Piattaforma Notifiche:** [[IAMVL-81](https://pagopa.atlassian.net/browse/IAMVL-81)] Let the user disable the disclaimer before opening a message from PN ([#4036](https://github.com/pagopa/io-app/issues/4036)) ([ad8d851](https://github.com/pagopa/io-app/commit/ad8d8511a7450a53492382a0a068a34ee3a6a052))


### Chores

* [[IAI-159](https://pagopa.atlassian.net/browse/IAI-159)] Update Zendesk navigator ([#4050](https://github.com/pagopa/io-app/issues/4050)) ([438b60a](https://github.com/pagopa/io-app/commit/438b60a4a0f41a34cab08137296d97ef25f13a05))
* **Carta Giovani Nazionale:** [[IOACGN-80](https://pagopa.atlassian.net/browse/IOACGN-80)] Removes unused store information about cgn selected category ([#4055](https://github.com/pagopa/io-app/issues/4055)) ([7aaf9dd](https://github.com/pagopa/io-app/commit/7aaf9dd9ed5be2636b333c28acb14954e8a14cc8))
* [[IAI-162](https://pagopa.atlassian.net/browse/IAI-162)] Update MVL stack navigator ([#4002](https://github.com/pagopa/io-app/issues/4002)) ([9e24884](https://github.com/pagopa/io-app/commit/9e24884e36db2399dadf5c73f8ebcece0f12094e))
* Remove background screen ([#4049](https://github.com/pagopa/io-app/issues/4049)) ([0d8567c](https://github.com/pagopa/io-app/commit/0d8567cc251af3f2443f4050c91b2f8fa074b816))

## [2.13.0-rc.2](https://github.com/pagopa/io-app/compare/2.13.0-rc.1...2.13.0-rc.2) (2022-07-13)


### Features

* **Piattaforma Notifiche:** [[IAMVL-78](https://pagopa.atlassian.net/browse/IAMVL-78)] Show a disclaimer to the user before opening a message from PN ([#4033](https://github.com/pagopa/io-app/issues/4033)) ([e52b50a](https://github.com/pagopa/io-app/commit/e52b50a3b92b03e3cbf518729b211fce030096e8))
* [[IA-877](https://pagopa.atlassian.net/browse/IA-877)] Implements type validation on Card Holder name to avoid unsupported special characters ([#4034](https://github.com/pagopa/io-app/issues/4034)) ([3755b3d](https://github.com/pagopa/io-app/commit/3755b3d977d7fc332e9b98e1e9a5b2116b2ae1ce))


### Bug Fixes

* [[IA-908](https://pagopa.atlassian.net/browse/IA-908)] Error is not reported to user if payment check fails ([#4038](https://github.com/pagopa/io-app/issues/4038)) ([adbaddf](https://github.com/pagopa/io-app/commit/adbaddf27152c58918aa34194695075a0101044e))
* [[IAI-212](https://pagopa.atlassian.net/browse/IAI-212)] Outdated libraries script doesn't run ([#4039](https://github.com/pagopa/io-app/issues/4039)) ([223c312](https://github.com/pagopa/io-app/commit/223c3126226b909f44711cecea731cb610804553))


### Chores

* [[IA-906](https://pagopa.atlassian.net/browse/IA-906)] Update `tosVersion` to `4.0` ([#4048](https://github.com/pagopa/io-app/issues/4048)) ([5f71719](https://github.com/pagopa/io-app/commit/5f71719685a3ca8c549d90a8872136691ed777ca))
* [[IA-911](https://pagopa.atlassian.net/browse/IA-911)] Fix a race condition in the last app version upsert during the startup ([#4052](https://github.com/pagopa/io-app/issues/4052)) ([b03645c](https://github.com/pagopa/io-app/commit/b03645cf09d744c671453a7f44778bbd630241c1))
* [[IAI-156](https://pagopa.atlassian.net/browse/IAI-156),[IAI-157](https://pagopa.atlassian.net/browse/IAI-157),[IAI-158](https://pagopa.atlassian.net/browse/IAI-158)] Upgrades CGN navigators to avoid the compat mode on RN v5 ([#4022](https://github.com/pagopa/io-app/issues/4022)) ([79ffd61](https://github.com/pagopa/io-app/commit/79ffd6117741870e374f8a804abd6ccfbd6a4a9b))
* [[IAI-161](https://pagopa.atlassian.net/browse/IAI-161)] Update EUCovidCert stack navigator ([#4001](https://github.com/pagopa/io-app/issues/4001)) ([043960d](https://github.com/pagopa/io-app/commit/043960d51697d520f5c31e691a92485c328746f1))
* **deps:** bump moment from 2.29.2 to 2.29.4 ([#4035](https://github.com/pagopa/io-app/issues/4035)) ([8aa61cd](https://github.com/pagopa/io-app/commit/8aa61cddae3bb50ba241d0aae61c6fa18023bdc9))
* [[IAI-190](https://pagopa.atlassian.net/browse/IAI-190)] Handle try-catch `unknown` parameter instead of `any` ([#4000](https://github.com/pagopa/io-app/issues/4000)) ([325b08f](https://github.com/pagopa/io-app/commit/325b08f40455f3d4fd8d38cd2db43fda1bf74436))

## [2.13.0-rc.1](https://github.com/pagopa/io-app/compare/2.13.0-rc.0...2.13.0-rc.1) (2022-07-07)


### Features

* **Piattaforma Notifiche:** [[IAMVL-77](https://pagopa.atlassian.net/browse/IAMVL-77)] Show an icon in messages list to identify a message from PN ([#4010](https://github.com/pagopa/io-app/issues/4010)) ([67b0ef1](https://github.com/pagopa/io-app/commit/67b0ef14f066cc79ecfae24b9306423b12834917))


### Chores

* [[IA-875](https://pagopa.atlassian.net/browse/IA-875)] Latest app version upsert ([#4024](https://github.com/pagopa/io-app/issues/4024)) ([9c387e5](https://github.com/pagopa/io-app/commit/9c387e5e2527fa1b29ccf76ffb21261a66f8b7a7))
* [[IA-905](https://pagopa.atlassian.net/browse/IA-905)] Enable the local feature flag for the Premium Messages Opt-out ([#4032](https://github.com/pagopa/io-app/issues/4032)) ([9ac5ce9](https://github.com/pagopa/io-app/commit/9ac5ce95dcd37a76d0046dfe76386d6c0fa48c75))
* [[IAI-155](https://pagopa.atlassian.net/browse/IAI-155)] Upgrade Profile navigator to v5 ([#4029](https://github.com/pagopa/io-app/issues/4029)) ([d009d25](https://github.com/pagopa/io-app/commit/d009d25bfd6ffc9e902bef2048ce88793e804f58))

## [2.13.0-rc.0](https://github.com/pagopa/io-app/compare/2.12.0-rc.2...2.13.0-rc.0) (2022-07-05)

## [2.12.0-rc.2](https://github.com/pagopa/io-app/compare/2.12.0-rc.1...2.12.0-rc.2) (2022-06-30)


### Features

* [[IA-836](https://pagopa.atlassian.net/browse/IA-836)] Integrate the new "Spunta Blu" service preference ([#4011](https://github.com/pagopa/io-app/issues/4011)) ([bbe0d89](https://github.com/pagopa/io-app/commit/bbe0d890dcaf63acbd0a6eea63904fcca1295150))


### Chores

* [[IA-855](https://pagopa.atlassian.net/browse/IA-855)] Remove the Premium Messages Opt-In/Out placeholder screens ([#4025](https://github.com/pagopa/io-app/issues/4025)) ([cb3df4d](https://github.com/pagopa/io-app/commit/cb3df4d9d0a133ce6a0fd8073301d41c74635e06))
* [[IA-901](https://pagopa.atlassian.net/browse/IA-901)] Adjust the new transaction summary screen UI ([#4026](https://github.com/pagopa/io-app/issues/4026)) ([de72672](https://github.com/pagopa/io-app/commit/de72672244d5c7862013c39be5fdfaeba42f3618))
* [[IAI-153](https://pagopa.atlassian.net/browse/IAI-153)] Update messages stack navigator ([#3999](https://github.com/pagopa/io-app/issues/3999)) ([4f47d3f](https://github.com/pagopa/io-app/commit/4f47d3fa7a1cc6c00f5722a275b22d9afc8e401f))

## [2.12.0-rc.1](https://github.com/pagopa/io-app/compare/2.12.0-rc.0...2.12.0-rc.1) (2022-06-23)


### Bug Fixes

* [[IA-848](https://pagopa.atlassian.net/browse/IA-848)] Message opening from push notification ([#3993](https://github.com/pagopa/io-app/issues/3993)) ([c5c733b](https://github.com/pagopa/io-app/commit/c5c733b984f79a5e12546d7da035f5addb5d422c))
* [[IABT-1373](https://pagopa.atlassian.net/browse/IABT-1373)] Fix support CTA behaviour ([#4014](https://github.com/pagopa/io-app/issues/4014)) ([72f4b46](https://github.com/pagopa/io-app/commit/72f4b46c35798f7e1675dad634b55e5ea45ca320))


### Chores

* add awards to publiccode.yml ([#4021](https://github.com/pagopa/io-app/issues/4021)) ([2718185](https://github.com/pagopa/io-app/commit/2718185177c5971556823deb0d083043afe63027))

## [2.12.0-rc.0](https://github.com/pagopa/io-app/compare/2.11.0-rc.5...2.12.0-rc.0) (2022-06-20)


### Bug Fixes

* [[IA-870](https://pagopa.atlassian.net/browse/IA-870)] Show the welcome screen only the first time for the user ([#3990](https://github.com/pagopa/io-app/issues/3990)) ([e921885](https://github.com/pagopa/io-app/commit/e921885cfa8e80cd2e918eed36da7eb77f73da09))
* [[IA-881](https://pagopa.atlassian.net/browse/IA-881)] Wrong message for Outcome code 4 ([#4006](https://github.com/pagopa/io-app/issues/4006)) ([0f912b4](https://github.com/pagopa/io-app/commit/0f912b44301e0c243d19018c5996c1603b193746))


### Chores

* [[IA-876](https://pagopa.atlassian.net/browse/IA-876)] Enable the feature flag for the new transaction summary screen ([#4009](https://github.com/pagopa/io-app/issues/4009)) ([75b3187](https://github.com/pagopa/io-app/commit/75b318751048d36d5e034c5693fce96aae5cb4f4))
* [[IA-886](https://pagopa.atlassian.net/browse/IA-886)] Change UADonations on iOS ([#4016](https://github.com/pagopa/io-app/issues/4016)) ([faf1e54](https://github.com/pagopa/io-app/commit/faf1e54747fa2caa13aeece8f250bfb6b4a71012))
* [[IAI-209](https://pagopa.atlassian.net/browse/IAI-209)] The `pagopa_specs_diff` job must not fail if the UAT and PROD specs are different ([#4017](https://github.com/pagopa/io-app/issues/4017)) ([cc881bb](https://github.com/pagopa/io-app/commit/cc881bb882025302830285e2ffb437b2598c6349))
* Improve check_urls files exclusion ([#4015](https://github.com/pagopa/io-app/issues/4015)) ([9b7b21c](https://github.com/pagopa/io-app/commit/9b7b21c46fb7f369de969005956576053349ea0f))
* **Carta della cultura:** [[AP-37](https://pagopa.atlassian.net/browse/AP-37)] Update outcome message on CDC partially success screen ([#3985](https://github.com/pagopa/io-app/issues/3985)) ([72f9993](https://github.com/pagopa/io-app/commit/72f99935c8502cfad82c1be3f8df10badeef55c6))
* **Carta Giovani Nazionale:** [[IOACGN-78](https://pagopa.atlassian.net/browse/IOACGN-78)] Fixes landing page to open automatically media playback ([#4013](https://github.com/pagopa/io-app/issues/4013)) ([c3e9735](https://github.com/pagopa/io-app/commit/c3e97355fc6afe76972eef186a2f8ed4b17e1fd5))

## [2.11.0-rc.5](https://github.com/pagopa/io-app/compare/2.11.0-rc.4...2.11.0-rc.5) (2022-06-09)


### Bug Fixes

* [[IAI-208](https://pagopa.atlassian.net/browse/IAI-208)] Fixes the CTAs conversion from old to new linking system ([#4007](https://github.com/pagopa/io-app/issues/4007)) ([1e3f029](https://github.com/pagopa/io-app/commit/1e3f029e0a55a817937c91af3745e2d016c89135))

## [2.11.0-rc.4](https://github.com/pagopa/io-app/compare/2.11.0-rc.3...2.11.0-rc.4) (2022-06-07)


### Features

* [[IIP-12](https://pagopa.atlassian.net/browse/IIP-12)] Redesign the transaction summary screen ([#3976](https://github.com/pagopa/io-app/issues/3976)) ([b84c1fa](https://github.com/pagopa/io-app/commit/b84c1fa7d8149cf053ac80f8ac5a20cc3d7607e8))


### Bug Fixes

* **Carta Giovani Nazionale:** [[IOACGN-75](https://pagopa.atlassian.net/browse/IOACGN-75)] Fixes discount code not showing on discount detail ([#4003](https://github.com/pagopa/io-app/issues/4003)) ([9743351](https://github.com/pagopa/io-app/commit/97433514ce7aca66cfe46b98ad99efa870753d9e))


### Chores

* [[IA-840](https://pagopa.atlassian.net/browse/IA-840)] Changes to Help flow ([#3932](https://github.com/pagopa/io-app/issues/3932)) ([a7c4762](https://github.com/pagopa/io-app/commit/a7c4762f79883aef5b755070a2a3efab7c735437))
* [[IAI-206](https://pagopa.atlassian.net/browse/IAI-206)] Add missing styles to `IOBadge` ([#3996](https://github.com/pagopa/io-app/issues/3996)) ([6271c9c](https://github.com/pagopa/io-app/commit/6271c9c7c68bc216d47f4bbe6932919af304f4f1))
* **Carta della cultura:** [[AP-38](https://pagopa.atlassian.net/browse/AP-38)] Restore swipe back for cdc navigator ([#3994](https://github.com/pagopa/io-app/issues/3994)) ([96a5577](https://github.com/pagopa/io-app/commit/96a5577eaadab77f0af1bb1d0d768e55f0c08e42))
* **deps:** bump simple-plist from 1.1.0 to 1.3.1 ([#3995](https://github.com/pagopa/io-app/issues/3995)) ([28fce22](https://github.com/pagopa/io-app/commit/28fce222e28fef937f72c7b9e8f8e837410c8b91))
* [[IA-874](https://pagopa.atlassian.net/browse/IA-874)] Switch support CTA order ([#3992](https://github.com/pagopa/io-app/issues/3992)) ([99a23ae](https://github.com/pagopa/io-app/commit/99a23aee6402ac590073f2f1a06291b89498b906))
* [[IAI-193](https://pagopa.atlassian.net/browse/IAI-193)] Implements internal link navigation based on `react-navigation` v5 ([#3968](https://github.com/pagopa/io-app/issues/3968)) ([5257326](https://github.com/pagopa/io-app/commit/5257326d5a9fc857a183fcf07d201c8de854ec4c))

## [2.11.0-rc.3](https://github.com/pagopa/io-app/compare/2.11.0-rc.2...2.11.0-rc.3) (2022-06-01)


### Chores

* **Carta Giovani Nazionale:** [[IOACGN-73](https://pagopa.atlassian.net/browse/IOACGN-73)] Adds event tracing for CGN  ([#3991](https://github.com/pagopa/io-app/issues/3991)) ([fe2fd13](https://github.com/pagopa/io-app/commit/fe2fd138afec1bce0f6060698f77f8c9cba192e5))
* [[IA-873](https://pagopa.atlassian.net/browse/IA-873)] Improve the new Pin Screen's a11y ([#3989](https://github.com/pagopa/io-app/issues/3989)) ([268a485](https://github.com/pagopa/io-app/commit/268a485e3c9012d25e9ca20657606e66159d42bf))

## [2.11.0-rc.2](https://github.com/pagopa/io-app/compare/2.11.0-rc.1...2.11.0-rc.2) (2022-05-30)


### Features

* **Piattaforma Notifiche:** [[IAMVL-76](https://pagopa.atlassian.net/browse/IAMVL-76)] Add the local feature flag for PN ([#3983](https://github.com/pagopa/io-app/issues/3983)) ([fb5035d](https://github.com/pagopa/io-app/commit/fb5035dde18abaca837391991b9938e48b3fd8c7))


### Bug Fixes

* [[IABT-1363](https://pagopa.atlassian.net/browse/IABT-1363)] When a service changes the `organization_fiscal_code`, the entry is duplicated ([#3980](https://github.com/pagopa/io-app/issues/3980)) ([a81dead](https://github.com/pagopa/io-app/commit/a81dead516f72fef52ae9c1449cdec4d67545afd))
* [[IABT-1375](https://pagopa.atlassian.net/browse/IABT-1375)] Improve error handling during migration to paginated messages ([#3975](https://github.com/pagopa/io-app/issues/3975)) ([71180e6](https://github.com/pagopa/io-app/commit/71180e6f09e797531da613036ec530bf152e13b3))
* [[IAI-199](https://pagopa.atlassian.net/browse/IAI-199)] Crash `Java.lang.NoSuchMethodError` for `okhttp3` ([#3982](https://github.com/pagopa/io-app/issues/3982)) ([0a42c42](https://github.com/pagopa/io-app/commit/0a42c42ad5761949128a56b0b7f534c8e4617c44))
* e2e tests crash on the iOS 15.5 simulator ([#3979](https://github.com/pagopa/io-app/issues/3979)) ([6420e1d](https://github.com/pagopa/io-app/commit/6420e1d20eb6e1c0df6fc9f1dd113d47d2c741e4))


### Chores

* [[IA-144](https://pagopa.atlassian.net/browse/IA-144)] Refactored the pin creation screen ([#3939](https://github.com/pagopa/io-app/issues/3939)) ([767de1c](https://github.com/pagopa/io-app/commit/767de1ce67f40a95a3aec9583f2f05c89974acfa))
* [[IA-867](https://pagopa.atlassian.net/browse/IA-867)] Add monitoring events for the Poste Data Matrix ([#3977](https://github.com/pagopa/io-app/issues/3977)) ([54cff66](https://github.com/pagopa/io-app/commit/54cff66a4a8eb942f39eae199b2d8fb2d287751f))
* [[IAI-189](https://pagopa.atlassian.net/browse/IAI-189)] Upgrade TypeScript to version `4.7` ([#3963](https://github.com/pagopa/io-app/issues/3963)) ([d5ef1c9](https://github.com/pagopa/io-app/commit/d5ef1c9911895f9d247ce8cfebe649581477aa3a))
* [[IAI-198](https://pagopa.atlassian.net/browse/IAI-198)] Disable `Flipper` on the CI ([#3981](https://github.com/pagopa/io-app/issues/3981)) ([f632fe2](https://github.com/pagopa/io-app/commit/f632fe215228764c0138b8b60a2012846d159190))
* [[IAI-202](https://pagopa.atlassian.net/browse/IAI-202)] Save the dev-server output stream in the CI logs ([#3986](https://github.com/pagopa/io-app/issues/3986)) ([d630111](https://github.com/pagopa/io-app/commit/d630111b43ed9ee778e3046e644048976b1addf6))
* **Federated Identity Management System:** [[IAFIMS-7](https://pagopa.atlassian.net/browse/IAFIMS-7)] Handles the remote FIMS domain configuration ([#3871](https://github.com/pagopa/io-app/issues/3871)) ([36b1071](https://github.com/pagopa/io-app/commit/36b107143dccbb0e94f1b9e4a50a060004f5f82f))
* **Messaggi a valore legale:** [[IAMVL-74](https://pagopa.atlassian.net/browse/IAMVL-74)] Improve attachment download handling ([#3947](https://github.com/pagopa/io-app/issues/3947)) ([f6078c6](https://github.com/pagopa/io-app/commit/f6078c6ce1777863350fd3d40ca0fcdb24c83fb5))
* **Piattaforma Notifiche:** [[IAMVL-80](https://pagopa.atlassian.net/browse/IAMVL-80)] Fix scope of IAMVL project in danger bot ([#3984](https://github.com/pagopa/io-app/issues/3984)) ([c8293dc](https://github.com/pagopa/io-app/commit/c8293dcb734e5b2b9513c8d3f0aa2e2684e07bf1))

## [2.11.0-rc.1](https://github.com/pagopa/io-app/compare/2.11.0-rc.0...2.11.0-rc.1) (2022-05-26)


### Chores

* [[IAI-36](https://pagopa.atlassian.net/browse/IAI-36)] Update react native to `0.67.4` ([#3915](https://github.com/pagopa/io-app/issues/3915)) ([7df0557](https://github.com/pagopa/io-app/commit/7df0557dbaa40e1c1f738f8527ede070c4b1909d))

## [2.11.0-rc.0](https://github.com/pagopa/io-app/compare/2.10.0-rc.1...2.11.0-rc.0) (2022-05-24)


### Chores

* [[IA-866](https://pagopa.atlassian.net/browse/IA-866)] Activate the local Feature Flag for the Poste Data Matrix feature ([#3974](https://github.com/pagopa/io-app/issues/3974)) ([32f89cb](https://github.com/pagopa/io-app/commit/32f89cbb751249348669559591436ee18ff70697))
* **deps:** bump async from 2.6.3 to 2.6.4 ([#3973](https://github.com/pagopa/io-app/issues/3973)) ([5a77a8f](https://github.com/pagopa/io-app/commit/5a77a8f893a4736b39e4277d19b8d9be3a493c04))

## [2.10.0-rc.1](https://github.com/pagopa/io-app/compare/2.10.0-rc.0...2.10.0-rc.1) (2022-05-19)


### Bug Fixes

* [[IA-847](https://pagopa.atlassian.net/browse/IA-847)] Bottomsheet randomly glitching on present ([#3969](https://github.com/pagopa/io-app/issues/3969)) ([f372378](https://github.com/pagopa/io-app/commit/f3723780d4c61c3ab118f9f173f81067e452439b))


### Chores

* **Carta della cultura:** [[AP-13](https://pagopa.atlassian.net/browse/AP-13)] Cdc requested bonus screen ([#3964](https://github.com/pagopa/io-app/issues/3964)) ([dd8a4a3](https://github.com/pagopa/io-app/commit/dd8a4a3a90a70cf647ffa3abd36944d57025c5d4))
* **Carta della cultura:** [[AP-14](https://pagopa.atlassian.net/browse/AP-14)] Cdc monitoring ([#3966](https://github.com/pagopa/io-app/issues/3966)) ([022639a](https://github.com/pagopa/io-app/commit/022639a51793d8d13429c4b4d72c38747df0f513))
* **Carta della cultura:** [[AP-27](https://pagopa.atlassian.net/browse/AP-27)] Update url path ([#3965](https://github.com/pagopa/io-app/issues/3965)) ([e62d75f](https://github.com/pagopa/io-app/commit/e62d75f301f3e20766ba5d4f741a29b06fdcea87))
* **Carta della cultura:** [[AP-33](https://pagopa.atlassian.net/browse/AP-33)] Update cdc swagger ([#3967](https://github.com/pagopa/io-app/issues/3967)) ([b7f7726](https://github.com/pagopa/io-app/commit/b7f77264e960c39c2f309a629061433c50557835))
* **Carta della cultura:** [[AP-34](https://pagopa.atlassian.net/browse/AP-34)] Update cdc bonus description screen ([#3970](https://github.com/pagopa/io-app/issues/3970)) ([7a28864](https://github.com/pagopa/io-app/commit/7a2886495390d883be396740763ecb6a4afefa8e))
* **Carta della cultura:** [[AP-36](https://pagopa.atlassian.net/browse/AP-36)] Activate local cdc feature flag ([#3972](https://github.com/pagopa/io-app/issues/3972)) ([efb0f82](https://github.com/pagopa/io-app/commit/efb0f82022a077884a23678ca90cce0b87fc6954))
* [[IA-858](https://pagopa.atlassian.net/browse/IA-858)] Add Poste Data Matrix implementation ([#3956](https://github.com/pagopa/io-app/issues/3956)) ([7fb456b](https://github.com/pagopa/io-app/commit/7fb456bb71acb5eb28190a395a440be29de90276))

## [2.10.0-rc.0](https://github.com/pagopa/io-app/compare/2.9.0-rc.1...2.10.0-rc.0) (2022-05-18)


### Bug Fixes

* [[IA-425](https://pagopa.atlassian.net/browse/IA-425)] Update PayWebViewModalcomments ([#3953](https://github.com/pagopa/io-app/issues/3953)) ([1138b83](https://github.com/pagopa/io-app/commit/1138b839a21c34e0f31680280503e8c022a3edb2))


### Chores

* **Carta della cultura:** [[AP-28](https://pagopa.atlassian.net/browse/AP-28)] Update select residence screen logic ([#3955](https://github.com/pagopa/io-app/issues/3955)) ([aec7ce9](https://github.com/pagopa/io-app/commit/aec7ce95193fd5ab63d47d6c0dc42c5ee6bd5b7a))
* **Carta della cultura:** [[AP-5](https://pagopa.atlassian.net/browse/AP-5)] Add cdc bonus entry points ([#3958](https://github.com/pagopa/io-app/issues/3958)) ([4e7f137](https://github.com/pagopa/io-app/commit/4e7f137cbc84b7baa643d399294ea212a75b9cda))
* [[IA-861](https://pagopa.atlassian.net/browse/IA-861)] Improve BPay item representation ([#3957](https://github.com/pagopa/io-app/issues/3957)) ([00c008c](https://github.com/pagopa/io-app/commit/00c008c707c7ad47dc9f5265a4e39f320ef1dfef))
* update podfile.lock to remove dependencies ([#3962](https://github.com/pagopa/io-app/issues/3962)) ([fe8ffd9](https://github.com/pagopa/io-app/commit/fe8ffd937c5ab512fed862c028ca0372eb2f2e8b))
* **Carta della cultura:** [[AP-21](https://pagopa.atlassian.net/browse/AP-21)] Add cdc status bar ([#3959](https://github.com/pagopa/io-app/issues/3959)) ([4d733fb](https://github.com/pagopa/io-app/commit/4d733fb96a750ade70877a4227282ed9266453a9))
* [[IA-844](https://pagopa.atlassian.net/browse/IA-844)] Add the local and remote flags for the Poste Data Matrix ([#3952](https://github.com/pagopa/io-app/issues/3952)) ([db9e6b8](https://github.com/pagopa/io-app/commit/db9e6b8c339dd8c647177e80c0383be6b6def8a0))
* **Carta della cultura:** [[AP-26](https://pagopa.atlassian.net/browse/AP-26)] Update cdc service CTA action [#3960](https://github.com/pagopa/io-app/issues/3960) ([abea2a6](https://github.com/pagopa/io-app/commit/abea2a6a2eddad9656261888984e88f8d48c2522))

## [2.9.0-rc.1](https://github.com/pagopa/io-app/compare/2.9.0-rc.0...2.9.0-rc.1) (2022-05-12)


### Bug Fixes

* [[IAI-194](https://pagopa.atlassian.net/browse/IAI-194)] E2E tests cannot complete spid onboarding ([#3944](https://github.com/pagopa/io-app/issues/3944)) ([aed5681](https://github.com/pagopa/io-app/commit/aed5681ce47ace9e2d35228955c1edfe21a1aec3))


### Chores

* [[IA-842](https://pagopa.atlassian.net/browse/IA-842)] Integrate React Native Vision Camera to scan QR Codes ([#3928](https://github.com/pagopa/io-app/issues/3928)) ([f5508c8](https://github.com/pagopa/io-app/commit/f5508c8de3080e86799fdf9a7c490811b4fffacc))
* [[IAI-197](https://pagopa.atlassian.net/browse/IAI-197)] Fix E2E test build with `react-native-vision-camera` ([#3950](https://github.com/pagopa/io-app/issues/3950)) ([f3e74f1](https://github.com/pagopa/io-app/commit/f3e74f103d9a3ae549dbf31f1a0a66f9b59e59ce))
* bump publiccode-parser-action to v1 [#3954](https://github.com/pagopa/io-app/issues/3954) ([9056bc3](https://github.com/pagopa/io-app/commit/9056bc3bcbf4bf756874caf441c28f7c0ff1595c))
* Updated EN copy for Carta della Cultura ([#3951](https://github.com/pagopa/io-app/issues/3951)) ([b00ff10](https://github.com/pagopa/io-app/commit/b00ff1038b7c61431d72f8c77fc25a273514c9d4))
* **Carta della cultura:** [[AP-24](https://pagopa.atlassian.net/browse/AP-24)] Update select residence screen ([#3949](https://github.com/pagopa/io-app/issues/3949)) ([dadb556](https://github.com/pagopa/io-app/commit/dadb5564b79f7e70ed399afb5965146ef45e7be5))
* **Carta Giovani Nazionale:** [[IOACGN-71](https://pagopa.atlassian.net/browse/IOACGN-71)] Adds news badge for CGN discounts on category list, merchants list and discount items ([#3948](https://github.com/pagopa/io-app/issues/3948)) ([f654ed4](https://github.com/pagopa/io-app/commit/f654ed46a1fdb7de95d087e755e7c3ddfae49411))

## [2.9.0-rc.0](https://github.com/pagopa/io-app/compare/2.8.0-rc.4...2.9.0-rc.0) (2022-05-10)


### Chores

* **Carta della cultura:** [[AP-10](https://pagopa.atlassian.net/browse/AP-10)] Create carta della cultura entry point on service card ([#3921](https://github.com/pagopa/io-app/issues/3921)) ([3f56d1d](https://github.com/pagopa/io-app/commit/3f56d1df502bf9facf8071f76f3eae11bbe60b81))
* **Carta della cultura:** [[AP-23](https://pagopa.atlassian.net/browse/AP-23)] Select year screen ([#3942](https://github.com/pagopa/io-app/issues/3942)) ([361054d](https://github.com/pagopa/io-app/commit/361054dbd30325e1f1195eed68779ea633556653))
* [[IA-857](https://pagopa.atlassian.net/browse/IA-857)] Transaction summary screen should show the organization fiscal code comes from API ([#3946](https://github.com/pagopa/io-app/issues/3946)) ([2651b44](https://github.com/pagopa/io-app/commit/2651b44d74c8badbfd07560fb7769ae203edee17))

## [2.8.0-rc.4](https://github.com/pagopa/io-app/compare/2.8.0-rc.3...2.8.0-rc.4) (2022-05-06)


### Chores

* [[IA-796](https://pagopa.atlassian.net/browse/IA-796)] BPay tracking events ([#3924](https://github.com/pagopa/io-app/issues/3924)) ([cfd4f1c](https://github.com/pagopa/io-app/commit/cfd4f1c11ca6e8c9ce40719b22db3b09cd3578e6))
* [[IA-833](https://pagopa.atlassian.net/browse/IA-833)] New intro text for BANCOMAT Pay flow ([#3931](https://github.com/pagopa/io-app/issues/3931)) ([213f16c](https://github.com/pagopa/io-app/commit/213f16c19cd875d0194ab5400b56773aeb13b0ee))
* **Carta della cultura:** [[AP-15](https://pagopa.atlassian.net/browse/AP-15)] Carta della cultura networking ([#3927](https://github.com/pagopa/io-app/issues/3927)) ([a87054d](https://github.com/pagopa/io-app/commit/a87054d7eab0ff655ca02a24a5b09b61c53a53af))
* **Carta della cultura:** [[AP-19](https://pagopa.atlassian.net/browse/AP-19)] Modify TOS url [#3943](https://github.com/pagopa/io-app/issues/3943) ([d8c5a59](https://github.com/pagopa/io-app/commit/d8c5a59460662a58f52bd0aaf3d5d5716fc87305))
* Sync Podfile.lock ([#3945](https://github.com/pagopa/io-app/issues/3945)) ([1ef5133](https://github.com/pagopa/io-app/commit/1ef51336ef546eddd18a87907a88c7f95071d5fc))

## [2.8.0-rc.3](https://github.com/pagopa/io-app/compare/2.8.0-rc.2...2.8.0-rc.3) (2022-05-05)


### Features

* **Messaggi a valore legale:** [[IAMVL-67](https://pagopa.atlassian.net/browse/IAMVL-67)] Android menu ([#3925](https://github.com/pagopa/io-app/issues/3925)) ([7a07ac2](https://github.com/pagopa/io-app/commit/7a07ac208014e6df1ba1630d780a2a83589741a8))
* [[IA-807](https://pagopa.atlassian.net/browse/IA-807)] Remove the automatic scroll to top behaviour while navigating back ([#3894](https://github.com/pagopa/io-app/issues/3894)) ([aa24c8f](https://github.com/pagopa/io-app/commit/aa24c8f6df52918bb357ce3c07fa14138b089cae))


### Bug Fixes

* [[IA-816](https://pagopa.atlassian.net/browse/IA-816)] Fix error glitch while deleting a payment method ([#3920](https://github.com/pagopa/io-app/issues/3920)) ([2bb39e8](https://github.com/pagopa/io-app/commit/2bb39e8e6af274f0d97101ca173c608390d2941b))
* [[IA-849](https://pagopa.atlassian.net/browse/IA-849)] Fix Android navigation bottom bar [#3936](https://github.com/pagopa/io-app/issues/3936) ([de9aa58](https://github.com/pagopa/io-app/commit/de9aa58435f3f6908281d815b0ceeef9146509aa))
* [[IA-850](https://pagopa.atlassian.net/browse/IA-850)] In develop mode, during the payment flow, if you go back, an error alert is displayed ([#3934](https://github.com/pagopa/io-app/issues/3934)) ([604beb5](https://github.com/pagopa/io-app/commit/604beb5ac5a1691dfa3064d21cef5526ab1825ba))
* [[IA-856](https://pagopa.atlassian.net/browse/IA-856)] Onboarding cannot be completed after a logout ([#3941](https://github.com/pagopa/io-app/issues/3941)) ([e6c4148](https://github.com/pagopa/io-app/commit/e6c414823a1861ea8b5dfe3d0414ec7bff566b2e))


### Chores

* [[IA-146](https://pagopa.atlassian.net/browse/IA-146)] Show a thank-you screen at the end of the onboarding ([#3833](https://github.com/pagopa/io-app/issues/3833)) ([3fd6d20](https://github.com/pagopa/io-app/commit/3fd6d20c7a27563c9dd3e24fc8762cc4656f81d4))
* **Carta della cultura:** [[AP-12](https://pagopa.atlassian.net/browse/AP-12)] Ask residence screen ([#3917](https://github.com/pagopa/io-app/issues/3917)) ([bc77c4d](https://github.com/pagopa/io-app/commit/bc77c4d207613846c621e960d6b27d588251ad65))
* [[IA-764](https://pagopa.atlassian.net/browse/IA-764)] Premium Messages Opt-In/Out profile stub screen ([#3887](https://github.com/pagopa/io-app/issues/3887)) ([4d7c26c](https://github.com/pagopa/io-app/commit/4d7c26cfa067cee065f4b9555bdf84007d75831f))
* [[IA-809](https://pagopa.atlassian.net/browse/IA-809)] Copy changes [#3938](https://github.com/pagopa/io-app/issues/3938) ([147823c](https://github.com/pagopa/io-app/commit/147823c58f775c38e6b0d21ca54ee9f66777940d))
* [[IA-831](https://pagopa.atlassian.net/browse/IA-831)] Activate disabled payment methods just before payment checkout ([#3929](https://github.com/pagopa/io-app/issues/3929)) ([84dc8ef](https://github.com/pagopa/io-app/commit/84dc8ef9c8c78f69d0e2cf53d9f21359c980b7d3))
* [[IA-845](https://pagopa.atlassian.net/browse/IA-845)] Update BancomatPay privacy url ([#3937](https://github.com/pagopa/io-app/issues/3937)) ([1e512d1](https://github.com/pagopa/io-app/commit/1e512d1560557f532896675083fa43459c530949))
* [[IA-851](https://pagopa.atlassian.net/browse/IA-851)] Refresh users's wallet when visit payment section ([#3935](https://github.com/pagopa/io-app/issues/3935)) ([1d0a338](https://github.com/pagopa/io-app/commit/1d0a338448fadc84ae6f9772e8308edb2e15e974))
* [[LB-348](https://pagopa.atlassian.net/browse/LB-348)] Change italian root/jailbreak message ([#3940](https://github.com/pagopa/io-app/issues/3940)) ([57de6f1](https://github.com/pagopa/io-app/commit/57de6f15ebc063651a23937d24907f59f369f012))
* **deps:** bump cross-fetch from 3.1.4 to 3.1.5 ([#3930](https://github.com/pagopa/io-app/issues/3930)) ([b4e75e6](https://github.com/pagopa/io-app/commit/b4e75e63b03747bce3c27b75794288240668c435))
* **deps:** bump ejs from 3.1.5 to 3.1.7 ([#3926](https://github.com/pagopa/io-app/issues/3926)) ([464f457](https://github.com/pagopa/io-app/commit/464f45710d9fc2e4a5632e42fc44e5a986c91150))
* Update check_urls.py ([#3933](https://github.com/pagopa/io-app/issues/3933)) ([30c5041](https://github.com/pagopa/io-app/commit/30c50410d6b88f700a7883ea0ac48b96935adf87))
* **Federated Identity Management System:** [[IAFIMS-6](https://pagopa.atlassian.net/browse/IAFIMS-6)] Implements FIMS webview component and screens ([#3850](https://github.com/pagopa/io-app/issues/3850)) ([bb3003a](https://github.com/pagopa/io-app/commit/bb3003a1c06814e2d94e95dca80e6230098b1769))

## [2.8.0-rc.2](https://github.com/pagopa/io-app/compare/2.8.0-rc.1...2.8.0-rc.2) (2022-04-28)


### Chores

* [[IA-787](https://pagopa.atlassian.net/browse/IA-787),[IA-789](https://pagopa.atlassian.net/browse/IA-789),[IA-835](https://pagopa.atlassian.net/browse/IA-835)] Upgrade psp list and update wallet API from v1 to v2 ([#3875](https://github.com/pagopa/io-app/issues/3875)) ([87484a8](https://github.com/pagopa/io-app/commit/87484a80085ce947d8a49b5ec7aee507380faf2b))
* **Carta della cultura:** [[AP-6](https://pagopa.atlassian.net/browse/AP-6),[AP-9](https://pagopa.atlassian.net/browse/AP-9)] Add carta della cultura navigation and workunit ([#3911](https://github.com/pagopa/io-app/issues/3911)) ([22e19af](https://github.com/pagopa/io-app/commit/22e19af6db05b8744164430b1d7e6290973502b8))

## [2.8.0-rc.1](https://github.com/pagopa/io-app/compare/2.8.0-rc.0...2.8.0-rc.1) (2022-04-27)


### Chores

* [[IAI-24](https://pagopa.atlassian.net/browse/IAI-24)] Upgrade `react-navigation` to `v5` ([#3836](https://github.com/pagopa/io-app/issues/3836)) ([83377e1](https://github.com/pagopa/io-app/commit/83377e150a0e00c718b1de5dcee6937c87a39474))

## [2.8.0-rc.0](https://github.com/pagopa/io-app/compare/2.7.0-rc.6...2.8.0-rc.0) (2022-04-27)


### Features

* [[#178212559](https://www.pivotaltracker.com/story/show/178212559)] Added learn more CTA on OutcomeCodeMessageComponent ([#3057](https://github.com/pagopa/io-app/issues/3057)) ([8bb2e9e](https://github.com/pagopa/io-app/commit/8bb2e9e78cf6cd838cf47ef9f3ac189dfd137e29))


### Chores

* [[IAI-107](https://pagopa.atlassian.net/browse/IAI-107)] Upgrades @gorhom/bottom-sheet, react-native-gesture-handler and react-native-reanimated ([#3803](https://github.com/pagopa/io-app/issues/3803)) ([644a265](https://github.com/pagopa/io-app/commit/644a265e657940894f79c0dad4623b3d683543e2))
* **Carta della cultura:** [[AP-11](https://pagopa.atlassian.net/browse/AP-11)] Carta della cultura ToS screen ([#3916](https://github.com/pagopa/io-app/issues/3916)) ([ff158db](https://github.com/pagopa/io-app/commit/ff158db001bd76779642d2e7c2389619535b2055))
* **Carta Giovani Nazionale:** [[IOACGN-69](https://pagopa.atlassian.net/browse/IOACGN-69)] Implements e2e tests for CGN activation flows ([#3898](https://github.com/pagopa/io-app/issues/3898)) ([7c31e31](https://github.com/pagopa/io-app/commit/7c31e3121b14dd1a30eaae1568b198cd962aa600))

## [2.7.0-rc.6](https://github.com/pagopa/io-app/compare/2.7.0-rc.5...2.7.0-rc.6) (2022-04-19)


### Bug Fixes

* [[IA-829](https://pagopa.atlassian.net/browse/IA-829)] Fix crash on press the support button on Android [#3918](https://github.com/pagopa/io-app/issues/3918) ([f2964f7](https://github.com/pagopa/io-app/commit/f2964f78acc8607ac6a5a3fe4268dcb620f5ac09))
* [[IA-830](https://pagopa.atlassian.net/browse/IA-830)] Fix performance issue when rendering new message pages ([#3919](https://github.com/pagopa/io-app/issues/3919)) ([a98ccad](https://github.com/pagopa/io-app/commit/a98ccadf5ff8e04a2d4749a333e0b7d6094b5808))


### Chores

* **Carta della cultura:** [[AP-7](https://pagopa.atlassian.net/browse/AP-7)] Model types, actions and reducers of carta della cultura ([#3907](https://github.com/pagopa/io-app/issues/3907)) ([b5387ce](https://github.com/pagopa/io-app/commit/b5387ce37e18d3eec128ba487551159e08282aa6))

## [2.7.0-rc.5](https://github.com/pagopa/io-app/compare/2.7.0-rc.4...2.7.0-rc.5) (2022-04-14)


### Bug Fixes

* [[IA-814](https://pagopa.atlassian.net/browse/IA-814)] An empty screen is shown when an error occurred in SPID login  ([#3896](https://github.com/pagopa/io-app/issues/3896)) ([9b34470](https://github.com/pagopa/io-app/commit/9b34470c7c444cbd3366fd634ade7ed4dcf4136d))
* [[IA-820](https://pagopa.atlassian.net/browse/IA-820)] During a payment if the credit card insertions fails the payment remains `on-going` ([#3902](https://github.com/pagopa/io-app/issues/3902)) ([ace0b81](https://github.com/pagopa/io-app/commit/ace0b81c8fd0aeb71c9b2968cfccd827aef35ea0))
* [[IABT-1369](https://pagopa.atlassian.net/browse/IABT-1369)] Check against service when entering the message detail view ([#3910](https://github.com/pagopa/io-app/issues/3910)) ([b1c991a](https://github.com/pagopa/io-app/commit/b1c991a6af30af36241b1850e55df04c9d3a9b4b))
* [[IABT-1370](https://pagopa.atlassian.net/browse/IABT-1370)] Infinite loop if a payment is started from a message and then go back ([#3904](https://github.com/pagopa/io-app/issues/3904)) ([36a75cb](https://github.com/pagopa/io-app/commit/36a75cbcd3194c977ee5da348f1c3744cd33961b))
* [[IABT-1371](https://pagopa.atlassian.net/browse/IABT-1371)] Make the loading indicator more visible while scrolling the message list [#3913](https://github.com/pagopa/io-app/issues/3913) ([26d8362](https://github.com/pagopa/io-app/commit/26d8362092eb3b2a3f6706dc9a2c328a6b10b7e0))


### Chores

* **Carta Giovani Nazionale:** [[IOACGN-70](https://pagopa.atlassian.net/browse/IOACGN-70)] Changes on the Merchant detail screen and Discount display ([#3914](https://github.com/pagopa/io-app/issues/3914)) ([fb70bad](https://github.com/pagopa/io-app/commit/fb70bad0a7f966828f7361a2dc438c08d856b19e))
* [[IAI-182](https://pagopa.atlassian.net/browse/IAI-182)] Enable iOS push notification in dev mode ([#3909](https://github.com/pagopa/io-app/issues/3909)) ([b3ac276](https://github.com/pagopa/io-app/commit/b3ac276bd62bd9f9c3de0ee7dea8ae92d49cad31))
* **deps:** bump moment from 2.29.1 to 2.29.2 ([#3901](https://github.com/pagopa/io-app/issues/3901)) ([2ee2f89](https://github.com/pagopa/io-app/commit/2ee2f899138343540ebc128b6331c7e7e0d2c4ce))
* **deps:** bump urijs from 1.19.10 to 1.19.11 ([#3906](https://github.com/pagopa/io-app/issues/3906)) ([9a23c42](https://github.com/pagopa/io-app/commit/9a23c424b34b3af47697998a3f0b9ea8e91c6e43))
* [[IA-724](https://pagopa.atlassian.net/browse/IA-724)] Add unit tests for the payment checkout WebView data ([#3900](https://github.com/pagopa/io-app/issues/3900)) ([a537435](https://github.com/pagopa/io-app/commit/a5374351e538fb5f89fa6153dce288129fc195e9))
* [[IA-778](https://pagopa.atlassian.net/browse/IA-778)] Move zendesk user identify after ask permission ([#3899](https://github.com/pagopa/io-app/issues/3899)) ([d9b4bed](https://github.com/pagopa/io-app/commit/d9b4bedc136edd76752b1fb01e60e4bd93b90652))
* [[IAI-180](https://pagopa.atlassian.net/browse/IAI-180)] Update Podfile.lock with RNZendeskChat (0.3.21) ([#3903](https://github.com/pagopa/io-app/issues/3903)) ([6d390a1](https://github.com/pagopa/io-app/commit/6d390a1975b8fde6cbe8627c0e6bf0cacd87d927))

## [2.7.0-rc.4](https://github.com/pagopa/io-app/compare/2.7.0-rc.3...2.7.0-rc.4) (2022-04-08)


### Bug Fixes

* [[IA-769](https://pagopa.atlassian.net/browse/IA-769)] Rptid custom field not filled or filled with wrong value ([#3864](https://github.com/pagopa/io-app/issues/3864)) ([431c7fe](https://github.com/pagopa/io-app/commit/431c7fe77d6f4c0f0ee132066a40b5b9258177a0))
* [[IABT-1364](https://pagopa.atlassian.net/browse/IABT-1364)] Add accessibility fixes to the checkout page ([#3869](https://github.com/pagopa/io-app/issues/3869)) ([11bc32e](https://github.com/pagopa/io-app/commit/11bc32ea393bf5521bc508a61d3fc91e1e6ba124))
* [[IABT-1368](https://pagopa.atlassian.net/browse/IABT-1368)] Wrong message router navigation from push notification ([#3897](https://github.com/pagopa/io-app/issues/3897)) ([fe1382f](https://github.com/pagopa/io-app/commit/fe1382fa846815d377f0a4df5184307e15cead98))


### Chores

* **Federated Identity Management System:** [[IAFIMS-10](https://pagopa.atlassian.net/browse/IAFIMS-10)] Upgrade io-services-metadata specifications [#3895](https://github.com/pagopa/io-app/issues/3895) ([58d2b8b](https://github.com/pagopa/io-app/commit/58d2b8b605c0592da104c60bdc311bcf53effddb))
* [[IA-763](https://pagopa.atlassian.net/browse/IA-763)] Premium Messages Opt-In/Out onboarding stub screen ([#3877](https://github.com/pagopa/io-app/issues/3877)) ([4f5f126](https://github.com/pagopa/io-app/commit/4f5f1268a24f71e400a29a41d34f6d778fd93c43))
* [[IA-805](https://pagopa.atlassian.net/browse/IA-805)] Update e2e tests ([#3889](https://github.com/pagopa/io-app/issues/3889)) ([2bfd702](https://github.com/pagopa/io-app/commit/2bfd702fcd6b78c25685af9978c4fe6cbc4345ac))
* [[IA-806](https://pagopa.atlassian.net/browse/IA-806)] Show BPay in checkout payment screen ([#3884](https://github.com/pagopa/io-app/issues/3884)) ([3fa0b01](https://github.com/pagopa/io-app/commit/3fa0b01777df30886033332876e4921ad2775e64))
* [[IA-812](https://pagopa.atlassian.net/browse/IA-812)] Fix euCovidCert e2e tests under paginated messages ([#3893](https://github.com/pagopa/io-app/issues/3893)) ([76bbef2](https://github.com/pagopa/io-app/commit/76bbef23ec9013e14de5f737cefdd681e583b11c))
* **Carta della cultura:** [[AP-3](https://pagopa.atlassian.net/browse/AP-3)] Add remote carta della cultura feature flag ([#3888](https://github.com/pagopa/io-app/issues/3888)) ([06ddd26](https://github.com/pagopa/io-app/commit/06ddd2641a750ddfa0f89d3f9fd646d9f9388ecf))
* [[IA-810](https://pagopa.atlassian.net/browse/IA-810)] Improve debug top overlay ([#3886](https://github.com/pagopa/io-app/issues/3886)) ([afc38c8](https://github.com/pagopa/io-app/commit/afc38c8660dc1b00bebdaf86c9c942e7d87577c1))
* **Carta della cultura:** [[AP-2](https://pagopa.atlassian.net/browse/AP-2)] Add CDC local feature flag ([#3883](https://github.com/pagopa/io-app/issues/3883)) ([28ffffc](https://github.com/pagopa/io-app/commit/28ffffc2c313c1d2e414d29f91404cdac2e6fff7))

## [2.7.0-rc.3](https://github.com/pagopa/io-app/compare/2.7.0-rc.2...2.7.0-rc.3) (2022-04-05)


### Chores

* [[IA-767](https://pagopa.atlassian.net/browse/IA-767),[IA-804](https://pagopa.atlassian.net/browse/IA-804),[IA-793](https://pagopa.atlassian.net/browse/IA-793)] Show a toast to inform the user when a message operation completes ([#3878](https://github.com/pagopa/io-app/issues/3878)) ([1a2636c](https://github.com/pagopa/io-app/commit/1a2636cb163dcf23d85d108570e0d9ae29ee0835))
* [[IA-799](https://pagopa.atlassian.net/browse/IA-799)] Enable pagination ([#3882](https://github.com/pagopa/io-app/issues/3882)) ([b7e377c](https://github.com/pagopa/io-app/commit/b7e377cdde1b07a48b9628a7198fa441712f59a6))
* [[IA-802](https://pagopa.atlassian.net/browse/IA-802)] Remove the button for (un)selecting all messages [#3879](https://github.com/pagopa/io-app/issues/3879) ([a8aa894](https://github.com/pagopa/io-app/commit/a8aa894ffce04e10368a24965cd263c9afe3ba63))
* [[IAI-179](https://pagopa.atlassian.net/browse/IAI-179)] Remove "upload sourcemap to Instabug" build phase on iOS ([#3880](https://github.com/pagopa/io-app/issues/3880)) ([8076f9e](https://github.com/pagopa/io-app/commit/8076f9ed471c159223e0b24fa53ac4d203de220a))

## [2.7.0-rc.2](https://github.com/pagopa/io-app/compare/2.7.0-rc.1...2.7.0-rc.2) (2022-04-04)


### Bug Fixes

* [[IA-783](https://pagopa.atlassian.net/browse/IA-783)] State handling on message loading ([#3873](https://github.com/pagopa/io-app/issues/3873)) ([e50cb17](https://github.com/pagopa/io-app/commit/e50cb1727427da1a6f3b178c06785ec4d79aa0b0))


### Chores

* [Snyk] Security upgrade cocoapods from 1.10.1 to 1.11.3 and fastlane from 2.191.0 to 2.205.1 ([#3876](https://github.com/pagopa/io-app/issues/3876)) ([953feb1](https://github.com/pagopa/io-app/commit/953feb1471186af0266dd892d3ae1fab6dc28a60))
* **deps-dev:** bump plist from 3.0.4 to 3.0.5 ([#3858](https://github.com/pagopa/io-app/issues/3858)) ([6dabe3f](https://github.com/pagopa/io-app/commit/6dabe3f57c240747fb5d5d50a0badb24b113188a))
* [[IA-736](https://pagopa.atlassian.net/browse/IA-736)] Remove instabug ([#3867](https://github.com/pagopa/io-app/issues/3867)) ([9b99669](https://github.com/pagopa/io-app/commit/9b99669e8bcf083d3290cfe5f00373757294dcac))
* [[IA-770](https://pagopa.atlassian.net/browse/IA-770)] Create the Premium Messages opt-in/out selectors ([#3866](https://github.com/pagopa/io-app/issues/3866)) ([b3e42ee](https://github.com/pagopa/io-app/commit/b3e42eef7087a685231dca184b31fb37c450fe1a))
* [[IA-794](https://pagopa.atlassian.net/browse/IA-794)] Add BancomatPay remote config ([#3872](https://github.com/pagopa/io-app/issues/3872)) ([ae09fa7](https://github.com/pagopa/io-app/commit/ae09fa7df3cac67fa9a212742aca52eb7a5b1f63))
* [[IA-801](https://pagopa.atlassian.net/browse/IA-801)] Remove donation banner from archive and search [#3874](https://github.com/pagopa/io-app/issues/3874) ([93e694d](https://github.com/pagopa/io-app/commit/93e694dd0dff14e720bcdc00f3828f3ee0451133))
* **Carta Giovani Nazionale:** [[IOACGN-65](https://pagopa.atlassian.net/browse/IOACGN-65)] Implements event tracking for landing page error events [#3842](https://github.com/pagopa/io-app/issues/3842) ([b69076f](https://github.com/pagopa/io-app/commit/b69076feaa15160f0c624ae6f888b01bb59c39fa))

## [2.7.0-rc.1](https://github.com/pagopa/io-app/compare/2.7.0-rc.0...2.7.0-rc.1) (2022-03-31)


### Features

* [[IA-681](https://pagopa.atlassian.net/browse/IA-681)] Add archiving to messages with pagination ([#3856](https://github.com/pagopa/io-app/issues/3856)) ([6fffc56](https://github.com/pagopa/io-app/commit/6fffc56392e54d1f719394ff24c0f591bcc6ea81))


### Chores

* [[IA-754](https://pagopa.atlassian.net/browse/IA-754)] Track migration events ([#3865](https://github.com/pagopa/io-app/issues/3865)) ([7857bb7](https://github.com/pagopa/io-app/commit/7857bb7c07a36d6fc8e429a2e4089e3514e79894))

## [2.7.0-rc.0](https://github.com/pagopa/io-app/compare/2.6.0-rc.3...2.7.0-rc.0) (2022-03-30)


### Features

* [[IA-711](https://pagopa.atlassian.net/browse/IA-711)] Refactored payment confirmation user interface ([#3840](https://github.com/pagopa/io-app/issues/3840)) ([686e5c8](https://github.com/pagopa/io-app/commit/686e5c8163b932d53c88a5b05a9e01aea5e21f8d))


### Chores

* [[IA-762](https://pagopa.atlassian.net/browse/IA-762)] Add a local Feature Flag for the Premium Messages Opt-In/Out feature ([#3861](https://github.com/pagopa/io-app/issues/3861)) ([564ddc5](https://github.com/pagopa/io-app/commit/564ddc5b54f10f369ec47b9d74daee6d92e6e233))
* [[IA-765](https://pagopa.atlassian.net/browse/IA-765)] Migration messages: copy update ([#3862](https://github.com/pagopa/io-app/issues/3862)) ([619ce28](https://github.com/pagopa/io-app/commit/619ce285ae8e4a033d6bb4cd7dcbd6b966571bd0))
* [[IA-766](https://pagopa.atlassian.net/browse/IA-766)] Enable pagination" [#3860](https://github.com/pagopa/io-app/issues/3860) ([34ef89c](https://github.com/pagopa/io-app/commit/34ef89cb603f1c39875d0425cc4a2d36b5ded8f7))

## [2.6.0-rc.3](https://github.com/pagopa/io-app/compare/2.6.0-rc.2...2.6.0-rc.3) (2022-03-29)


### Chores

* [[IA-766](https://pagopa.atlassian.net/browse/IA-766)] Enable pagination [#3859](https://github.com/pagopa/io-app/issues/3859) ([82055ec](https://github.com/pagopa/io-app/commit/82055ecd2bdc69c7fd8a8978bd46990c0c6c2e2e))

## [2.6.0-rc.2](https://github.com/pagopa/io-app/compare/2.6.0-rc.1...2.6.0-rc.2) (2022-03-29)


### Features

* [[IA-729](https://pagopa.atlassian.net/browse/IA-729)] Migration UI, loader, messages ([#3853](https://github.com/pagopa/io-app/issues/3853)) ([503722e](https://github.com/pagopa/io-app/commit/503722e0aba08695f0d55b19e7f664b0a8ef625b))


### Bug Fixes

* [[IA-735](https://pagopa.atlassian.net/browse/IA-735)] Fix payment method switch loader alignment on Android [#3855](https://github.com/pagopa/io-app/issues/3855) ([93d92db](https://github.com/pagopa/io-app/commit/93d92dbdd629223559a6607c4537b612ad8cc52b))

## [2.6.0-rc.1](https://github.com/pagopa/io-app/compare/2.6.0-rc.0...2.6.0-rc.1) (2022-03-24)


### Features

* [[IA-728](https://pagopa.atlassian.net/browse/IA-728)] Saga and networking for upserting message attributes ([#3848](https://github.com/pagopa/io-app/issues/3848)) ([99f4ba1](https://github.com/pagopa/io-app/commit/99f4ba18e8e8275eec9822a7d406d5d4510d9d7e))


### Chores

* **deps:** bump minimist from 1.2.5 to 1.2.6 ([#3854](https://github.com/pagopa/io-app/issues/3854)) ([544d8fc](https://github.com/pagopa/io-app/commit/544d8fcaa8631430aaa97db9b3446948eb451df6))
* [[IAI-178](https://pagopa.atlassian.net/browse/IAI-178)] Fix e2e tests on the CI ([#3852](https://github.com/pagopa/io-app/issues/3852)) ([2d43abc](https://github.com/pagopa/io-app/commit/2d43abc8bbbb5121d130c8d482a29a354765803f))
* **Carta Giovani Nazionale:** [[IOACGN-68](https://pagopa.atlassian.net/browse/IOACGN-68)] Refactors bucket code request component to avoid huge bucket consuption ([#3849](https://github.com/pagopa/io-app/issues/3849)) ([dd48f11](https://github.com/pagopa/io-app/commit/dd48f11af636852795e547a5fd2802a1f6c88a4f))
* [[IAI-177](https://pagopa.atlassian.net/browse/IAI-177)] Upgrade xcode version in circleCI config ([#3851](https://github.com/pagopa/io-app/issues/3851)) ([cda3160](https://github.com/pagopa/io-app/commit/cda3160390a55e98798447bc2e6ad53e66c4c379))

## [2.6.0-rc.0](https://github.com/pagopa/io-app/compare/2.5.0-rc.3...2.6.0-rc.0) (2022-03-22)


### Features

* [[IA-679](https://pagopa.atlassian.net/browse/IA-679)] Implement 'Archive' tab with pagination ([#3805](https://github.com/pagopa/io-app/issues/3805)) ([c1ab548](https://github.com/pagopa/io-app/commit/c1ab5481ccd7de8206da837a3af9e11dfe24c103))
* [[IA-726](https://pagopa.atlassian.net/browse/IA-726)] Implement the migration logic ([#3841](https://github.com/pagopa/io-app/issues/3841)) ([0f1c714](https://github.com/pagopa/io-app/commit/0f1c714f410ba80eb8782ceb8e2e964259f78e44))


### Bug Fixes

* [[IA-582](https://pagopa.atlassian.net/browse/IA-582)] Calendar permission denial is not handled correctly on Android ([#3825](https://github.com/pagopa/io-app/issues/3825)) ([17d8e82](https://github.com/pagopa/io-app/commit/17d8e82f759c855cb5e7fd971ac140f54df5d4a5))
* [[IA-709](https://pagopa.atlassian.net/browse/IA-709)] Fix LGTM warnings ([#3822](https://github.com/pagopa/io-app/issues/3822)) ([115d7db](https://github.com/pagopa/io-app/commit/115d7db17ea425437f285fb153fceb5f3ba14df9))
* [[IA-723](https://pagopa.atlassian.net/browse/IA-723)] Remove the green check when a valid QR code is scanned ([#3838](https://github.com/pagopa/io-app/issues/3838)) ([ffe60a3](https://github.com/pagopa/io-app/commit/ffe60a39e54800594c02ad47fa5c893fa4fb3455))
* [[IA-741](https://pagopa.atlassian.net/browse/IA-741)] Test failing on MessageRouterScreen ([#3844](https://github.com/pagopa/io-app/issues/3844)) ([cddd21a](https://github.com/pagopa/io-app/commit/cddd21a05eef2f508a360df4a43347dcc1772fd1))


### Chores

* [[IA-695](https://pagopa.atlassian.net/browse/IA-695)] Search in paginated messages ([#3847](https://github.com/pagopa/io-app/issues/3847)) ([f2d1cf0](https://github.com/pagopa/io-app/commit/f2d1cf0fd9a7006eac46fcb315429c2085abe43c))
* **Federated Identity Management System:** [[IAFIMS-1](https://pagopa.atlassian.net/browse/IAFIMS-1)] Adds Remote and Local feature flag for FIMS feature ([#3834](https://github.com/pagopa/io-app/issues/3834)) ([a6a28d5](https://github.com/pagopa/io-app/commit/a6a28d5be4867007777449af6d9d5d72d851fc05))
* [[IA-715](https://pagopa.atlassian.net/browse/IA-715)] Cleanup in the Android main activity ([#3835](https://github.com/pagopa/io-app/issues/3835)) ([dee39e3](https://github.com/pagopa/io-app/commit/dee39e345d39769488a4757872b3afbd4ee002a1))
* [[IAI-142](https://pagopa.atlassian.net/browse/IAI-142)] Update `react-native-flag-secure-android` and remove custom target ([#3846](https://github.com/pagopa/io-app/issues/3846)) ([d104a14](https://github.com/pagopa/io-app/commit/d104a141d50863e56026530ff4c4daef54814bcb))
* checkurl - Add url to black list ([#3843](https://github.com/pagopa/io-app/issues/3843)) ([05e7b10](https://github.com/pagopa/io-app/commit/05e7b10e3e4192b83a127bb388eb317c65115fed))

## [2.5.0-rc.3](https://github.com/pagopa/io-app/compare/2.5.0-rc.2...2.5.0-rc.3) (2022-03-15)


### Bug Fixes

* [[IA-733](https://pagopa.atlassian.net/browse/IA-733)] The email client is not open when the user denies consent to share information [#3837](https://github.com/pagopa/io-app/issues/3837) ([7705668](https://github.com/pagopa/io-app/commit/77056686d5a0a76adf7621e4a2aae2ba074888a7))


### Chores

* [[IA-142](https://pagopa.atlassian.net/browse/IA-142)] Update ToS screen during onboarding ([#3826](https://github.com/pagopa/io-app/issues/3826)) ([ca6cac7](https://github.com/pagopa/io-app/commit/ca6cac7290fd222a69e163fd3fb75652fdc033ff))
* [[IA-730](https://pagopa.atlassian.net/browse/IA-730)] Copy update CGN ([#3830](https://github.com/pagopa/io-app/issues/3830)) ([0339629](https://github.com/pagopa/io-app/commit/0339629133fe8324b6f4657bae2f5119dc364751))
* add publiccode.yml validation in CI ([#3831](https://github.com/pagopa/io-app/issues/3831)) ([803e382](https://github.com/pagopa/io-app/commit/803e38230073e6db044fe3e7df0cc488750cc95c))

## [2.5.0-rc.2](https://github.com/pagopa/io-app/compare/2.5.0-rc.1...2.5.0-rc.2) (2022-03-11)


### Chores

* [[IA-731](https://pagopa.atlassian.net/browse/IA-731)] Turn ON UA Donation feature flag [#3832](https://github.com/pagopa/io-app/issues/3832) ([081ebef](https://github.com/pagopa/io-app/commit/081ebef1065760810c0e2e84c8e2068536b22586))

## [2.5.0-rc.1](https://github.com/pagopa/io-app/compare/2.5.0-rc.0...2.5.0-rc.1) (2022-03-11)


### Features

* [[IA-349](https://pagopa.atlassian.net/browse/IA-349),[IA-394](https://pagopa.atlassian.net/browse/IA-394)] Added accessibility label for all the payment methods ([#3815](https://github.com/pagopa/io-app/issues/3815)) ([bc1acd1](https://github.com/pagopa/io-app/commit/bc1acd189cfcfe8063fa5073b676a90206afb4f8))
* [[IA-366](https://pagopa.atlassian.net/browse/IA-366)] Link recognition by the screen reader on Android ([#3799](https://github.com/pagopa/io-app/issues/3799)) ([f1542a5](https://github.com/pagopa/io-app/commit/f1542a550da6ed2887da19f82e3c0b921df5ea99))
* [[IA-653](https://pagopa.atlassian.net/browse/IA-653)] Update psp on payment checkout  ([#3718](https://github.com/pagopa/io-app/issues/3718)) ([89c7e0f](https://github.com/pagopa/io-app/commit/89c7e0fe26ddb29df1211e440dd48f0fc7473e32))
* [[IA-668](https://pagopa.atlassian.net/browse/IA-668)] Open the email client instead of the web form if the user denies submitting their information ([#3801](https://github.com/pagopa/io-app/issues/3801)) ([93582fe](https://github.com/pagopa/io-app/commit/93582feb9fa82e7332d5624ed49b6de388399967))
* [[IA-693](https://pagopa.atlassian.net/browse/IA-693)] Add Ukraine donations banner ([#3810](https://github.com/pagopa/io-app/issues/3810)) ([d055d9f](https://github.com/pagopa/io-app/commit/d055d9fa1a95a35b969359b929f6df729548968c))
* [[IA-694](https://pagopa.atlassian.net/browse/IA-694)] Add webview to show and communicate with donation web page ([#3813](https://github.com/pagopa/io-app/issues/3813)) ([e87c0b3](https://github.com/pagopa/io-app/commit/e87c0b31aba48a9d33a37abd2c57be2b5f736cf5))
* [[IA-699](https://pagopa.atlassian.net/browse/IA-699)] Update payment copy ([#3807](https://github.com/pagopa/io-app/issues/3807)) ([e5be94b](https://github.com/pagopa/io-app/commit/e5be94bfe43db05d924c28989a72a5a4dde18cdc))
* [[IA-700](https://pagopa.atlassian.net/browse/IA-700)] Remove the transaction fee contextual help when there is not a fee to pay ([#3808](https://github.com/pagopa/io-app/issues/3808)) ([e066b34](https://github.com/pagopa/io-app/commit/e066b3409bb9cf2ea9d45d786bbd3aa311611524))
* [[IA-704](https://pagopa.atlassian.net/browse/IA-704)] Update payment transaction summary UI ([#3814](https://github.com/pagopa/io-app/issues/3814)) ([9d6d358](https://github.com/pagopa/io-app/commit/9d6d358f9ebc23d8c8e74faf9ec658b4d3ea98b6))


### Bug Fixes

* [[IA-703](https://pagopa.atlassian.net/browse/IA-703)] Regression in the layout of the footer with a safe area ([#3809](https://github.com/pagopa/io-app/issues/3809)) ([cc12d1e](https://github.com/pagopa/io-app/commit/cc12d1e940cb6bd29bce99a2d3daaa8dfa620e56))
* [[IA-705](https://pagopa.atlassian.net/browse/IA-705)] Payment banner shows incorrect total when transaction has no fee ([#3811](https://github.com/pagopa/io-app/issues/3811)) ([077ada1](https://github.com/pagopa/io-app/commit/077ada12fa9502d897b74f3ebdcceff95f00496f))
* [[IA-721](https://pagopa.atlassian.net/browse/IA-721)] Payment data are not forwarded in the payment webview ([#3828](https://github.com/pagopa/io-app/issues/3828)) ([42e304d](https://github.com/pagopa/io-app/commit/42e304d7ce4c85662dbe32fe6ed316beef36e376))
* [[IABT-1348](https://pagopa.atlassian.net/browse/IABT-1348)] Dismiss Zendesk views when app requires identification ([#3794](https://github.com/pagopa/io-app/issues/3794)) ([cf60632](https://github.com/pagopa/io-app/commit/cf606323d8262b39e256c920768a9d69a6de749f))
* [Snyk] Security upgrade react-native-svg from 12.1.1 to 12.3.0 ([#3800](https://github.com/pagopa/io-app/issues/3800)) ([5d20cb0](https://github.com/pagopa/io-app/commit/5d20cb01633869e1eb91a92dab09714a823a7937))
* UAWebViewScreen doesn't have SafeAreaView ([#3823](https://github.com/pagopa/io-app/issues/3823)) ([5cb54ae](https://github.com/pagopa/io-app/commit/5cb54ae9f2ebe11041fdc755dc4681c17df10cbb))


### Chores

* **Bonus Pagamenti Digitali:** [[IAC-143](https://pagopa.atlassian.net/browse/IAC-143)] Switch on local opt-in payment methods feature flag [#3829](https://github.com/pagopa/io-app/issues/3829) ([2717bcf](https://github.com/pagopa/io-app/commit/2717bcf81d7e8d94415b07457049ff1c016d1c04))
* [[IA-701](https://pagopa.atlassian.net/browse/IA-701)] Implements analytics on ua donations ([#3821](https://github.com/pagopa/io-app/issues/3821)) ([406ffc1](https://github.com/pagopa/io-app/commit/406ffc1ed055ce9edd2956d53b76d9312b87be15))
* [[IA-706](https://pagopa.atlassian.net/browse/IA-706)] Show error when url is empty or malformed ([#3824](https://github.com/pagopa/io-app/issues/3824)) ([43cc0ad](https://github.com/pagopa/io-app/commit/43cc0add6bf6c34e7c08d0b530485b5064b6016d))
* Sync Podfile.lock for RNSVG ([#3827](https://github.com/pagopa/io-app/issues/3827)) ([7de7829](https://github.com/pagopa/io-app/commit/7de782931ad11955292267a2a84041c5c09f1ca9))
* **Bonus Pagamenti Digitali:** [[IAC-136](https://pagopa.atlassian.net/browse/IAC-136)] Opt-in analytics ([#3786](https://github.com/pagopa/io-app/issues/3786)) ([f6897fa](https://github.com/pagopa/io-app/commit/f6897fa5e680364983326782aa90567cd0c94555))
* [[IA-692](https://pagopa.atlassian.net/browse/IA-692)] Parse & handle messages coming from donation web page ([#3816](https://github.com/pagopa/io-app/issues/3816)) ([165369c](https://github.com/pagopa/io-app/commit/165369cbedf7fc9800d64e05784e662dc1e70211))
* **deps:** bump urijs from 1.19.9 to 1.19.10 ([#3820](https://github.com/pagopa/io-app/issues/3820)) ([f5a803c](https://github.com/pagopa/io-app/commit/f5a803c566dbab4098073cc14857b1997e77cc8e))
* [[IA-710](https://pagopa.atlassian.net/browse/IA-710)] UaDonationsBanner test refactoring ([#3819](https://github.com/pagopa/io-app/issues/3819)) ([890bde2](https://github.com/pagopa/io-app/commit/890bde26939588fa6caf4dc4c5b3c996700533df))
* **Bonus Pagamenti Digitali:** [[IAC-140](https://pagopa.atlassian.net/browse/IAC-140)] Starts opt-in payment methods workunit ([#3785](https://github.com/pagopa/io-app/issues/3785)) ([408fb6f](https://github.com/pagopa/io-app/commit/408fb6f5b2d9eed6f37a325fff80c2cfab74a14d))
* **Carta Giovani Nazionale:** [[IOACGN-63](https://pagopa.atlassian.net/browse/IOACGN-63)] Prevents the possibility to open media on full screen for CGN merchants landing page ([#3817](https://github.com/pagopa/io-app/issues/3817)) ([92d13c0](https://github.com/pagopa/io-app/commit/92d13c033e3b359838115c99c23cbf92901b603d))
* **deps:** bump urijs from 1.19.8 to 1.19.9 ([#3804](https://github.com/pagopa/io-app/issues/3804)) ([e319022](https://github.com/pagopa/io-app/commit/e3190224452e6df2c044f0799a0b21ca9cdcbba7))
* [[IA-687](https://pagopa.atlassian.net/browse/IA-687)] Disable SPID webview cache ([b9de481](https://github.com/pagopa/io-app/commit/b9de48148af386c051333b6c408c9775f0659b42))
* [[IA-698](https://pagopa.atlassian.net/browse/IA-698)] Donation config selectors ([#3812](https://github.com/pagopa/io-app/issues/3812)) ([b37b62d](https://github.com/pagopa/io-app/commit/b37b62dc4a91036bd17012f6f73a3132971947b4))
* [[IA-702](https://pagopa.atlassian.net/browse/IA-702)] Donations to Ukraine feature flag and foldering ([#3806](https://github.com/pagopa/io-app/issues/3806)) ([ed57c12](https://github.com/pagopa/io-app/commit/ed57c12e44879f2ac9eaebf0774b1e8f1c425284))
* [[IAI-138](https://pagopa.atlassian.net/browse/IAI-138)] Fixed unsafe `take` effects ([#3795](https://github.com/pagopa/io-app/issues/3795)) ([984cc0f](https://github.com/pagopa/io-app/commit/984cc0f0554d98bb0da983512692ef64c790f04b))

## [2.5.0-rc.0](https://github.com/pagopa/io-app/compare/2.4.0-rc.3...2.5.0-rc.0) (2022-03-03)


### Bug Fixes

* [[IA-308](https://pagopa.atlassian.net/browse/IA-308)] Status banner position in messages when the screen reader is OFF ([#3798](https://github.com/pagopa/io-app/issues/3798)) ([3519921](https://github.com/pagopa/io-app/commit/35199212c0f3968c7a29e7a6f19489f8891e8a1a))
* [[IA-406](https://pagopa.atlassian.net/browse/IA-406)] Missing iOS accessibility internal translations ([#3791](https://github.com/pagopa/io-app/issues/3791)) ([1dbc41b](https://github.com/pagopa/io-app/commit/1dbc41b575b0aac4501edc4517c877f04267efb9))


### Chores

* Sync Podfile.lock ([#3797](https://github.com/pagopa/io-app/issues/3797)) ([f96bf83](https://github.com/pagopa/io-app/commit/f96bf83b2dd9aade4fd9e5cc019adce9e6864421))
* **deps-dev:** bump plist from 3.0.1 to 3.0.4 ([#3796](https://github.com/pagopa/io-app/issues/3796)) ([211883f](https://github.com/pagopa/io-app/commit/211883f77d85e001a56088469d96b5c7816b3e6d))

## [2.4.0-rc.3](https://github.com/pagopa/io-app/compare/2.4.0-rc.2...2.4.0-rc.3) (2022-02-28)


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[IAC-142](https://pagopa.atlassian.net/browse/IAC-142)] Fix wrong translation in OptInPaymentMethodsChoiceScreen ([#3789](https://github.com/pagopa/io-app/issues/3789)) ([4f55071](https://github.com/pagopa/io-app/commit/4f55071a1285d1daf1bcc722313409ec3e82f5b0))
* **Carta Giovani Nazionale:** [[IOACGN-61](https://pagopa.atlassian.net/browse/IOACGN-61)] Fixes the bug that prevents to send Referer header for CGN landing page Discount ([#3792](https://github.com/pagopa/io-app/issues/3792)) ([2b1d388](https://github.com/pagopa/io-app/commit/2b1d388d9a64a259538302a7c65a9e4f14f9b52a))


### Chores

* **deps:** bump urijs from 1.19.7 to 1.19.8 ([#3790](https://github.com/pagopa/io-app/issues/3790)) ([ab6d8ce](https://github.com/pagopa/io-app/commit/ab6d8cead908e8a7de8480513fcac2765002c383))
* [[IAI-109](https://pagopa.atlassian.net/browse/IAI-109)] Added `redux-saga` effect types through `typed-redux-saga` ([#3730](https://github.com/pagopa/io-app/issues/3730)) ([21b5333](https://github.com/pagopa/io-app/commit/21b53330aa370a1bf6d313d41d359161d795e2db))
* **Carta Giovani Nazionale:** [[IOACGN-60](https://pagopa.atlassian.net/browse/IOACGN-60)] Implements new CGN Landing page Playground for tests purposes ([#3781](https://github.com/pagopa/io-app/issues/3781)) ([88a344c](https://github.com/pagopa/io-app/commit/88a344c8f33da77567656b22b9b2a21a339472d9))

## [2.4.0-rc.2](https://github.com/pagopa/io-app/compare/2.4.0-rc.1...2.4.0-rc.2) (2022-02-24)


### Bug Fixes

* [[IA-659](https://pagopa.atlassian.net/browse/IA-659)] Opt-out dark mode in iOS ([#3780](https://github.com/pagopa/io-app/issues/3780)) ([04039c9](https://github.com/pagopa/io-app/commit/04039c92d3c80f9bcb66c92a0669078e062cb13f))
* [[IABT-1300](https://pagopa.atlassian.net/browse/IABT-1300)] Centered label text in TransactionErrorScreen ([#3782](https://github.com/pagopa/io-app/issues/3782)) ([89e0b6f](https://github.com/pagopa/io-app/commit/89e0b6fc1da292d754d192cf17d381f582cdb46e))
* package.json & yarn.lock to reduce vulnerabilities ([#3779](https://github.com/pagopa/io-app/issues/3779)) ([4010f33](https://github.com/pagopa/io-app/commit/4010f332035953270c0f95dc815c4388c23b7a7d))


### Chores

* [[IA-677](https://pagopa.atlassian.net/browse/IA-677)] Copy changes after a final check with the legal dept ([#3787](https://github.com/pagopa/io-app/issues/3787)) ([0df943b](https://github.com/pagopa/io-app/commit/0df943b0d922dfa76f1b47123b5a5e82bb882a1b))
* [[IAI-134](https://pagopa.atlassian.net/browse/IAI-134)] chore: [[IAI-133](https://pagopa.atlassian.net/browse/IAI-133)] Rework types for routes and navigation params (2/2 vertical functionalities routes) ([#3760](https://github.com/pagopa/io-app/issues/3760)) ([83c5703](https://github.com/pagopa/io-app/commit/83c5703f52589bdcb470751405e3c284c1da98ed))
* Revert "Enable MVL, disable Android ([#3783](https://github.com/pagopa/io-app/issues/3783))" ([#3784](https://github.com/pagopa/io-app/issues/3784)) ([63e2bbc](https://github.com/pagopa/io-app/commit/63e2bbcfa60ee4cf31e199997082349237a77c3b))

## [2.4.0-rc.1](https://github.com/pagopa/io-app/compare/2.4.0-rc.0...2.4.0-rc.1) (2022-02-23)


### Chores

* **Messaggi a valore legale:** [[IAMVL-68](https://pagopa.atlassian.net/browse/IAMVL-68)] Preview MVL attachments on IOS ([#3774](https://github.com/pagopa/io-app/issues/3774)) ([f0ccfb8](https://github.com/pagopa/io-app/commit/f0ccfb8a38d3e6a9d51ad2cf773c79fb6e4e264b))

## [2.4.0-rc.0](https://github.com/pagopa/io-app/compare/2.3.0-rc.3...2.4.0-rc.0) (2022-02-22)


### Features

* [[IA-673](https://pagopa.atlassian.net/browse/IA-673)] Added versions history permission field ([#3776](https://github.com/pagopa/io-app/issues/3776)) ([bad51da](https://github.com/pagopa/io-app/commit/bad51da1fb931c530123f6c2974e5a800420305b))


### Chores

* [[IAI-133](https://pagopa.atlassian.net/browse/IAI-133)] Rework types for routes and navigation params (1/2 Core routes) ([#3756](https://github.com/pagopa/io-app/issues/3756)) ([30014a8](https://github.com/pagopa/io-app/commit/30014a81872ae29522cc8e0e2d2d8dfcd7938e06))

## [2.3.0-rc.3](https://github.com/pagopa/io-app/compare/2.3.0-rc.2...2.3.0-rc.3) (2022-02-21)


### Features

* [[IA-336](https://pagopa.atlassian.net/browse/IA-336),[IA-380](https://pagopa.atlassian.net/browse/IA-380),[IA-381](https://pagopa.atlassian.net/browse/IA-381)] Fixed Android section header accessibility [#3772](https://github.com/pagopa/io-app/issues/3772) ([6f28361](https://github.com/pagopa/io-app/commit/6f283612572176b9f649455c22bea68961d91dfb))
* [[IA-400](https://pagopa.atlassian.net/browse/IA-400)] The C.F. text will be read as Codice fiscale by the Voice Over ([#3771](https://github.com/pagopa/io-app/issues/3771)) ([9870935](https://github.com/pagopa/io-app/commit/98709359d9f103bd73b55d935729067d28e018ec))


### Bug Fixes

* [[IABT-1283](https://pagopa.atlassian.net/browse/IABT-1283)] Fixed deadline messages loader ([#3758](https://github.com/pagopa/io-app/issues/3758)) ([72b5bb8](https://github.com/pagopa/io-app/commit/72b5bb8e36bb1f3032da7f8c3e763fb940fc70a1))


### Chores

* **Bonus Pagamenti Digitali:** [[IAC-129](https://pagopa.atlassian.net/browse/IAC-129)] Implemented payment methods selection screen ([#3773](https://github.com/pagopa/io-app/issues/3773)) ([86d27fb](https://github.com/pagopa/io-app/commit/86d27fb80eed661947aead5a19821eba1ea58f34))
* [[IAI-127](https://pagopa.atlassian.net/browse/IAI-127)] Removed `ts-jest` in favour of Babel ([#3742](https://github.com/pagopa/io-app/issues/3742)) ([5048304](https://github.com/pagopa/io-app/commit/5048304370a90ae34539326f034701f9989424ef))
* [[IAI-128](https://pagopa.atlassian.net/browse/IAI-128)] Replace `NavigationInjectedProps` with `NavigationStackScreenProps` ([#3752](https://github.com/pagopa/io-app/issues/3752)) ([6e7ad4e](https://github.com/pagopa/io-app/commit/6e7ad4ef841cee655d38f27ebea5791f7ca819f5))
* **Bonus Pagamenti Digitali:** [[IAC-131](https://pagopa.atlassian.net/browse/IAC-131)] Add thank you page and retry page ([#3763](https://github.com/pagopa/io-app/issues/3763)) ([0d1e337](https://github.com/pagopa/io-app/commit/0d1e3372ae3ec8dace4f7830234ad7e963cb561d))

## [2.3.0-rc.2](https://github.com/pagopa/io-app/compare/2.3.0-rc.1...2.3.0-rc.2) (2022-02-16)


### Features

* [[IA-397](https://pagopa.atlassian.net/browse/IA-397)] Implemented accessibility unread badge in the bottom nav ([#3762](https://github.com/pagopa/io-app/issues/3762)) ([f643ca7](https://github.com/pagopa/io-app/commit/f643ca7561edc0190cc61194ac417a6dbc4548ad))
* **EU Covid Certificate:** [[IAGP-74](https://pagopa.atlassian.net/browse/IAGP-74)] Do not specify album for saving EU Covid certificate on Android [#3769](https://github.com/pagopa/io-app/issues/3769) ([af9b105](https://github.com/pagopa/io-app/commit/af9b105c54125bb2593e7c04d6dfd7f7f9ae31a4))


### Bug Fixes

* **Carta Giovani Nazionale:** [[IOACGN-59](https://pagopa.atlassian.net/browse/IOACGN-59)] Fixes offline-operators API request has a prefixed coordinates ([#3768](https://github.com/pagopa/io-app/issues/3768)) ([13b0e9d](https://github.com/pagopa/io-app/commit/13b0e9d6d402fd0c677213287f4a74aca181211e))
* package.json & yarn.lock to reduce vulnerabilities ([#3766](https://github.com/pagopa/io-app/issues/3766)) ([ca3331f](https://github.com/pagopa/io-app/commit/ca3331ff0c6d3f471245bf92f8002091592c755e))


### Chores

* **Carta Giovani Nazionale:** [[IOACGN-58](https://pagopa.atlassian.net/browse/IOACGN-58)] Updates finance category label ([#3767](https://github.com/pagopa/io-app/issues/3767)) ([3b7d165](https://github.com/pagopa/io-app/commit/3b7d1651ee944e4ea8860f8f674b453b1eca9cd5))
* **Messaggi a valore legale:** [[IAMVL-72](https://pagopa.atlassian.net/browse/IAMVL-72)] Upgrade fs, blob-utils, share ([#3764](https://github.com/pagopa/io-app/issues/3764)) ([920c358](https://github.com/pagopa/io-app/commit/920c3581a7afb7ed06108951493fa5ef9ad6614c))

## [2.3.0-rc.1](https://github.com/pagopa/io-app/compare/2.2.0-rc.2...2.3.0-rc.1) (2022-02-15)


### Features

* [[IA-663](https://pagopa.atlassian.net/browse/IA-663)] Show PAA_SYSTEM_ERROR payment code error ([#3757](https://github.com/pagopa/io-app/issues/3757)) ([b9dcca6](https://github.com/pagopa/io-app/commit/b9dcca6a518161aef98ab96d39949b99e5380f78))


### Bug Fixes

* [[IA-2](https://pagopa.atlassian.net/browse/IA-2)] Show loading while setting payment method as favourite ([#3727](https://github.com/pagopa/io-app/issues/3727)) ([5d5b879](https://github.com/pagopa/io-app/commit/5d5b879ed81e11216bf4323650e2df29245a52d8))
* [[IA-254](https://pagopa.atlassian.net/browse/IA-254)] Fixed messages organization/service alignment for long strings ([#3737](https://github.com/pagopa/io-app/issues/3737)) ([22b41a5](https://github.com/pagopa/io-app/commit/22b41a5433a4aad9dcb835f0ec7123c6b911e636))
* [[IA-256](https://pagopa.atlassian.net/browse/IA-256)] Title incorrect alignment when right button is missing ([#3736](https://github.com/pagopa/io-app/issues/3736)) ([ef2ac79](https://github.com/pagopa/io-app/commit/ef2ac79020305ccc848dec8c93a1c30eba09e81b))
* [[IA-257](https://pagopa.atlassian.net/browse/IA-257)] Incorrect layout in several screens ([#3728](https://github.com/pagopa/io-app/issues/3728)) ([7a7a2f2](https://github.com/pagopa/io-app/commit/7a7a2f22435217c42ea7b5f77ccf2acd38d71f00))
* [[IA-431](https://pagopa.atlassian.net/browse/IA-431)] Fixed multiple logout request issue ([#3734](https://github.com/pagopa/io-app/issues/3734)) ([2a48e9e](https://github.com/pagopa/io-app/commit/2a48e9e81c74f407579785bf29e0ae30cd0295a9))
* [[IA-629](https://pagopa.atlassian.net/browse/IA-629)] If some services are in error, they will be never reloaded ([#3754](https://github.com/pagopa/io-app/issues/3754)) ([88d99e3](https://github.com/pagopa/io-app/commit/88d99e33cb26f2761de5cf87815b5b59c4e69248))
* [[IA-646](https://pagopa.atlassian.net/browse/IA-646)] When user adds a credit card during a payment, at the end he will be redirect to the wallet home ([#3759](https://github.com/pagopa/io-app/issues/3759)) ([9d51d5f](https://github.com/pagopa/io-app/commit/9d51d5fa7816a5e3e18af37385569d469b5b7476))
* **Bonus Pagamenti Digitali:** optInStatus should be optional ([#3750](https://github.com/pagopa/io-app/issues/3750)) ([a8f53f5](https://github.com/pagopa/io-app/commit/a8f53f59e744a6d9cef546bc3fd8dbb25efc0a65))
* Missing button accessibility role in UpdateAppModal ([#3729](https://github.com/pagopa/io-app/issues/3729)) ([5bd6abe](https://github.com/pagopa/io-app/commit/5bd6abeec5be973ec0be0852e227d300bac15210))


### Chores

* **Bonus Pagamenti Digitali:** [[IAC-128](https://pagopa.atlassian.net/browse/IAC-128)] Opt-in payment method cashback update screen ([#3725](https://github.com/pagopa/io-app/issues/3725)) ([1dc5348](https://github.com/pagopa/io-app/commit/1dc5348ea3496ebfce23eca51258d13da1d35808))
* **Bonus Pagamenti Digitali:** [[IAC-130](https://pagopa.atlassian.net/browse/IAC-130)] Add bottom sheet to display the payment method to delete ([#3744](https://github.com/pagopa/io-app/issues/3744)) ([b2eca96](https://github.com/pagopa/io-app/commit/b2eca96853927e10930b2208d1ee76d03753b2ac))
* **Carta Giovani Nazionale:** [[IOACGN-35](https://pagopa.atlassian.net/browse/IOACGN-35)] Removes unused components for CGN otp dedicated screen ([#3749](https://github.com/pagopa/io-app/issues/3749)) ([393ae69](https://github.com/pagopa/io-app/commit/393ae69cafbb05caa442cc62d2a619d280224b2e))
* **Carta Giovani Nazionale:** [[IOACGN-38](https://pagopa.atlassian.net/browse/IOACGN-38)] Introduces API to retrieve the list of available categories ([#3751](https://github.com/pagopa/io-app/issues/3751)) ([558fd27](https://github.com/pagopa/io-app/commit/558fd27256b2709e723f9e78e3fa4446a676046a))
* **Carta Giovani Nazionale:** [[IOACGN-39](https://pagopa.atlassian.net/browse/IOACGN-39)] CGN Merchants categories store structure ([#3740](https://github.com/pagopa/io-app/issues/3740)) ([06c2464](https://github.com/pagopa/io-app/commit/06c2464e85512e6a78e2da33fe8cb5c31ef057f4))
* **Carta Giovani Nazionale:** [[IOACGN-40](https://pagopa.atlassian.net/browse/IOACGN-40)] List available CGN operators selecting a category ([#3738](https://github.com/pagopa/io-app/issues/3738)) ([3fb5bc9](https://github.com/pagopa/io-app/commit/3fb5bc98a042ad68029398e705fdd6da4ec57c65))
* **Carta Giovani Nazionale:** [[IOACGN-55](https://pagopa.atlassian.net/browse/IOACGN-55)] Orders categories by its translation value ([#3765](https://github.com/pagopa/io-app/issues/3765)) ([371f915](https://github.com/pagopa/io-app/commit/371f9154aca702ad1db63e10d97ddd436798c140))
* **deps:** bump vm2 from 3.9.5 to 3.9.7 ([#3761](https://github.com/pagopa/io-app/issues/3761)) ([8d852d1](https://github.com/pagopa/io-app/commit/8d852d1405209a30d6fc1ca1bf52600d46d86e36))
* [[IA-648](https://pagopa.atlassian.net/browse/IA-648)] Add Zendesk app versions history ([#3715](https://github.com/pagopa/io-app/issues/3715)) ([44739de](https://github.com/pagopa/io-app/commit/44739de2de5a0aaf87d413b62d413e581ffcdfcb))
* [[IA-651](https://pagopa.atlassian.net/browse/IA-651)] Save EU Covid certificate in a user friendly way ([#3753](https://github.com/pagopa/io-app/issues/3753)) ([65a950b](https://github.com/pagopa/io-app/commit/65a950b72469a5897e90af6aa0bf0d2787a54233))
* [[IA-657](https://pagopa.atlassian.net/browse/IA-657)] Track screen lock availability ([#3732](https://github.com/pagopa/io-app/issues/3732)) ([d824d23](https://github.com/pagopa/io-app/commit/d824d23f347a0d222d45a0fff3b01fd8c06be885))
* [[IAI-124](https://pagopa.atlassian.net/browse/IAI-124)] Refactoring version info module ([#3724](https://github.com/pagopa/io-app/issues/3724)) ([8323166](https://github.com/pagopa/io-app/commit/832316679c37b4a628639be1ef18682a27048c49))
* [[IAI-125](https://pagopa.atlassian.net/browse/IAI-125)] Remove unused routes ([#3733](https://github.com/pagopa/io-app/issues/3733)) ([6228607](https://github.com/pagopa/io-app/commit/6228607e80b94a70ef6a3e0c731110c801f3b82c))
* [[IAI-126](https://pagopa.atlassian.net/browse/IAI-126)] Remove unused routes from app functionalities ([#3735](https://github.com/pagopa/io-app/issues/3735)) ([978c43d](https://github.com/pagopa/io-app/commit/978c43d45d196186400adf6d2e065289f50777eb))
* [[IAI-129](https://pagopa.atlassian.net/browse/IAI-129)] Rework `FocusAwareStatusBar`  ([#3746](https://github.com/pagopa/io-app/issues/3746)) ([b2ebd05](https://github.com/pagopa/io-app/commit/b2ebd0578e9fbf4f64dba3ece600449e29f1bd0f))
* **Carta Giovani Nazionale:** [[IOACGN-52](https://pagopa.atlassian.net/browse/IOACGN-52)] UI Fixes to discountUrl CTA and bottomsheet height ([#3755](https://github.com/pagopa/io-app/issues/3755)) ([26d0bc7](https://github.com/pagopa/io-app/commit/26d0bc7a8aded070f014c6653c4fde9f1934871d))
* **release:** 2.3.0-rc.0 ([6c33326](https://github.com/pagopa/io-app/commit/6c33326722c11e910ea78ed0f3edecb293427e13))
* [[IA-143](https://pagopa.atlassian.net/browse/IA-143)] Updated onboarding ShareDataComponent + back button ([#3739](https://github.com/pagopa/io-app/issues/3739)) ([36bc1ab](https://github.com/pagopa/io-app/commit/36bc1ab2934eb186ac5cb5b3b28596853149e3ac))
* [[IA-662](https://pagopa.atlassian.net/browse/IA-662)] Update pm specification ([#3743](https://github.com/pagopa/io-app/issues/3743)) ([dbc115e](https://github.com/pagopa/io-app/commit/dbc115eba597cfa39d6ffc770f13a74fdc48720b))
* [[IAI-104](https://pagopa.atlassian.net/browse/IAI-104)] Update deprecated Android image and upload a new released app in internal and alpha track ([#3747](https://github.com/pagopa/io-app/issues/3747)) ([3343d9a](https://github.com/pagopa/io-app/commit/3343d9a8dbdc4cbc9a3517e18f3c7a05b09eaffa))
* [[IAI-131](https://pagopa.atlassian.net/browse/IAI-131)] Remove `getRouteName` from `ts/utils/navigation.ts` ([#3745](https://github.com/pagopa/io-app/issues/3745)) ([545daf1](https://github.com/pagopa/io-app/commit/545daf11da5a3a0359cefc34f68b8ba5be66a166))
* [[IAI-132](https://pagopa.atlassian.net/browse/IAI-132)] Change test class resource from xlarge to large ([#3748](https://github.com/pagopa/io-app/issues/3748)) ([4903a1a](https://github.com/pagopa/io-app/commit/4903a1a878e173310be8674fdd1d15ddc08d632f))
* **Bonus Pagamenti Digitali:** [[IAC-137](https://pagopa.atlassian.net/browse/IAC-137)] Add `optInStatus` field in citizenV2 model ([#3726](https://github.com/pagopa/io-app/issues/3726)) ([1360bf1](https://github.com/pagopa/io-app/commit/1360bf18e947ea5baf990854f444a95be5af880f))
* **Carta Giovani Nazionale:** [[IOACGN-50](https://pagopa.atlassian.net/browse/IOACGN-50)] Handles the discountUrl CTA as an additional detail for benefits [#3741](https://github.com/pagopa/io-app/issues/3741) ([0b8c0fc](https://github.com/pagopa/io-app/commit/0b8c0fc7563b0647db4f5a97967995369e0d5eb4))
* **Messaggi a valore legale:** [[IAMVL-51](https://pagopa.atlassian.net/browse/IAMVL-51)] Support two lines filename and preserve extension ([#3687](https://github.com/pagopa/io-app/issues/3687)) ([052dd41](https://github.com/pagopa/io-app/commit/052dd4131424be77af0088ce35de857e1a499527))
* **Messaggi a valore legale:** [[IAMVL-66](https://pagopa.atlassian.net/browse/IAMVL-66)] Add loader and error management to the bottom sheet for attachments ([#3706](https://github.com/pagopa/io-app/issues/3706)) ([40d3d1c](https://github.com/pagopa/io-app/commit/40d3d1c88f4f3e708a359a673c426576733ba320))

## [2.3.0-rc.0](https://github.com/pagopa/io-app/compare/2.2.0-rc.2...2.3.0-rc.0) (2022-02-11)


### Bug Fixes

* [[IA-629](https://pagopa.atlassian.net/browse/IA-629)] If some services are in error, they will be never reloaded ([#3754](https://github.com/pagopa/io-app/issues/3754)) ([88d99e3](https://github.com/pagopa/io-app/commit/88d99e33cb26f2761de5cf87815b5b59c4e69248))
* **Bonus Pagamenti Digitali:** optInStatus should be optional ([#3750](https://github.com/pagopa/io-app/issues/3750)) ([a8f53f5](https://github.com/pagopa/io-app/commit/a8f53f59e744a6d9cef546bc3fd8dbb25efc0a65))
* [[IA-2](https://pagopa.atlassian.net/browse/IA-2)] Show loading while setting payment method as favourite ([#3727](https://github.com/pagopa/io-app/issues/3727)) ([5d5b879](https://github.com/pagopa/io-app/commit/5d5b879ed81e11216bf4323650e2df29245a52d8))
* [[IA-254](https://pagopa.atlassian.net/browse/IA-254)] Fixed messages organization/service alignment for long strings ([#3737](https://github.com/pagopa/io-app/issues/3737)) ([22b41a5](https://github.com/pagopa/io-app/commit/22b41a5433a4aad9dcb835f0ec7123c6b911e636))
* [[IA-256](https://pagopa.atlassian.net/browse/IA-256)] Title incorrect alignment when right button is missing ([#3736](https://github.com/pagopa/io-app/issues/3736)) ([ef2ac79](https://github.com/pagopa/io-app/commit/ef2ac79020305ccc848dec8c93a1c30eba09e81b))
* [[IA-257](https://pagopa.atlassian.net/browse/IA-257)] Incorrect layout in several screens ([#3728](https://github.com/pagopa/io-app/issues/3728)) ([7a7a2f2](https://github.com/pagopa/io-app/commit/7a7a2f22435217c42ea7b5f77ccf2acd38d71f00))
* [[IA-431](https://pagopa.atlassian.net/browse/IA-431)] Fixed multiple logout request issue ([#3734](https://github.com/pagopa/io-app/issues/3734)) ([2a48e9e](https://github.com/pagopa/io-app/commit/2a48e9e81c74f407579785bf29e0ae30cd0295a9))
* Missing button accessibility role in UpdateAppModal ([#3729](https://github.com/pagopa/io-app/issues/3729)) ([5bd6abe](https://github.com/pagopa/io-app/commit/5bd6abeec5be973ec0be0852e227d300bac15210))


### Chores

* **Carta Giovani Nazionale:** [[IOACGN-52](https://pagopa.atlassian.net/browse/IOACGN-52)] UI Fixes to discountUrl CTA and bottomsheet height ([#3755](https://github.com/pagopa/io-app/issues/3755)) ([26d0bc7](https://github.com/pagopa/io-app/commit/26d0bc7a8aded070f014c6653c4fde9f1934871d))
* [[IA-143](https://pagopa.atlassian.net/browse/IA-143)] Updated onboarding ShareDataComponent + back button ([#3739](https://github.com/pagopa/io-app/issues/3739)) ([36bc1ab](https://github.com/pagopa/io-app/commit/36bc1ab2934eb186ac5cb5b3b28596853149e3ac))
* [[IA-648](https://pagopa.atlassian.net/browse/IA-648)] Add Zendesk app versions history ([#3715](https://github.com/pagopa/io-app/issues/3715)) ([44739de](https://github.com/pagopa/io-app/commit/44739de2de5a0aaf87d413b62d413e581ffcdfcb))
* [[IA-657](https://pagopa.atlassian.net/browse/IA-657)] Track screen lock availability ([#3732](https://github.com/pagopa/io-app/issues/3732)) ([d824d23](https://github.com/pagopa/io-app/commit/d824d23f347a0d222d45a0fff3b01fd8c06be885))
* [[IA-662](https://pagopa.atlassian.net/browse/IA-662)] Update pm specification ([#3743](https://github.com/pagopa/io-app/issues/3743)) ([dbc115e](https://github.com/pagopa/io-app/commit/dbc115eba597cfa39d6ffc770f13a74fdc48720b))
* [[IAI-104](https://pagopa.atlassian.net/browse/IAI-104)] Update deprecated Android image and upload a new released app in internal and alpha track ([#3747](https://github.com/pagopa/io-app/issues/3747)) ([3343d9a](https://github.com/pagopa/io-app/commit/3343d9a8dbdc4cbc9a3517e18f3c7a05b09eaffa))
* [[IAI-124](https://pagopa.atlassian.net/browse/IAI-124)] Refactoring version info module ([#3724](https://github.com/pagopa/io-app/issues/3724)) ([8323166](https://github.com/pagopa/io-app/commit/832316679c37b4a628639be1ef18682a27048c49))
* [[IAI-125](https://pagopa.atlassian.net/browse/IAI-125)] Remove unused routes ([#3733](https://github.com/pagopa/io-app/issues/3733)) ([6228607](https://github.com/pagopa/io-app/commit/6228607e80b94a70ef6a3e0c731110c801f3b82c))
* [[IAI-126](https://pagopa.atlassian.net/browse/IAI-126)] Remove unused routes from app functionalities ([#3735](https://github.com/pagopa/io-app/issues/3735)) ([978c43d](https://github.com/pagopa/io-app/commit/978c43d45d196186400adf6d2e065289f50777eb))
* [[IAI-131](https://pagopa.atlassian.net/browse/IAI-131)] Remove `getRouteName` from `ts/utils/navigation.ts` ([#3745](https://github.com/pagopa/io-app/issues/3745)) ([545daf1](https://github.com/pagopa/io-app/commit/545daf11da5a3a0359cefc34f68b8ba5be66a166))
* [[IAI-132](https://pagopa.atlassian.net/browse/IAI-132)] Change test class resource from xlarge to large ([#3748](https://github.com/pagopa/io-app/issues/3748)) ([4903a1a](https://github.com/pagopa/io-app/commit/4903a1a878e173310be8674fdd1d15ddc08d632f))
* **Bonus Pagamenti Digitali:** [[IAC-137](https://pagopa.atlassian.net/browse/IAC-137)] Add `optInStatus` field in citizenV2 model ([#3726](https://github.com/pagopa/io-app/issues/3726)) ([1360bf1](https://github.com/pagopa/io-app/commit/1360bf18e947ea5baf990854f444a95be5af880f))
* **Carta Giovani Nazionale:** [[IOACGN-50](https://pagopa.atlassian.net/browse/IOACGN-50)] Handles the discountUrl CTA as an additional detail for benefits [#3741](https://github.com/pagopa/io-app/issues/3741) ([0b8c0fc](https://github.com/pagopa/io-app/commit/0b8c0fc7563b0647db4f5a97967995369e0d5eb4))
* **Messaggi a valore legale:** [[IAMVL-51](https://pagopa.atlassian.net/browse/IAMVL-51)] Support two lines filename and preserve extension ([#3687](https://github.com/pagopa/io-app/issues/3687)) ([052dd41](https://github.com/pagopa/io-app/commit/052dd4131424be77af0088ce35de857e1a499527))
* **Messaggi a valore legale:** [[IAMVL-66](https://pagopa.atlassian.net/browse/IAMVL-66)] Add loader and error management to the bottom sheet for attachments ([#3706](https://github.com/pagopa/io-app/issues/3706)) ([40d3d1c](https://github.com/pagopa/io-app/commit/40d3d1c88f4f3e708a359a673c426576733ba320))

## [2.2.0-rc.2](https://github.com/pagopa/io-app/compare/2.2.0-rc.1...2.2.0-rc.2) (2022-02-03)


### Features

* [[IA-388](https://pagopa.atlassian.net/browse/IA-388)] Improved accessibility in the Service details section ([#3705](https://github.com/pagopa/io-app/issues/3705)) ([585ffee](https://github.com/pagopa/io-app/commit/585ffee292c6d2a12d52277f0114cf4b19849f35))
* [[IA-460](https://pagopa.atlassian.net/browse/IA-460)] Update add card summary screen ([#3691](https://github.com/pagopa/io-app/issues/3691)) ([13affaf](https://github.com/pagopa/io-app/commit/13affafa042f7e5df30002a277a39de538fe53e0))
* [[IA-640](https://pagopa.atlassian.net/browse/IA-640)] The `VersionInfoOverlay` component is now enabled in the debug mode ([#3716](https://github.com/pagopa/io-app/issues/3716)) ([3d733af](https://github.com/pagopa/io-app/commit/3d733afa5b2c0ce85e777ebe602bd231badec5ed))


### Bug Fixes

* [[IA-642](https://pagopa.atlassian.net/browse/IA-642)] Onboarding success screen says to continue the payment even when the user starts from wallet ([#3688](https://github.com/pagopa/io-app/issues/3688)) ([8740f54](https://github.com/pagopa/io-app/commit/8740f54d84a4522c307d6d681f3a8b83c2536505))
* [[IA-650](https://pagopa.atlassian.net/browse/IA-650)] Unpredictable status bar behavior ([#3717](https://github.com/pagopa/io-app/issues/3717)) ([28f10bf](https://github.com/pagopa/io-app/commit/28f10bf552908add4266c4cbadbaad78e6042628))
* [[IA-654](https://pagopa.atlassian.net/browse/IA-654)] The logic to check if a data is expired is wrong ([#3714](https://github.com/pagopa/io-app/issues/3714)) ([572158d](https://github.com/pagopa/io-app/commit/572158d7c1f146e5573d14f3ac122b8a9f8cf0f2))
* [[IA-655](https://pagopa.atlassian.net/browse/IA-655)] Payment attempts history is deleted on logout ([#3720](https://github.com/pagopa/io-app/issues/3720)) ([bf25bb1](https://github.com/pagopa/io-app/commit/bf25bb14fd80c40f51305cbc5d16439721c43015))
* [[IA-656](https://pagopa.atlassian.net/browse/IA-656)] Fix e2e test ([#3723](https://github.com/pagopa/io-app/issues/3723)) ([82d5e60](https://github.com/pagopa/io-app/commit/82d5e600d7d981fdf1aa20b3993619b7b4e6c74f))
* [[IA-79](https://pagopa.atlassian.net/browse/IA-79)] Added the messages' badge into the accessibility label ([#3708](https://github.com/pagopa/io-app/issues/3708)) ([f57cde3](https://github.com/pagopa/io-app/commit/f57cde318272fdf3f6e6bf00e003e1fafb28af02))


### Chores

* **Carta Giovani Nazionale:** [[IOACGN-34](https://pagopa.atlassian.net/browse/IOACGN-34)] UI Improvements on CGN components and labels ([#3710](https://github.com/pagopa/io-app/issues/3710)) ([97a8390](https://github.com/pagopa/io-app/commit/97a83904b679f5494d1d2f5cfd923fb202e3174a))
* **Carta Giovani Nazionale:** [[IOACGN-36](https://pagopa.atlassian.net/browse/IOACGN-36)] Temporary ignore CGN FF for production release ([#3722](https://github.com/pagopa/io-app/issues/3722)) ([5f2356a](https://github.com/pagopa/io-app/commit/5f2356ac9420002a74fa0635b3ba698cdebbf35b))
* [[IAI-114](https://pagopa.atlassian.net/browse/IAI-114)] Use `/status/versionInfo.json` instead of `/info` to retrieve app version metadata ([#3713](https://github.com/pagopa/io-app/issues/3713)) ([68eca81](https://github.com/pagopa/io-app/commit/68eca81334b654aaff17b5d5f16543fe6b8da778))
* [[IAI-122](https://pagopa.atlassian.net/browse/IAI-122)] Renaming backendInfo to versionInfo ([#3721](https://github.com/pagopa/io-app/issues/3721)) ([7266776](https://github.com/pagopa/io-app/commit/726677623089dc2b7bb73ef724cfa01d3e1864ea))
* **Bonus Pagamenti Digitali:** [[IAC-126](https://pagopa.atlassian.net/browse/IAC-126)] Create payments methods opt-in workunit ([#3701](https://github.com/pagopa/io-app/issues/3701)) ([533c3d4](https://github.com/pagopa/io-app/commit/533c3d411d76c534aea3018bdf08218d36809020))
* **Bonus Pagamenti Digitali:** [[IAC-134](https://pagopa.atlassian.net/browse/IAC-134)] Hide cashback card ([#3709](https://github.com/pagopa/io-app/issues/3709)) ([bf18d34](https://github.com/pagopa/io-app/commit/bf18d346992b09d465202e0914e7b8b2ef5731a1))

## [2.2.0-rc.1](https://github.com/pagopa/io-app/compare/2.2.0-rc.0...2.2.0-rc.1) (2022-01-31)


### Bug Fixes

* [[IA-652](https://pagopa.atlassian.net/browse/IA-652)] Remove ios-sim package from CI ([#3711](https://github.com/pagopa/io-app/issues/3711)) ([fcfcc4f](https://github.com/pagopa/io-app/commit/fcfcc4ff4e0f349e4f238a50cab6cc38f5a2e46a))


### Chores

* [[IA-606](https://pagopa.atlassian.net/browse/IA-606)] Store app versions history ([#3702](https://github.com/pagopa/io-app/issues/3702)) ([07fa798](https://github.com/pagopa/io-app/commit/07fa798b2f245ed9dede56764b836923eb6064e1))
* **Bonus Pagamenti Digitali:** [[IAC-132](https://pagopa.atlassian.net/browse/IAC-132)] Opt-in payment feature flag ([#3697](https://github.com/pagopa/io-app/issues/3697)) ([e4f3310](https://github.com/pagopa/io-app/commit/e4f33109075f007c02d18b2b0b80a26cb7c88da3))
* [[IA-647](https://pagopa.atlassian.net/browse/IA-647)] Mentions to Cashback ([#3696](https://github.com/pagopa/io-app/issues/3696)) ([db31788](https://github.com/pagopa/io-app/commit/db31788a68d253c61108bcc4b4ce4694ec43ce73))

## [2.2.0-rc.0](https://github.com/pagopa/io-app/compare/2.1.0-rc.1...2.2.0-rc.0) (2022-01-27)


### Features

* [[IA-553](https://pagopa.atlassian.net/browse/IA-553)] Updated Wallet locales and fixed compilation errors ([#3692](https://github.com/pagopa/io-app/issues/3692)) ([06798f4](https://github.com/pagopa/io-app/commit/06798f4743794e22023533df6e823f67758a340b))
* [[IA-633](https://pagopa.atlassian.net/browse/IA-633)] Allow back during SPID webview loading ([#3682](https://github.com/pagopa/io-app/issues/3682)) ([d7a2e83](https://github.com/pagopa/io-app/commit/d7a2e836c23b6dc696091ad36daf5dfb9b05b7ca))


### Bug Fixes

* [[IA-637](https://pagopa.atlassian.net/browse/IA-637)] Update PayPal logo [#3679](https://github.com/pagopa/io-app/issues/3679) ([891fd66](https://github.com/pagopa/io-app/commit/891fd6679767c22f43d2c833d9361c9dfdc31fc2))
* [[IA-644](https://pagopa.atlassian.net/browse/IA-644)] Fixed messages title not flexible ([#3694](https://github.com/pagopa/io-app/issues/3694)) ([f422bb4](https://github.com/pagopa/io-app/commit/f422bb40eb0b3fed9adc93d8242f1841a94bb370))


### Chores

* **Carta Giovani Nazionale:** [[IOACGN-32](https://pagopa.atlassian.net/browse/IOACGN-32)] Handles new ProductCategories for CGN ([#3699](https://github.com/pagopa/io-app/issues/3699)) ([94ee304](https://github.com/pagopa/io-app/commit/94ee304060a7fd086cec0d2465198d27ba6e4c99))
* **deps:** bump nanoid from 3.1.16 to 3.2.0 ([#3684](https://github.com/pagopa/io-app/issues/3684)) ([b2f903a](https://github.com/pagopa/io-app/commit/b2f903a39b54793020d3dd0a1aa23f1756da77ce))
* **deps-dev:** bump node-fetch from 2.6.0 to 2.6.7 ([#3704](https://github.com/pagopa/io-app/issues/3704)) ([35de44a](https://github.com/pagopa/io-app/commit/35de44af5a11f896184805b91fceb37df6cf1896))
* [[IA-432](https://pagopa.atlassian.net/browse/IA-432)] Trace message read with message type ([#3689](https://github.com/pagopa/io-app/issues/3689)) ([5ca6ee1](https://github.com/pagopa/io-app/commit/5ca6ee1c5afda3d38f77ca2f61561a2c2eb124e5))
* **Messaggi a valore legale:** [[IAMVL-26](https://pagopa.atlassian.net/browse/IAMVL-26)] Persist attachments preferences for MVL ([#3681](https://github.com/pagopa/io-app/issues/3681)) ([22189ef](https://github.com/pagopa/io-app/commit/22189ef6381784f5c1019e904a42cd486fbd2e73))
* [[IA-619](https://pagopa.atlassian.net/browse/IA-619)] Improve CIE data usage consent screen ([#3640](https://github.com/pagopa/io-app/issues/3640)) ([c9e5e92](https://github.com/pagopa/io-app/commit/c9e5e928c433a3f80274d03abad4308b4c4410c1))
* [[IA-634](https://pagopa.atlassian.net/browse/IA-634)] Add Zendesk tests ([#3674](https://github.com/pagopa/io-app/issues/3674)) ([3ee9034](https://github.com/pagopa/io-app/commit/3ee90343d23f611da3df8aa1fa6a5f10560f1fbb))
* [[IA-635](https://pagopa.atlassian.net/browse/IA-635)] Added e2e tests for a valid green pass message ([#3686](https://github.com/pagopa/io-app/issues/3686)) ([b2fea97](https://github.com/pagopa/io-app/commit/b2fea97185bd016d5201844ca32cfaabe33abcba))
* [[IA-636](https://pagopa.atlassian.net/browse/IA-636)] Added e2e tests for a revoked and expired green pass message  ([#3690](https://github.com/pagopa/io-app/issues/3690)) ([b6b8bc2](https://github.com/pagopa/io-app/commit/b6b8bc21089f1a9a3667afecd2682a65b74296de))
* [[IA-639](https://pagopa.atlassian.net/browse/IA-639)] Test epic icon ([#3680](https://github.com/pagopa/io-app/issues/3680)) ([d8427ad](https://github.com/pagopa/io-app/commit/d8427adede80390490ccfe41acdcdd3abdb3f5ae))
* Update check-urls([#3695](https://github.com/pagopa/io-app/issues/3695)) ([b29047f](https://github.com/pagopa/io-app/commit/b29047f31c7bdebb2ede1ff7ebe94a9574ac88da))
* **Carta Giovani Nazionale:** [[IOACGN-31](https://pagopa.atlassian.net/browse/IOACGN-31)] Re-enables CGN remote FF [#3677](https://github.com/pagopa/io-app/issues/3677) ([a123cd4](https://github.com/pagopa/io-app/commit/a123cd4e51e8d470808dba09afbc315f6522cc4c))
* [[IAI-110](https://pagopa.atlassian.net/browse/IAI-110)] Upgrade macOS resources on CircleCI ([#3678](https://github.com/pagopa/io-app/issues/3678)) ([683ae46](https://github.com/pagopa/io-app/commit/683ae46a1bf27f45646530b445f0d3dd219d98b0))

## [2.1.0-rc.1](https://github.com/pagopa/io-app/compare/2.1.0-rc.0...2.1.0-rc.1) (2022-01-20)


### Features

* **Carta Giovani Nazionale:** [[IOACGN-9](https://pagopa.atlassian.net/browse/IOACGN-9)] Impelements CGN unsubscription flow ([#3656](https://github.com/pagopa/io-app/issues/3656)) ([161f509](https://github.com/pagopa/io-app/commit/161f5091a951eb97c3fe992c2021c219962da849))
* **EU Covid Certificate:** [[IAGP-70](https://pagopa.atlassian.net/browse/IAGP-70)] Show certificate header_info in header component ([#3666](https://github.com/pagopa/io-app/issues/3666)) ([7f862d1](https://github.com/pagopa/io-app/commit/7f862d1d1398c936977558e1ca05d12ca59c315e))


### Chores

* **Carta Giovani Nazionale:** [[IOACGN-31](https://pagopa.atlassian.net/browse/IOACGN-31)] Disables CGN remote FF [#3675](https://github.com/pagopa/io-app/issues/3675) ([46190df](https://github.com/pagopa/io-app/commit/46190df31a01b14c3cbd7f4ae31baff740de22f6))
* **deps:** bump trim-off-newlines from 1.0.1 to 1.0.3 ([#3672](https://github.com/pagopa/io-app/issues/3672)) ([a318ca7](https://github.com/pagopa/io-app/commit/a318ca79865cf2112cba7f48b1ff57a322190bc9))
* **Messaggi a valore legale:** [[IAMVL-37](https://pagopa.atlassian.net/browse/IAMVL-37)] Hide html selector when no html is present in the body ([#3663](https://github.com/pagopa/io-app/issues/3663)) ([f93ce50](https://github.com/pagopa/io-app/commit/f93ce5029605ad795b6c795eea9a0c063f1184f2))
* [[IAI-108](https://pagopa.atlassian.net/browse/IAI-108)] Improved type-safety using object dynamic keys ([#3661](https://github.com/pagopa/io-app/issues/3661)) ([c192429](https://github.com/pagopa/io-app/commit/c1924299b1dd8342f8fb6cc86b2bd90ea32343c0))
* Upgrade spec tag version ([#3668](https://github.com/pagopa/io-app/issues/3668)) ([be2a07c](https://github.com/pagopa/io-app/commit/be2a07c053ec8aa88aa5f2250383a9955772149a))
* **Carta Giovani Nazionale:** [[IOACGN-24](https://pagopa.atlassian.net/browse/IOACGN-24)] Implements UI component for CGN Buckets errors ([#3659](https://github.com/pagopa/io-app/issues/3659)) ([04280d0](https://github.com/pagopa/io-app/commit/04280d0e294edcac1dbc400191e1926c26ae5b94))

## [2.1.0-rc.0](https://github.com/pagopa/io-app/compare/2.0.0-rc.0...2.1.0-rc.0) (2022-01-18)


### Features

* **EU Covid Certificate:** [[IAGP-69](https://pagopa.atlassian.net/browse/IAGP-69)] Update revoked body text ([#3657](https://github.com/pagopa/io-app/issues/3657)) ([49b30ca](https://github.com/pagopa/io-app/commit/49b30ca06ebceb7f279a852621cffec32e041b8f))
* [[IA-399](https://pagopa.atlassian.net/browse/IA-399)] Fixes the accessibility labels for the PIN icon buttons ([#3645](https://github.com/pagopa/io-app/issues/3645)) ([56e073c](https://github.com/pagopa/io-app/commit/56e073cf57d6704afccc1de92734fda02978a8e7))


### Bug Fixes

* [[IA-430](https://pagopa.atlassian.net/browse/IA-430)] When the CIE PIN is wrong or the user goes back, the CIE PIN can't be set again ([#3632](https://github.com/pagopa/io-app/issues/3632)) ([9e488e8](https://github.com/pagopa/io-app/commit/9e488e8d211df7964bd3bb625ac999ac34e9d24b))
* [[IA-621](https://pagopa.atlassian.net/browse/IA-621)] Remove cashback references from "Insert credit card data -> Are you missing some data?" bottom sheet copy ([#3665](https://github.com/pagopa/io-app/issues/3665)) ([b3326e6](https://github.com/pagopa/io-app/commit/b3326e681f5bae6e83b517cb970943f9733430b4))
* [[IA-630](https://pagopa.atlassian.net/browse/IA-630)] Profile birthdate is formatted considering the device locale ([#3653](https://github.com/pagopa/io-app/issues/3653)) ([f02f1d0](https://github.com/pagopa/io-app/commit/f02f1d011d059eb21e02d76bee5b8e4945dd54b2))
* **Carta Giovani Nazionale:** [[IOACGN-16](https://pagopa.atlassian.net/browse/IOACGN-16)] Fixes cropped icons on android ([#3644](https://github.com/pagopa/io-app/issues/3644)) ([0924347](https://github.com/pagopa/io-app/commit/0924347e5d4ebdc47b51decc69a1ca1953d3cccd))


### Chores

* **Carta Giovani Nazionale:** [[IOACGN-22](https://pagopa.atlassian.net/browse/IOACGN-22)] Properly handles networking errors on UI ([#3652](https://github.com/pagopa/io-app/issues/3652)) ([a0439a1](https://github.com/pagopa/io-app/commit/a0439a1eb117bbe634aa3ee537fde116f37a61df))
* [[IA-493](https://pagopa.atlassian.net/browse/IA-493)] Update privacy/share data copy and link ([#3655](https://github.com/pagopa/io-app/issues/3655)) ([cdc167d](https://github.com/pagopa/io-app/commit/cdc167d4037b9a8b09a1798cc27d5f466f5f4168))
* **Carta Giovani Nazionale:** [[IOACGN-12](https://pagopa.atlassian.net/browse/IOACGN-12)] Introduces API to load a discount code from a bucket for cgn merchants ([#3651](https://github.com/pagopa/io-app/issues/3651)) ([b4b7491](https://github.com/pagopa/io-app/commit/b4b7491b2b9f252dd6ff315f14eab96789c7113b))
* **Carta Giovani Nazionale:** [[IOACGN-17](https://pagopa.atlassian.net/browse/IOACGN-17)] Moves CGN FF on remote ([#3648](https://github.com/pagopa/io-app/issues/3648)) ([48c2dfb](https://github.com/pagopa/io-app/commit/48c2dfb999a6c9a4b642d49823e3599e7d1c472c))
* **Carta Giovani Nazionale:** [[IOACGN-18](https://pagopa.atlassian.net/browse/IOACGN-18)] Integrate tracking for missing CGN Actions ([#3660](https://github.com/pagopa/io-app/issues/3660)) ([462311f](https://github.com/pagopa/io-app/commit/462311fa2ef7546a4aee407e5965a26e867813bc))
* **Carta Giovani Nazionale:** [[IOACGN-21](https://pagopa.atlassian.net/browse/IOACGN-21)] Implements error handling on bucket code visualization ([#3654](https://github.com/pagopa/io-app/issues/3654)) ([6b2d28f](https://github.com/pagopa/io-app/commit/6b2d28f8e9060b8fea6d931a9b9bca575b77cd52))
* **Carta Giovani Nazionale:** [[IOACGN-26](https://pagopa.atlassian.net/browse/IOACGN-26)] Updates CGN merchants API path ([#3664](https://github.com/pagopa/io-app/issues/3664)) ([1b6ee47](https://github.com/pagopa/io-app/commit/1b6ee47ba7acca95e9c86155bd04125d901ebe63))
* **Carta Giovani Nazionale:** [[IOACGN-7](https://pagopa.atlassian.net/browse/IOACGN-7)] Implements CGN Special Service CTA ([#3639](https://github.com/pagopa/io-app/issues/3639)) ([f7025a6](https://github.com/pagopa/io-app/commit/f7025a668e759bfc044f0423415a4df5f71f6c7a))
* **deps:** bump shelljs from 0.8.4 to 0.8.5 ([#3658](https://github.com/pagopa/io-app/issues/3658)) ([a623fb8](https://github.com/pagopa/io-app/commit/a623fb8759eb7564f2ab65c89aba1813a550b31e))
* [[IA-608](https://pagopa.atlassian.net/browse/IA-608)] Revert Activate FF and comment Android release out ([#3627](https://github.com/pagopa/io-app/issues/3627)) ([8dd0b14](https://github.com/pagopa/io-app/commit/8dd0b14eeb82240804ec0579516f73bb53cc25a7))
* [[IA-618](https://pagopa.atlassian.net/browse/IA-618)] Added no-duplicate-imports eslint rule ([#3646](https://github.com/pagopa/io-app/issues/3646)) ([8d2ffac](https://github.com/pagopa/io-app/commit/8d2ffac32fadce8df19063287a2cf83b9825ad3a))
* [[IA-620](https://pagopa.atlassian.net/browse/IA-620)] Improve SPID/CIE url data extraction ([#3642](https://github.com/pagopa/io-app/issues/3642)) ([1d490f6](https://github.com/pagopa/io-app/commit/1d490f696c9b1028e9856927c3447a4e60b28530))
* [[IA-625](https://pagopa.atlassian.net/browse/IA-625)] Add app version tag ([#3647](https://github.com/pagopa/io-app/issues/3647)) ([fe40b87](https://github.com/pagopa/io-app/commit/fe40b87970e5ceff8de97b8e2444c1db25ba0312))
* [[IA-627](https://pagopa.atlassian.net/browse/IA-627)] Integrate Zendesk analytics ([#3649](https://github.com/pagopa/io-app/issues/3649)) ([8e23b2a](https://github.com/pagopa/io-app/commit/8e23b2aca02f8aed1deef2eedd1fc24e9f2e0810))
* [[IAI-106](https://pagopa.atlassian.net/browse/IAI-106)] Upgrade ESLint toolchain ([#3650](https://github.com/pagopa/io-app/issues/3650)) ([844335b](https://github.com/pagopa/io-app/commit/844335b6265f6e80f02227b402924dca3cf435f7))

## [2.0.0-rc.0](https://github.com/pagopa/io-app/compare/1.38.0-rc.12...2.0.0-rc.0) (2022-01-11)


### Features

* [[IA-612](https://pagopa.atlassian.net/browse/IA-612)] Activate Paypal from remote feature flag ([#3634](https://github.com/pagopa/io-app/issues/3634)) ([9a7f405](https://github.com/pagopa/io-app/commit/9a7f4057f1478f2becb6eb258fe5347a795151dd))


### Chores

* **Carta Giovani Nazionale:** [[IOACGN-14](https://pagopa.atlassian.net/browse/IOACGN-14)] Implements component to display a code from a bucket for [#3641](https://github.com/pagopa/io-app/issues/3641) ([f251387](https://github.com/pagopa/io-app/commit/f2513874089941e0eb8c589970057e27b1d9e247))
* **Carta Giovani Nazionale:** [[IOACGN-2](https://pagopa.atlassian.net/browse/IOACGN-2)] Moves OTP Generation inside the discount bottomsheet ([#3594](https://github.com/pagopa/io-app/issues/3594)) ([77172e0](https://github.com/pagopa/io-app/commit/77172e0586bd1daede9793b9eef3c44742132907))
* [[IA-574](https://pagopa.atlassian.net/browse/IA-574)] Track error with message_id in push notification [#3638](https://github.com/pagopa/io-app/issues/3638) ([7510973](https://github.com/pagopa/io-app/commit/7510973fb08e48913b1e30771371eb97675beae2))
* **Carta Giovani Nazionale:** [[IOACGN-13](https://pagopa.atlassian.net/browse/IOACGN-13)] Implements action/reducer/saga for code from bucket consuption ([#3635](https://github.com/pagopa/io-app/issues/3635)) ([c96342f](https://github.com/pagopa/io-app/commit/c96342ff7c4a3d760a86e3c33cf3f1a3facc579f))
* **Redesign Servizi:** [[IARS-45](https://pagopa.atlassian.net/browse/IARS-45)] Disables contact switch on special services ([#3497](https://github.com/pagopa/io-app/issues/3497)) ([3c03dcb](https://github.com/pagopa/io-app/commit/3c03dcbb5ae46458345a52a494ede493e5b3f037))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
