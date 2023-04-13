# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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

## [1.38.0-rc.12](https://github.com/pagopa/io-app/compare/1.38.0-rc.11...1.38.0-rc.12) (2022-01-05)


### Chores

* Restore iOS release & notify new app on CI ([#3637](https://github.com/pagopa/io-app/issues/3637)) ([842a313](https://github.com/pagopa/io-app/commit/842a3132eab2ef4733e70c8294c67400516cc3bc))

## [1.38.0-rc.11](https://github.com/pagopa/io-app/compare/1.38.0-rc.10...1.38.0-rc.11) (2022-01-05)


### Bug Fixes

* [[IA-609](https://pagopa.atlassian.net/browse/IA-609)] Increasing the tos version causes an app crash  ([#3630](https://github.com/pagopa/io-app/issues/3630)) ([7f00321](https://github.com/pagopa/io-app/commit/7f00321c8b2461b0d2c2888312f2b14e5da0a13a))
* [[IA-611](https://pagopa.atlassian.net/browse/IA-611)] When the MessageDetail can't get the relative sender services, app crashes ([#3631](https://github.com/pagopa/io-app/issues/3631)) ([b8fa268](https://github.com/pagopa/io-app/commit/b8fa268fcc443c1d29662bd846de16626a83ecc6))
* [[IA-616](https://pagopa.atlassian.net/browse/IA-616)] The initializeApplicationSaga could be executed before the NavigationService initialization ([#3636](https://github.com/pagopa/io-app/issues/3636)) ([59e4566](https://github.com/pagopa/io-app/commit/59e4566f2e1257da3996d401422b67ccc30accb9))
* [[IABT-1272](https://pagopa.atlassian.net/browse/IABT-1272)] Cannot insert a credit cart that expires in the current month ([#3633](https://github.com/pagopa/io-app/issues/3633)) ([b3b2d74](https://github.com/pagopa/io-app/commit/b3b2d74d7dc6aa7a13dbc0ebec63a78a7e801b80))
* **Carta Giovani Nazionale:** [[IOACGN-6](https://pagopa.atlassian.net/browse/IOACGN-6)] Fix blocking error when merchants search API responds with errors [#3597](https://github.com/pagopa/io-app/issues/3597) ([258f95a](https://github.com/pagopa/io-app/commit/258f95add6c538fd27fc07458d8b984e2f3c4f70))


### Chores

* [[IA-480](https://pagopa.atlassian.net/browse/IA-480)] Handle back on Paypal onboarding ([#3629](https://github.com/pagopa/io-app/issues/3629)) ([ad8e021](https://github.com/pagopa/io-app/commit/ad8e02100e7a8ed156bf456ec28630fc3e9e24a8))
* [[IA-592](https://pagopa.atlassian.net/browse/IA-592)] Add access to gallery prominent disclosure in Zendesk workflow ([#3620](https://github.com/pagopa/io-app/issues/3620)) ([23c9ce1](https://github.com/pagopa/io-app/commit/23c9ce112e7aacd4c8524b2498008c1aa78ba0fd))
* [[IA-605](https://pagopa.atlassian.net/browse/IA-605)] Add logId in the app code ([#3616](https://github.com/pagopa/io-app/issues/3616)) ([934e0eb](https://github.com/pagopa/io-app/commit/934e0eb021c9afa7c5403074474c9a2b83444389))
* [[IAI-101](https://pagopa.atlassian.net/browse/IAI-101)] Patch react-native-device-info ([#3582](https://github.com/pagopa/io-app/issues/3582)) ([b3edf51](https://github.com/pagopa/io-app/commit/b3edf515eaccfcafced243dd484b4c340169cadd))
* [[IAI-103](https://pagopa.atlassian.net/browse/IAI-103)] Explicit code generation for dev-server on e2e job [#3628](https://github.com/pagopa/io-app/issues/3628) ([1a6f5cd](https://github.com/pagopa/io-app/commit/1a6f5cd72986d5a93a26d82385c966399c204c45))
* Update check-urls files black list ([#3619](https://github.com/pagopa/io-app/issues/3619)) ([62ffe67](https://github.com/pagopa/io-app/commit/62ffe67709a86bca990deb9c06f4ac988e4cfb58))

## [1.38.0-rc.10](https://github.com/pagopa/io-app/compare/1.38.0-rc.9...1.38.0-rc.10) (2021-12-29)


### Chores

* [[IA-607](https://pagopa.atlassian.net/browse/IA-607)] Increase debug log for OPERISSUES_10 ([#3625](https://github.com/pagopa/io-app/issues/3625)) ([4dbf2be](https://github.com/pagopa/io-app/commit/4dbf2be4c6d4affc29cda69f17affdd6a135842e))
* **Messaggi a valore legale:** [[IAMVL-44](https://pagopa.atlassian.net/browse/IAMVL-44)] Revert activate FF and comment Android release out ([#3624](https://github.com/pagopa/io-app/issues/3624))" ([#3626](https://github.com/pagopa/io-app/issues/3626)) ([c9bd787](https://github.com/pagopa/io-app/commit/c9bd78714aec1d64be087a9e2bd928b05606992a))

## [1.38.0-rc.9](https://github.com/pagopa/io-app/compare/1.38.0-rc.8...1.38.0-rc.9) (2021-12-29)


### Features

* **Messaggi a valore legale:** [[IAMVL-21](https://pagopa.atlassian.net/browse/IAMVL-21)] Read status for MVL ([#3621](https://github.com/pagopa/io-app/issues/3621)) ([b930aa0](https://github.com/pagopa/io-app/commit/b930aa05f19f0a7732c11745eadf1c77f40385ef))


### Bug Fixes

* [[IA-598](https://pagopa.atlassian.net/browse/IA-598)] Fix wrong name surname value in ZendeskAskPermissions screen ([#3610](https://github.com/pagopa/io-app/issues/3610)) ([1225569](https://github.com/pagopa/io-app/commit/1225569a50aa64bb588bf0a413c6f6f239ddb815))
* [[IA-599](https://pagopa.atlassian.net/browse/IA-599)] Fix wrong icons ([#3615](https://github.com/pagopa/io-app/issues/3615)) ([5647ec6](https://github.com/pagopa/io-app/commit/5647ec680aec1167212b17412528fed7b5a6b74f))


### Chores

* **Messaggi a valore legale:** [[IAMVL-13](https://pagopa.atlassian.net/browse/IAMVL-13)] Identify MVL in the list ([#3599](https://github.com/pagopa/io-app/issues/3599)) ([ca979f0](https://github.com/pagopa/io-app/commit/ca979f0bc446773f3b37f4974a1c9d1d8c623603))
* **Messaggi a valore legale:** [[IAMVL-19](https://pagopa.atlassian.net/browse/IAMVL-19)] Display legal message attachments ([#3583](https://github.com/pagopa/io-app/issues/3583)) ([0c745ee](https://github.com/pagopa/io-app/commit/0c745ee6768fce48bb6acc20ffcf493ecd546693))
* **Messaggi a valore legale:** [[IAMVL-20](https://pagopa.atlassian.net/browse/IAMVL-20)] Display legal message metadata ([#3596](https://github.com/pagopa/io-app/issues/3596)) ([0dc8658](https://github.com/pagopa/io-app/commit/0dc8658e713e0e451e187631cf63cf867e75eaf9))
* **Messaggi a valore legale:** [[IAMVL-27](https://pagopa.atlassian.net/browse/IAMVL-27),[IAMVL-34](https://pagopa.atlassian.net/browse/IAMVL-34)] Download attachments ([#3618](https://github.com/pagopa/io-app/issues/3618)) ([dfd4590](https://github.com/pagopa/io-app/commit/dfd4590ac67c20d8731e24030203e4b2623c39ec))
* **Messaggi a valore legale:** [[IAMVL-32](https://pagopa.atlassian.net/browse/IAMVL-32)] Add get legal message API ([#3609](https://github.com/pagopa/io-app/issues/3609)) ([35b2ac3](https://github.com/pagopa/io-app/commit/35b2ac3d2d3e6f2f2dab0546c4562fea0a07b0f3))
* **Messaggi a valore legale:** [[IAMVL-33](https://pagopa.atlassian.net/browse/IAMVL-33)] Update legal message error screen ([#3612](https://github.com/pagopa/io-app/issues/3612)) ([7766398](https://github.com/pagopa/io-app/commit/77663988cedf49f76641e1b0e183181d952cc11a))
* **Messaggi a valore legale:** [[IAMVL-36](https://pagopa.atlassian.net/browse/IAMVL-36)] Fetch service if not present in MvlDetailsScreen ([#3623](https://github.com/pagopa/io-app/issues/3623)) ([4d9ec9c](https://github.com/pagopa/io-app/commit/4d9ec9c5274306199c5c07128f7a952b552bf558))
* **Messaggi a valore legale:** [[IAMVL-44](https://pagopa.atlassian.net/browse/IAMVL-44)] Activate FF and comment Android release out ([#3624](https://github.com/pagopa/io-app/issues/3624)) ([ef36d06](https://github.com/pagopa/io-app/commit/ef36d0675e560d54a56c8d5e4d0bb86c69d8eb2a))
* [[IA-505](https://pagopa.atlassian.net/browse/IA-505)] Copy changes related to PayPal ([#3549](https://github.com/pagopa/io-app/issues/3549)) ([e98e05f](https://github.com/pagopa/io-app/commit/e98e05fe3e8b9baf3192c1d8e841f45fb29fa2cc))
* [IA-563, IA-463] Update push notifications routing for pagination ([#3580](https://github.com/pagopa/io-app/issues/3580)) ([2cf419a](https://github.com/pagopa/io-app/commit/2cf419a089e3f931fb47b7ab330142811019ab07))
* [[IA-591](https://pagopa.atlassian.net/browse/IA-591)] Copy changes CGN [#3607](https://github.com/pagopa/io-app/issues/3607) ([667e3c4](https://github.com/pagopa/io-app/commit/667e3c470f533b4faf292ed4ebc97f89a42f6102))
* Disable flaky test for constantPollingFetch ([#3613](https://github.com/pagopa/io-app/issues/3613)) ([a2df9db](https://github.com/pagopa/io-app/commit/a2df9db7dbb673ac6b0949d1f1eaf566377a694b))
* Update CGN specs endpoint ([#3622](https://github.com/pagopa/io-app/issues/3622)) ([37296c5](https://github.com/pagopa/io-app/commit/37296c520d5f1f2a520816ebeaae2ce08c9ce90f))

## [1.38.0-rc.8](https://github.com/pagopa/io-app/compare/1.38.0-rc.7...1.38.0-rc.8) (2021-12-22)


### Features

* [[IA-404](https://pagopa.atlassian.net/browse/IA-404)] Improves accessibility on transaction full reason link [#3574](https://github.com/pagopa/io-app/issues/3574) ([45e627d](https://github.com/pagopa/io-app/commit/45e627dd4e59450bc2fe66b79fb022f81f7fcbbe))
* [[IA-542](https://pagopa.atlassian.net/browse/IA-542)] Open ticket without share data ([#3589](https://github.com/pagopa/io-app/issues/3589)) ([c101d68](https://github.com/pagopa/io-app/commit/c101d68fc958fbbea64d9df25a733038801b3ee9))
* [[IA-556](https://pagopa.atlassian.net/browse/IA-556),[IA-511](https://pagopa.atlassian.net/browse/IA-511)] Manage ask assistance entry point ([#3572](https://github.com/pagopa/io-app/issues/3572)) ([796dd83](https://github.com/pagopa/io-app/commit/796dd83ec5b352edc6c2cf7b3c3abf2479ea56f8))


### Bug Fixes

* [[IA-566](https://pagopa.atlassian.net/browse/IA-566)] Fix entrypoints on error and attempt screens ([#3573](https://github.com/pagopa/io-app/issues/3573)) ([29a9e13](https://github.com/pagopa/io-app/commit/29a9e1396820d8ab745614894e647e256d2c5b08))
* [[IA-594](https://pagopa.atlassian.net/browse/IA-594)] Align locales with UX ([#3604](https://github.com/pagopa/io-app/issues/3604)) ([3d162a1](https://github.com/pagopa/io-app/commit/3d162a1f871af8768a1e522f1e5fa89349733edb))


### Chores

* [[IA-475](https://pagopa.atlassian.net/browse/IA-475)] Show an alert when Paypal is already in the user wallet ([#3581](https://github.com/pagopa/io-app/issues/3581)) ([d0b9894](https://github.com/pagopa/io-app/commit/d0b98940f74e42591c5fe171de91c6e02451ba5e))
* [[IA-532](https://pagopa.atlassian.net/browse/IA-532)] Complete ZendeskSupportHelpCenter screen ([#3571](https://github.com/pagopa/io-app/issues/3571)) ([1276110](https://github.com/pagopa/io-app/commit/1276110a9e7d957cf3a263fa977a387290a194f7))
* [[IA-533](https://pagopa.atlassian.net/browse/IA-533)] Zendesk permission detail screen ([#3552](https://github.com/pagopa/io-app/issues/3552)) ([549824f](https://github.com/pagopa/io-app/commit/549824f64d00276c7e4bab2c699e9af1af26a8b3))
* [[IA-546](https://pagopa.atlassian.net/browse/IA-546)] Paypal payment flow: fix and refinement ([#3557](https://github.com/pagopa/io-app/issues/3557)) ([004d7b2](https://github.com/pagopa/io-app/commit/004d7b2cb9a62c1c955a0c733a366e17d8bb7cde))
* [[IA-551](https://pagopa.atlassian.net/browse/IA-551)] Improve archived messages ([#3584](https://github.com/pagopa/io-app/issues/3584)) ([4ec4438](https://github.com/pagopa/io-app/commit/4ec44383a04c1cd32ac7e0b1a540102cfb3865a7))
* [[IA-552](https://pagopa.atlassian.net/browse/IA-552)] Add Paypal banner ([#3578](https://github.com/pagopa/io-app/issues/3578)) ([a168b41](https://github.com/pagopa/io-app/commit/a168b4126afb3b0365ea9f99eff7ab0ca232e474))
* [[IA-575](https://pagopa.atlassian.net/browse/IA-575),[IA-564](https://pagopa.atlassian.net/browse/IA-564)] Add payment info ([#3593](https://github.com/pagopa/io-app/issues/3593)) ([870a8b1](https://github.com/pagopa/io-app/commit/870a8b1372c7831bec0a08a81adfedfe07c34664))
* [[IA-576](https://pagopa.atlassian.net/browse/IA-576)] Upgrade io-react-native-zendesk ([#3585](https://github.com/pagopa/io-app/issues/3585)) ([fd3315b](https://github.com/pagopa/io-app/commit/fd3315b0b79b98bbf8cb5441d295fca337b20ef4))
* [[IA-576](https://pagopa.atlassian.net/browse/IA-576)] Upgrade react-native-zendesk IOS [#3588](https://github.com/pagopa/io-app/issues/3588) ([2bd82f2](https://github.com/pagopa/io-app/commit/2bd82f2811ad10b3a4089535f72eb8395f3d91f0))
* [[IA-578](https://pagopa.atlassian.net/browse/IA-578)] Update Zendesk SDK configuration value [#3590](https://github.com/pagopa/io-app/issues/3590) ([2065a36](https://github.com/pagopa/io-app/commit/2065a36219697e4af9bf39edc85f8d87b88c6c55))
* [[IA-579](https://pagopa.atlassian.net/browse/IA-579)] Reset assistance data on logout/sessionExpired ([#3591](https://github.com/pagopa/io-app/issues/3591)) ([e1a8a97](https://github.com/pagopa/io-app/commit/e1a8a977fff7ae15f9f0e5e9e836fda3b6672e3e))
* [[IA-585](https://pagopa.atlassian.net/browse/IA-585)] Send support information ([#3595](https://github.com/pagopa/io-app/issues/3595)) ([ccb17af](https://github.com/pagopa/io-app/commit/ccb17af897097907439386e18a66658010e6c9cd))
* [[IA-586](https://pagopa.atlassian.net/browse/IA-586)] Hide zendesk if email not validated ([#3600](https://github.com/pagopa/io-app/issues/3600)) ([54def91](https://github.com/pagopa/io-app/commit/54def91f7d974377625ffdc8fc22a661ede1e5ca))
* [[IA-587](https://pagopa.atlassian.net/browse/IA-587)] Add Zendesk analytics ([#3601](https://github.com/pagopa/io-app/issues/3601)) ([df5b2c7](https://github.com/pagopa/io-app/commit/df5b2c7ca2d3339da34a2fce4200648766732686))
* [[IA-590](https://pagopa.atlassian.net/browse/IA-590)] Enable Zendesk local feature flag ([#3602](https://github.com/pagopa/io-app/issues/3602)) ([142b223](https://github.com/pagopa/io-app/commit/142b223b657c2fea2d6a1012bf70e7d2a1276e35))
* [[IA-593](https://pagopa.atlassian.net/browse/IA-593)] Disable Instabug attachments & screen recording [#3603](https://github.com/pagopa/io-app/issues/3603) ([413f510](https://github.com/pagopa/io-app/commit/413f510ccc4205b355f7de5c9fd1d2e496566723))
* [[IA-595](https://pagopa.atlassian.net/browse/IA-595)] Hide show tickets button ([#3605](https://github.com/pagopa/io-app/issues/3605)) ([0762115](https://github.com/pagopa/io-app/commit/0762115c81dfbb35e46270fb1a66df3be113ce2a))
* Disable android release ([#3606](https://github.com/pagopa/io-app/issues/3606)) ([a2609df](https://github.com/pagopa/io-app/commit/a2609dfb9edb1769d58d2b0f4fa00eb9730e9d52))
* **Carta Giovani Nazionale:** [[IOACGN-1](https://pagopa.atlassian.net/browse/IOACGN-1)] Fixes card and background color ([#3577](https://github.com/pagopa/io-app/issues/3577)) ([3ff2913](https://github.com/pagopa/io-app/commit/3ff2913edda4a303f31f89854e067b896ce28169))
* **Messaggi a valore legale:** [[IAMVL-18](https://pagopa.atlassian.net/browse/IAMVL-18)] MvlDetailsScreen layout and components placeholders ([#3567](https://github.com/pagopa/io-app/issues/3567)) ([d866cee](https://github.com/pagopa/io-app/commit/d866cee05be2016382aec4c42577e5d7d26c239a))
* **Messaggi a valore legale:** [[IAMVL-23](https://pagopa.atlassian.net/browse/IAMVL-23)] Display plain and html message body ([#3575](https://github.com/pagopa/io-app/issues/3575)) ([86810b7](https://github.com/pagopa/io-app/commit/86810b7b26edb8a8ca53837e972c06455c47d35c))
* revert "set CGN Feature flag ON" ([0c983c8](https://github.com/pagopa/io-app/commit/0c983c8a68107892de98a4fc512d57bf01ebd6f8))

## [1.38.0-rc.7](https://github.com/pagopa/io-app/compare/1.38.0-rc.6...1.38.0-rc.7) (2021-12-13)


### Features

* [[IA-301](https://pagopa.atlassian.net/browse/IA-301),[IA-302](https://pagopa.atlassian.net/browse/IA-302),[IA-479](https://pagopa.atlassian.net/browse/IA-479),[IA-506](https://pagopa.atlassian.net/browse/IA-506)] Track Paypal onboarding & payment events ([#3536](https://github.com/pagopa/io-app/issues/3536)) ([4ea4f8e](https://github.com/pagopa/io-app/commit/4ea4f8e47f72ca46e7e73d3a1d4b855f7158949e))


### Chores

* [[IA-439](https://pagopa.atlassian.net/browse/IA-439)] Fixes timestamp visualization on MessageDetailScreen ([#3562](https://github.com/pagopa/io-app/issues/3562)) ([9f1a0d7](https://github.com/pagopa/io-app/commit/9f1a0d71682e72102960c7ec8020c3beb5c983d2))
* Revert "set Paypal feature flag ON" ([#3570](https://github.com/pagopa/io-app/issues/3570)) ([eda342a](https://github.com/pagopa/io-app/commit/eda342abbc22ed43846fd38fc09e3eba99fd54ae))
* set CGN Feature flag ON ([373e4f8](https://github.com/pagopa/io-app/commit/373e4f85797a1de0f78cf2a9bb7e267d0dee8cd5))
* **Redesign Servizi:** [[IARS-44](https://pagopa.atlassian.net/browse/IARS-44)] Handles "Special" services category inside service detail screen ([#3480](https://github.com/pagopa/io-app/issues/3480)) ([adacd33](https://github.com/pagopa/io-app/commit/adacd3354c60595e5912ff4029eb7f58703e56c1))

## [1.38.0-rc.6](https://github.com/pagopa/io-app/compare/1.38.0-rc.5...1.38.0-rc.6) (2021-12-10)


### Chores

* set Paypal feature flag ON ([#3569](https://github.com/pagopa/io-app/issues/3569)) ([b063144](https://github.com/pagopa/io-app/commit/b063144370cf5ae363f86169eccdf212e413b5d2))

## [1.38.0-rc.5](https://github.com/pagopa/io-app/compare/1.38.0-rc.4...1.38.0-rc.5) (2021-12-10)


### Features

* [[IA-512](https://pagopa.atlassian.net/browse/IA-512)] Select category screen ([#3565](https://github.com/pagopa/io-app/issues/3565)) ([75e09eb](https://github.com/pagopa/io-app/commit/75e09ebf1f184d8732077dea31defa4544178eb1))


### Bug Fixes

* Use current time for time-based assertions [#3568](https://github.com/pagopa/io-app/issues/3568) ([f37456e](https://github.com/pagopa/io-app/commit/f37456e3ab95a57c4d948936faf93f0247e6cb72))


### Chores

* [[IA-536](https://pagopa.atlassian.net/browse/IA-536)] Add remote zendesk config ([#3561](https://github.com/pagopa/io-app/issues/3561)) ([ff5b7b3](https://github.com/pagopa/io-app/commit/ff5b7b33700cedb57bee4abbbd95fcc63bc17dce))
* [[IA-541](https://pagopa.atlassian.net/browse/IA-541)] Add remote assistanceTool ff ([#3544](https://github.com/pagopa/io-app/issues/3544)) ([66c1d48](https://github.com/pagopa/io-app/commit/66c1d48bab67d5045305bb39842e6cd138ff1b8f))
* [[IA-550](https://pagopa.atlassian.net/browse/IA-550)] Add Paypal checkout psp info banner ([#3559](https://github.com/pagopa/io-app/issues/3559)) ([c10142d](https://github.com/pagopa/io-app/commit/c10142da689c0cc9a5bad04f8884527027aad5f8))
* Upgrade to v7.26.0-RELEASE ([#3564](https://github.com/pagopa/io-app/issues/3564)) ([ea7912c](https://github.com/pagopa/io-app/commit/ea7912cc8d6906b86c81a561f8447b1e66b39538))

## [1.38.0-rc.4](https://github.com/pagopa/io-app/compare/1.38.0-rc.3...1.38.0-rc.4) (2021-12-09)


### Features

* [[IA-174](https://pagopa.atlassian.net/browse/IA-174),[IA-484](https://pagopa.atlassian.net/browse/IA-484)] Handle new outcome error codes ([#3530](https://github.com/pagopa/io-app/issues/3530)) ([a32b1d8](https://github.com/pagopa/io-app/commit/a32b1d8878265cc37c7b5bbe0b50ee003b4961a6))
* [[IA-418](https://pagopa.atlassian.net/browse/IA-418)] Identify Green Pass on the new message list ([#3546](https://github.com/pagopa/io-app/issues/3546)) ([97cefbd](https://github.com/pagopa/io-app/commit/97cefbda794c5e59416b23c4df4e340c970df24f))
* [[IA-458](https://pagopa.atlassian.net/browse/IA-458)] Pay with Paypal ([#3534](https://github.com/pagopa/io-app/issues/3534)) ([68442f1](https://github.com/pagopa/io-app/commit/68442f12d06ee89fe8e5d539f415f24b0535b01f))


### Bug Fixes

* [[IA-503](https://pagopa.atlassian.net/browse/IA-503)] Improve rendering performance in Message list ([#3540](https://github.com/pagopa/io-app/issues/3540)) ([adaac30](https://github.com/pagopa/io-app/commit/adaac30932da2f020dfc90fb10f2215571bec062))
* [[IABT-1303](https://pagopa.atlassian.net/browse/IABT-1303)] When a payment is done the "See notice" button isn't shown ([#3553](https://github.com/pagopa/io-app/issues/3553)) ([bc9c4b3](https://github.com/pagopa/io-app/commit/bc9c4b3b8ef8cbd16a75b3d19d02a4b115a35a29))


### Chores

* [[IA-557](https://pagopa.atlassian.net/browse/IA-557)] Remove useless permission and show prominent disclosure in the read device storage cases ([#3563](https://github.com/pagopa/io-app/issues/3563)) ([cea26f8](https://github.com/pagopa/io-app/commit/cea26f868f053c5680558800b37c133c214982fe))
* **Messaggi a valore legale:** [[IAMVL-16](https://pagopa.atlassian.net/browse/IAMVL-16)] Extract common components shared by MessageDetailsComponent and MVLDetailsScreen ([#3551](https://github.com/pagopa/io-app/issues/3551)) ([5fc683d](https://github.com/pagopa/io-app/commit/5fc683df0c836919d287210c7778637eaa34bdda))
* **Messaggi a valore legale:** [[IAMVL-17](https://pagopa.atlassian.net/browse/IAMVL-17)] Refinement of MVL datamodel ([#3555](https://github.com/pagopa/io-app/issues/3555)) ([334cd26](https://github.com/pagopa/io-app/commit/334cd267fe240a2cb8888cd306bd7e488cad7bf8))
* [[IA-468](https://pagopa.atlassian.net/browse/IA-468)] Handle Payment Verification code for EC category ([#3556](https://github.com/pagopa/io-app/issues/3556)) ([422a016](https://github.com/pagopa/io-app/commit/422a0162ad12a627dbe1a446f8ebce9fe7b4c7ce))
* **Messaggi a valore legale:** [[IAMVL-9](https://pagopa.atlassian.net/browse/IAMVL-9)] Stub screens and navigation ([#3545](https://github.com/pagopa/io-app/issues/3545)) ([c7d1106](https://github.com/pagopa/io-app/commit/c7d1106c207bb1890d4615c6f9b48112c5e30074))
* [[IA-499](https://pagopa.atlassian.net/browse/IA-499)] Add psp list API - V2 ([#3531](https://github.com/pagopa/io-app/issues/3531)) ([7672cb0](https://github.com/pagopa/io-app/commit/7672cb0d8ed2c236d9bf9de1a8e76d1e1459278d))
* [[IA-531](https://pagopa.atlassian.net/browse/IA-531)] Zendesk workunit ([#3538](https://github.com/pagopa/io-app/issues/3538)) ([1eb8bed](https://github.com/pagopa/io-app/commit/1eb8bed42d54de4f9c2d994a2e2fba678eb02fd3))
* [[IA-539](https://pagopa.atlassian.net/browse/IA-539)] Revert "Enable FF for testing purpose" ([#3541](https://github.com/pagopa/io-app/issues/3541)) ([412146c](https://github.com/pagopa/io-app/commit/412146c1ff1e1e1d948c4112021e300fd67e6e1e))
* [[IA-549](https://pagopa.atlassian.net/browse/IA-549)] Align mock backendStatus ([#3548](https://github.com/pagopa/io-app/issues/3548)) ([cc017cb](https://github.com/pagopa/io-app/commit/cc017cb1c69dc0da57337dff3f856f575be10536))
* [[IAI-100](https://pagopa.atlassian.net/browse/IAI-100)] Add generic test overlay ([#3537](https://github.com/pagopa/io-app/issues/3537)) ([bf85e48](https://github.com/pagopa/io-app/commit/bf85e4852626fa241fce5a5c0cf74246a13ef917))
* Update check_url script config ([#3554](https://github.com/pagopa/io-app/issues/3554)) ([d75e35f](https://github.com/pagopa/io-app/commit/d75e35fde918e23670946c146721c7761fac6475))

## [1.38.0-rc.3](https://github.com/pagopa/io-app/compare/1.38.0-rc.2...1.38.0-rc.3) (2021-12-02)


### Features

* [[IA-268](https://pagopa.atlassian.net/browse/IA-268)] Support infinite scroll ([#3510](https://github.com/pagopa/io-app/issues/3510)) ([f8487a5](https://github.com/pagopa/io-app/commit/f8487a50d5e27dbfd1810481e46dbe5cd3b37677))
* [[IA-269](https://pagopa.atlassian.net/browse/IA-269)] Support pull-to-refresh ([#3514](https://github.com/pagopa/io-app/issues/3514)) ([a8c55a2](https://github.com/pagopa/io-app/commit/a8c55a2ead0f9d3d7bf019a558bc82ad15b8164a))
* [[IA-325](https://pagopa.atlassian.net/browse/IA-325)] Added the accessibility role button to the reset code function [#3511](https://github.com/pagopa/io-app/issues/3511) ([bc2af65](https://github.com/pagopa/io-app/commit/bc2af65c0412fede0696545c2301a9a7669f6871))
* [[IA-436](https://pagopa.atlassian.net/browse/IA-436)] Paypal psp: change privacy and ToS url in the info bottom sheet ([#3529](https://github.com/pagopa/io-app/issues/3529)) ([9715467](https://github.com/pagopa/io-app/commit/97154678637b47ff131d42ef294aafd40575d60f))
* [[IA-452](https://pagopa.atlassian.net/browse/IA-452)] Add Paypal details screen ([#3499](https://github.com/pagopa/io-app/issues/3499)) ([f8dce1b](https://github.com/pagopa/io-app/commit/f8dce1b887089121cb53e42b5f0fe5eb86a26090))
* [[IA-457](https://pagopa.atlassian.net/browse/IA-457)] Show Paypal as method that can pay ([#3509](https://github.com/pagopa/io-app/issues/3509)) ([4a83498](https://github.com/pagopa/io-app/commit/4a83498d29cccda64002fd1c4a15025c9fa647d7))
* [[IA-465](https://pagopa.atlassian.net/browse/IA-465)] Implement new message details view ([#3519](https://github.com/pagopa/io-app/issues/3519)) ([49a3498](https://github.com/pagopa/io-app/commit/49a3498801531668a145d9942b279acb47eec3c7))
* [[IA-470](https://pagopa.atlassian.net/browse/IA-470)] Paypal onboarding flow - part 1 of 2 ([#3513](https://github.com/pagopa/io-app/issues/3513)) ([6773567](https://github.com/pagopa/io-app/commit/67735673ce8accaaf9dabdbdae8706edc5247651))
* [[IA-471](https://pagopa.atlassian.net/browse/IA-471)] Paypal onboarding flow - part 2 of 2 ([#3515](https://github.com/pagopa/io-app/issues/3515)) ([1c2d2b5](https://github.com/pagopa/io-app/commit/1c2d2b54b96ad5b075e702857f8517b1ea06759d))
* [[IA-497](https://pagopa.atlassian.net/browse/IA-497)] Add screen to update paypal psp ([#3521](https://github.com/pagopa/io-app/issues/3521)) ([47e9336](https://github.com/pagopa/io-app/commit/47e9336c0a96a61a3b45e692911a4d720764cc28))
* [[IA-501](https://pagopa.atlassian.net/browse/IA-501)] Add Paypal during a payment  ([#3525](https://github.com/pagopa/io-app/issues/3525)) ([412d7fa](https://github.com/pagopa/io-app/commit/412d7fad37210f08e04ef5d62b319b467664d7e9))


### Bug Fixes

* [[IA-413](https://pagopa.atlassian.net/browse/IA-413)] Typo in BANCOMATPay not found copy ([#3516](https://github.com/pagopa/io-app/issues/3516)) ([e9d3580](https://github.com/pagopa/io-app/commit/e9d35801c2c94b81644d31b9ec28b7d693a335e9))
* [[IA-485](https://pagopa.atlassian.net/browse/IA-485)] Disable crash reporting ([#3517](https://github.com/pagopa/io-app/issues/3517)) ([7ffc40b](https://github.com/pagopa/io-app/commit/7ffc40b62a2aa2d2442a8d7cb5e79c8121880e15))
* [[IA-496](https://pagopa.atlassian.net/browse/IA-496)] If a payment started from a message detail, the cancellation of the payment causes a navigation to the Wallet instead of returning to the message details ([#3520](https://github.com/pagopa/io-app/issues/3520)) ([45d6ac4](https://github.com/pagopa/io-app/commit/45d6ac4e7e8ae000eb4796d8a826c18d4657493b))
* [[IA-502](https://pagopa.atlassian.net/browse/IA-502)] Return EdgeBorderComponent in list footer [#3524](https://github.com/pagopa/io-app/issues/3524) ([a8b8fde](https://github.com/pagopa/io-app/commit/a8b8fdea259d9ea0c528c96b12b90757183488d4))


### Chores

* [[IA-539](https://pagopa.atlassian.net/browse/IA-539)] Enable FF for testing purpose ([#3539](https://github.com/pagopa/io-app/issues/3539)) ([b3821a7](https://github.com/pagopa/io-app/commit/b3821a78b5523efc4a2846b32a0b8a9c61c2f3b3))
* **Messaggi a valore legale:** [[IAMVL-15](https://pagopa.atlassian.net/browse/IAMVL-15)] Add new scope "Messaggi a valore legale" to changelog and GitHub tag [#3532](https://github.com/pagopa/io-app/issues/3532) ([d1a9f56](https://github.com/pagopa/io-app/commit/d1a9f562f2fa5c1b81f892c4161a0378715032f6))
* **Messaggi a valore legale:** [[IAMVL-8](https://pagopa.atlassian.net/browse/IAMVL-8)] Add types, actions, store, reducers & saga entrypoint ([#3535](https://github.com/pagopa/io-app/issues/3535)) ([4f279e3](https://github.com/pagopa/io-app/commit/4f279e38c69434e15402fa31e55b69f7e5798808))
* [[IA-419](https://pagopa.atlassian.net/browse/IA-419)] Support and freeze archived messages  ([#3526](https://github.com/pagopa/io-app/issues/3526)) ([1f93f5d](https://github.com/pagopa/io-app/commit/1f93f5dbfa38c30132e6d334db428d116efb0679))
* **Zendesk:** [[ASZ-114](https://pagopa.atlassian.net/browse/ASZ-114)] Add zendesk entrypoint ([#3508](https://github.com/pagopa/io-app/issues/3508)) ([235615e](https://github.com/pagopa/io-app/commit/235615e3d420c1047fc5632e95dcc9411fbcc448))
* [[IA-438](https://pagopa.atlassian.net/browse/IA-438)] Set color and a11y props for messagelist loader [#3522](https://github.com/pagopa/io-app/issues/3522) ([bf63c58](https://github.com/pagopa/io-app/commit/bf63c5879e222b4a62146cf333afd2f72c22dcb5))
* [[IA-504](https://pagopa.atlassian.net/browse/IA-504)] Sync Paypal PM spec ([#3527](https://github.com/pagopa/io-app/issues/3527)) ([80cea77](https://github.com/pagopa/io-app/commit/80cea77d9518511dcfaa466f9e2876cf34e06f8d))
* **Messaggi a valore legale:** [[IAMVL-7](https://pagopa.atlassian.net/browse/IAMVL-7)] Add MVL feature flag and folder structure ([#3533](https://github.com/pagopa/io-app/issues/3533)) ([656c089](https://github.com/pagopa/io-app/commit/656c0890a50ff83de4cad00a76abc43f4736e62a))
* **Redesign Servizi:** [[IARS-47](https://pagopa.atlassian.net/browse/IARS-47)] Load service detail when navigating to service detail screen ([#3487](https://github.com/pagopa/io-app/issues/3487)) ([5f0837f](https://github.com/pagopa/io-app/commit/5f0837f23fc79b1a422530d20561d2a5dac79e88))
* **Sicilia Vola:** [[IASV-26](https://pagopa.atlassian.net/browse/IASV-26)] Select destination component ([#3452](https://github.com/pagopa/io-app/issues/3452)) ([b256d09](https://github.com/pagopa/io-app/commit/b256d0974ea1e37a337d14b7c3ef7f1d905110b3))
* **Zendesk:** [[ASZ-124](https://pagopa.atlassian.net/browse/ASZ-124)] Update io-react-native-zendesk ([#3528](https://github.com/pagopa/io-app/issues/3528)) ([f225e82](https://github.com/pagopa/io-app/commit/f225e827b00f1be1273a31fe14efc8448cb226a7))
* [[IA-494](https://pagopa.atlassian.net/browse/IA-494)] Support login failure error code 1001 ([#3518](https://github.com/pagopa/io-app/issues/3518)) ([5cd78ab](https://github.com/pagopa/io-app/commit/5cd78ab046f9ed13daa637b3680117a8e723a7d7))
* [[IA-500](https://pagopa.atlassian.net/browse/IA-500)] Update check_url script config ([#3523](https://github.com/pagopa/io-app/issues/3523)) ([595e9d4](https://github.com/pagopa/io-app/commit/595e9d4b9f44231dd575e4108d51261a6b57b8d2))
* [[IAI-91](https://pagopa.atlassian.net/browse/IAI-91)] Execute e2e tests with release build on CI ([#3496](https://github.com/pagopa/io-app/issues/3496)) ([32d0ca1](https://github.com/pagopa/io-app/commit/32d0ca1f8bc1855b64cc6ec7972d8a366e914438))

## [1.38.0-rc.2](https://github.com/pagopa/io-app/compare/1.38.0-rc.1...1.38.0-rc.2) (2021-11-18)


### Features

* [[IA-341](https://pagopa.atlassian.net/browse/IA-341)] & [[IA-342](https://pagopa.atlassian.net/browse/IA-342)] Improved the accessibility of national services list ([#3504](https://github.com/pagopa/io-app/issues/3504)) ([16b7171](https://github.com/pagopa/io-app/commit/16b71711e02a5a2ad7d8e754593bcc79ba94ddc1))
* [[IA-421](https://pagopa.atlassian.net/browse/IA-421)] Add Paypal search psp API/action/store/reducer ([#3483](https://github.com/pagopa/io-app/issues/3483)) ([6dff355](https://github.com/pagopa/io-app/commit/6dff355754fadfbbab46ef6a146c801d89009dc9))
* [[IA-445](https://pagopa.atlassian.net/browse/IA-445)] Add PayPal payment method type ([#3491](https://github.com/pagopa/io-app/issues/3491)) ([48492d3](https://github.com/pagopa/io-app/commit/48492d3ed2cbef4069022dee261c1aec36fe9874))
* [[IA-467](https://pagopa.atlassian.net/browse/IA-467)] Add an alert explaining why the calendar permissions are required on Android ([#3507](https://github.com/pagopa/io-app/issues/3507)) ([284260e](https://github.com/pagopa/io-app/commit/284260e494f82b22a2869091f65b167a27ac626f))


### Bug Fixes

* [[IA-420](https://pagopa.atlassian.net/browse/IA-420)] All space characters text cause infinite loading in the MarkDown component ([#3502](https://github.com/pagopa/io-app/issues/3502)) ([31872a7](https://github.com/pagopa/io-app/commit/31872a788ecb560dfdfe33de4ab39fad1a398ee8))
* [[IA-441](https://pagopa.atlassian.net/browse/IA-441)] When the contextual help data is not available, app starts an infinite loop of requests ([#3485](https://github.com/pagopa/io-app/issues/3485)) ([5b1d0ca](https://github.com/pagopa/io-app/commit/5b1d0ca7d4fb78c10044ad5ec3ede635263d7d63))
* [[IA-447](https://pagopa.atlassian.net/browse/IA-447)] In MessageDetailsScreen the link to related services doesn't work ([#3493](https://github.com/pagopa/io-app/issues/3493)) ([0afd11c](https://github.com/pagopa/io-app/commit/0afd11c28fef2bc7b607e4d4fa8512af32b99d82))
* [[IA-466](https://pagopa.atlassian.net/browse/IA-466)] Cannot cancel CIE login if a wrong PIN is inserted ([#3505](https://github.com/pagopa/io-app/issues/3505)) ([623e86a](https://github.com/pagopa/io-app/commit/623e86adc70fb6a0ff4f3ea07dc655d2c304b804))
* [[IABT-1291](https://pagopa.atlassian.net/browse/IABT-1291)] Wrong payment history selection [#3492](https://github.com/pagopa/io-app/issues/3492) ([d4305da](https://github.com/pagopa/io-app/commit/d4305dad8b919b84bdc7569969414e05198761b1))
* Move misplaced mocks ([#3500](https://github.com/pagopa/io-app/issues/3500)) ([efa2e9d](https://github.com/pagopa/io-app/commit/efa2e9d9f57b815cf65cff84b5723018c55544c7))


### Chores

* [[IA-315](https://pagopa.atlassian.net/browse/IA-315)] Add suite tests on notification saga ([#3453](https://github.com/pagopa/io-app/issues/3453)) ([3d6a472](https://github.com/pagopa/io-app/commit/3d6a472f5b7daee703d98c371d9ae86600605167))
* [[IA-450](https://pagopa.atlassian.net/browse/IA-450)] Message list should remember its scroll offset ([#3495](https://github.com/pagopa/io-app/issues/3495)) ([4ae1281](https://github.com/pagopa/io-app/commit/4ae128126fd69214760ebb10f24abe76d9c2c60b))
* [[IA-464](https://pagopa.atlassian.net/browse/IA-464)] Copy improvement ([#3503](https://github.com/pagopa/io-app/issues/3503)) ([e63ed1c](https://github.com/pagopa/io-app/commit/e63ed1c3200fbd2081edf760065951303cc204c8))
* [[IAI-88](https://pagopa.atlassian.net/browse/IAI-88)] Execute e2e tests when merge on master ([#3489](https://github.com/pagopa/io-app/issues/3489)) ([1276a8f](https://github.com/pagopa/io-app/commit/1276a8f9e7b9c7b86e36f423d3b66f664ca78fe3))
* Refactoring tests in GivenWhenThen style ([#3494](https://github.com/pagopa/io-app/issues/3494)) ([cd62e19](https://github.com/pagopa/io-app/commit/cd62e19dd0a1e9b8b9a6139d7a23df22bb28ac1e))
* Sync .env.local feature flags with .env.production ([#3488](https://github.com/pagopa/io-app/issues/3488)) ([4a0284d](https://github.com/pagopa/io-app/commit/4a0284d18732dbf9464d8386438d1b47146e2650))

## [1.38.0-rc.1](https://github.com/pagopa/io-app/compare/1.38.0-rc.0...1.38.0-rc.1) (2021-11-11)


### Features

* [[IA-278](https://pagopa.atlassian.net/browse/IA-278)] Use pagination API for messages ([#3441](https://github.com/pagopa/io-app/issues/3441)) ([c6089bb](https://github.com/pagopa/io-app/commit/c6089bb8b47e66dba8a9770f4293b4a0c6380f01))
* [[IA-375](https://pagopa.atlassian.net/browse/IA-375)] Fixes the color contrast when the StatusMessage has aqua background color ([#3456](https://github.com/pagopa/io-app/issues/3456)) ([6178be7](https://github.com/pagopa/io-app/commit/6178be7e04d12191dbaaf0197a08d7edeab062d2))
* [[IA-382](https://pagopa.atlassian.net/browse/IA-382)] Added a label read by screen reader ([#3477](https://github.com/pagopa/io-app/issues/3477)) ([2ab46f5](https://github.com/pagopa/io-app/commit/2ab46f5abb74a81aa9c8da10cd4ffd30826b22db))


### Bug Fixes

* [[IA-440](https://pagopa.atlassian.net/browse/IA-440)] Wrong color assignment in SectionStatus ([#3484](https://github.com/pagopa/io-app/issues/3484)) ([1a8ff2a](https://github.com/pagopa/io-app/commit/1a8ff2a2def5a9c57b47e6ee91e190b9313ffdb0))
* [[IA-444](https://pagopa.atlassian.net/browse/IA-444)] Credit card holder is always the user using the app ([#3486](https://github.com/pagopa/io-app/issues/3486)) ([a3f7246](https://github.com/pagopa/io-app/commit/a3f7246ff0fe1262c3a4f0c71d9f53ec65038e06))


### Chores

* [[IA-407](https://pagopa.atlassian.net/browse/IA-407)] Refactoring the list of available payment method to add  ([#3465](https://github.com/pagopa/io-app/issues/3465)) ([99d7de4](https://github.com/pagopa/io-app/commit/99d7de402f1ebdf48ce486a023a0ff43b9853f5e))
* [[IA-424](https://pagopa.atlassian.net/browse/IA-424)] Upgrade @pagopa/io-pagopa-commons ([#3481](https://github.com/pagopa/io-app/issues/3481)) ([4acb115](https://github.com/pagopa/io-app/commit/4acb1158625cc288d19b6d29da02e48e808e702b))
* [[IAI-76](https://pagopa.atlassian.net/browse/IAI-76)] Remove react-navigation-redux-helpers ([#3448](https://github.com/pagopa/io-app/issues/3448)) ([900d7fb](https://github.com/pagopa/io-app/commit/900d7fb52444d2424b0fbfc1637e91724b73e754))
* [[IAI-86](https://pagopa.atlassian.net/browse/IAI-86),[IAI-87](https://pagopa.atlassian.net/browse/IAI-87)] Add credit card e2e test and refactoring ([#3482](https://github.com/pagopa/io-app/issues/3482)) ([e17ed67](https://github.com/pagopa/io-app/commit/e17ed67fc88faaa5fc67e7b4bf5621e17b9120a1))
* **deps:** bump browserslist from 4.16.1 to 4.17.6 ([#3474](https://github.com/pagopa/io-app/issues/3474)) ([6ae7699](https://github.com/pagopa/io-app/commit/6ae7699a1c136b0c7dbfe50be5251a6252688096))
* **Zendesk:** [[ASZ-104](https://pagopa.atlassian.net/browse/ASZ-104)] Add zendesk package ([#3462](https://github.com/pagopa/io-app/issues/3462)) ([1e30dd7](https://github.com/pagopa/io-app/commit/1e30dd762b04bfd7ed98b0862739865600e85601))

## [1.38.0-rc.0](https://github.com/pagopa/io-app/compare/1.37.0-rc.4...1.38.0-rc.0) (2021-11-08)

## [1.37.0-rc.4](https://github.com/pagopa/io-app/compare/1.37.0-rc.3...1.37.0-rc.4) (2021-11-05)


### Features

* [[IA-304](https://pagopa.atlassian.net/browse/IA-304)] Add "what is a psp" bottom sheet info ([#3469](https://github.com/pagopa/io-app/issues/3469)) ([53e617d](https://github.com/pagopa/io-app/commit/53e617d2a043b8daf7b37b8ef584187dcb260fef))


### Bug Fixes

* Linking.openURL doesn't open urls on Android ([#3478](https://github.com/pagopa/io-app/issues/3478)) ([ce57b85](https://github.com/pagopa/io-app/commit/ce57b859b9f6ab44683bd2d447ef3c4d952370c5))


### Chores

* **deps:** bump color-string from 1.5.3 to 1.6.0 ([#3473](https://github.com/pagopa/io-app/issues/3473)) ([f27382d](https://github.com/pagopa/io-app/commit/f27382d3a75bc2a7c61b41b86b8b668d6dc08d7d))
* **deps:** bump ua-parser-js from 0.7.21 to 0.7.31 ([#3472](https://github.com/pagopa/io-app/issues/3472)) ([dfbd473](https://github.com/pagopa/io-app/commit/dfbd47378a53973baa5418c91c779e11771652e3))
* **deps:** bump url-parse from 1.4.7 to 1.5.2 ([#3471](https://github.com/pagopa/io-app/issues/3471)) ([fdac5aa](https://github.com/pagopa/io-app/commit/fdac5aaf6a820b9ab8298e1861525b3658cd7229))

## [1.37.0-rc.3](https://github.com/pagopa/io-app/compare/1.37.0-rc.2...1.37.0-rc.3) (2021-11-04)


### Chores

* Revert "Upgrade CircleCI Android image" ([#3476](https://github.com/pagopa/io-app/issues/3476)) ([e503111](https://github.com/pagopa/io-app/commit/e5031117730860c03969ec3fcbe5d3f3363a184c))

## [1.37.0-rc.2](https://github.com/pagopa/io-app/compare/1.37.0-rc.1...1.37.0-rc.2) (2021-11-04)


### Features

* [[IA-275](https://pagopa.atlassian.net/browse/IA-275)] Add first e2e test for messages screen ([#3417](https://github.com/pagopa/io-app/issues/3417)) ([80752ed](https://github.com/pagopa/io-app/commit/80752ed6ef08cc4def6e966ada21b935905db277))
* [[IA-311](https://pagopa.atlassian.net/browse/IA-311)] Add PayPal onboarding complete success screen ([#3450](https://github.com/pagopa/io-app/issues/3450)) ([8e6fa5b](https://github.com/pagopa/io-app/commit/8e6fa5bdb46d3125cd94acd0fccbfbd6fca1dc5a))
* [[IA-312](https://pagopa.atlassian.net/browse/IA-312)] Add PayPal card wallet preview ([#3451](https://github.com/pagopa/io-app/issues/3451)) ([2f7432a](https://github.com/pagopa/io-app/commit/2f7432a8eb27129d75a3656c4999d33c4dd69236))


### Bug Fixes

* [[IA-316](https://pagopa.atlassian.net/browse/IA-316)] Logout purges "notification" store section ([#3454](https://github.com/pagopa/io-app/issues/3454)) ([cc050b6](https://github.com/pagopa/io-app/commit/cc050b60ba314d6d75abfdcafe9252926f5a95f5))
* [[IA-414](https://pagopa.atlassian.net/browse/IA-414),[IA-415](https://pagopa.atlassian.net/browse/IA-415)] PTT_PAGAMENTO_DUPLICATO error code is not handled ([#3463](https://github.com/pagopa/io-app/issues/3463)) ([a75c692](https://github.com/pagopa/io-app/commit/a75c6925e6671e8a01db70d34338bb198a65c368))
* [[IABT-1271](https://pagopa.atlassian.net/browse/IABT-1271)] On iOS the CIE the hint messages are misleading ([#3446](https://github.com/pagopa/io-app/issues/3446)) ([68f63b5](https://github.com/pagopa/io-app/commit/68f63b527f8029d271047b8bf9bf8853a3ac5a77))


### Chores

* [[IAI-83](https://pagopa.atlassian.net/browse/IAI-83)] Store test results on CircleCI ([#3467](https://github.com/pagopa/io-app/issues/3467)) ([ea64e54](https://github.com/pagopa/io-app/commit/ea64e54b443f0a75e100034af0631b54cec3b7a5))
* **deps:** bump validator from 10.11.0 to 13.7.0 ([#3468](https://github.com/pagopa/io-app/issues/3468)) ([710178c](https://github.com/pagopa/io-app/commit/710178c71bd39a9208ff57df0d210b05c007c537))
* [[ASZ-113](https://pagopa.atlassian.net/browse/ASZ-113)] Add Zendesk feature flag ([#3458](https://github.com/pagopa/io-app/issues/3458)) ([3609999](https://github.com/pagopa/io-app/commit/36099994744d523c032bc06c830e4ad0fbca2cce))
* [[IAI-82](https://pagopa.atlassian.net/browse/IAI-82)] Upgrade CircleCI Android image [#3466](https://github.com/pagopa/io-app/issues/3466) ([b87f10f](https://github.com/pagopa/io-app/commit/b87f10f20b44d19bcfe6be008780bad6a0ed0af8))
* **Zendesk:** [[ASZ-115](https://pagopa.atlassian.net/browse/ASZ-115)] Add Zendesk Id for title generation and changelog ([#3464](https://github.com/pagopa/io-app/issues/3464)) ([7504993](https://github.com/pagopa/io-app/commit/7504993e9727859d3f963c1cbcb8c64f808f05ab))
* [[IA-408](https://pagopa.atlassian.net/browse/IA-408)] Remove close button in PayPal onboarding success screen ([#3461](https://github.com/pagopa/io-app/issues/3461)) ([8f37d40](https://github.com/pagopa/io-app/commit/8f37d40fbcae64dd1c9b9152c926e643ec9d9005))
* [[IA-411](https://pagopa.atlassian.net/browse/IA-411)] Add PaymentManager API spec file ([#3460](https://github.com/pagopa/io-app/issues/3460)) ([3216d0d](https://github.com/pagopa/io-app/commit/3216d0d7bc6cc1bc821a4b49c9b65dfb90bfea37))
* [[IAI-78](https://pagopa.atlassian.net/browse/IAI-78)] Increase Android targetSdkVersion to 30 ([#3455](https://github.com/pagopa/io-app/issues/3455)) ([ac4b8ae](https://github.com/pagopa/io-app/commit/ac4b8ae0c44d9948dc5348969b165bd325871b03))
* **Sicilia Vola:** [[IASV-46](https://pagopa.atlassian.net/browse/IASV-46)] Download voucher pdf ([#3439](https://github.com/pagopa/io-app/issues/3439)) ([1beef52](https://github.com/pagopa/io-app/commit/1beef520478d1ae92ed04c9706b34976255baf2c))
* [[IAI-80](https://pagopa.atlassian.net/browse/IAI-80)] Update stale issues / pull requests text ([#3457](https://github.com/pagopa/io-app/issues/3457)) ([fdbca88](https://github.com/pagopa/io-app/commit/fdbca880a584a903409027bd4a6b3424231dbe03))
* **deps:** bump vm2 from 3.9.3 to 3.9.5 ([#3442](https://github.com/pagopa/io-app/issues/3442)) ([c398ca9](https://github.com/pagopa/io-app/commit/c398ca9ea714e6a36b37875fed3105407966072f))
* [Snyk] Security upgrade xss from 1.0.6 to 1.0.10 ([#3447](https://github.com/pagopa/io-app/issues/3447)) ([41aba51](https://github.com/pagopa/io-app/commit/41aba5114f28851031c092c699712cd8dbef3698))

## [1.37.0-rc.1](https://github.com/pagopa/io-app/compare/1.37.0-rc.0...1.37.0-rc.1) (2021-10-28)


### Features

* [[IA-310](https://pagopa.atlassian.net/browse/IA-310)] Onboarding PayPal files refactoring ([#3449](https://github.com/pagopa/io-app/issues/3449)) ([24c1e5d](https://github.com/pagopa/io-app/commit/24c1e5d8a2407e501ba98355526aba4ef1789c4c))

## [1.37.0-rc.0](https://github.com/pagopa/io-app/compare/1.36.0-rc.2...1.37.0-rc.0) (2021-10-26)


### Features

* [[IA-300](https://pagopa.atlassian.net/browse/IA-300)] Add PayPal psp screen selection ([#3443](https://github.com/pagopa/io-app/issues/3443)) ([b0c19af](https://github.com/pagopa/io-app/commit/b0c19aff24e7f38ca8d112a4efa9f16b3a058006))


### Bug Fixes

* [[IA-305](https://pagopa.atlassian.net/browse/IA-305)] The content of error component has bad valign ([#3445](https://github.com/pagopa/io-app/issues/3445)) ([ecac647](https://github.com/pagopa/io-app/commit/ecac64759a78fc8cea9f5e8dead1bda635107248))

## [1.36.0-rc.2](https://github.com/pagopa/io-app/compare/1.36.0-rc.1...1.36.0-rc.2) (2021-10-21)


### Features

* **Sicilia Vola:** [[IASV-32](https://pagopa.atlassian.net/browse/IASV-32)] Summary screen ([#3431](https://github.com/pagopa/io-app/issues/3431)) ([3301831](https://github.com/pagopa/io-app/commit/3301831cc772f07b1418599bb0ebfc08f9b55d60))
* [[IA-299](https://pagopa.atlassian.net/browse/IA-299)] Add PayPal start screen ([#3440](https://github.com/pagopa/io-app/issues/3440)) ([4a36337](https://github.com/pagopa/io-app/commit/4a36337a467e00f71f759c7b9e4ef707bd19ceb3))
* **Sicilia Vola:** [[IASV-16](https://pagopa.atlassian.net/browse/IASV-16)] Voucher revocation ([#3429](https://github.com/pagopa/io-app/issues/3429)) ([180066b](https://github.com/pagopa/io-app/commit/180066b823e610b2de3a54d0d4cd58158b51317d))


### Bug Fixes

* [[IABT-1270](https://pagopa.atlassian.net/browse/IABT-1270)] Instabug chat badge blocks button tap ([#3433](https://github.com/pagopa/io-app/issues/3433)) ([126bd99](https://github.com/pagopa/io-app/commit/126bd99e28a15db7526e5ecbcf8852166ad8d9eb))
* **Bonus Pagamenti Digitali:** [[IAC-120](https://pagopa.atlassian.net/browse/IAC-120)] Moving rapidly between periods causes graphical glitches  ([#3437](https://github.com/pagopa/io-app/issues/3437)) ([917bd89](https://github.com/pagopa/io-app/commit/917bd89234e51e2830f11868d7fc171bf73075b1))


### Chores

* [[IA-292](https://pagopa.atlassian.net/browse/IA-292)] Restore services persistence ([#3434](https://github.com/pagopa/io-app/issues/3434)) ([33a3a7d](https://github.com/pagopa/io-app/commit/33a3a7db7a538b35d4a4f406b11c1c0092eeb68b))
* [[IA-294](https://pagopa.atlassian.net/browse/IA-294)] Payment CTA should be always shown ([#3435](https://github.com/pagopa/io-app/issues/3435)) ([141e2ba](https://github.com/pagopa/io-app/commit/141e2babfe9386a6a978e98aa270c5e9509a1a32))
* [[IA-296](https://pagopa.atlassian.net/browse/IA-296)] Increase payment history details ([#3438](https://github.com/pagopa/io-app/issues/3438)) ([3a1054f](https://github.com/pagopa/io-app/commit/3a1054f4d54d343a3c8b5489cad9464ef95d9fea))

## [1.36.0-rc.1](https://github.com/pagopa/io-app/compare/1.36.0-rc.0...1.36.0-rc.1) (2021-10-14)


### Bug Fixes

* [[IA-280](https://pagopa.atlassian.net/browse/IA-280)] Push notification token is not sent to the backend on first run after session invalid detected ([#3423](https://github.com/pagopa/io-app/issues/3423)) ([b34158f](https://github.com/pagopa/io-app/commit/b34158fc76aab98d6b424f0dcf1194f848a641aa))


### Chores

* [[IA-290](https://pagopa.atlassian.net/browse/IA-290)] Enable Paypal in DigitalPayment list ([#3430](https://github.com/pagopa/io-app/issues/3430)) ([ade1000](https://github.com/pagopa/io-app/commit/ade100071f417a2022ea50559e984803e3f92655))
* [[IA-291](https://pagopa.atlassian.net/browse/IA-291)] Payment from message has to consider payee fiscal code ([#3432](https://github.com/pagopa/io-app/issues/3432)) ([59cd5ad](https://github.com/pagopa/io-app/commit/59cd5ad982b50c1e0c0b414458aa9b88b43ccd4c))
* [[IAI-74](https://pagopa.atlassian.net/browse/IAI-74)] Removes serviceMetadata load from CDN ([#3424](https://github.com/pagopa/io-app/issues/3424)) ([0b62638](https://github.com/pagopa/io-app/commit/0b6263873b75da2cc8020f4e2f854d6e798d97ba))

## [1.36.0-rc.0](https://github.com/pagopa/io-app/compare/1.35.0-rc.2...1.36.0-rc.0) (2021-10-13)


### Bug Fixes

* [[IA-265](https://pagopa.atlassian.net/browse/IA-265),[IA-264](https://pagopa.atlassian.net/browse/IA-264),[IA-260](https://pagopa.atlassian.net/browse/IA-260)] Improve and update UI/Copy CIE ([#3412](https://github.com/pagopa/io-app/issues/3412)) ([3fa05ac](https://github.com/pagopa/io-app/commit/3fa05ac0d108341cf581a770fef54b478f8a6dde))
* The devIoApp team is not tagged in the final notification message after successfully complete a release ([#3422](https://github.com/pagopa/io-app/issues/3422)) ([b5748e5](https://github.com/pagopa/io-app/commit/b5748e587edcd78245832cf5b556079a4bd39166))


### Chores

* [[IA-277](https://pagopa.atlassian.net/browse/IA-277)] Remove services from persisted store configuration [#3420](https://github.com/pagopa/io-app/issues/3420) ([91149e0](https://github.com/pagopa/io-app/commit/91149e0f5cc1b5c7299d6c95c3aea41b5b5e7ba0))
* [[IA-283](https://pagopa.atlassian.net/browse/IA-283)] Upgrade io-backend 7.21.1 ([#3425](https://github.com/pagopa/io-app/issues/3425)) ([4dd2750](https://github.com/pagopa/io-app/commit/4dd27500525d15da63e33361998289ff210de69b))
* [[IA-284](https://pagopa.atlassian.net/browse/IA-284),[IA-274](https://pagopa.atlassian.net/browse/IA-274)] Fixes copy formats on messages dates and back button label ([#3427](https://github.com/pagopa/io-app/issues/3427)) ([8f3824e](https://github.com/pagopa/io-app/commit/8f3824ec8c6bddbd1f88369ef2228210feb50cf5))
* [[IA-286](https://pagopa.atlassian.net/browse/IA-286)] Improve bottom tab badge displaying ([#3426](https://github.com/pagopa/io-app/issues/3426)) ([050ff92](https://github.com/pagopa/io-app/commit/050ff924283e9d2a1c756e7670d89e250f8ffb05))
* **Sicilia Vola:** [[IASV-45](https://pagopa.atlassian.net/browse/IASV-45)] Autocomplete component ([#3419](https://github.com/pagopa/io-app/issues/3419)) ([9a9fba9](https://github.com/pagopa/io-app/commit/9a9fba9be59758761612c7ede2230adaa2daec80))

## [1.35.0-rc.2](https://github.com/pagopa/io-app/compare/1.35.0-rc.1...1.35.0-rc.2) (2021-10-08)


### Features

* **Sicilia Vola:** [[IASV-33](https://pagopa.atlassian.net/browse/IASV-33),[IASV-8](https://pagopa.atlassian.net/browse/IASV-8)] Show voucher generated screen ([#3401](https://github.com/pagopa/io-app/issues/3401)) ([4ad7321](https://github.com/pagopa/io-app/commit/4ad732147d38e3836cd9fe63f3dae2f70e4fb267))


### Chores

* [[IA-261](https://pagopa.atlassian.net/browse/IA-261)] Changes on UI Elements for CGN Merchants and discounts ([#3406](https://github.com/pagopa/io-app/issues/3406)) ([40a4b4f](https://github.com/pagopa/io-app/commit/40a4b4f1cc19f6ba0d74eba56dc1b687ab5b722b))
* [[IAI-71](https://pagopa.atlassian.net/browse/IAI-71)] Replaces remark-html and remark-custom-plugin to update remark and avoid security alert ([#3411](https://github.com/pagopa/io-app/issues/3411)) ([ff9ae50](https://github.com/pagopa/io-app/commit/ff9ae50353a278075321df9e318247ba46c1a714))
* [[IAI-72](https://pagopa.atlassian.net/browse/IAI-72)] Change app version format for release message ([#3415](https://github.com/pagopa/io-app/issues/3415)) ([5707d9a](https://github.com/pagopa/io-app/commit/5707d9a8a638d9ac1206860490141068de63dcf2))

## [1.35.0-rc.1](https://github.com/pagopa/io-app/compare/1.35.0-rc.0...1.35.0-rc.1) (2021-10-01)


### Features

* **Sicilia Vola:** [[IASV-42](https://pagopa.atlassian.net/browse/IASV-42),[IASV-43](https://pagopa.atlassian.net/browse/IASV-43)] Voucher details screen ([#3400](https://github.com/pagopa/io-app/issues/3400)) ([185bb41](https://github.com/pagopa/io-app/commit/185bb41d019209ecfbb3b446c684dca47bc237dc))
* [[IAI-5](https://pagopa.atlassian.net/browse/IAI-5)] Automatically notify when a new app version is available ([#3405](https://github.com/pagopa/io-app/issues/3405)) ([05a443f](https://github.com/pagopa/io-app/commit/05a443fe572e4b023ecdafa4ea6624cedbc2d784))


### Bug Fixes

* [[IA-263](https://pagopa.atlassian.net/browse/IA-263)] Wrong spacing in navigation bar for iPhone 13 ([#3404](https://github.com/pagopa/io-app/issues/3404)) ([cedbf65](https://github.com/pagopa/io-app/commit/cedbf65f781e1562677edddf8c0260d08f1fddb5))
* [[IA-271](https://pagopa.atlassian.net/browse/IA-271)] Fixes accessibility on Manual Data insertion screen ([#3409](https://github.com/pagopa/io-app/issues/3409)) ([c7812f5](https://github.com/pagopa/io-app/commit/c7812f52ad47ebbad4f632382d88c8a09ba892eb))


### Chores

* **Bonus Pagamenti Digitali:** [[IAC-81](https://pagopa.atlassian.net/browse/IAC-81)] Enable bpd transactions pagination ([#3408](https://github.com/pagopa/io-app/issues/3408)) ([9277018](https://github.com/pagopa/io-app/commit/9277018a193b1e44c4a9c0da5cf56975f542e7cc))
* [[IA-212](https://pagopa.atlassian.net/browse/IA-212)] Add delete-wallets PM API ([#3381](https://github.com/pagopa/io-app/issues/3381)) ([1fc01df](https://github.com/pagopa/io-app/commit/1fc01df6dd1791e206d7eebacdb4cb8c7d304a97))
* [[IA-272](https://pagopa.atlassian.net/browse/IA-272)] Minor refactoring for messages ([#3407](https://github.com/pagopa/io-app/issues/3407)) ([c843dd3](https://github.com/pagopa/io-app/commit/c843dd34aad3a9b7ae853c9f0d97b666c1bc88b8))
* [[IAI-23](https://pagopa.atlassian.net/browse/IAI-23)] Remove obsolete fetch polyfill ([#3402](https://github.com/pagopa/io-app/issues/3402)) ([c34ad32](https://github.com/pagopa/io-app/commit/c34ad32ba8c3a2fde2d877a6d0269ad7c0321235))
* [[IAI-27](https://pagopa.atlassian.net/browse/IAI-27)] Reactivate eslint react-hooks/recommended and remove errors and warnings ([#3397](https://github.com/pagopa/io-app/issues/3397)) ([19a1a18](https://github.com/pagopa/io-app/commit/19a1a18233a8d6c5d524fc055c6d95fa673a8bae))
* [[IAI-67](https://pagopa.atlassian.net/browse/IAI-67)] Upgrade eslint & prettier ([#3403](https://github.com/pagopa/io-app/issues/3403)) ([a805c86](https://github.com/pagopa/io-app/commit/a805c86a372e87e13ee6f9c7aa5ca49b2ee196b4))

## [1.35.0-rc.0](https://github.com/pagopa/io-app/compare/1.34.0-rc.3...1.35.0-rc.0) (2021-09-28)


### Features

* [[IA-241](https://pagopa.atlassian.net/browse/IA-241)] Implements new Payment Transaction error screen ([#3386](https://github.com/pagopa/io-app/issues/3386)) ([e654153](https://github.com/pagopa/io-app/commit/e654153dde8b4aec46376843736642dfe007b593))


### Chores

* [[IA-258](https://pagopa.atlassian.net/browse/IA-258)] Add patch react-native-webview (Android) ([#3398](https://github.com/pagopa/io-app/issues/3398)) ([7ae5062](https://github.com/pagopa/io-app/commit/7ae5062b9cfb4445319f4e79af11c000f8da6833))

## [1.34.0-rc.3](https://github.com/pagopa/io-app/compare/1.34.0-rc.2...1.34.0-rc.3) (2021-09-24)


### Features

* **Sicilia Vola:** [[IASV-14](https://pagopa.atlassian.net/browse/IASV-14),[IASV-15](https://pagopa.atlassian.net/browse/IASV-15)] Voucher list screen with filters  ([#3361](https://github.com/pagopa/io-app/issues/3361)) ([23340bd](https://github.com/pagopa/io-app/commit/23340bd1d133e8c2d3fb044add3c11d0dca1a182))


### Bug Fixes

* [[IA-224](https://pagopa.atlassian.net/browse/IA-224)] Upgrade react-native-webview and fix cie login ([#3394](https://github.com/pagopa/io-app/issues/3394)) ([5580921](https://github.com/pagopa/io-app/commit/558092100be04b0a6b529e4b97e957d3b7e19b1c))
* [[IAI-61](https://pagopa.atlassian.net/browse/IAI-61)] Fix Xcode 13 build error ([#3392](https://github.com/pagopa/io-app/issues/3392)) ([97db442](https://github.com/pagopa/io-app/commit/97db442e4bc9a4bfbd7259444eb1a687b204fd31))


### Chores

* [[IA-217](https://pagopa.atlassian.net/browse/IA-217)] Track biometric capabilities ([#3393](https://github.com/pagopa/io-app/issues/3393)) ([22a1e49](https://github.com/pagopa/io-app/commit/22a1e495589017987606390c5ed56747895c2bba))
* [[IA-219](https://pagopa.atlassian.net/browse/IA-219)] CIE copy update ([#3399](https://github.com/pagopa/io-app/issues/3399)) ([c9f43e9](https://github.com/pagopa/io-app/commit/c9f43e98d6d2ee146b6be30aa3a85450bea6db74))
* [[IA-251](https://pagopa.atlassian.net/browse/IA-251)] Reset notification token state when the authentication is not longer valid ([#3387](https://github.com/pagopa/io-app/issues/3387)) ([7ce9e46](https://github.com/pagopa/io-app/commit/7ce9e461708b704821eadfc76cf31e65e488afa9))
* [[IAI-60](https://pagopa.atlassian.net/browse/IAI-60)] Updgrade react-native-cie ([#3395](https://github.com/pagopa/io-app/issues/3395)) ([fadfb18](https://github.com/pagopa/io-app/commit/fadfb180ff0993844e22d779745a7cc03b12bc65))
* **deps:** bump tmpl from 1.0.4 to 1.0.5 ([#3391](https://github.com/pagopa/io-app/issues/3391)) ([32450a9](https://github.com/pagopa/io-app/commit/32450a9831fd0ea91adea214a79b670a3545e059))
* **deps:** bump y18n from 3.2.1 to 3.2.2 ([#2945](https://github.com/pagopa/io-app/issues/2945)) ([b9c04e0](https://github.com/pagopa/io-app/commit/b9c04e09ed56930cad96449025ddd71dc1504974))

## [1.34.0-rc.2](https://github.com/pagopa/io-app/compare/1.34.0-rc.1...1.34.0-rc.2) (2021-09-20)


### Bug Fixes

* [[IAI-59](https://pagopa.atlassian.net/browse/IAI-59)] Wrong time for workflow [#3389](https://github.com/pagopa/io-app/issues/3389) ([768c82b](https://github.com/pagopa/io-app/commit/768c82b0a48ddbd5fc6f948dd352982bc41b087e))
* E2E tests fail to run ([#3390](https://github.com/pagopa/io-app/issues/3390)) ([28eca8a](https://github.com/pagopa/io-app/commit/28eca8a62f2d5a8bc725798d18c91f78ba040c8a))


### Chores

* **Bonus Pagamenti Digitali:** [[IAC-114](https://pagopa.atlassian.net/browse/IAC-114)] Update BPD API endpoints ([#3388](https://github.com/pagopa/io-app/issues/3388)) ([35edbec](https://github.com/pagopa/io-app/commit/35edbecd6a5c0a5b308a3c84be4a73b2625a25bc))

## [1.34.0-rc.1](https://github.com/pagopa/io-app/compare/1.34.0-rc.0...1.34.0-rc.1) (2021-09-17)


### Features

* [[IA-234](https://pagopa.atlassian.net/browse/IA-234)] Create app-logo.svg ([#3368](https://github.com/pagopa/io-app/issues/3368)) ([967f156](https://github.com/pagopa/io-app/commit/967f156c2504f5cdace98fca16e17496cdaf49f7))
* [[IAI-49](https://pagopa.atlassian.net/browse/IAI-49)] Implement first e2e test on IOS ([#3269](https://github.com/pagopa/io-app/issues/3269)) ([bd84e97](https://github.com/pagopa/io-app/commit/bd84e97f376d733d8065ea2c886ef2fff7a559bb))


### Bug Fixes

* [[IA-112](https://pagopa.atlassian.net/browse/IA-112)] Fixes BPD transaction detail bottom sheet hiding elements on VO enabled [#3375](https://github.com/pagopa/io-app/issues/3375) ([3e2face](https://github.com/pagopa/io-app/commit/3e2faceb3505e90678040d674c1bcaeafb84b866))
* [[IA-225](https://pagopa.atlassian.net/browse/IA-225)] Function components cannot be given refs in BaseScreenComponent ([#3353](https://github.com/pagopa/io-app/issues/3353)) ([13fcb85](https://github.com/pagopa/io-app/commit/13fcb852a6a69335280e17cf6a131654d8e72bd1))
* [[IA-229](https://pagopa.atlassian.net/browse/IA-229)] App crashes when the message frontmatter is malformed ([#3359](https://github.com/pagopa/io-app/issues/3359)) ([166bfeb](https://github.com/pagopa/io-app/commit/166bfeb86725403e08c22155b1547fd433e8bf44))
* [[IA-233](https://pagopa.atlassian.net/browse/IA-233)] React.forwardRef is missing a param [#3366](https://github.com/pagopa/io-app/issues/3366) ([9c17adb](https://github.com/pagopa/io-app/commit/9c17adb4a6d775dc271d108995d5ae8fec7a85c0))
* [[IA-235](https://pagopa.atlassian.net/browse/IA-235)] Crash when inserting email during CIE onboarding ([#3378](https://github.com/pagopa/io-app/issues/3378)) ([d352182](https://github.com/pagopa/io-app/commit/d3521826d8ad66e04b9ec2288fbc9c7abaa9c426))
* [[IA-237](https://pagopa.atlassian.net/browse/IA-237)] /payment-activations fails if it takes longer than a second [#3373](https://github.com/pagopa/io-app/issues/3373) ([c181f10](https://github.com/pagopa/io-app/commit/c181f10a38cb3acc196482e3aa400afbeac13255))
* [[IABT-1253](https://pagopa.atlassian.net/browse/IABT-1253)] If the user changes psp during a payment, a wrong payment total is displayed at the end of the operation in the thank you page [#3376](https://github.com/pagopa/io-app/issues/3376) ([7da5c0e](https://github.com/pagopa/io-app/commit/7da5c0ee13c0006cb06b8f3997f0cf80623a5485))
* [[IAI-56](https://pagopa.atlassian.net/browse/IAI-56)] The e2e test is not executed [#3371](https://github.com/pagopa/io-app/issues/3371) ([254d857](https://github.com/pagopa/io-app/commit/254d8575749412bbcc11073e08cb1067b6b6129f))
* pivotal url is not longer available ([#3357](https://github.com/pagopa/io-app/issues/3357)) ([af81f1b](https://github.com/pagopa/io-app/commit/af81f1b20e00e94a44f0b739b9aee43eff2ef36d))
* typo in publiccode.yml [#3374](https://github.com/pagopa/io-app/issues/3374) ([869d79b](https://github.com/pagopa/io-app/commit/869d79b50613b44bb31155f3e42230a020026195))
* **Bonus Pagamenti Digitali:** [[IAC-115](https://pagopa.atlassian.net/browse/IAC-115)] IBAN textinput is in error state even when it's empty ([#3354](https://github.com/pagopa/io-app/issues/3354)) ([9be912e](https://github.com/pagopa/io-app/commit/9be912e1b8dbbeac8219b3dcf77dee17d6f5b2e4))


### Chores

* **Sicilia Vola:** [[IASV-44](https://pagopa.atlassian.net/browse/IASV-44)] Qr barcode component ([#3379](https://github.com/pagopa/io-app/issues/3379)) ([ce7562c](https://github.com/pagopa/io-app/commit/ce7562cb24738902a1fdc5543ec2878a942c64d9))
* [[IA-218](https://pagopa.atlassian.net/browse/IA-218)] Enhance LOGIN_SUCCESS event  ([#3342](https://github.com/pagopa/io-app/issues/3342)) ([967c1fc](https://github.com/pagopa/io-app/commit/967c1fcc4cdfe1139f3d632af802077d27f0edcc))
* [[IA-220](https://pagopa.atlassian.net/browse/IA-220)] Hides the biometric button if device biometry response is currently blocked ([#3380](https://github.com/pagopa/io-app/issues/3380)) ([5489e46](https://github.com/pagopa/io-app/commit/5489e46ea044d51951d4519f8300df6326c1d4fb))
* [[IA-230](https://pagopa.atlassian.net/browse/IA-230)] Review payment and cc onboarding flow ([#3362](https://github.com/pagopa/io-app/issues/3362)) ([102ec84](https://github.com/pagopa/io-app/commit/102ec848a0927653273bd381620d87bebf523bae))
* [[IA-239](https://pagopa.atlassian.net/browse/IA-239)] Remove payment toggle feature flag [#3377](https://github.com/pagopa/io-app/issues/3377) ([560b6d7](https://github.com/pagopa/io-app/commit/560b6d7497bfcf2f050d9e00d0df70412c150069))
* [[IA-248](https://pagopa.atlassian.net/browse/IA-248)] Enhance LOGIN_FAILURE event ([#3383](https://github.com/pagopa/io-app/issues/3383)) ([32062d8](https://github.com/pagopa/io-app/commit/32062d87a47523649c36e309ed94ef1f908f504c))
* [[IA-249](https://pagopa.atlassian.net/browse/IA-249)] Add an alert explaining why a permission is required on Android ([#3385](https://github.com/pagopa/io-app/issues/3385)) ([5f50253](https://github.com/pagopa/io-app/commit/5f50253320d5c57df2582bb8bbb59d3fcf483a19))
* [[IAI-47](https://pagopa.atlassian.net/browse/IAI-47)] Outdated library weekly report ([#3358](https://github.com/pagopa/io-app/issues/3358)) ([c966b81](https://github.com/pagopa/io-app/commit/c966b81669325fcbe26bb87f690c6c81b1ba7484))
* [[IAI-52](https://pagopa.atlassian.net/browse/IAI-52)] Updates uuid from 3.3.2 to 8.3.2 ([#3360](https://github.com/pagopa/io-app/issues/3360)) ([68e29bc](https://github.com/pagopa/io-app/commit/68e29bc119a7f402bbc19032fcb30acbedde72f4))
* [[IAI-53](https://pagopa.atlassian.net/browse/IAI-53)] Restore autolink & Flipper on Android ([#3363](https://github.com/pagopa/io-app/issues/3363)) ([64cbd00](https://github.com/pagopa/io-app/commit/64cbd00394394055cd3896b664148df4d0d88699))
* [[IAI-55](https://pagopa.atlassian.net/browse/IAI-55)] Remove cyclic dependencies ([#3369](https://github.com/pagopa/io-app/issues/3369)) ([c6ae21a](https://github.com/pagopa/io-app/commit/c6ae21aa473605ed168db6aa783719e35d393389))
* Add readablePrivacyReport in profile API requests ([#3382](https://github.com/pagopa/io-app/issues/3382)) ([419251e](https://github.com/pagopa/io-app/commit/419251e36a8194ac72ed125465939732ccd9b26d))
* **deps:** bump handlebars from 4.7.6 to 4.7.7 ([#3027](https://github.com/pagopa/io-app/issues/3027)) ([9fbe14e](https://github.com/pagopa/io-app/commit/9fbe14ea84b2e3246c92b32a3eeff899c8a0622c))
* Copy update ([#3367](https://github.com/pagopa/io-app/issues/3367)) ([0fa1494](https://github.com/pagopa/io-app/commit/0fa14948b1d545b3c74e2bdfaf3fb9238c476116))

## [1.34.0-rc.0](https://github.com/pagopa/io-app/compare/1.33.0-rc.16...1.34.0-rc.0) (2021-09-08)


### Bug Fixes

* [[IAI-50](https://pagopa.atlassian.net/browse/IAI-50)] Check url fails on CircleCI ([#3350](https://github.com/pagopa/io-app/issues/3350)) ([c4f3a1a](https://github.com/pagopa/io-app/commit/c4f3a1acfd62c50d66ed56ae753a763dc1ced66c))


### Chores

* [[IAI-25](https://pagopa.atlassian.net/browse/IAI-25)] Replaces biometric library to support more devices biometric options ([#3344](https://github.com/pagopa/io-app/issues/3344)) ([618a766](https://github.com/pagopa/io-app/commit/618a7667703ca92832d7ffc736e40b4b4526cae0))
* [[IAI-30](https://pagopa.atlassian.net/browse/IAI-30)] Remove unused dependencies ([#3352](https://github.com/pagopa/io-app/issues/3352)) ([6b2a3b0](https://github.com/pagopa/io-app/commit/6b2a3b041c924b908cf6cdaceee1bd55126b4c88))

## [1.33.0-rc.16](https://github.com/pagopa/io-app/compare/1.33.0-rc.15...1.33.0-rc.16) (2021-09-07)


### Bug Fixes

* [[IA-221](https://pagopa.atlassian.net/browse/IA-221)] Java.lang.NoSuchMethodError for okhttp3 ([#3346](https://github.com/pagopa/io-app/issues/3346)) ([e038134](https://github.com/pagopa/io-app/commit/e0381342da8ba87bbff22b2598547dbf53dbde9f))
* [[IA-223](https://pagopa.atlassian.net/browse/IA-223)] Revert react-native-webview ([#3347](https://github.com/pagopa/io-app/issues/3347)) ([03b29d7](https://github.com/pagopa/io-app/commit/03b29d73ebcb0b7bd0cec5eea3d30323f604ef95))

### Revert

* [[IAI-25](https://pagopa.atlassian.net/browse/IAI-25)] Replaces biometric library to support more devices biometric options ([#3344](https://github.com/pagopa/io-app/issues/3344)) ([2e5acf6](https://github.com/pagopa/io-app/commit/2e5acf67f66e1f80c3880072226d5793fe78f988))


### Chores

* [[IAI-25](https://pagopa.atlassian.net/browse/IAI-25)] Replaces biometric library to support more devices biometric options ([#3344](https://github.com/pagopa/io-app/issues/3344)) ([2e5acf6](https://github.com/pagopa/io-app/commit/2e5acf67f66e1f80c3880072226d5793fe78f988))

## [1.33.0-rc.15](https://github.com/pagopa/io-app/compare/1.33.0-rc.14...1.33.0-rc.15) (2021-09-03)

## [1.33.0-rc.14](https://github.com/pagopa/io-app/compare/1.33.0-rc.13...1.33.0-rc.14) (2021-09-03)


### Chores

* [[IA-91](https://pagopa.atlassian.net/browse/IA-91)] Contextual help event ([#3329](https://github.com/pagopa/io-app/issues/3329)) ([2be0db9](https://github.com/pagopa/io-app/commit/2be0db913dc9186d3ad80b92cfd96cb71dcfccaa))

## [1.33.0-rc.13](https://github.com/pagopa/io-app/compare/1.33.0-rc.12...1.33.0-rc.13) (2021-09-02)

## [1.33.0-rc.12](https://github.com/pagopa/io-app/compare/1.33.0-rc.9...1.33.0-rc.12) (2021-09-02)


### Features

* **Carta Giovani Nazionale:** [[#179282600](https://www.pivotaltracker.com/story/show/179282600)] Integrates CGN Merchant Landing page discount option ([#3316](https://github.com/pagopa/io-app/issues/3316)) ([25f7bfa](https://github.com/pagopa/io-app/commit/25f7bfa3f07eadd260e78c1c6211515d7ce5ac68))
* **Sicilia Vola:** [[IASV-12](https://pagopa.atlassian.net/browse/IASV-12)] SiciliaVola api integration ([#3267](https://github.com/pagopa/io-app/issues/3267)) ([84b263f](https://github.com/pagopa/io-app/commit/84b263f9b4a42927de80180d97df8697c51d1ff7))
* [[IA-211](https://pagopa.atlassian.net/browse/IA-211)] Remove cobadge payment status disabled toggle ([#3334](https://github.com/pagopa/io-app/issues/3334)) ([1390e0b](https://github.com/pagopa/io-app/commit/1390e0b860142990ef0994dc03173487f2b40d98))


### Bug Fixes

* [[IA-134](https://pagopa.atlassian.net/browse/IA-134),[IA-114](https://pagopa.atlassian.net/browse/IA-114)] Improve accessibility of link-like components ([#3338](https://github.com/pagopa/io-app/issues/3338)) ([34ee0da](https://github.com/pagopa/io-app/commit/34ee0da0e50ea2205cf61ef2b0a52e1048c1ecd9)), closes [#IA-134](https://github.com/pagopa/io-app/issues/IA-134)
* [[IA-134](https://pagopa.atlassian.net/browse/IA-134)] Use Infobox for Cashback transactions' info ([#3340](https://github.com/pagopa/io-app/issues/3340)) ([213a734](https://github.com/pagopa/io-app/commit/213a73475ac2722d0cd509e922b3e873791f5f86)), closes [#IA-134](https://github.com/pagopa/io-app/issues/IA-134)
* [[IABT-1235](https://pagopa.atlassian.net/browse/IABT-1235)] Show add new payment method even when there are payable methods ([ced6dc9](https://github.com/pagopa/io-app/commit/ced6dc97f8311205a185fa2db34c27176faa4a0a))
* Fix stale workflow typo ([#3343](https://github.com/pagopa/io-app/issues/3343)) ([6d4f6ba](https://github.com/pagopa/io-app/commit/6d4f6bad6a37b8637337fe51d6c170507515bcc8))
* **EU Covid Certificate:** [[IAGP-68](https://pagopa.atlassian.net/browse/IAGP-68)] When the app changes the brighness to the max and the user close the app or changes the current active app, the device brightness always remains at maximum  ([#3313](https://github.com/pagopa/io-app/issues/3313)) ([0bc1341](https://github.com/pagopa/io-app/commit/0bc134129321dc5ec49a50bcbfce77cb08474432))


### Chores

* [[IA-189](https://pagopa.atlassian.net/browse/IA-189)] Update delete methods copy ([#3332](https://github.com/pagopa/io-app/issues/3332)) ([0cfa8b6](https://github.com/pagopa/io-app/commit/0cfa8b6c8e319c615f5a9b4bb7ab1dbbe1375a9c))
* [[IA-209](https://pagopa.atlassian.net/browse/IA-209)] Update publiccode.yml when a new version of the app is released  ([#3335](https://github.com/pagopa/io-app/issues/3335)) ([a5fe299](https://github.com/pagopa/io-app/commit/a5fe299112f5549635dea01ad3bdb6bd37e30f2d))
* [[IA-54](https://pagopa.atlassian.net/browse/IA-54)] Implements accessibility label for cashback card ([#3330](https://github.com/pagopa/io-app/issues/3330)) ([fb29df9](https://github.com/pagopa/io-app/commit/fb29df9fc8b6379de8b6582aa7987e3aefe0987f))
* [[IA-55](https://pagopa.atlassian.net/browse/IA-55)] Introduces Bonus Vacanze card preview accessibility label ([#3336](https://github.com/pagopa/io-app/issues/3336)) ([d319a14](https://github.com/pagopa/io-app/commit/d319a142f7344c80f3fd1aeaf3e60777e5f251ec))
* [[IAI-43](https://pagopa.atlassian.net/browse/IAI-43)] Configuration for reactotron integration for flipper [#3328](https://github.com/pagopa/io-app/issues/3328) ([52333b2](https://github.com/pagopa/io-app/commit/52333b2e9dac10eb58f72503c3f086bb06b2b2ee))
* [[IAI-44](https://pagopa.atlassian.net/browse/IAI-44)] Configure actions/stale [#3339](https://github.com/pagopa/io-app/issues/3339) ([aa05f4a](https://github.com/pagopa/io-app/commit/aa05f4aa2b8814ea4ff8f4bf01019096a72d7b51))
* [[IAI-45](https://pagopa.atlassian.net/browse/IAI-45)] Update circleci images ([#3341](https://github.com/pagopa/io-app/issues/3341)) ([a126007](https://github.com/pagopa/io-app/commit/a12600777f59dd09ba6a0e5a61a7896bb3aa0817))

## [1.33.0-rc.11](https://github.com/pagopa/io-app/compare/1.33.0-rc.9...1.33.0-rc.11) (2021-09-02)


### Features

* **Carta Giovani Nazionale:** [[#179282600](https://www.pivotaltracker.com/story/show/179282600)] Integrates CGN Merchant Landing page discount option ([#3316](https://github.com/pagopa/io-app/issues/3316)) ([25f7bfa](https://github.com/pagopa/io-app/commit/25f7bfa3f07eadd260e78c1c6211515d7ce5ac68))
* **Sicilia Vola:** [[IASV-12](https://pagopa.atlassian.net/browse/IASV-12)] SiciliaVola api integration ([#3267](https://github.com/pagopa/io-app/issues/3267)) ([84b263f](https://github.com/pagopa/io-app/commit/84b263f9b4a42927de80180d97df8697c51d1ff7))
* [[IA-211](https://pagopa.atlassian.net/browse/IA-211)] Remove cobadge payment status disabled toggle ([#3334](https://github.com/pagopa/io-app/issues/3334)) ([1390e0b](https://github.com/pagopa/io-app/commit/1390e0b860142990ef0994dc03173487f2b40d98))


### Bug Fixes

* [[IA-134](https://pagopa.atlassian.net/browse/IA-134),[IA-114](https://pagopa.atlassian.net/browse/IA-114)] Improve accessibility of link-like components ([#3338](https://github.com/pagopa/io-app/issues/3338)) ([34ee0da](https://github.com/pagopa/io-app/commit/34ee0da0e50ea2205cf61ef2b0a52e1048c1ecd9)), closes [#IA-134](https://github.com/pagopa/io-app/issues/IA-134)
* [[IA-134](https://pagopa.atlassian.net/browse/IA-134)] Use Infobox for Cashback transactions' info ([#3340](https://github.com/pagopa/io-app/issues/3340)) ([213a734](https://github.com/pagopa/io-app/commit/213a73475ac2722d0cd509e922b3e873791f5f86)), closes [#IA-134](https://github.com/pagopa/io-app/issues/IA-134)
* [[IABT-1235](https://pagopa.atlassian.net/browse/IABT-1235)] Show add new payment method even when there are payable methods ([ced6dc9](https://github.com/pagopa/io-app/commit/ced6dc97f8311205a185fa2db34c27176faa4a0a))
* Fix stale workflow typo ([#3343](https://github.com/pagopa/io-app/issues/3343)) ([6d4f6ba](https://github.com/pagopa/io-app/commit/6d4f6bad6a37b8637337fe51d6c170507515bcc8))
* **EU Covid Certificate:** [[IAGP-68](https://pagopa.atlassian.net/browse/IAGP-68)] When the app changes the brighness to the max and the user close the app or changes the current active app, the device brightness always remains at maximum  ([#3313](https://github.com/pagopa/io-app/issues/3313)) ([0bc1341](https://github.com/pagopa/io-app/commit/0bc134129321dc5ec49a50bcbfce77cb08474432))


### Chores

* [[IA-189](https://pagopa.atlassian.net/browse/IA-189)] Update delete methods copy ([#3332](https://github.com/pagopa/io-app/issues/3332)) ([0cfa8b6](https://github.com/pagopa/io-app/commit/0cfa8b6c8e319c615f5a9b4bb7ab1dbbe1375a9c))
* [[IA-209](https://pagopa.atlassian.net/browse/IA-209)] Update publiccode.yml when a new version of the app is released  ([#3335](https://github.com/pagopa/io-app/issues/3335)) ([a5fe299](https://github.com/pagopa/io-app/commit/a5fe299112f5549635dea01ad3bdb6bd37e30f2d))
* [[IA-54](https://pagopa.atlassian.net/browse/IA-54)] Implements accessibility label for cashback card ([#3330](https://github.com/pagopa/io-app/issues/3330)) ([fb29df9](https://github.com/pagopa/io-app/commit/fb29df9fc8b6379de8b6582aa7987e3aefe0987f))
* [[IA-55](https://pagopa.atlassian.net/browse/IA-55)] Introduces Bonus Vacanze card preview accessibility label ([#3336](https://github.com/pagopa/io-app/issues/3336)) ([d319a14](https://github.com/pagopa/io-app/commit/d319a142f7344c80f3fd1aeaf3e60777e5f251ec))
* [[IAI-43](https://pagopa.atlassian.net/browse/IAI-43)] Configuration for reactotron integration for flipper [#3328](https://github.com/pagopa/io-app/issues/3328) ([52333b2](https://github.com/pagopa/io-app/commit/52333b2e9dac10eb58f72503c3f086bb06b2b2ee))
* [[IAI-44](https://pagopa.atlassian.net/browse/IAI-44)] Configure actions/stale [#3339](https://github.com/pagopa/io-app/issues/3339) ([aa05f4a](https://github.com/pagopa/io-app/commit/aa05f4aa2b8814ea4ff8f4bf01019096a72d7b51))
* [[IAI-45](https://pagopa.atlassian.net/browse/IAI-45)] Update circleci images ([#3341](https://github.com/pagopa/io-app/issues/3341)) ([a126007](https://github.com/pagopa/io-app/commit/a12600777f59dd09ba6a0e5a61a7896bb3aa0817))

## [1.33.0-rc.10](https://github.com/pagopa/io-app/compare/1.33.0-rc.9...1.33.0-rc.10) (2021-09-02)


### Features

* **Carta Giovani Nazionale:** [[#179282600](https://www.pivotaltracker.com/story/show/179282600)] Integrates CGN Merchant Landing page discount option ([#3316](https://github.com/pagopa/io-app/issues/3316)) ([25f7bfa](https://github.com/pagopa/io-app/commit/25f7bfa3f07eadd260e78c1c6211515d7ce5ac68))
* **Sicilia Vola:** [[IASV-12](https://pagopa.atlassian.net/browse/IASV-12)] SiciliaVola api integration ([#3267](https://github.com/pagopa/io-app/issues/3267)) ([84b263f](https://github.com/pagopa/io-app/commit/84b263f9b4a42927de80180d97df8697c51d1ff7))
* [[IA-211](https://pagopa.atlassian.net/browse/IA-211)] Remove cobadge payment status disabled toggle ([#3334](https://github.com/pagopa/io-app/issues/3334)) ([1390e0b](https://github.com/pagopa/io-app/commit/1390e0b860142990ef0994dc03173487f2b40d98))


### Bug Fixes

* [[IA-134](https://pagopa.atlassian.net/browse/IA-134),[IA-114](https://pagopa.atlassian.net/browse/IA-114)] Improve accessibility of link-like components ([#3338](https://github.com/pagopa/io-app/issues/3338)) ([34ee0da](https://github.com/pagopa/io-app/commit/34ee0da0e50ea2205cf61ef2b0a52e1048c1ecd9)), closes [#IA-134](https://github.com/pagopa/io-app/issues/IA-134)
* [[IA-134](https://pagopa.atlassian.net/browse/IA-134)] Use Infobox for Cashback transactions' info ([#3340](https://github.com/pagopa/io-app/issues/3340)) ([213a734](https://github.com/pagopa/io-app/commit/213a73475ac2722d0cd509e922b3e873791f5f86)), closes [#IA-134](https://github.com/pagopa/io-app/issues/IA-134)
* [[IABT-1235](https://pagopa.atlassian.net/browse/IABT-1235)] Show add new payment method even when there are payable methods ([ced6dc9](https://github.com/pagopa/io-app/commit/ced6dc97f8311205a185fa2db34c27176faa4a0a))
* Fix stale workflow typo ([#3343](https://github.com/pagopa/io-app/issues/3343)) ([6d4f6ba](https://github.com/pagopa/io-app/commit/6d4f6bad6a37b8637337fe51d6c170507515bcc8))
* **EU Covid Certificate:** [[IAGP-68](https://pagopa.atlassian.net/browse/IAGP-68)] When the app changes the brighness to the max and the user close the app or changes the current active app, the device brightness always remains at maximum  ([#3313](https://github.com/pagopa/io-app/issues/3313)) ([0bc1341](https://github.com/pagopa/io-app/commit/0bc134129321dc5ec49a50bcbfce77cb08474432))


### Chores

* [[IA-189](https://pagopa.atlassian.net/browse/IA-189)] Update delete methods copy ([#3332](https://github.com/pagopa/io-app/issues/3332)) ([0cfa8b6](https://github.com/pagopa/io-app/commit/0cfa8b6c8e319c615f5a9b4bb7ab1dbbe1375a9c))
* [[IA-209](https://pagopa.atlassian.net/browse/IA-209)] Update publiccode.yml when a new version of the app is released  ([#3335](https://github.com/pagopa/io-app/issues/3335)) ([a5fe299](https://github.com/pagopa/io-app/commit/a5fe299112f5549635dea01ad3bdb6bd37e30f2d))
* [[IA-54](https://pagopa.atlassian.net/browse/IA-54)] Implements accessibility label for cashback card ([#3330](https://github.com/pagopa/io-app/issues/3330)) ([fb29df9](https://github.com/pagopa/io-app/commit/fb29df9fc8b6379de8b6582aa7987e3aefe0987f))
* [[IA-55](https://pagopa.atlassian.net/browse/IA-55)] Introduces Bonus Vacanze card preview accessibility label ([#3336](https://github.com/pagopa/io-app/issues/3336)) ([d319a14](https://github.com/pagopa/io-app/commit/d319a142f7344c80f3fd1aeaf3e60777e5f251ec))
* [[IAI-43](https://pagopa.atlassian.net/browse/IAI-43)] Configuration for reactotron integration for flipper [#3328](https://github.com/pagopa/io-app/issues/3328) ([52333b2](https://github.com/pagopa/io-app/commit/52333b2e9dac10eb58f72503c3f086bb06b2b2ee))
* [[IAI-44](https://pagopa.atlassian.net/browse/IAI-44)] Configure actions/stale [#3339](https://github.com/pagopa/io-app/issues/3339) ([aa05f4a](https://github.com/pagopa/io-app/commit/aa05f4aa2b8814ea4ff8f4bf01019096a72d7b51))
* [[IAI-45](https://pagopa.atlassian.net/browse/IAI-45)] Update circleci images ([#3341](https://github.com/pagopa/io-app/issues/3341)) ([a126007](https://github.com/pagopa/io-app/commit/a12600777f59dd09ba6a0e5a61a7896bb3aa0817))

## [1.33.0-rc.9](https://github.com/pagopa/io-app/compare/1.33.0-rc.8...1.33.0-rc.9) (2021-08-27)


### Bug Fixes

* [[IA-205](https://pagopa.atlassian.net/browse/IA-205)] Some network requests could cause crash ([#3326](https://github.com/pagopa/io-app/issues/3326)) ([335c40c](https://github.com/pagopa/io-app/commit/335c40c58af87761b9bab03de861aed209a82b7c))


### Chores

* [[IA-199](https://pagopa.atlassian.net/browse/IA-199)] Update PM payment-status API ([#3325](https://github.com/pagopa/io-app/issues/3325)) ([4534c0f](https://github.com/pagopa/io-app/commit/4534c0f132f1ffb752fedd1fb9253d2d1a718028))
* [[IA-206](https://pagopa.atlassian.net/browse/IA-206)] Replaces EnableableFunctions enumeration with generated one from API spec file [#3327](https://github.com/pagopa/io-app/issues/3327) ([1c01eec](https://github.com/pagopa/io-app/commit/1c01eec77c3a3b61948473097c870976d49e7d71))
* **deps:** bump glob-parent from 5.1.1 to 5.1.2 ([#3118](https://github.com/pagopa/io-app/issues/3118)) ([faad279](https://github.com/pagopa/io-app/commit/faad27911ee77bbe7ba3876be60da1f79cc3e404))
* [[IAI-29](https://pagopa.atlassian.net/browse/IAI-29)] Upgrade react-redux ([#3311](https://github.com/pagopa/io-app/issues/3311)) ([b2e246f](https://github.com/pagopa/io-app/commit/b2e246fbf903cd37a53ca3adb957e75d4abeb702))

## [1.33.0-rc.8](https://github.com/pagopa/io-app/compare/1.33.0-rc.7...1.33.0-rc.8) (2021-08-20)


### Chores

* [[IA-182](https://pagopa.atlassian.net/browse/IA-182)] Display an alert when there are no payment methods enabled to pay ([#3297](https://github.com/pagopa/io-app/issues/3297)) ([5ddd5bd](https://github.com/pagopa/io-app/commit/5ddd5bd3d4245bcd093ca9a0b1ce4b3a03fa0a73))
* [[IA-51](https://pagopa.atlassian.net/browse/IA-51)] Fixes accessibility for sectionCardComponent ([#3312](https://github.com/pagopa/io-app/issues/3312)) ([3a5e281](https://github.com/pagopa/io-app/commit/3a5e281cda00a5a3fb09e6d332aa6c60df121098))
* [[IAI-28](https://pagopa.atlassian.net/browse/IAI-28)] Upgrade react-native-webview and urllib3 ([#3307](https://github.com/pagopa/io-app/issues/3307)) ([7c9db16](https://github.com/pagopa/io-app/commit/7c9db16336ddc9e6ce76eebd55485403e54e5f51))
* [[IAI-39](https://pagopa.atlassian.net/browse/IAI-39)] Adds a patch to react-native package to solve conflicting pod specs ([#3317](https://github.com/pagopa/io-app/issues/3317)) ([d36f882](https://github.com/pagopa/io-app/commit/d36f882d1b687531306afe3479b46d5ee7aa45a7))
* Enable Hermes on iOS ([#3318](https://github.com/pagopa/io-app/issues/3318)) ([afc66cb](https://github.com/pagopa/io-app/commit/afc66cbf8d78b91da9062696015ff823a7e26b3b))

## [1.33.0-rc.7](https://github.com/pagopa/io-app/compare/1.33.0-rc.6...1.33.0-rc.7) (2021-08-18)


### Chores

* [[IAI-16](https://pagopa.atlassian.net/browse/IAI-16)] Upgrade react-native to 0.64.2 ([#3301](https://github.com/pagopa/io-app/issues/3301)) ([b0c1eaa](https://github.com/pagopa/io-app/commit/b0c1eaa99357c39d3dc9140a69f0175612bf3282))

## [1.33.0-rc.6](https://github.com/pagopa/io-app/compare/1.33.0-rc.5...1.33.0-rc.6) (2021-08-17)


### Bug Fixes

* [[IABT-1233](https://pagopa.atlassian.net/browse/IABT-1233)] Wrong accessibility on services home screen ([#3303](https://github.com/pagopa/io-app/issues/3303)) ([172f599](https://github.com/pagopa/io-app/commit/172f59903c096f3b637a6b36076d81794ca0de1e))


### Chores

* [[IAI-32](https://pagopa.atlassian.net/browse/IAI-32)] Upgrade react-navigation to 4.4 ([#3300](https://github.com/pagopa/io-app/issues/3300)) ([d4ed5e1](https://github.com/pagopa/io-app/commit/d4ed5e1833bbdbc7cb6be12761af3ee178f4a9bd))
* **Carta Giovani Nazionale:** [[#179247891](https://www.pivotaltracker.com/story/show/179247891)] Sync cgn updated specs ([#3305](https://github.com/pagopa/io-app/issues/3305)) ([4b2b9b8](https://github.com/pagopa/io-app/commit/4b2b9b80be1237990aa4a5e93b1fa7a7f8029c80))

## [1.33.0-rc.5](https://github.com/pagopa/io-app/compare/1.33.0-rc.4...1.33.0-rc.5) (2021-08-13)


### Features

* [[IA-1](https://pagopa.atlassian.net/browse/IA-1)] Update notification token when it changes ([#3295](https://github.com/pagopa/io-app/issues/3295)) ([679d6b7](https://github.com/pagopa/io-app/commit/679d6b75d6065e0458de7c7b0348cc984581acea))
* **Carta Giovani Nazionale:** [[#178358407](https://www.pivotaltracker.com/story/show/178358407),[#178358013](https://www.pivotaltracker.com/story/show/178358013)] Integrates merchants search API for CGN ([#3123](https://github.com/pagopa/io-app/issues/3123)) ([8ad7f2b](https://github.com/pagopa/io-app/commit/8ad7f2ba164e0aa7a99bcea47457b1346df0c1d7))


### Chores

* [[IA-187](https://pagopa.atlassian.net/browse/IA-187)] Edit Service Preferences moved on Service Home header ([#3292](https://github.com/pagopa/io-app/issues/3292)) ([0088746](https://github.com/pagopa/io-app/commit/008874676e26655efbab4d7c8eae167008048df6))

## [1.33.0-rc.4](https://github.com/pagopa/io-app/compare/1.33.0-rc.3...1.33.0-rc.4) (2021-08-12)


### Chores

* [[IAI-4](https://pagopa.atlassian.net/browse/IAI-4)] Generate iOS build on circleCI ([#3289](https://github.com/pagopa/io-app/issues/3289)) ([7c742c7](https://github.com/pagopa/io-app/commit/7c742c7af78091fc1ff6cc4ace88532005e08c6d))
* Add react-hooks rule as a warning ([#3293](https://github.com/pagopa/io-app/issues/3293)) ([51815fd](https://github.com/pagopa/io-app/commit/51815fd15a0c2e29e5d791c4a77d918e9df7a6cb))

## [1.33.0-rc.3](https://github.com/pagopa/io-app/compare/1.33.0-rc.2...1.33.0-rc.3) (2021-08-11)


### Features

* **Sicilia Vola:** [[IASV-34](https://pagopa.atlassian.net/browse/IASV-34)] Select region screen ([#3288](https://github.com/pagopa/io-app/issues/3288)) ([32c2157](https://github.com/pagopa/io-app/commit/32c21570054adb5c13be5b837089bdd000683fbc))


### Bug Fixes

* [[IA-53](https://pagopa.atlassian.net/browse/IA-53)] VO doesn't read correctly the banner trait ([#3208](https://github.com/pagopa/io-app/issues/3208)) ([8567d9e](https://github.com/pagopa/io-app/commit/8567d9e96ab22f94223549b3ccaf123e39e38a61))


### Chores

* [[#178393697](https://www.pivotaltracker.com/story/show/178393697)][[#178393686](https://www.pivotaltracker.com/story/show/178393686)] Chore added disabled state to LabelledItem and changed colours ([#3155](https://github.com/pagopa/io-app/issues/3155)) ([b2c3748](https://github.com/pagopa/io-app/commit/b2c3748fa75a9ac8e4b8d3a4a28ade5c12403c48)), closes [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13)
* [[IA-183](https://pagopa.atlassian.net/browse/IA-183)] Code refactoring for all payment method detail screens ([#3286](https://github.com/pagopa/io-app/issues/3286)) ([79caf6a](https://github.com/pagopa/io-app/commit/79caf6a5bb3307cb002052ffaae241d79807e3ed))

## [1.33.0-rc.2](https://github.com/pagopa/io-app/compare/1.33.0-rc.1...1.33.0-rc.2) (2021-08-11)

## [1.33.0-rc.1](https://github.com/pagopa/io-app/compare/1.33.0-rc.0...1.33.0-rc.1) (2021-08-11)


### Features

* **Sicilia Vola:** [[IASV-31](https://pagopa.atlassian.net/browse/IASV-31)] Select flights date screen ([#3284](https://github.com/pagopa/io-app/issues/3284)) ([7cdb2bc](https://github.com/pagopa/io-app/commit/7cdb2bc54002f1fa8593cab4f82e1b5ae0866d70))


### Chores

* **deps:** bump path-parse from 1.0.6 to 1.0.7 ([#3291](https://github.com/pagopa/io-app/issues/3291)) ([36d74ee](https://github.com/pagopa/io-app/commit/36d74ee82cb4cf2b13843a164c1398e1facb855c))

## [1.33.0-rc.0](https://github.com/pagopa/io-app/compare/1.32.0-rc.3...1.33.0-rc.0) (2021-08-10)


### Features

* **Sicilia Vola:** [[IASV-24](https://pagopa.atlassian.net/browse/IASV-24)] Check income worker screen ([#3279](https://github.com/pagopa/io-app/issues/3279)) ([586d1a6](https://github.com/pagopa/io-app/commit/586d1a6056714e6d56e34b202327b8f3facf9dc5))
* **Sicilia Vola:** [[IASV-28](https://pagopa.atlassian.net/browse/IASV-28)] Add check income sick screen ([#3280](https://github.com/pagopa/io-app/issues/3280)) ([35888af](https://github.com/pagopa/io-app/commit/35888af44d87514a496221c14522ac4c5d9e26f4))
* **Sicilia Vola:** [[IASV-30](https://pagopa.atlassian.net/browse/IASV-30)] Additional information screen for disabled ([#3276](https://github.com/pagopa/io-app/issues/3276)) ([661878a](https://github.com/pagopa/io-app/commit/661878ad0fc43cdd38a29979fdbc37f7eda21d25))
* [[IA-165](https://pagopa.atlassian.net/browse/IA-165)] Rework payment method details screen & add functionality to change payment method status ([#3274](https://github.com/pagopa/io-app/issues/3274)) ([0317b1c](https://github.com/pagopa/io-app/commit/0317b1c4034b48678ae4d36f55bd43cd6eaa6319))


### Chores

* [[IA-181](https://pagopa.atlassian.net/browse/IA-181)] Update bottom sheet content shown when a payment method can't pay ([#3275](https://github.com/pagopa/io-app/issues/3275)) ([19bb33a](https://github.com/pagopa/io-app/commit/19bb33a1071457da82be9adccbd31470000a7d0e))
* [[IA-48](https://pagopa.atlassian.net/browse/IA-48),[IA-49](https://pagopa.atlassian.net/browse/IA-49)] Update accessibility for wallet preview cards ([#3287](https://github.com/pagopa/io-app/issues/3287)) ([20e0c1e](https://github.com/pagopa/io-app/commit/20e0c1e5745f6d8b948bf3e37e133b091374e8cd))
* **Sicilia Vola:** [[IASV-41](https://pagopa.atlassian.net/browse/IASV-41)] Add check income component ([#3278](https://github.com/pagopa/io-app/issues/3278)) ([8a33563](https://github.com/pagopa/io-app/commit/8a3356300a84471d8b3ae46e79305ab9d001c44c))

## [1.32.0-rc.3](https://github.com/pagopa/io-app/compare/1.32.0-rc.2...1.32.0-rc.3) (2021-08-06)


### Features

* [[IA-171](https://pagopa.atlassian.net/browse/IA-171)] Add app_update_required ServiceSection ([#3265](https://github.com/pagopa/io-app/issues/3265)) ([a475bb1](https://github.com/pagopa/io-app/commit/a475bb1d31da353a2c1cdff034948c8eee230e0a))


### Bug Fixes

* [[IA-185](https://pagopa.atlassian.net/browse/IA-185)] Fixes broken URIs from the daily check and manages some improvements to Slack scripts ([#3283](https://github.com/pagopa/io-app/issues/3283)) ([50d5f09](https://github.com/pagopa/io-app/commit/50d5f090f3af6f3b05a633aa4cba8aaa7e49cc74))


### Chores

* [[IA-13](https://pagopa.atlassian.net/browse/IA-13)] Changed all native base Input with LabelledItem generic component ([#3143](https://github.com/pagopa/io-app/issues/3143)) ([6b246e0](https://github.com/pagopa/io-app/commit/6b246e04c30296872f51bc7fc6d32a43d2c6f041)), closes [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13) [#IA-13](https://github.com/pagopa/io-app/issues/IA-13)
* [[IA-157](https://pagopa.atlassian.net/browse/IA-157)] Share unique ID with assistance ([#3266](https://github.com/pagopa/io-app/issues/3266)) ([5715b16](https://github.com/pagopa/io-app/commit/5715b16d3d55c22b46df082abda8322f5729c3b7))
* [[IA-179](https://pagopa.atlassian.net/browse/IA-179)] Track message search enabling ([#3271](https://github.com/pagopa/io-app/issues/3271)) ([828d55c](https://github.com/pagopa/io-app/commit/828d55c04f6fcacb77e93995b357b4245cd0d79d))
* [[IA-184](https://pagopa.atlassian.net/browse/IA-184)] New German string [#3281](https://github.com/pagopa/io-app/issues/3281) ([0f0c106](https://github.com/pagopa/io-app/commit/0f0c106e5a0152020751d20b9447b4ff82f46fd0))

## [1.32.0-rc.2](https://github.com/pagopa/io-app/compare/1.32.0-rc.1...1.32.0-rc.2) (2021-08-03)


### Features

* **Sicilia Vola:** [[IASV-23](https://pagopa.atlassian.net/browse/IASV-23)] Select beneficiary category screen ([#3273](https://github.com/pagopa/io-app/issues/3273)) ([239cf59](https://github.com/pagopa/io-app/commit/239cf59beb65adce6697fddc286e1ed3feb2d170))
* **Sicilia Vola:** [[IASV-35](https://pagopa.atlassian.net/browse/IASV-35)] Add ToS component ([#3256](https://github.com/pagopa/io-app/issues/3256)) ([0150ad3](https://github.com/pagopa/io-app/commit/0150ad3c78a7b842f02d929ab88ca5b43ce0bf23))


### Bug Fixes

* **Redesign Servizi:** [[IARS-43](https://pagopa.atlassian.net/browse/IARS-43)] Render maximum amount of information available ([#3268](https://github.com/pagopa/io-app/issues/3268)) ([e380844](https://github.com/pagopa/io-app/commit/e38084483b513fb17144d1b88a8a1e579e0f88c4))


### Chores

* [[IA-162](https://pagopa.atlassian.net/browse/IA-162)] Handle Poste/SPID intent ([#3250](https://github.com/pagopa/io-app/issues/3250)) ([3617cf0](https://github.com/pagopa/io-app/commit/3617cf0d3238058d8ac4f8a48384e8604eb47bdd))
* [[IA-177](https://pagopa.atlassian.net/browse/IA-177)] Alert user when is paying and there are no payable methods ([#3272](https://github.com/pagopa/io-app/issues/3272)) ([7672d43](https://github.com/pagopa/io-app/commit/7672d434238df52381cef33a66ffabe73a9984c3))
* gender neutral questions in Italian locale ([#3270](https://github.com/pagopa/io-app/issues/3270)) ([1d8d115](https://github.com/pagopa/io-app/commit/1d8d115d672689d5ac0c7e769ddbed8ec6f92321))

## [1.32.0-rc.1](https://github.com/pagopa/io-app/compare/1.32.0-rc.0...1.32.0-rc.1) (2021-07-30)


### Features

* **Bonus Pagamenti Digitali:** [[IAC-108](https://pagopa.atlassian.net/browse/IAC-108)] Remove Add payment method CTA from cashback details screen [#3247](https://github.com/pagopa/io-app/issues/3247) ([df17044](https://github.com/pagopa/io-app/commit/df170444b4e9675a427005a3055ea4f79af56a95))
* [[IA-170](https://pagopa.atlassian.net/browse/IA-170)] Add action/saga/network to change payment method status ([#3262](https://github.com/pagopa/io-app/issues/3262)) ([44ff992](https://github.com/pagopa/io-app/commit/44ff9921f5a3ad2387043b0009b24fb91a1a7c76))


### Bug Fixes

* [[IA-107](https://pagopa.atlassian.net/browse/IA-107)] Missing accessibility role link on search bank privacy policy ([#3248](https://github.com/pagopa/io-app/issues/3248)) ([1a7a041](https://github.com/pagopa/io-app/commit/1a7a04118aafe5a8b0e3e250d64c56d3cc64a710)), closes [#IA-107](https://github.com/pagopa/io-app/issues/IA-107) [#IA-107](https://github.com/pagopa/io-app/issues/IA-107)
* [[IABT-1214](https://pagopa.atlassian.net/browse/IABT-1214)] Italian label is shown even when the language is set to different locale ([#3260](https://github.com/pagopa/io-app/issues/3260)) ([0dc08ad](https://github.com/pagopa/io-app/commit/0dc08ad73196ccab548907eaf28bcce3cc67073f))


### Chores

* [[IA-52](https://pagopa.atlassian.net/browse/IA-52)] When VO/Talkback is On, the advice banner doesn't focus ([#3188](https://github.com/pagopa/io-app/issues/3188)) ([ba8713b](https://github.com/pagopa/io-app/commit/ba8713b9a34261be4ddef32b6fd0143f8a1b4aaf))

## [1.32.0-rc.0](https://github.com/pagopa/io-app/compare/1.31.0-rc.3...1.32.0-rc.0) (2021-07-26)


### Features

* **Sicilia Vola:** [[IASV-13](https://pagopa.atlassian.net/browse/IASV-13)] Add SiciliaVola entry point ([#3257](https://github.com/pagopa/io-app/issues/3257)) ([059ce43](https://github.com/pagopa/io-app/commit/059ce43b14cb83c45a4e1672966b146e0bd4f397))


### Bug Fixes

* [[IA-90](https://pagopa.atlassian.net/browse/IA-90)] The traits of some links are not read correctly ([#3244](https://github.com/pagopa/io-app/issues/3244)) ([82cb73f](https://github.com/pagopa/io-app/commit/82cb73f92db0feffb6f6e82b380cb01e924ed8ef))


### Chores

* [[IA-169](https://pagopa.atlassian.net/browse/IA-169)] Copy update [#3261](https://github.com/pagopa/io-app/issues/3261) ([e678d60](https://github.com/pagopa/io-app/commit/e678d6076c5f23e37ee47c2278af7c3703ddae4c))
* [[IA-47](https://pagopa.atlassian.net/browse/IA-47)] In wallet home, when click on refresh label the accessibility label is wrong ([#3167](https://github.com/pagopa/io-app/issues/3167)) ([59d2ca7](https://github.com/pagopa/io-app/commit/59d2ca736b3686ff7b5a44b305fceef6027c4bba))

## [1.31.0-rc.3](https://github.com/pagopa/io-app/compare/1.31.0-rc.2...1.31.0-rc.3) (2021-07-23)


### Features

* **Bonus Pagamenti Digitali:** [[IAC-109](https://pagopa.atlassian.net/browse/IAC-109)] Disable cashback onboarding and edit IBAN from message CTA if the initiative is completed ([#3251](https://github.com/pagopa/io-app/issues/3251)) ([c8ca5b0](https://github.com/pagopa/io-app/commit/c8ca5b0d7d95eabd13c1972425738e8dce927d09))


### Bug Fixes

* [[IA-156](https://pagopa.atlassian.net/browse/IA-156)] Missing luhn check on continue button ([#3253](https://github.com/pagopa/io-app/issues/3253)) ([2240b3a](https://github.com/pagopa/io-app/commit/2240b3a58de1689e54675851fa859551be4f255f))
* [[IA-164](https://pagopa.atlassian.net/browse/IA-164)] Unable to navigate to an internal route using a CTA in service details [#3255](https://github.com/pagopa/io-app/issues/3255) ([8b47071](https://github.com/pagopa/io-app/commit/8b47071d81380356a9e57e2a7abf23779f381991))


### Chores

* [[IA-154](https://pagopa.atlassian.net/browse/IA-154)] Upgrade eslint and introduce test-only rules ([#3240](https://github.com/pagopa/io-app/issues/3240)) ([a3f3518](https://github.com/pagopa/io-app/commit/a3f35182902f7c5908cbce4d9d51b5224262aa08))

## [1.31.0-rc.2](https://github.com/pagopa/io-app/compare/1.31.0-rc.1...1.31.0-rc.2) (2021-07-21)


### Features

* [[#178212417](https://www.pivotaltracker.com/story/show/178212417)] Feature profile data on one screen ([#3090](https://github.com/pagopa/io-app/issues/3090)) ([f408db7](https://github.com/pagopa/io-app/commit/f408db774d3447393bbd027cdbeeb1c84e119551))
* **Bonus Pagamenti Digitali:** [[IAC-102](https://pagopa.atlassian.net/browse/IAC-102)] Add support for expired cashback as listitem in available bonuses list ([#3241](https://github.com/pagopa/io-app/issues/3241)) ([3353280](https://github.com/pagopa/io-app/commit/335328047a36f3feff561369983cb75518704935))
* **Redesign Servizi:** [[IARS-12](https://pagopa.atlassian.net/browse/IARS-12),[IARS-15](https://pagopa.atlassian.net/browse/IARS-15)] Metadata section in profile ([#3225](https://github.com/pagopa/io-app/issues/3225)) ([5822c4d](https://github.com/pagopa/io-app/commit/5822c4d6548ea701afc6b1e495f73bdd72bf5e8d))
* [[#178212350](https://www.pivotaltracker.com/story/show/178212350)] New profile structure ([#3082](https://github.com/pagopa/io-app/issues/3082)) ([f8da207](https://github.com/pagopa/io-app/commit/f8da2071c7288610d41d53269156899b837580ab))
* **Bonus Pagamenti Digitali:** [[IAC-101](https://pagopa.atlassian.net/browse/IAC-101)] Display cashback capability for a payment method only if the cashback program is active ([#3238](https://github.com/pagopa/io-app/issues/3238)) ([c570826](https://github.com/pagopa/io-app/commit/c570826a1cef2b7ba0cef6a4ae9ed25865befbfc))
* [[IA-152](https://pagopa.atlassian.net/browse/IA-152)] Create german_localization ([#3235](https://github.com/pagopa/io-app/issues/3235)) ([755a730](https://github.com/pagopa/io-app/commit/755a730e87bf33b576097a2394e810f7b9d000fb))


### Chores

* [[IA-153](https://pagopa.atlassian.net/browse/IA-153)] Events cleanup ([#3239](https://github.com/pagopa/io-app/issues/3239)) ([00ae28f](https://github.com/pagopa/io-app/commit/00ae28feef3ceef1e8273fee451440f2414c5bff))
* [[IA-155](https://pagopa.atlassian.net/browse/IA-155)] Update index.yml [#3243](https://github.com/pagopa/io-app/issues/3243) ([9787439](https://github.com/pagopa/io-app/commit/9787439551bdc2bb7ba8252d5f35a6ceada35aa3))
* [[IA-56](https://pagopa.atlassian.net/browse/IA-56)] Upgrade react-native-cie ([#3245](https://github.com/pagopa/io-app/issues/3245)) ([9e39ed6](https://github.com/pagopa/io-app/commit/9e39ed6338fba82212067f35613d98e038eb8189))

## [1.31.0-rc.1](https://github.com/pagopa/io-app/compare/1.31.0-rc.0...1.31.0-rc.1) (2021-07-16)


### Features

* **Bonus Pagamenti Digitali:** [[IAC-100](https://pagopa.atlassian.net/browse/IAC-100)] Ask to enable cashback on a new onboarded payment method only if the cashback program is active ([#3236](https://github.com/pagopa/io-app/issues/3236)) ([52219bc](https://github.com/pagopa/io-app/commit/52219bc35e139c479862fc1e67713d7f48367f81))
* [[#174730105](https://www.pivotaltracker.com/story/show/174730105),IA-96] Add support to german language ([#3203](https://github.com/pagopa/io-app/issues/3203)) ([41b49f5](https://github.com/pagopa/io-app/commit/41b49f59810eaad86d5ba2efcd4a1c01e036586f))
* [[#174892991](https://www.pivotaltracker.com/story/show/174892991)] Implementation of luhn algorithm as hook ([#3080](https://github.com/pagopa/io-app/issues/3080)) ([44db6e5](https://github.com/pagopa/io-app/commit/44db6e5ffc76568cac3a128b23ef3c8f43731c0a))


### Bug Fixes

* **Bonus Vacanze:** [[#178113212](https://www.pivotaltracker.com/story/show/178113212)] Fix success saga on load all activation bonus flow ([#3047](https://github.com/pagopa/io-app/issues/3047)) ([024c13a](https://github.com/pagopa/io-app/commit/024c13a2aa596133f5a17eec274205cc339edd17))
* **Redesign Servizi:** [[IARS-36](https://pagopa.atlassian.net/browse/IARS-36)] Android doesn't show activity indicator on service preference switches ([#3229](https://github.com/pagopa/io-app/issues/3229)) ([c42d18c](https://github.com/pagopa/io-app/commit/c42d18c4f034f8657fbc610fe8efe79d2075d444))


### Chores

* [[IA-121](https://pagopa.atlassian.net/browse/IA-121)] Green Pass de translation [#3234](https://github.com/pagopa/io-app/issues/3234) ([0960abd](https://github.com/pagopa/io-app/commit/0960abd9405d5657efabc51a2b2c4a2480957b03))
* **Sicilia Vola:** [[IASV-6](https://pagopa.atlassian.net/browse/IASV-6)] Added screens layout, routing and navigation ([#3212](https://github.com/pagopa/io-app/issues/3212)) ([bdb327c](https://github.com/pagopa/io-app/commit/bdb327ce71619c2f0f0c0d003575b7a6a48fa017))
* [[#176841424](https://www.pivotaltracker.com/story/show/176841424),IA-130] Replace backend status type with remote definition ([#3221](https://github.com/pagopa/io-app/issues/3221)) ([bd66332](https://github.com/pagopa/io-app/commit/bd66332fc69fcf339a679823af434a652d03460d))
* [[IA-141](https://pagopa.atlassian.net/browse/IA-141)] Change notification text ([#3228](https://github.com/pagopa/io-app/issues/3228)) ([7902079](https://github.com/pagopa/io-app/commit/7902079c32567eaa8708c0bf124f3c2a264ed784))
* [[IA-145](https://pagopa.atlassian.net/browse/IA-145)] Updates generic error message ([#3231](https://github.com/pagopa/io-app/issues/3231)) ([c3b7173](https://github.com/pagopa/io-app/commit/c3b7173c444c6eaf293d554fa96dbd47b6d3749c))
* [[IA-150](https://pagopa.atlassian.net/browse/IA-150)] Trace SPID login errors ([#3233](https://github.com/pagopa/io-app/issues/3233)) ([86cae7c](https://github.com/pagopa/io-app/commit/86cae7cb241ce11eaf1531113ab727ab2162fdb6))
* **Redesign Servizi:** [[IARS-40](https://pagopa.atlassian.net/browse/IARS-40)] Removes the currentSelectedService reducer and action ([#3219](https://github.com/pagopa/io-app/issues/3219)) ([7476fbf](https://github.com/pagopa/io-app/commit/7476fbffced04ed2dce47d815d1836b97223cc59))
* [[IA-44](https://pagopa.atlassian.net/browse/IA-44)] VoiceOver/Talkback doesn't read status of the main bottom menu ([#3162](https://github.com/pagopa/io-app/issues/3162)) ([cc3eaf0](https://github.com/pagopa/io-app/commit/cc3eaf0ee3283cbe7be6679cef0a7fa2b315cae3))
* [[IA-97](https://pagopa.atlassian.net/browse/IA-97)] Add SectionStatusComponent to the favourite language screen ([#3230](https://github.com/pagopa/io-app/issues/3230)) ([8eacf28](https://github.com/pagopa/io-app/commit/8eacf2829f99dbc2780006c4f76ed9e5a39d32ea))
* **Redesign Servizi:** [[IARS-28](https://pagopa.atlassian.net/browse/IARS-28)] Removes services redesign FF and cleanup dead code ([#3220](https://github.com/pagopa/io-app/issues/3220)) ([482c031](https://github.com/pagopa/io-app/commit/482c0311dc1bf86406283ab60b6e8b2f9faa3e5f))
* **Sicilia Vola:** [[IASV-22](https://pagopa.atlassian.net/browse/IASV-22)] Model SiciliaVola store and reducer ([#3170](https://github.com/pagopa/io-app/issues/3170)) ([22b7ee7](https://github.com/pagopa/io-app/commit/22b7ee720d5e47489960716bf610660db0a91121))

## [1.31.0-rc.0](https://github.com/pagopa/io-app/compare/1.30.0-rc.2...1.31.0-rc.0) (2021-07-13)


### Bug Fixes

* [[IA-89](https://pagopa.atlassian.net/browse/IA-89)] Missing accessibility role on share data links ([#3185](https://github.com/pagopa/io-app/issues/3185)) ([d0e7be9](https://github.com/pagopa/io-app/commit/d0e7be9918deebb80af17d7a52311dfe62fe6a79)), closes [#IA-89](https://github.com/pagopa/io-app/issues/IA-89) [#IA-89](https://github.com/pagopa/io-app/issues/IA-89) [#IA-89](https://github.com/pagopa/io-app/issues/IA-89) [#IA-89](https://github.com/pagopa/io-app/issues/IA-89)


### Chores

* **deps:** bump addressable from 2.7.0 to 2.8.0 ([#3223](https://github.com/pagopa/io-app/issues/3223)) ([9df6068](https://github.com/pagopa/io-app/commit/9df6068985b3a34ad81456dbc3d5c07ca43ba2fb))
* [[IA-126](https://pagopa.atlassian.net/browse/IA-126)] Persisted store snapshot test ([#3218](https://github.com/pagopa/io-app/issues/3218)) ([73622e2](https://github.com/pagopa/io-app/commit/73622e261626bad743a8a8ace3e0cdacda720567))

## [1.30.0-rc.2](https://github.com/pagopa/io-app/compare/1.30.0-rc.1...1.30.0-rc.2) (2021-07-09)


### Bug Fixes

* [[IA-125](https://pagopa.atlassian.net/browse/IA-125)] Persisted store doesn't migrate ([#3217](https://github.com/pagopa/io-app/issues/3217)) ([2576148](https://github.com/pagopa/io-app/commit/2576148f2d8cc6de19a361f9319ddcb8fe8066d5))

## [1.30.0-rc.1](https://github.com/pagopa/io-app/compare/1.30.0-rc.0...1.30.0-rc.1) (2021-07-09)


### Features

* **Redesign Servizi:** [[IARS-14](https://pagopa.atlassian.net/browse/IARS-14)]  TOS and info new section ([#3200](https://github.com/pagopa/io-app/issues/3200)) ([a506ace](https://github.com/pagopa/io-app/commit/a506ace418eed22e2f01afc962008667397b4292))


### Bug Fixes

* **Redesign Servizi:** [[IARS-39](https://pagopa.atlassian.net/browse/IARS-39)] Fix services not selected from message detail screen ([#3216](https://github.com/pagopa/io-app/issues/3216)) ([52cd82a](https://github.com/pagopa/io-app/commit/52cd82af24efc6102973caf94f93af1fa9f8245d))
* [[IA-9](https://pagopa.atlassian.net/browse/IA-9)] Remove extra space context help ([#3213](https://github.com/pagopa/io-app/issues/3213)) ([fb2622c](https://github.com/pagopa/io-app/commit/fb2622c08111efed634947f177e0e1bfcad4ffab))
* **Redesign Servizi:** [[IARS-37](https://pagopa.atlassian.net/browse/IARS-37)] Fix disabled webhook flag when reactivating service communication ([#3214](https://github.com/pagopa/io-app/issues/3214)) ([7a5e229](https://github.com/pagopa/io-app/commit/7a5e2298fda0a4ca79e12bca2a96b9d27d7f49eb))


### Chores

* **Redesign Servizi:** [[IARS-38](https://pagopa.atlassian.net/browse/IARS-38)] Removes the Enabling footer button from ServicesHomeScreen ([#3215](https://github.com/pagopa/io-app/issues/3215)) ([2f0d795](https://github.com/pagopa/io-app/commit/2f0d7952a38802f7cb8e1959a0ccf4603d657c1f))

## [1.30.0-rc.0](https://github.com/pagopa/io-app/compare/1.29.0-rc.1...1.30.0-rc.0) (2021-07-08)


### Bug Fixes

* [[IA-120](https://pagopa.atlassian.net/browse/IA-120)] Info message is not right localized ([#3210](https://github.com/pagopa/io-app/issues/3210)) ([317af84](https://github.com/pagopa/io-app/commit/317af84d2a618af36c22a3d7eb7f3e8bb55f10ad))
* [[IA-71](https://pagopa.atlassian.net/browse/IA-71)] Wrong secondary button in choose payment method screen ([#3176](https://github.com/pagopa/io-app/issues/3176)) ([0dd543d](https://github.com/pagopa/io-app/commit/0dd543d4d1e8fb0e2994603051a9da571e5a85bd))
* **Redesign Servizi:** [[IARS-31](https://pagopa.atlassian.net/browse/IARS-31)] Items on service contact preference screen uses the device locale and not the app selected ([#3207](https://github.com/pagopa/io-app/issues/3207)) ([d45cd20](https://github.com/pagopa/io-app/commit/d45cd206fcb1630a20183692bb5dd454220233f3))


### Chores

* **Redesign Servizi:** [[IARS-34](https://pagopa.atlassian.net/browse/IARS-34)] Implements saga to handle profile preference upsert success action ([#3211](https://github.com/pagopa/io-app/issues/3211)) ([0b8c34d](https://github.com/pagopa/io-app/commit/0b8c34dbe1db5fb5e211c5bb6f6075591aaf2572))
* [[IRS-66](https://pagopa.atlassian.net/browse/IRS-66)] Locales update [#3204](https://github.com/pagopa/io-app/issues/3204) ([04927c4](https://github.com/pagopa/io-app/commit/04927c43930c97513a83ad9c2edd3779526c2a8a))

## [1.29.0-rc.1](https://github.com/pagopa/io-app/compare/1.29.0-rc.0...1.29.0-rc.1) (2021-07-06)


### Features

* **Bonus Pagamenti Digitali:** [[IAC-96](https://pagopa.atlassian.net/browse/IAC-96)] Remove cashback item from FeaturedCardCarousel in wallet ([#3194](https://github.com/pagopa/io-app/issues/3194)) ([9d62e1f](https://github.com/pagopa/io-app/commit/9d62e1f2a74f9083e813dac2b66c5bcf172a3de3))
* **Bonus Pagamenti Digitali:** [[IAC-97](https://pagopa.atlassian.net/browse/IAC-97)] Remote configuration for cashback enroll after add payment method ([#3197](https://github.com/pagopa/io-app/issues/3197)) ([527c6ee](https://github.com/pagopa/io-app/commit/527c6eebafb00806852974264010220854037330))
* **EU Covid Certificate:** [[IAGP-66](https://pagopa.atlassian.net/browse/IAGP-66)] Export screenshot in PNG format ([#3199](https://github.com/pagopa/io-app/issues/3199)) ([ded0cf3](https://github.com/pagopa/io-app/commit/ded0cf391f5f2bb2a0f0ed2cc6cffbabc7316739))
* **Redesign Servizi:** [[IARS-13](https://pagopa.atlassian.net/browse/IARS-13)] Isolate toggle components for service contact preference handling ([#3178](https://github.com/pagopa/io-app/issues/3178)) ([00ae7b4](https://github.com/pagopa/io-app/commit/00ae7b40350db1050bc4fa53ec5a564459a37a15))
* **Redesign Servizi:** [[IARS-24](https://pagopa.atlassian.net/browse/IARS-24)] Update profile services preference mode ([#3191](https://github.com/pagopa/io-app/issues/3191)) ([121dd48](https://github.com/pagopa/io-app/commit/121dd48e520c77f5bc257cb3ae79e305b59d3036))
* [[IA-72](https://pagopa.atlassian.net/browse/IA-72)] Add contextual help and tracking to UpdateAppModal ([#3179](https://github.com/pagopa/io-app/issues/3179)) ([f4f517c](https://github.com/pagopa/io-app/commit/f4f517cfa7b8c25953ec91509a9c93c6dabee82b))
* **Redesign Servizi:** [[IARS-4](https://pagopa.atlassian.net/browse/IARS-4),[IARS-6](https://pagopa.atlassian.net/browse/IARS-6)] Implements footer component for ServicesHome screen to enable, disable all services ([#3180](https://github.com/pagopa/io-app/issues/3180)) ([851f28f](https://github.com/pagopa/io-app/commit/851f28f73921375160eb3b1bab37f5e2326bfbb0))


### Bug Fixes

* **Redesign Servizi:** [[IARS-30](https://pagopa.atlassian.net/browse/IARS-30)] Conditions to send event is never raised ([#3202](https://github.com/pagopa/io-app/issues/3202)) ([8ed2ef8](https://github.com/pagopa/io-app/commit/8ed2ef889ace5b8f5688a57c5522d14287a80dd6))
* [[IA-106](https://pagopa.atlassian.net/browse/IA-106)] Profile is not updated ([#3201](https://github.com/pagopa/io-app/issues/3201)) ([4965c52](https://github.com/pagopa/io-app/commit/4965c52857c1729a56cd5c7c9da410c3d79ace50))
* **Redesign Servizi:** [[IARS-22](https://pagopa.atlassian.net/browse/IARS-22)] Implements accessibility on ServiceContactComponent ([#3189](https://github.com/pagopa/io-app/issues/3189)) ([f3e1b8e](https://github.com/pagopa/io-app/commit/f3e1b8e6aec191e9c1cf44184645f13daea1f27d))


### Chores

* **Redesign Servizi:** [[IARS-20](https://pagopa.atlassian.net/browse/IARS-20),[IARS-21](https://pagopa.atlassian.net/browse/IARS-21)] Introduces networking types and store definition for services preference ([#3177](https://github.com/pagopa/io-app/issues/3177)) ([c9a3f93](https://github.com/pagopa/io-app/commit/c9a3f938dd451ee5db47ae61469ac3045c3408a6))
* **Redesign Servizi:** [[IARS-23](https://pagopa.atlassian.net/browse/IARS-23)] Introduces Service Preference API Saga and toggle component store linking ([#3186](https://github.com/pagopa/io-app/issues/3186)) ([ef00c43](https://github.com/pagopa/io-app/commit/ef00c4312ba89a12ec51b28b39a616459f7429e0))
* **Redesign Servizi:** [[IARS-25](https://pagopa.atlassian.net/browse/IARS-25)] Add services preference mode opt-in on startup ([#3196](https://github.com/pagopa/io-app/issues/3196)) ([a145fcb](https://github.com/pagopa/io-app/commit/a145fcb0628b0bce513d030ae98d5a2355737eea))
* **Redesign Servizi:** [[IARS-26](https://pagopa.atlassian.net/browse/IARS-26)] Preference summary is displayed only on national list as footer ([#3182](https://github.com/pagopa/io-app/issues/3182)) ([19249ee](https://github.com/pagopa/io-app/commit/19249ee5e34469f9200981ef1b14e26f617e9d72))
* **Redesign Servizi:** [[IARS-27](https://pagopa.atlassian.net/browse/IARS-27)] Removes the option to set Email forwarding preference by service [#3187](https://github.com/pagopa/io-app/issues/3187) ([04d6004](https://github.com/pagopa/io-app/commit/04d60046e708a0cab749ff8aa931b7375728d6f9))
* **Redesign Servizi:** [[IARS-29](https://pagopa.atlassian.net/browse/IARS-29)] Add mixpanel track for newly integrated service preference API ([#3195](https://github.com/pagopa/io-app/issues/3195)) ([bef9853](https://github.com/pagopa/io-app/commit/bef98538530fd66bfb49def4131df7eafb794a03))
* **Redesign Servizi:** [[IARS-7](https://pagopa.atlassian.net/browse/IARS-7)] Introduces thank you page for service preference save ([#3184](https://github.com/pagopa/io-app/issues/3184)) ([23134d5](https://github.com/pagopa/io-app/commit/23134d5e912755a0e22060d205efccf82e5f4474))
* **Sicilia Vola:** [[IASV-7](https://pagopa.atlassian.net/browse/IASV-7)] Create SiciliaVola voucher generation workunit ([#3128](https://github.com/pagopa/io-app/issues/3128)) ([928b4bf](https://github.com/pagopa/io-app/commit/928b4bf1e89fd2b6d9ad20ca5d702267d8df0a00))
* [[IA-21](https://pagopa.atlassian.net/browse/IA-21)] added permissions mapping in README ([#3132](https://github.com/pagopa/io-app/issues/3132)) ([09c713f](https://github.com/pagopa/io-app/commit/09c713f6ebe3e4a1408a61258ceabeded8d571fc)), closes [#IA-21](https://github.com/pagopa/io-app/issues/IA-21)
* [[IA-45](https://pagopa.atlassian.net/browse/IA-45)] In wallet home header when VO is active, the title and the add card method is not clear ([#3164](https://github.com/pagopa/io-app/issues/3164)) ([b397c99](https://github.com/pagopa/io-app/commit/b397c99b5d819121e1eed09fd56e7387cb2a8a4e))
* **Redesign Servizi:** [[IARS-8](https://pagopa.atlassian.net/browse/IARS-8)] Adds the bottom sheet to confirm the manual option ([#3165](https://github.com/pagopa/io-app/issues/3165)) ([f6491f4](https://github.com/pagopa/io-app/commit/f6491f4839d7f9a2baf494b9cc419824c92d8c0d))

## [1.29.0-rc.0](https://github.com/pagopa/io-app/compare/1.28.0-rc.4...1.29.0-rc.0) (2021-06-30)


### Bug Fixes

* [[IA-11](https://pagopa.atlassian.net/browse/IA-11),[IA-22](https://pagopa.atlassian.net/browse/IA-22)] IDPS list is requested only when trying to login with SPID ([#3136](https://github.com/pagopa/io-app/issues/3136)) ([22b8452](https://github.com/pagopa/io-app/commit/22b8452c643a9649ea8619234a55cafb0b72768d))
* [[IA-73](https://pagopa.atlassian.net/browse/IA-73)] Can't login with SPID due to wrong navigation route ([#3175](https://github.com/pagopa/io-app/issues/3175)) ([529380d](https://github.com/pagopa/io-app/commit/529380d1b9ecee35ec917acc87874faa59ea9db6))

## [1.28.0-rc.4](https://github.com/pagopa/io-app/compare/1.28.0-rc.3...1.28.0-rc.4) (2021-06-25)


### Chores

* [[IA-69](https://pagopa.atlassian.net/browse/IA-69)] Remove title, update description and tests ([#3169](https://github.com/pagopa/io-app/issues/3169)) ([51e0ff0](https://github.com/pagopa/io-app/commit/51e0ff0ed4789304e2944b94a8213f63616c08fd))

## [1.28.0-rc.3](https://github.com/pagopa/io-app/compare/1.28.0-rc.2...1.28.0-rc.3) (2021-06-25)


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[IAC-84](https://pagopa.atlassian.net/browse/IAC-84)] Wrong textual representation when superCashbackAmount === 0 for a period [#3172](https://github.com/pagopa/io-app/issues/3172) ([d0836c0](https://github.com/pagopa/io-app/commit/d0836c0bb43043cca402adfd93f5a9f4c1820197))

## [1.28.0-rc.2](https://github.com/pagopa/io-app/compare/1.28.0-rc.1...1.28.0-rc.2) (2021-06-25)


### Features

* **Redesign Servizi:** [[IARS-2](https://pagopa.atlassian.net/browse/IARS-2)] Introduces the services contact preference screen ([#3163](https://github.com/pagopa/io-app/issues/3163)) ([63c6ff7](https://github.com/pagopa/io-app/commit/63c6ff7dfd0d1cc9037aca445452ff9aaf3f4edd))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [IAC-75, IA-70] Fix spacing area in darklayout button footer for iphone 12 ([#3133](https://github.com/pagopa/io-app/issues/3133)) ([91e6292](https://github.com/pagopa/io-app/commit/91e6292c1d23414198968001403da96da6e3d12c))


### Chores

* [[IA-62](https://pagopa.atlassian.net/browse/IA-62)] Add SCREEN_CHANGE_V2 event ([#3171](https://github.com/pagopa/io-app/issues/3171)) ([b2a378e](https://github.com/pagopa/io-app/commit/b2a378edc857e1100a1d6c3e67c8f7dcbec211be))

## [1.28.0-rc.1](https://github.com/pagopa/io-app/compare/1.28.0-rc.0...1.28.0-rc.1) (2021-06-23)


### Features

* **Payments:** [[#178212517](https://www.pivotaltracker.com/story/show/178212517)] Show information about 3DS verification ([#3135](https://github.com/pagopa/io-app/issues/3135)) ([e088498](https://github.com/pagopa/io-app/commit/e088498863afdcbe8cd259fefae28d9016ce4ece))
* [[IAI-17](https://pagopa.atlassian.net/browse/IAI-17)] Render local svg files ([#3158](https://github.com/pagopa/io-app/issues/3158)) ([b895c92](https://github.com/pagopa/io-app/commit/b895c92dd46ce209312d02955ca56d0de485b611))


### Bug Fixes

* [[IA-23](https://pagopa.atlassian.net/browse/IA-23)] added isMounted to check mounted state ([#3134](https://github.com/pagopa/io-app/issues/3134)) ([6c30715](https://github.com/pagopa/io-app/commit/6c307153db291e7763a1a0379c72edf3a08e4a98))
* **EU Covid Certificate:** [[IAGP-57](https://pagopa.atlassian.net/browse/IAGP-57)] Change locales for photolibrary permission ([#3120](https://github.com/pagopa/io-app/issues/3120)) ([4ef3e8c](https://github.com/pagopa/io-app/commit/4ef3e8c672abd876af5dbefe2f0922b3a605e1b2))


### Chores

* **Bonus Pagamenti Digitali:** [[IAC-82](https://pagopa.atlassian.net/browse/IAC-82)] Graphical review for cashback states ([#3166](https://github.com/pagopa/io-app/issues/3166)) ([14891f6](https://github.com/pagopa/io-app/commit/14891f6239e454892e28e616f6a301bad21c4bdf))
* [[IA-41](https://pagopa.atlassian.net/browse/IA-41)] Expose the unique device ID and let the developer copy it to the clipboard ([#3159](https://github.com/pagopa/io-app/issues/3159)) ([4aa1aea](https://github.com/pagopa/io-app/commit/4aa1aea4206b5523f1e2683ca4bd29eb2843497b))
* [[IA-42](https://pagopa.atlassian.net/browse/IA-42)] Disable A/B testing ([#3160](https://github.com/pagopa/io-app/issues/3160)) ([2bb7d82](https://github.com/pagopa/io-app/commit/2bb7d82690273e29e900a4f48312e66ae7513106))
* **Bonus Pagamenti Digitali:** [[IAC-7](https://pagopa.atlassian.net/browse/IAC-7)] Remove technical iban feature flag ([#3113](https://github.com/pagopa/io-app/issues/3113)) ([d468faf](https://github.com/pagopa/io-app/commit/d468faf52f7683c407afaca78d075e2d7a147195))
* **EU Covid Certificate:** [[IAGP-65](https://pagopa.atlassian.net/browse/IAGP-65)] Add top and bottom qrcode spacing [#3161](https://github.com/pagopa/io-app/issues/3161) ([d960d55](https://github.com/pagopa/io-app/commit/d960d55f3ee339ba892685d4046bdc762a403c97))

## [1.28.0-rc.0](https://github.com/pagopa/io-app/compare/1.27.0-rc.0...1.28.0-rc.0) (2021-06-20)


### Bug Fixes

* [[#178110273](https://www.pivotaltracker.com/story/show/178110273)] Fix margin on contact support button for small device ([#3107](https://github.com/pagopa/io-app/issues/3107)) ([8357a0d](https://github.com/pagopa/io-app/commit/8357a0d1d242e4b3b3ca2bf218de66924f81d7af))
* [[IA-40](https://pagopa.atlassian.net/browse/IA-40)] In "your data" screen, missing bottomsheet content when the screen reader is enabled [#3154](https://github.com/pagopa/io-app/issues/3154) ([6a47421](https://github.com/pagopa/io-app/commit/6a47421cb659673af2e6f34733f3733f73afb631))


### Chores

* [[IA-19](https://pagopa.atlassian.net/browse/IA-19)] When copy id message is missing service name ([#3153](https://github.com/pagopa/io-app/issues/3153)) ([6a691d7](https://github.com/pagopa/io-app/commit/6a691d7da8eb2161fdfd296ba6cbb9c3315c1aa4))

## [1.27.0-rc.0](https://github.com/pagopa/io-app/compare/1.26.0-rc.6...1.27.0-rc.0) (2021-06-16)


### Features

* [[IA-27](https://pagopa.atlassian.net/browse/IA-27),[IA-28](https://pagopa.atlassian.net/browse/IA-28)] Ask opt-in preference while onboarding or when user is logged in ([#3145](https://github.com/pagopa/io-app/issues/3145)) ([b5dd615](https://github.com/pagopa/io-app/commit/b5dd615b67fdbc589f0d74f5af5d4f7619c1f021))
* [[IA-29](https://pagopa.atlassian.net/browse/IA-29)] Add privacy settings in profile section ([#3146](https://github.com/pagopa/io-app/issues/3146)) ([30ff409](https://github.com/pagopa/io-app/commit/30ff409a9a2da2356ca0ec65ba6907f9b27aaf13))


### Chores

* [[IA-39](https://pagopa.atlassian.net/browse/IA-39)] Copy update ([#3152](https://github.com/pagopa/io-app/issues/3152)) ([7e36763](https://github.com/pagopa/io-app/commit/7e3676399f0b9325368cec64dd4ef8b351fd2cb6))
* **Redesign Servizi:** [[IARS-3](https://pagopa.atlassian.net/browse/IARS-3)] Adds Redesign Servizi to Changelog scopes ([#3150](https://github.com/pagopa/io-app/issues/3150)) ([fac69fa](https://github.com/pagopa/io-app/commit/fac69fa0c02489d034be0b32e9214919976014c6))
* [[IA-36](https://pagopa.atlassian.net/browse/IA-36)] Copy update ([#3151](https://github.com/pagopa/io-app/issues/3151)) ([69d0923](https://github.com/pagopa/io-app/commit/69d0923ff3b80c910d92e35252e6d394f378af11))
* **Bonus Pagamenti Digitali:** [[IAC-80](https://pagopa.atlassian.net/browse/IAC-80)] Supercashback copy update ([#3148](https://github.com/pagopa/io-app/issues/3148)) ([970014e](https://github.com/pagopa/io-app/commit/970014e80b4851ffa0f4a1ae92f37e3bcc2e1756))
* [[IA-30](https://pagopa.atlassian.net/browse/IA-30)] Refactoring for mixpanel integration ([#3141](https://github.com/pagopa/io-app/issues/3141)) ([2d16049](https://github.com/pagopa/io-app/commit/2d16049bcab0ce116b8820dc6a7d17ddcd5103e5))
* [[IA-32](https://pagopa.atlassian.net/browse/IA-32)] Open ToS links in external browser ([#3142](https://github.com/pagopa/io-app/issues/3142)) ([a7e8947](https://github.com/pagopa/io-app/commit/a7e8947bbb5db788db58f91b1660ee8f4a60c52b))
* [[IA-33](https://pagopa.atlassian.net/browse/IA-33)] Reset opt-in choice on differentProfileLoggedIn event ([#3144](https://github.com/pagopa/io-app/issues/3144)) ([06dc021](https://github.com/pagopa/io-app/commit/06dc02166a276d1c12b4a1d87832ba03d19e51e1))
* [[IA-34](https://pagopa.atlassian.net/browse/IA-34)] New copy ([#3147](https://github.com/pagopa/io-app/issues/3147)) ([5c01fdf](https://github.com/pagopa/io-app/commit/5c01fdf6e8d4305f7ddff96c0c19e851a9e90f5c))

## [1.26.0-rc.6](https://github.com/pagopa/io-app/compare/1.26.0-rc.5...1.26.0-rc.6) (2021-06-14)


### Bug Fixes

* **EU Covid Certificate:** [[IAGP-56](https://pagopa.atlassian.net/browse/IAGP-56)] Add overflow wrap for markdown component ([#3127](https://github.com/pagopa/io-app/issues/3127)) ([eec0959](https://github.com/pagopa/io-app/commit/eec095963a51689476772e405a0fc7f87eab5ca4))
* [[IA-3](https://pagopa.atlassian.net/browse/IA-3)] Error swallowing on upsert email API fault code ([#3119](https://github.com/pagopa/io-app/issues/3119)) ([cbeb096](https://github.com/pagopa/io-app/commit/cbeb096c08c84723b6d705ba747f2b82043a0641))


### Chores

* **EU Covid Certificate:** [[IAGP-61](https://pagopa.atlassian.net/browse/IAGP-61)] Add shouldAskForScreenshotWithInitialValue [#3130](https://github.com/pagopa/io-app/issues/3130) ([85ddfff](https://github.com/pagopa/io-app/commit/85ddffffcbfcdefc2ef53fa7d36fcaf36509a887))
* **Sicilia Vola:** [[IASV-3](https://pagopa.atlassian.net/browse/IASV-3)] Add SiciliaVola feature flag ([#3124](https://github.com/pagopa/io-app/issues/3124)) ([4f8a345](https://github.com/pagopa/io-app/commit/4f8a345763b7ea1d080d3eb08d34a0575aa3a0dc))
* **Sicilia Vola:** [[IASV-5](https://pagopa.atlassian.net/browse/IASV-5)] Add sicilia vola actions, store & reducer placeholders ([#3074](https://github.com/pagopa/io-app/issues/3074)) ([d9e8e99](https://github.com/pagopa/io-app/commit/d9e8e99ef5a31948799a10168605ab4113d5da14))
* [[IA-18](https://pagopa.atlassian.net/browse/IA-18)] Update README [#3122](https://github.com/pagopa/io-app/issues/3122) ([42dcb40](https://github.com/pagopa/io-app/commit/42dcb408d0d69eb82328eddefbf026a38c183077))
* [[IA-20](https://pagopa.atlassian.net/browse/IA-20)] Copy update [#3125](https://github.com/pagopa/io-app/issues/3125) ([2f00896](https://github.com/pagopa/io-app/commit/2f008961669f7c9dcb701c6a6c06aa4ade26d12c))

## [1.26.0-rc.5](https://github.com/pagopa/io-app/compare/1.26.0-rc.4...1.26.0-rc.5) (2021-06-08)


### Features

* **EU Covid Certificate:** [[IAGP-16](https://pagopa.atlassian.net/browse/IAGP-16),[IAGP-19](https://pagopa.atlassian.net/browse/IAGP-19),[IAGP-33](https://pagopa.atlassian.net/browse/IAGP-33)] Display of valid certificate, full-screen QR code and additional textual details  ([#3094](https://github.com/pagopa/io-app/issues/3094)) ([b971c70](https://github.com/pagopa/io-app/commit/b971c707b796a7c0e5b88e85b723c00228cb1032))
* **EU Covid Certificate:** [[IAGP-17](https://pagopa.atlassian.net/browse/IAGP-17),[IAGP-37](https://pagopa.atlassian.net/browse/IAGP-37)] Save QRCode and certificate details as image ([#3103](https://github.com/pagopa/io-app/issues/3103)) ([b4eff4c](https://github.com/pagopa/io-app/commit/b4eff4cba83bd71def44c87b51f39bb80d375092))
* **EU Covid Certificate:** [[IAGP-2](https://pagopa.atlassian.net/browse/IAGP-2)] Introduces the SectionStatusComponent on BaseEuCovidCertificateLayout component ([#3101](https://github.com/pagopa/io-app/issues/3101)) ([8195eee](https://github.com/pagopa/io-app/commit/8195eee50545a3fe5ab2b28328b77d3880cfb3a8))
* **EU Covid Certificate:** [[IAGP-20](https://pagopa.atlassian.net/browse/IAGP-20)] Expired certificate screen ([#3096](https://github.com/pagopa/io-app/issues/3096)) ([60cd893](https://github.com/pagopa/io-app/commit/60cd8936783914cadd9f606024808012d0d2e5ad))
* **EU Covid Certificate:** [[IAGP-22](https://pagopa.atlassian.net/browse/IAGP-22)] Certificate not found screen ([#3091](https://github.com/pagopa/io-app/issues/3091)) ([f03375d](https://github.com/pagopa/io-app/commit/f03375d9991f3de35b5443ce41b4768d32106f8e))
* **EU Covid Certificate:** [[IAGP-23](https://pagopa.atlassian.net/browse/IAGP-23)] Added generic error screen in case of networking errors, 500 error or other unmanaged response code  ([#3095](https://github.com/pagopa/io-app/issues/3095)) ([e0a17ab](https://github.com/pagopa/io-app/commit/e0a17aba69f76783cf86ad5c1d9a40e16321b4ab))
* **EU Covid Certificate:** [[IAGP-35](https://pagopa.atlassian.net/browse/IAGP-35)] Certificate in wrong format ([#3093](https://github.com/pagopa/io-app/issues/3093)) ([4ce8668](https://github.com/pagopa/io-app/commit/4ce8668424c96ed3e751ccb145a1145064ad52cf))


### Bug Fixes

* **EU Covid Certificate:** [[IAGP-48](https://pagopa.atlassian.net/browse/IAGP-48)] Adds preferredLanguage parameter to certificate detail API request  ([#3105](https://github.com/pagopa/io-app/issues/3105)) ([337a889](https://github.com/pagopa/io-app/commit/337a88930e533c27f1489c775a24b1d6065bdd87))
* **EU Covid Certificate:** getCertificate request payload is in a wrong format ([#3117](https://github.com/pagopa/io-app/issues/3117)) ([c520611](https://github.com/pagopa/io-app/commit/c5206117d1612f67b2cb35249fe17d0cf68398f2))


### Chores

* **Bonus Pagamenti Digitali:** [[IAC-71](https://pagopa.atlassian.net/browse/IAC-71)] Added Venpay logo ([#3098](https://github.com/pagopa/io-app/issues/3098)) ([354d816](https://github.com/pagopa/io-app/commit/354d8167415f5f5049fc03a7e48a68841afc4e03))
* **EU Covid Certificate:** [[IAGP-27](https://pagopa.atlassian.net/browse/IAGP-27)] Add mixpanel tracking ([#3109](https://github.com/pagopa/io-app/issues/3109)) ([f97b59a](https://github.com/pagopa/io-app/commit/f97b59a0a52a701abde30c515f24c0d919b6a17f))
* **EU Covid Certificate:** [[IAGP-39](https://pagopa.atlassian.net/browse/IAGP-39)] Update specs with the latest tag version [#3111](https://github.com/pagopa/io-app/issues/3111) ([a345426](https://github.com/pagopa/io-app/commit/a345426515bdc938487f512f52e93146f9d8b0c4))
* **EU Covid Certificate:** [[IAGP-43](https://pagopa.atlassian.net/browse/IAGP-43)] Update API spec ([#3089](https://github.com/pagopa/io-app/issues/3089)) ([f34e001](https://github.com/pagopa/io-app/commit/f34e001fe39ce40b9aa8f021737b741dfb6c90e3))
* **EU Covid Certificate:** [[IAGP-44](https://pagopa.atlassian.net/browse/IAGP-44)] Update api specs and add the "expired" state [#3102](https://github.com/pagopa/io-app/issues/3102) ([0eb9eb6](https://github.com/pagopa/io-app/commit/0eb9eb6b581f31831c46d83808cb16e4372e89ff))
* **EU Covid Certificate:** [[IAGP-45](https://pagopa.atlassian.net/browse/IAGP-45)] Make ActivityIndicator bigger [#3099](https://github.com/pagopa/io-app/issues/3099) ([8ba833a](https://github.com/pagopa/io-app/commit/8ba833ac76d58e5d6f6665fc5e93f859d8e231e5))
* **EU Covid Certificate:** [[IAGP-46](https://pagopa.atlassian.net/browse/IAGP-46)] Prevent the Covid CERT CTA if FF is disabled [#3100](https://github.com/pagopa/io-app/issues/3100) ([58068bf](https://github.com/pagopa/io-app/commit/58068bf9a3e58a917cf7c3561909ff5fde410203))
* **EU Covid Certificate:** [[IAGP-47](https://pagopa.atlassian.net/browse/IAGP-47)] Change the ttl of the volatile cache ([#3104](https://github.com/pagopa/io-app/issues/3104)) ([721213b](https://github.com/pagopa/io-app/commit/721213b08d55deeba44c3f18e49cfec01e5fd0cc))
* **EU Covid Certificate:** [[IAGP-49](https://pagopa.atlassian.net/browse/IAGP-49)] Add certificate expired test case [#3106](https://github.com/pagopa/io-app/issues/3106) ([452edf4](https://github.com/pagopa/io-app/commit/452edf4b5c59db4649faf907dc280829d7f1c1d0))
* **EU Covid Certificate:** [[IAGP-50](https://pagopa.atlassian.net/browse/IAGP-50)] Enable EuCovidCert feature flag [#3112](https://github.com/pagopa/io-app/issues/3112) ([1c1bd2d](https://github.com/pagopa/io-app/commit/1c1bd2dea20ed2714cf42c973ab7090d09548a8f))
* **EU Covid Certificate:** [[IAGP-51](https://pagopa.atlassian.net/browse/IAGP-51)] Track eucovidcert message ([#3114](https://github.com/pagopa/io-app/issues/3114)) ([29bbd6d](https://github.com/pagopa/io-app/commit/29bbd6d2bc31cb1446dd61ac94c3051b3419d1aa))
* **EU Covid Certificate:** [[IAGP-52](https://pagopa.atlassian.net/browse/IAGP-52)] Copy check ([#3115](https://github.com/pagopa/io-app/issues/3115)) ([49cf58c](https://github.com/pagopa/io-app/commit/49cf58cb2fd21675d179f3c510003aa76cc7cbb9))
* **EU Covid Certificate:** [[IAGP-53](https://pagopa.atlassian.net/browse/IAGP-53)] Graphical refinements ([#3116](https://github.com/pagopa/io-app/issues/3116)) ([f91f2ee](https://github.com/pagopa/io-app/commit/f91f2ee3252d6a11c1c447451d170627f3711f2c))
* [[#178393622](https://www.pivotaltracker.com/story/show/178393622)] Changed [#5](https://github.com/pagopa/io-app/issues/5)C6F82 color to [#475](https://github.com/pagopa/io-app/issues/475)A6D ([#3092](https://github.com/pagopa/io-app/issues/3092)) ([98a6046](https://github.com/pagopa/io-app/commit/98a60464e5faf1ca2e604a9f3a5ea2f3ac8ec477)), closes [#5C6F82](https://github.com/pagopa/io-app/issues/5C6F82) [#475A6](https://github.com/pagopa/io-app/issues/475A6) [#5C6F82](https://github.com/pagopa/io-app/issues/5C6F82) [#475A6](https://github.com/pagopa/io-app/issues/475A6)

## [1.26.0-rc.4](https://github.com/pagopa/io-app/compare/1.26.0-rc.3...1.26.0-rc.4) (2021-06-04)


### Chores

* **EU Covid Certificate:** [[IAGP-40](https://pagopa.atlassian.net/browse/IAGP-40)] Add backoff waiting time on getCertificate error ([#3084](https://github.com/pagopa/io-app/issues/3084)) ([4f4716f](https://github.com/pagopa/io-app/commit/4f4716f5c5dab42a6271f1247781d9c3a483751d))

## [1.26.0-rc.3](https://github.com/pagopa/io-app/compare/1.26.0-rc.2...1.26.0-rc.3) (2021-06-04)


### Chores

* **EU Covid Certificate:** [[IAGP-38](https://pagopa.atlassian.net/browse/IAGP-38)] Handle message routing ([#3085](https://github.com/pagopa/io-app/issues/3085)) ([bd107c9](https://github.com/pagopa/io-app/commit/bd107c932339d36569ea51ed570f0b2435f7a730))

## [1.26.0-rc.2](https://github.com/pagopa/io-app/compare/1.26.0-rc.1...1.26.0-rc.2) (2021-06-04)


### Features

* **EU Covid Certificate:** [[IAGP-21](https://pagopa.atlassian.net/browse/IAGP-21)] Implements Covid Certificate Revoked Component ([#3083](https://github.com/pagopa/io-app/issues/3083)) ([cabfd7f](https://github.com/pagopa/io-app/commit/cabfd7fa10827bb17871451b69d0204c70af7e71))
* **EU Covid Certificate:** [[IAGP-24](https://pagopa.atlassian.net/browse/IAGP-24)] Implements NotOperarional screen for EUCovidCert ([#3088](https://github.com/pagopa/io-app/issues/3088)) ([e65f5ad](https://github.com/pagopa/io-app/commit/e65f5ada1992514b5c123af338d5b5604047b050))
* **EU Covid Certificate:** [[IAGP-26](https://pagopa.atlassian.net/browse/IAGP-26)] Implements TemporarilyUnavailable screen component [#3087](https://github.com/pagopa/io-app/issues/3087) ([a3e2a2d](https://github.com/pagopa/io-app/commit/a3e2a2dbd21a53e24edf3198d7a7ad881b8f8c16))
* **EU Covid Certificate:** [[IAGP-31](https://pagopa.atlassian.net/browse/IAGP-31)] Add "View" CTA on EuCovidCert Message list item ([#3086](https://github.com/pagopa/io-app/issues/3086)) ([0066ce8](https://github.com/pagopa/io-app/commit/0066ce8516ad03748d6979e32becb4bf4183c3ce))
* **EU Covid Certificate:** [[IAGP-34](https://pagopa.atlassian.net/browse/IAGP-34),[IA-6](https://pagopa.atlassian.net/browse/IA-6)] Add COPY as supported schema in iohandledlink ([#3077](https://github.com/pagopa/io-app/issues/3077)) ([69a2049](https://github.com/pagopa/io-app/commit/69a20491e7caacac711c6a05593c54c131f70e9b))
* **EU Covid Certificate:** [[IAGP-36](https://pagopa.atlassian.net/browse/IAGP-36)] Add euCovidCert as new section status ([#3073](https://github.com/pagopa/io-app/issues/3073)) ([9a2e3ed](https://github.com/pagopa/io-app/commit/9a2e3ed07cf1a2e57e3255f625eb4ac290b1869f))


### Chores

* **Carta Giovani Nazionale:** [[#178127305](https://www.pivotaltracker.com/story/show/178127305)] Adds Department name and Eyca Logo on card component ([#3042](https://github.com/pagopa/io-app/issues/3042)) ([c8c9267](https://github.com/pagopa/io-app/commit/c8c92675e1ba3b151e6e42fd3a4975c0e4e6eafb))
* **EU Covid Certificate:** [[IAGP-10](https://pagopa.atlassian.net/browse/IAGP-10),[IAGP-12](https://pagopa.atlassian.net/browse/IAGP-12)] Update Message spec with EUCovidCert ([#3081](https://github.com/pagopa/io-app/issues/3081)) ([dd83c65](https://github.com/pagopa/io-app/commit/dd83c656719b86b7f544e49239c8f808b0c4e859))
* **EU Covid Certificate:** [[IAGP-5](https://pagopa.atlassian.net/browse/IAGP-5)] Types, actions & store for EU Covid Certificate ([#3076](https://github.com/pagopa/io-app/issues/3076)) ([4a04070](https://github.com/pagopa/io-app/commit/4a040706a8bea52d37185a89ed99548a70293922))
* **EU Covid Certificate:** [[IAGP-6](https://pagopa.atlassian.net/browse/IAGP-6)] Added screens layout, routing and navigation ([#3079](https://github.com/pagopa/io-app/issues/3079)) ([72d0dc7](https://github.com/pagopa/io-app/commit/72d0dc7d048fe3196791f33d70a87e2bd36590f4))
* **EU Covid Certificate:** [[IAGP-9](https://pagopa.atlassian.net/browse/IAGP-9)] Add getCertificate API network logic ([#3078](https://github.com/pagopa/io-app/issues/3078)) ([20b93cd](https://github.com/pagopa/io-app/commit/20b93cd054519907916873e46f0638ac99232384))

## [1.26.0-rc.1](https://github.com/pagopa/io-app/compare/1.26.0-rc.0...1.26.0-rc.1) (2021-05-28)


### Features

* [[#177558088](https://www.pivotaltracker.com/story/show/177558088)] Idps data for selection grid is now loaded from CDN ([#3008](https://github.com/pagopa/io-app/issues/3008)) ([3752586](https://github.com/pagopa/io-app/commit/37525863f8bd5b668f0db220a5c070093f519ad6))
* **Carta Giovani Nazionale:** [[#178020526](https://www.pivotaltracker.com/story/show/178020526)] Implements components to filter on merchants search ([#3033](https://github.com/pagopa/io-app/issues/3033)) ([0d7c7cb](https://github.com/pagopa/io-app/commit/0d7c7cb8d02490f5c7eaeaacd1500f635406422f))


### Bug Fixes

* [[#177478372](https://www.pivotaltracker.com/story/show/177478372)] Multiple enable/disable services doesn't work ([#3052](https://github.com/pagopa/io-app/issues/3052)) ([60371e5](https://github.com/pagopa/io-app/commit/60371e5868ff32245caea0c36c5dbf594f72a339))
* [[#178166915](https://www.pivotaltracker.com/story/show/178166915)] Fix the problem of setting the security code after reinstalling the app on IOS ([#3069](https://github.com/pagopa/io-app/issues/3069)) ([343248b](https://github.com/pagopa/io-app/commit/343248b218bfccb07648e258be1a85251a909cc2))


### Chores

* **EU Covid Certificate:** [[IAGP-4](https://pagopa.atlassian.net/browse/IAGP-4)] Add EU covid certificate feature flag ([#3071](https://github.com/pagopa/io-app/issues/3071)) ([fdd2077](https://github.com/pagopa/io-app/commit/fdd207704a65f4a2473d74d276e94540fc1d4659))
* **Green Pass:** [[IAGP-1](https://pagopa.atlassian.net/browse/IAGP-1)] Add "Green Pass" to changelog scope [#3066](https://github.com/pagopa/io-app/issues/3066) ([9bce3d3](https://github.com/pagopa/io-app/commit/9bce3d35b215c1cc992d6777f9ed77921fa2615b))
* [[#178297319](https://www.pivotaltracker.com/story/show/178297319)] Fixes broken urls [#3065](https://github.com/pagopa/io-app/issues/3065) ([7ec0418](https://github.com/pagopa/io-app/commit/7ec04189838fa9d7e5e848d40c6e09892b418421))

## [1.26.0-rc.0](https://github.com/pagopa/io-app/compare/1.25.0-rc.14...1.26.0-rc.0) (2021-05-25)


### Features

* [[#176409590](https://www.pivotaltracker.com/story/show/176409590)] Removed favoriteWalletId from Redux store ([#3054](https://github.com/pagopa/io-app/issues/3054)) ([cd22427](https://github.com/pagopa/io-app/commit/cd22427a7ef6ebdcc6969c027d0d900c97cec690))
* [[#178230437](https://www.pivotaltracker.com/story/show/178230437)] Changed valid until color [#3058](https://github.com/pagopa/io-app/issues/3058) ([84748ca](https://github.com/pagopa/io-app/commit/84748ca1e7303f0d4fdf1ddbe11d92ef849ec734))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[IAC-66](https://pagopa.atlassian.net/browse/IAC-66)] Wrong normalization of cashback amount when the pivot transaction is in a different day but in the same page ([#3061](https://github.com/pagopa/io-app/issues/3061)) ([688ddb4](https://github.com/pagopa/io-app/commit/688ddb43f1364ce4263e534296bb079da1273513))
* [[#176538461](https://www.pivotaltracker.com/story/show/176538461)] Fix broken ScanQrCodeScreen layout ([#3051](https://github.com/pagopa/io-app/issues/3051)) ([1b1aa13](https://github.com/pagopa/io-app/commit/1b1aa13caaeb4f98f34ba646d274a4b983e77fda))
* [[#178243533](https://www.pivotaltracker.com/story/show/178243533)] Fix cards not visible during payment ([#3060](https://github.com/pagopa/io-app/issues/3060)) ([4bb6b3e](https://github.com/pagopa/io-app/commit/4bb6b3e50345379b71c4449252c49516bb383cf6))


### Chores

* **Bonus Pagamenti Digitali:** [[IAC-70](https://pagopa.atlassian.net/browse/IAC-70)] Write-off copy update [#3063](https://github.com/pagopa/io-app/issues/3063) ([58a00eb](https://github.com/pagopa/io-app/commit/58a00eb738a840c9d0f73818bd049d6983d799c6))
* [[#177058428](https://www.pivotaltracker.com/story/show/177058428)] Changed native base Text with typography components in thank you page screens ([#3053](https://github.com/pagopa/io-app/issues/3053)) ([198718f](https://github.com/pagopa/io-app/commit/198718fbee0d88c9048e74936cc56aa48f373729))
* **Sicilia Vola:** [[IASV-1](https://pagopa.atlassian.net/browse/IASV-1)] Add Sicilia Vola Id for title generation and changelog  ([#3056](https://github.com/pagopa/io-app/issues/3056)) ([f4947ab](https://github.com/pagopa/io-app/commit/f4947ab5da34adb644de5f662b682b1df182c5f4))

## [1.25.0-rc.14](https://github.com/pagopa/io-app/compare/1.25.0-rc.13...1.25.0-rc.14) (2021-05-19)


### Bug Fixes

* [[#177270155](https://www.pivotaltracker.com/story/show/177270155)] Fix accessibility for ios in add credit card screen ([#3020](https://github.com/pagopa/io-app/issues/3020)) ([a60db57](https://github.com/pagopa/io-app/commit/a60db57092efeda649506a6b4c13f3276912f287))


### Chores

* **Bonus Pagamenti Digitali:** [[IAC-64](https://pagopa.atlassian.net/browse/IAC-64)] Disable paginated transaction feature flag [#3055](https://github.com/pagopa/io-app/issues/3055) ([9e4b9a1](https://github.com/pagopa/io-app/commit/9e4b9a1f97a391df7f9d48c7c8031fafb6759a2e))
* [[#178065380](https://www.pivotaltracker.com/story/show/178065380)] Replaced failed identification text ([#3044](https://github.com/pagopa/io-app/issues/3044)) ([bb81939](https://github.com/pagopa/io-app/commit/bb819391c8fbe291f5db923e4c1dcd3b6849b57c))

## [1.25.0-rc.13](https://github.com/pagopa/io-app/compare/1.25.0-rc.12...1.25.0-rc.13) (2021-05-18)


### Features

* **Bonus Pagamenti Digitali:** [[#176801780](https://www.pivotaltracker.com/story/show/176801780)] Avoid Android hardware go back on add payment method ([#3034](https://github.com/pagopa/io-app/issues/3034)) ([323d368](https://github.com/pagopa/io-app/commit/323d368c0e3748ed33d293335b24ada9118256a3))
* [[#177058404](https://www.pivotaltracker.com/story/show/177058404)] Implement amount information on payment success screen ([#2975](https://github.com/pagopa/io-app/issues/2975)) ([56160af](https://github.com/pagopa/io-app/commit/56160af3cbbfc07d679d44ff7654fe1fa771e9e1))


### Bug Fixes

* [[#178157694](https://www.pivotaltracker.com/story/show/178157694)] No transactions done even if there are ([#3046](https://github.com/pagopa/io-app/issues/3046)) ([3871a33](https://github.com/pagopa/io-app/commit/3871a336cd34751b67d140bbb638930107aabe02))
* **Bonus Pagamenti Digitali:** [[IAC-57](https://pagopa.atlassian.net/browse/IAC-57)] Privative displayed as incoming when adding a new payment method during a payment [#3049](https://github.com/pagopa/io-app/issues/3049) ([055795a](https://github.com/pagopa/io-app/commit/055795a33788e6f64912f257cfa4c110f7259e38))
* [[#177534705](https://www.pivotaltracker.com/story/show/177534705)] Fixed header with close button that causes press problems ([#3006](https://github.com/pagopa/io-app/issues/3006)) ([c2f2dc1](https://github.com/pagopa/io-app/commit/c2f2dc1c031ab07f4b5440fe333a9fbd30bb24c0))
* **Payments:** [[#176919872](https://www.pivotaltracker.com/story/show/176919872)] Dismiss keyboard on create credit card ([#3030](https://github.com/pagopa/io-app/issues/3030)) ([e95c621](https://github.com/pagopa/io-app/commit/e95c621b8095f51d6b8622f5ee5734691653edda))


### Chores

* **Bonus Pagamenti Digitali:** [[IAC-62](https://pagopa.atlassian.net/browse/IAC-62)] Add changelog scope for cashback jira project [#3050](https://github.com/pagopa/io-app/issues/3050) ([4c96f51](https://github.com/pagopa/io-app/commit/4c96f51aa671fecf651abf6ed033a70ca6c5ce48))
* **deps:** bump hosted-git-info from 2.8.8 to 2.8.9 ([#3032](https://github.com/pagopa/io-app/issues/3032)) ([b3da6a4](https://github.com/pagopa/io-app/commit/b3da6a407c0151ecd73ce4ba28b4717e09040d2c))
* **deps:** bump lodash from 4.17.20 to 4.17.21 [#3031](https://github.com/pagopa/io-app/issues/3031) ([2f951f0](https://github.com/pagopa/io-app/commit/2f951f0b71e3b6640c358a55eab0f51085e03c85))

## [1.25.0-rc.12](https://github.com/pagopa/io-app/compare/1.25.0-rc.11...1.25.0-rc.12) (2021-05-14)


### Bug Fixes

* [[#178155677](https://www.pivotaltracker.com/story/show/178155677)] Local scheduled notification aren't canceled after login with SPID / CIE ([#3045](https://github.com/pagopa/io-app/issues/3045)) ([e3a5f2b](https://github.com/pagopa/io-app/commit/e3a5f2bbf9466f6d9ae5a8a09474079b1be78d62))

## [1.25.0-rc.11](https://github.com/pagopa/io-app/compare/1.25.0-rc.10...1.25.0-rc.11) (2021-05-13)


### Features

* **Carta Giovani Nazionale:** [[#178020445](https://www.pivotaltracker.com/story/show/178020445)] Implements Tabs for CGN merchant list to show online and places merchants ([#3024](https://github.com/pagopa/io-app/issues/3024)) ([b4a440b](https://github.com/pagopa/io-app/commit/b4a440bfd889b060d0c98d9cb6d7adca974c33cc))


### Bug Fixes

* [[#178141300](https://www.pivotaltracker.com/story/show/178141300)] Profile reducer has a wrong someUpdating state ([#3043](https://github.com/pagopa/io-app/issues/3043)) ([ed9e3c2](https://github.com/pagopa/io-app/commit/ed9e3c2133fe2e941e613cbc20cb33efd7ecfd54))


### Chores

* [[#174150612](https://www.pivotaltracker.com/story/show/174150612)] Upgrade react-native-push-notification ([#3036](https://github.com/pagopa/io-app/issues/3036)) ([4fdff96](https://github.com/pagopa/io-app/commit/4fdff96005b7a24c894077d8f8d56caf8e8f7a43))

## [1.25.0-rc.10](https://github.com/pagopa/io-app/compare/1.25.0-rc.9...1.25.0-rc.10) (2021-05-12)


### Features

* [[#178036707](https://www.pivotaltracker.com/story/show/178036707)] Added profile name capitalization ([#3028](https://github.com/pagopa/io-app/issues/3028)) ([cc7ef36](https://github.com/pagopa/io-app/commit/cc7ef36220574f5805f951bafa518e4f5985198e))


### Bug Fixes

* [[#178070799](https://www.pivotaltracker.com/story/show/178070799)] Allow the addition of Diners cards ([#3039](https://github.com/pagopa/io-app/issues/3039)) ([d0f20f4](https://github.com/pagopa/io-app/commit/d0f20f4aba3195a506244be1eb657f456a7aca34))
* [[#178094151](https://www.pivotaltracker.com/story/show/178094151)] Xcode 12.5 iOS build breaks ([#3035](https://github.com/pagopa/io-app/issues/3035)) ([b1dbd7c](https://github.com/pagopa/io-app/commit/b1dbd7c8ed4f96ec1c5d7aec044330ef86d182ae))
* [[#178129966](https://www.pivotaltracker.com/story/show/178129966)] Cannot deploy a develop build on physical device [#3040](https://github.com/pagopa/io-app/issues/3040) ([6cdc6b4](https://github.com/pagopa/io-app/commit/6cdc6b450b068b24a4d988ac5c446ba83b782a39))


### Chores

* [[#177132354](https://www.pivotaltracker.com/story/show/177132354)] Add lookupID for PM observability ([#3004](https://github.com/pagopa/io-app/issues/3004)) ([e19f73f](https://github.com/pagopa/io-app/commit/e19f73ffbff0d907286a6ba2b33a909f059847ac))
* [[#178106274](https://www.pivotaltracker.com/story/show/178106274)] Remove legacy backend status endpoint ([#3038](https://github.com/pagopa/io-app/issues/3038)) ([d258d46](https://github.com/pagopa/io-app/commit/d258d461749187a2a0140d145d27bd41eeefce44))

## [1.25.0-rc.9](https://github.com/pagopa/io-app/compare/1.25.0-rc.8...1.25.0-rc.9) (2021-05-06)


### Chores

* **Bonus Pagamenti Digitali:** [[#178052788](https://www.pivotaltracker.com/story/show/178052788)] Enable bpd paginated transactions ([#3025](https://github.com/pagopa/io-app/issues/3025)) ([8cdc901](https://github.com/pagopa/io-app/commit/8cdc901ea5c9c592d06376af071cbc9af9a12e75))

## [1.25.0-rc.8](https://github.com/pagopa/io-app/compare/1.25.0-rc.7...1.25.0-rc.8) (2021-05-06)


### Features

* **Bonus Pagamenti Digitali:** [[#176997427](https://www.pivotaltracker.com/story/show/176997427)] Added V-PAY logo for cobadge and credit card ([#3018](https://github.com/pagopa/io-app/issues/3018)) ([deef18d](https://github.com/pagopa/io-app/commit/deef18d9d711f7ffb505bd6f1cbb93632f654852))
* **Bonus Pagamenti Digitali:** [[#177544049](https://www.pivotaltracker.com/story/show/177544049),[#177852497](https://www.pivotaltracker.com/story/show/177852497)] Added paginated loading for cashback transactions ([#2995](https://github.com/pagopa/io-app/issues/2995)) ([c0fe7c0](https://github.com/pagopa/io-app/commit/c0fe7c053ab330368ade89161bdd7d86790f0d44))
* **Bonus Pagamenti Digitali:** [[#177544138](https://www.pivotaltracker.com/story/show/177544138)] Add mixpanel tracking for paginated transaction ([#3012](https://github.com/pagopa/io-app/issues/3012)) ([949d69f](https://github.com/pagopa/io-app/commit/949d69f57faf0e63c7188d80813c66df5d77c23e))
* **Bonus Pagamenti Digitali:** [[#177965778](https://www.pivotaltracker.com/story/show/177965778)] Change "last valid transition" to "last update" in transactions screen ([#3010](https://github.com/pagopa/io-app/issues/3010)) ([1d49dd7](https://github.com/pagopa/io-app/commit/1d49dd7a14bab9685e2b7577dc306227eecca2be))

## [1.25.0-rc.7](https://github.com/pagopa/io-app/compare/1.25.0-rc.6...1.25.0-rc.7) (2021-05-05)


### Features

* [[#177760905](https://www.pivotaltracker.com/story/show/177760905)] Feature logout from identification modal ([#3001](https://github.com/pagopa/io-app/issues/3001)) ([5c32944](https://github.com/pagopa/io-app/commit/5c3294436f55bff288ef259ce634ebf6eacbf602))
* **Bonus Pagamenti Digitali:** [[#175741773](https://www.pivotaltracker.com/story/show/175741773)] Update Mastercard circuit to "Mastercard / Maestro" for cashback transaction detail ([#3013](https://github.com/pagopa/io-app/issues/3013)) ([183955f](https://github.com/pagopa/io-app/commit/183955f585eeaa1cdd2eff5f96840a8ab918a5fa))


### Bug Fixes

* [[#177161429](https://www.pivotaltracker.com/story/show/177161429)] Fixed missing loading on delete credit card ([#2980](https://github.com/pagopa/io-app/issues/2980)) ([38703e7](https://github.com/pagopa/io-app/commit/38703e7cca53f76c32ee39ac19979ba802adf409))
* [[#177905135](https://www.pivotaltracker.com/story/show/177905135)] Fixed wrong font family ([#3005](https://github.com/pagopa/io-app/issues/3005)) ([2678ebd](https://github.com/pagopa/io-app/commit/2678ebdddafe26f5508d752a934ce422b556af27))
* [[#177960813](https://www.pivotaltracker.com/story/show/177960813)] Changelog may contains noise suffixes ([#3007](https://github.com/pagopa/io-app/issues/3007)) ([7fc581f](https://github.com/pagopa/io-app/commit/7fc581f2d11c78a5cd9b1949181ee5be20c837d5))
* grammar error in locales/en/index.yml ([#3016](https://github.com/pagopa/io-app/issues/3016)) ([a5d3aa1](https://github.com/pagopa/io-app/commit/a5d3aa1d5ddae7e09d3ab644f17076bfd25a8f1c))
* Wrong copy for SPID url ([#3015](https://github.com/pagopa/io-app/issues/3015)) ([1c8141a](https://github.com/pagopa/io-app/commit/1c8141a49744ecf8eba41eaf17d70cda78dcf740))


### Chores

* [[#177479598](https://www.pivotaltracker.com/story/show/177479598)] Convert bpdTestOverlay to BetaTestingOverlay as generic component ([#2951](https://github.com/pagopa/io-app/issues/2951)) ([0db36c2](https://github.com/pagopa/io-app/commit/0db36c2162797ffdceaaa68743cc2858469bb54f))
* [[#178001227](https://www.pivotaltracker.com/story/show/178001227)] Upgrade node version to 12 ([#3011](https://github.com/pagopa/io-app/issues/3011)) ([151e541](https://github.com/pagopa/io-app/commit/151e541073179cdb6ee5a5640fb015a8e44ae538))
* Activate local services - staging url ([#3022](https://github.com/pagopa/io-app/issues/3022)) ([c7d3b61](https://github.com/pagopa/io-app/commit/c7d3b614d78f08158125b3e27bbd3ffe034cad77))
* **Bonus Pagamenti Digitali:** [[#176314517](https://www.pivotaltracker.com/story/show/176314517)] Refactoring: backoff reducer ([#3003](https://github.com/pagopa/io-app/issues/3003)) ([e73cf8d](https://github.com/pagopa/io-app/commit/e73cf8d1c1add4fd6a8ba3090c4485cedc138764))
* **Carta Giovani Nazionale:** [[#177367462](https://www.pivotaltracker.com/story/show/177367462)] Implements tests on Eyca Activation worker ([#3002](https://github.com/pagopa/io-app/issues/3002)) ([ec4418a](https://github.com/pagopa/io-app/commit/ec4418add19230f6be04d7b2bc4573fdd6e49541))

## [1.25.0-rc.6](https://github.com/pagopa/io-app/compare/1.25.0-rc.5...1.25.0-rc.6) (2021-04-28)


### Features

* **Bonus Pagamenti Digitali:** [[#177543882](https://www.pivotaltracker.com/story/show/177543882)] Add paginated transactions networking logic ([#2983](https://github.com/pagopa/io-app/issues/2983)) ([f64d21f](https://github.com/pagopa/io-app/commit/f64d21f7ff34041f7407b86941c1e86570fb72f8))
* [[#177760591](https://www.pivotaltracker.com/story/show/177760591)] Added profile name on identification modal ([#2996](https://github.com/pagopa/io-app/issues/2996)) ([c85c1c3](https://github.com/pagopa/io-app/commit/c85c1c30a2fafaa428e4bbeff24891415e55c583))
* [[IRS-3](https://pagopa.atlassian.net/browse/IRS-3)] Services preferences copy update [#3000](https://github.com/pagopa/io-app/issues/3000) ([1f15c9f](https://github.com/pagopa/io-app/commit/1f15c9f5820be608064698ddf7d94a7073239fde))


### Bug Fixes

* [[#177001144](https://www.pivotaltracker.com/story/show/177001144)] Changed latest transactions label when transactions are hidden ([#2999](https://github.com/pagopa/io-app/issues/2999)) ([b76e092](https://github.com/pagopa/io-app/commit/b76e092807221f876297bb8531f35c93f05332cb))
* [[#177536180](https://www.pivotaltracker.com/story/show/177536180)] The logout delay is not handled ([#2990](https://github.com/pagopa/io-app/issues/2990)) ([27b5f52](https://github.com/pagopa/io-app/commit/27b5f52352b3b180f071f915854eb21b1c180341))


### Chores

* [[#177058553](https://www.pivotaltracker.com/story/show/177058553)] Added outcome code message component test ([#2991](https://github.com/pagopa/io-app/issues/2991)) ([f79695c](https://github.com/pagopa/io-app/commit/f79695c0564702f7b7b141d958a7c4bb02236638))
* [[#177696948](https://www.pivotaltracker.com/story/show/177696948)] Remove Services by scope API ([#2973](https://github.com/pagopa/io-app/issues/2973)) ([dc64bfc](https://github.com/pagopa/io-app/commit/dc64bfc2b07c703463636f6d2846360d48b6a0c6))
* [[#177698138](https://www.pivotaltracker.com/story/show/177698138)] Remove services by scope tests ([#2998](https://github.com/pagopa/io-app/issues/2998)) ([c33aee9](https://github.com/pagopa/io-app/commit/c33aee98139039cef96aa679c10f9459bd48d36d))
* [[#177795910](https://www.pivotaltracker.com/story/show/177795910)] Add codecov checksum ([#2988](https://github.com/pagopa/io-app/issues/2988)) ([613b983](https://github.com/pagopa/io-app/commit/613b983989fe2212066c0e82a57d760eba73dde9))

## [1.25.0-rc.5](https://github.com/pagopa/io-app/compare/1.25.0-rc.4...1.25.0-rc.5) (2021-04-22)


### Features

* **Bonus Pagamenti Digitali:** [[#177543245](https://www.pivotaltracker.com/story/show/177543245)] Manage pre-compiled IBAN in technical IBAN case ([#2977](https://github.com/pagopa/io-app/issues/2977)) ([fb5ff74](https://github.com/pagopa/io-app/commit/fb5ff74cfb6f07abe4ce56d2e61bfd6941da065b))
* [[#175800057](https://www.pivotaltracker.com/story/show/175800057),[#176870138](https://www.pivotaltracker.com/story/show/176870138)] Show when credit-card/bancomat/cobadge is expired ([#2982](https://github.com/pagopa/io-app/issues/2982)) ([3dd3c76](https://github.com/pagopa/io-app/commit/3dd3c761f6f176403272d051fda52b8a60a17cc0))
* [[#177795379](https://www.pivotaltracker.com/story/show/177795379)] Removed assistance form web view component [#2989](https://github.com/pagopa/io-app/issues/2989) ([6885b58](https://github.com/pagopa/io-app/commit/6885b587de107375b44697ce82716bf2c612ed6c))


### Bug Fixes

* **Carta Giovani Nazionale:** [[#177777595](https://www.pivotaltracker.com/story/show/177777595)] Accessibility improvements on CGN screens and bottomsheets ([#2992](https://github.com/pagopa/io-app/issues/2992)) ([b4ceda0](https://github.com/pagopa/io-app/commit/b4ceda0cc25cbf4a9952d96f2a550582561e4ccb))
* [[#177270155](https://www.pivotaltracker.com/story/show/177270155)] Improve accessibility flow on add card screen ([#2942](https://github.com/pagopa/io-app/issues/2942)) ([3eefc1b](https://github.com/pagopa/io-app/commit/3eefc1b91f5c528b6e5343ebf64277bbe2642fca))


### Chores

* [[#177560087](https://www.pivotaltracker.com/story/show/177560087)] Changed pick psp screen UI ([#2954](https://github.com/pagopa/io-app/issues/2954)) ([dfe7310](https://github.com/pagopa/io-app/commit/dfe7310c68057194dc0ee1138815d83083f95ee4))

## [1.25.0-rc.4](https://github.com/pagopa/io-app/compare/1.25.0-rc.3...1.25.0-rc.4) (2021-04-19)

## [1.25.0-rc.3](https://github.com/pagopa/io-app/compare/1.25.0-rc.2...1.25.0-rc.3) (2021-04-19)

## [1.25.0-rc.2](https://github.com/pagopa/io-app/compare/1.25.0-rc.1...1.25.0-rc.2) (2021-04-19)


### Features

* **Bonus Pagamenti Digitali:** [[#177542720](https://www.pivotaltracker.com/story/show/177542720)] Add technical iban information to mixpanel ([#2978](https://github.com/pagopa/io-app/issues/2978)) ([37d2274](https://github.com/pagopa/io-app/commit/37d2274f3627b1cd78e8bc43e79f9a3bbdfcf418))

## [1.25.0-rc.1](https://github.com/pagopa/io-app/compare/1.25.0-rc.0...1.25.0-rc.1) (2021-04-19)


### Features

* **Bonus Pagamenti Digitali:** [[#177542335](https://www.pivotaltracker.com/story/show/177542335)] Citizen v2 api integration ([#2969](https://github.com/pagopa/io-app/issues/2969)) ([dd277b7](https://github.com/pagopa/io-app/commit/dd277b78ea380184ad92388b44c254bbb4d47105))
* **Bonus Pagamenti Digitali:** [[#177542840](https://www.pivotaltracker.com/story/show/177542840)] Show technical IBAN information ([#2974](https://github.com/pagopa/io-app/issues/2974)) ([53d6f86](https://github.com/pagopa/io-app/commit/53d6f86178a6fedecfcbf8ab4cf21f06edd22827))
* **Bonus Pagamenti Digitali:** [[#177740790](https://www.pivotaltracker.com/story/show/177740790)] Actions & store definiton for paginated transactions ([#2972](https://github.com/pagopa/io-app/issues/2972)) ([fa958cc](https://github.com/pagopa/io-app/commit/fa958cc7c6a8915293ee59619e4e8e6f013b051a))


### Bug Fixes

* [[#177606620](https://www.pivotaltracker.com/story/show/177606620)] Buttons inside BottomSheets are not pressable on Android ([#2985](https://github.com/pagopa/io-app/issues/2985)) ([3ea895d](https://github.com/pagopa/io-app/commit/3ea895db4208d3fc4561902dfad1fe1da149fe19))
* [[#177775588](https://www.pivotaltracker.com/story/show/177775588)] Customer care working hours update [#2984](https://github.com/pagopa/io-app/issues/2984) ([aa7add5](https://github.com/pagopa/io-app/commit/aa7add58cf4b0e407ec94a58b89d8a3698809870))

## [1.25.0-rc.0](https://github.com/pagopa/io-app/compare/1.24.0-rc.8...1.25.0-rc.0) (2021-04-14)


### Features

* [[#177386218](https://www.pivotaltracker.com/story/show/177386218)] Remove transaction dynamic header on wallet screen [#2966](https://github.com/pagopa/io-app/issues/2966) ([f6454af](https://github.com/pagopa/io-app/commit/f6454af463fb196df8a2b56a286c032c61012846))
* **Bonus Pagamenti Digitali:** [[#177542335](https://www.pivotaltracker.com/story/show/177542335),[#177543882](https://www.pivotaltracker.com/story/show/177543882)] Add code generation for citizen and winning_transaction v2 api ([#2968](https://github.com/pagopa/io-app/issues/2968)) ([817ffc3](https://github.com/pagopa/io-app/commit/817ffc3bffe176cd49d8dd11515c1f061783eb10))
* **Carta Giovani Nazionale:** [[#177458070](https://www.pivotaltracker.com/story/show/177458070)] Bonuses Available list now follows the same logic of bonuses in carousel ([#2960](https://github.com/pagopa/io-app/issues/2960)) ([2769d72](https://github.com/pagopa/io-app/commit/2769d72abce758b487a8cd5162811d655eb9b3e3))
* [[#177590245](https://www.pivotaltracker.com/story/show/177590245)] Added new component to shown assistance form in web view ([#2959](https://github.com/pagopa/io-app/issues/2959)) ([9e83ca4](https://github.com/pagopa/io-app/commit/9e83ca44351c049f7d41e3d60b8f960aa50944fe))


### Bug Fixes

* [[#177314796](https://www.pivotaltracker.com/story/show/177314796)] Starting blank space on link "update your preferences" ([#2963](https://github.com/pagopa/io-app/issues/2963)) ([44c9a46](https://github.com/pagopa/io-app/commit/44c9a4681ddab2a2b846f1c69ecdcc14ddaefcf3))
* **Carta Giovani Nazionale:** [[#177481627](https://www.pivotaltracker.com/story/show/177481627)] In case of EYCA Activation status is in final status activation doesn't start ([#2955](https://github.com/pagopa/io-app/issues/2955)) ([b786ded](https://github.com/pagopa/io-app/commit/b786ded5b653ae9ea20c22eedf0f68e0eac55a83))


### Chores

* [[#177137610](https://www.pivotaltracker.com/story/show/177137610)] Remove button bug that open instabug in service home screen ([#2964](https://github.com/pagopa/io-app/issues/2964)) ([04a59e2](https://github.com/pagopa/io-app/commit/04a59e21d8ece807bb196e0cb4ec5b2791d83aae))
* [[#177695356](https://www.pivotaltracker.com/story/show/177695356)] Upgrade cocoapods to version 1.10.1 ([#2971](https://github.com/pagopa/io-app/issues/2971)) ([55e6253](https://github.com/pagopa/io-app/commit/55e6253022112c14094f47fec577aed75fbfb890))
* **Carta Giovani Nazionale:** [[#177441837](https://www.pivotaltracker.com/story/show/177441837),[#177322409](https://www.pivotaltracker.com/story/show/177322409)] Implements Unit tests on EycaDetailComponent and CgnCardComponent ([#2970](https://github.com/pagopa/io-app/issues/2970)) ([16f2fdf](https://github.com/pagopa/io-app/commit/16f2fdf266296b146eacc4328f33013218af84aa))

## [1.24.0-rc.8](https://github.com/pagopa/io-app/compare/1.24.0-rc.7...1.24.0-rc.8) (2021-04-08)

## [1.24.0-rc.7](https://github.com/pagopa/io-app/compare/1.24.0-rc.6...1.24.0-rc.7) (2021-04-07)

## [1.24.0-rc.6](https://github.com/pagopa/io-app/compare/1.24.0-rc.5...1.24.0-rc.6) (2021-04-07)

## [1.24.0-rc.5](https://github.com/pagopa/io-app/compare/1.24.0-rc.3...1.24.0-rc.5) (2021-04-07)


### Chores

* **release:** 1.24.0-rc.4 ([31d8196](https://github.com/pagopa/io-app/commit/31d81967abded847a4cc7dff1c2d52ab0b8db041))

## [1.24.0-rc.4](https://github.com/pagopa/io-app/compare/1.24.0-rc.3...1.24.0-rc.4) (2021-04-07)

## [1.24.0-rc.3](https://github.com/pagopa/io-app/compare/1.24.0-rc.1...1.24.0-rc.3) (2021-04-07)


### Features

* [[#175894877](https://www.pivotaltracker.com/story/show/175894877)] refactor pick payment method ([#2926](https://github.com/pagopa/io-app/issues/2926)) ([10a7ec1](https://github.com/pagopa/io-app/commit/10a7ec15a273999c9be96237117565a7b021874e))
* **Bonus Pagamenti Digitali:** [[#176781159](https://www.pivotaltracker.com/story/show/176781159)] Manage error and loading state for the abi list when start co-badge onboarding workflow ([#2940](https://github.com/pagopa/io-app/issues/2940)) ([b85831f](https://github.com/pagopa/io-app/commit/b85831fe7a6c1029d1b158dc1dcadc87f4ca49a1))
* **Bonus Pagamenti Digitali:** [[#176925463](https://www.pivotaltracker.com/story/show/176925463)] Tracks action to notify the possibility to add a co-badge to the user ([#2952](https://github.com/pagopa/io-app/issues/2952)) ([d30237b](https://github.com/pagopa/io-app/commit/d30237bdc03765c2099cfe3f613251f8abf9ac6a))
* **Bonus Pagamenti Digitali:** [[#177434959](https://www.pivotaltracker.com/story/show/177434959)] Start co-badge flow from add credit card screen ([#2931](https://github.com/pagopa/io-app/issues/2931)) ([42ff757](https://github.com/pagopa/io-app/commit/42ff7579f36a23fd95c0af5459eba96f6114bdbf))
* **Carta Giovani Nazionale:** [[#177479621](https://www.pivotaltracker.com/story/show/177479621)] Disables CGN Feature Flags ([#2937](https://github.com/pagopa/io-app/issues/2937)) ([96ee908](https://github.com/pagopa/io-app/commit/96ee9086851efb55bf129366705a661fb7b94b0f))
* **Payments:** [[#177548187](https://www.pivotaltracker.com/story/show/177548187)] Add credit card / payment webview closing reason ([#2958](https://github.com/pagopa/io-app/issues/2958)) ([90ef10b](https://github.com/pagopa/io-app/commit/90ef10b50887030c450aee764e95b72973566834))


### Bug Fixes

* [[#172097711](https://www.pivotaltracker.com/story/show/172097711),[#172935224](https://www.pivotaltracker.com/story/show/172935224)] On some iOS devices a white screen is shown after biometric authentication ([#2939](https://github.com/pagopa/io-app/issues/2939)) ([5138228](https://github.com/pagopa/io-app/commit/51382281a2c91a200c0ff50eb62a7d03527689b5))
* **Bonus Pagamenti Digitali:** [[#177511360](https://www.pivotaltracker.com/story/show/177511360)] Wrong rendering of privative loyalty logo in cashback transaction detail bottomsheet [#2946](https://github.com/pagopa/io-app/issues/2946) ([8cc449b](https://github.com/pagopa/io-app/commit/8cc449be0801ecf3b6a9da5c69194f934cc506e3))
* [[#173031364](https://www.pivotaltracker.com/story/show/173031364)] The request to abort a payment is never sent ([#2933](https://github.com/pagopa/io-app/issues/2933)) ([9b6a940](https://github.com/pagopa/io-app/commit/9b6a940a363354271469c55ef97140e6967f6a07))
* [[#175535051](https://www.pivotaltracker.com/story/show/175535051)] fixes offset scroller for messages (iphone 7) ([#2791](https://github.com/pagopa/io-app/issues/2791)) ([8c69b54](https://github.com/pagopa/io-app/commit/8c69b54e8f53cc8b09509deb7cb9ed093b4f225d))
* **Carta Giovani Nazionale:** [[#177485208](https://www.pivotaltracker.com/story/show/177485208)] Hardware back button doesn't work on CGN Detail screen [#2957](https://github.com/pagopa/io-app/issues/2957) ([3864c1b](https://github.com/pagopa/io-app/commit/3864c1ba018b170af284a7415efac9196ddfa7c6))
* **Carta Giovani Nazionale:** [[#177490914](https://www.pivotaltracker.com/story/show/177490914)] Discount bottom sheet title doesn't break line [#2956](https://github.com/pagopa/io-app/issues/2956) ([ba35c0c](https://github.com/pagopa/io-app/commit/ba35c0ce8a87a8467fefda6328fef2d2520d02cc))
* **Carta Giovani Nazionale:** [[#177490938](https://www.pivotaltracker.com/story/show/177490938)] Success Screen pictogram results cut on the bottom ([#2938](https://github.com/pagopa/io-app/issues/2938)) ([146a197](https://github.com/pagopa/io-app/commit/146a197a370c3f633665f357247749999acb4156))
* **Carta Giovani Nazionale:** [[#177577081](https://www.pivotaltracker.com/story/show/177577081)] CGN Card component shows wrong border ([#2950](https://github.com/pagopa/io-app/issues/2950)) ([83da2b0](https://github.com/pagopa/io-app/commit/83da2b0bec2cb267740eaaa8f2e8ab9c66b0f434))


### Chores

* [[#177137637](https://www.pivotaltracker.com/story/show/177137637)] Show services status banner in any rendering state ([#2929](https://github.com/pagopa/io-app/issues/2929)) ([e7dd9bb](https://github.com/pagopa/io-app/commit/e7dd9bb31a4733a6fec5bfa9734474c7378cfa71))
* [[#177288211](https://www.pivotaltracker.com/story/show/177288211)] Move organization logo to the right side for the services item ([#2944](https://github.com/pagopa/io-app/issues/2944)) ([6861ab9](https://github.com/pagopa/io-app/commit/6861ab997a2a7f1a1fdf167ef37b61cae39d2989))
* [[#177458092](https://www.pivotaltracker.com/story/show/177458092)] Support Jira ticket key in the PR title ([#2935](https://github.com/pagopa/io-app/issues/2935)) ([ff7601a](https://github.com/pagopa/io-app/commit/ff7601aa8dd38e7ed562b9161e906f7a92577dc7))
* [[#177506546](https://www.pivotaltracker.com/story/show/177506546)] Remove false positive from urls check ([#2941](https://github.com/pagopa/io-app/issues/2941)) ([db6654f](https://github.com/pagopa/io-app/commit/db6654fd7973fcd466e64c6ade44f75e42bc1248))
* **Bonus Pagamenti Digitali:** [[#177542266](https://www.pivotaltracker.com/story/show/177542266)] Add technical iban feature flag ([#2961](https://github.com/pagopa/io-app/issues/2961)) ([ac6e9ef](https://github.com/pagopa/io-app/commit/ac6e9ef811711a60d8f6cc5733051bb5c2b07788))
* **Bonus Pagamenti Digitali:** [[#177543860](https://www.pivotaltracker.com/story/show/177543860)] Add transactions paging feature flag ([#2947](https://github.com/pagopa/io-app/issues/2947)) ([2ad3755](https://github.com/pagopa/io-app/commit/2ad37557a4e028d776cfb2f3c9d46b9a6a16ab06))
* [[#177560562](https://www.pivotaltracker.com/story/show/177560562)] Close NFC dialog when card is successfully read ([#2948](https://github.com/pagopa/io-app/issues/2948)) ([7859770](https://github.com/pagopa/io-app/commit/78597708d61a76ccdbc3dbe9fc8daaa1d6193818))

## [1.24.0-rc.1](https://github.com/pagopa/io-app/compare/1.24.0-rc.0...1.24.0-rc.1) (2021-03-24)


### Features

* **Carta Giovani Nazionale:** [[#177479621](https://www.pivotaltracker.com/story/show/177479621)] Enables CGN Feature Flags [#2936](https://github.com/pagopa/io-app/issues/2936) ([dd3d439](https://github.com/pagopa/io-app/commit/dd3d43960992bef3db7c17bfef20982d6e4a6e53))


### Chores

* **Carta Giovani Nazionale:** [[#177461712](https://www.pivotaltracker.com/story/show/177461712)] Introduces the CGN Test overlay information ([#2934](https://github.com/pagopa/io-app/issues/2934)) ([a877448](https://github.com/pagopa/io-app/commit/a877448078c2062faee245e210a8ae9a221042e4))

## [1.24.0-rc.0](https://github.com/pagopa/io-app/compare/1.23.0-rc.5...1.24.0-rc.0) (2021-03-23)


### Features

* **Bonus Pagamenti Digitali:** [[#177144320](https://www.pivotaltracker.com/story/show/177144320),[#177144482](https://www.pivotaltracker.com/story/show/177144482)] Insert privative card number ([#2905](https://github.com/pagopa/io-app/issues/2905)) ([d52a9ae](https://github.com/pagopa/io-app/commit/d52a9ae2ee5c4e2a23df31c390aeaf5e0cc64654))
* **Bonus Pagamenti Digitali:** [[#177144429](https://www.pivotaltracker.com/story/show/177144429)] Add mixpanel tracking for privative workflow ([#2903](https://github.com/pagopa/io-app/issues/2903)) ([a68198a](https://github.com/pagopa/io-app/commit/a68198ac41ed954e9b1505e95f168f950ea456dc))
* **Bonus Pagamenti Digitali:** [[#177144784](https://www.pivotaltracker.com/story/show/177144784)] Add privative card to wallet screen ([#2916](https://github.com/pagopa/io-app/issues/2916)) ([d8cd34c](https://github.com/pagopa/io-app/commit/d8cd34c0e3106b517b7da0fd998666fa760b4a7f))
* **Bonus Pagamenti Digitali:** [[#177244740](https://www.pivotaltracker.com/story/show/177244740)] In the "co-badge add card to wallet" screen, the disclaimer bold text now does not always wrap [#2911](https://github.com/pagopa/io-app/issues/2911) ([7315b64](https://github.com/pagopa/io-app/commit/7315b64346a486af4070186e7f27a356b0d3231c))
* **Bonus Pagamenti Digitali:** [[#177306957](https://www.pivotaltracker.com/story/show/177306957)] Add ko service error screen ([#2904](https://github.com/pagopa/io-app/issues/2904)) ([f7276c6](https://github.com/pagopa/io-app/commit/f7276c683cd60e5819fad9b323d26641d3220a27))
* **Bonus Pagamenti Digitali:** [[#177338693](https://www.pivotaltracker.com/story/show/177338693)] Changed style for close button in PrivativeIssuerKoDisabled ([#2909](https://github.com/pagopa/io-app/issues/2909)) ([af2a860](https://github.com/pagopa/io-app/commit/af2a8607df8c8f7938cbe5115d2482c6d7d22797))
* **Bonus Pagamenti Digitali:** [[#177339683](https://www.pivotaltracker.com/story/show/177339683)] Revert change test config [#2900](https://github.com/pagopa/io-app/issues/2900) ([cae0a0b](https://github.com/pagopa/io-app/commit/cae0a0bd572bc6303a1d850b96f641dd8bc9099e))
* **Bonus Pagamenti Digitali:** [[#177362328](https://www.pivotaltracker.com/story/show/177362328)] Update loyalty logo size for privative card & privative wallet card preview [#2907](https://github.com/pagopa/io-app/issues/2907) ([27f6b09](https://github.com/pagopa/io-app/commit/27f6b09db73c5f328da8a007629a6d97790135a4))
* **Bonus Pagamenti Digitali:** [[#177366768](https://www.pivotaltracker.com/story/show/177366768)] Changed the blurred pan representation for all the wallet components ([#2919](https://github.com/pagopa/io-app/issues/2919)) ([6b9411c](https://github.com/pagopa/io-app/commit/6b9411c8b9cbed1146006dc20dcc2f4e82bf0c9f))
* **Bonus Pagamenti Digitali:** [[#177378510](https://www.pivotaltracker.com/story/show/177378510)] Add failure handling to workunit ([#2923](https://github.com/pagopa/io-app/issues/2923)) ([375d681](https://github.com/pagopa/io-app/commit/375d6813233f0d4dd68794a755ab8af7d5bc52ee))
* **Bonus Pagamenti Digitali:** [[#177398006](https://www.pivotaltracker.com/story/show/177398006)] Change copy and cta text for PrivativeKoNotFound ([#2918](https://github.com/pagopa/io-app/issues/2918)) ([1c98a49](https://github.com/pagopa/io-app/commit/1c98a49b0faa571a61cdc214c20df20ab290ac7a))
* **Carta Giovani Nazionale:** [[#176655458](https://www.pivotaltracker.com/story/show/176655458)] Enables CGN Activation CTA from message/service detail ([#2893](https://github.com/pagopa/io-app/issues/2893)) ([bd89a32](https://github.com/pagopa/io-app/commit/bd89a327caad410a18807b802b4fb90d5a786475))
* **Carta Giovani Nazionale:** [[#176715099](https://www.pivotaltracker.com/story/show/176715099)] Introduces the CGN folded card for wallet preview ([#2898](https://github.com/pagopa/io-app/issues/2898)) ([3492261](https://github.com/pagopa/io-app/commit/349226119e98b714f93d10960ddaca86aa3f60da))
* **Carta Giovani Nazionale:** [[#176959164](https://www.pivotaltracker.com/story/show/176959164),[#177266269](https://www.pivotaltracker.com/story/show/177266269)] Add analytics on cgn flow ([#2887](https://github.com/pagopa/io-app/issues/2887)) ([a445fda](https://github.com/pagopa/io-app/commit/a445fdad70e360fceab761476e018014cc8c6ea4))
* **Carta Giovani Nazionale:** [[#176959393](https://www.pivotaltracker.com/story/show/176959393),[#177244360](https://www.pivotaltracker.com/story/show/177244360)] Implements the screen to request and copy for an OTP code related to the CGN ([#2908](https://github.com/pagopa/io-app/issues/2908)) ([f7aa17a](https://github.com/pagopa/io-app/commit/f7aa17afa153399d4dd23e0fc8c130f87db38007))
* **Carta Giovani Nazionale:** [[#177062520](https://www.pivotaltracker.com/story/show/177062520),[#177062719](https://www.pivotaltracker.com/story/show/177062719)] Add start/status Eyca API requests implementation, actions, reduces and saga logic ([#2855](https://github.com/pagopa/io-app/issues/2855)) ([6cf8848](https://github.com/pagopa/io-app/commit/6cf88487d63f80ea111dda3d53bd0db7d6a680f4))
* **Carta Giovani Nazionale:** [[#177063605](https://www.pivotaltracker.com/story/show/177063605)] Introduces EYCA status informations ([#2867](https://github.com/pagopa/io-app/issues/2867)) ([ff6da94](https://github.com/pagopa/io-app/commit/ff6da9430999317848586a32d1f3efe623fce164))
* **Carta Giovani Nazionale:** [[#177115055](https://www.pivotaltracker.com/story/show/177115055)] Adds the workflow to retry EYCA activation in case of Error or missing EYCA information for CGN ([#2872](https://github.com/pagopa/io-app/issues/2872)) ([485d194](https://github.com/pagopa/io-app/commit/485d19452cfe9b46ae2802b8859f19670632e5bf))
* **Carta Giovani Nazionale:** [[#177163732](https://www.pivotaltracker.com/story/show/177163732)] Introduces EYCA information and discounts bottom sheet ([#2870](https://github.com/pagopa/io-app/issues/2870)) ([4ecf35c](https://github.com/pagopa/io-app/commit/4ecf35cb21971c1337a22ba522ff64effa7bb552))
* **Carta Giovani Nazionale:** [[#177386642](https://www.pivotaltracker.com/story/show/177386642),[#177367453](https://www.pivotaltracker.com/story/show/177367453)] Missing loading transition on CGN Detail Screen [#2920](https://github.com/pagopa/io-app/issues/2920) ([4b5ec8d](https://github.com/pagopa/io-app/commit/4b5ec8d9c93285ad52c34d94acd4b7829168717d))
* **Payments:** [[#176176928](https://www.pivotaltracker.com/story/show/176176928)] Add a switch to set payment method as favorite ([#2930](https://github.com/pagopa/io-app/issues/2930)) ([a20339b](https://github.com/pagopa/io-app/commit/a20339b2932e6e9c29c8c3b12e5d7bac68beba40))
* [[#175898227](https://www.pivotaltracker.com/story/show/175898227)] Add delete button to credit card detail screen ([#2917](https://github.com/pagopa/io-app/issues/2917)) ([cd5da16](https://github.com/pagopa/io-app/commit/cd5da16a87ef0f8ae0927884dacd005bba125900))


### Bug Fixes

* [[#176740861](https://www.pivotaltracker.com/story/show/176740861)] Remove from store/readState a not found service ([#2868](https://github.com/pagopa/io-app/issues/2868)) ([64c4a41](https://github.com/pagopa/io-app/commit/64c4a41132982cabe314b4df636a8796beaa4cd9))
* **Bonus Pagamenti Digitali:** [[#176781020](https://www.pivotaltracker.com/story/show/176781020)] Satispay circuit is displayed incorrectly in the cashback transaction detail bottom sheet ([#2921](https://github.com/pagopa/io-app/issues/2921)) ([31e6377](https://github.com/pagopa/io-app/commit/31e6377caf51a7c2c4f5ee4556eac656529f1e50))
* **Bonus Pagamenti Digitali:** [[#177357472](https://www.pivotaltracker.com/story/show/177357472)] Wrong decode during the add of a new privative card to the wallet ([#2902](https://github.com/pagopa/io-app/issues/2902)) ([0ac7d0c](https://github.com/pagopa/io-app/commit/0ac7d0c487ab4d1456ce966ddccc0988085702bc))
* **Bonus Pagamenti Digitali:** [[#177368806](https://www.pivotaltracker.com/story/show/177368806)] Wrong align for the bottom-left text of the privative & cobadge cards ([#2910](https://github.com/pagopa/io-app/issues/2910)) ([d0dc2b3](https://github.com/pagopa/io-app/commit/d0dc2b3eb507f03b9832bc6c9551b7ffc016cc95))
* **Bonus Pagamenti Digitali:** [[#177378257](https://www.pivotaltracker.com/story/show/177378257)] When viewing the details of a bpd transaction with a cashback value equal to 0, the warning on the maximum value reached is displayed  ([#2914](https://github.com/pagopa/io-app/issues/2914)) ([485492d](https://github.com/pagopa/io-app/commit/485492da4fb78fa4c042a7ed35513ff20e81a665))
* **Carta Giovani Nazionale:** [[#177367873](https://www.pivotaltracker.com/story/show/177367873)] Transactions header in wallet home shows before the required scroll position if CGN informations are available [#2913](https://github.com/pagopa/io-app/issues/2913) ([2fc53f8](https://github.com/pagopa/io-app/commit/2fc53f8a09338dcb360ebf8e0c7b4174514c11de))
* **Carta Giovani Nazionale:** [[#177385897](https://www.pivotaltracker.com/story/show/177385897)] CGN Details doesn't load automatically when activation is completed [#2915](https://github.com/pagopa/io-app/issues/2915) ([9040e89](https://github.com/pagopa/io-app/commit/9040e89ae5702ce0b68fdb247906fc69fd16ff25))
* **Carta Giovani Nazionale:** [[#177419110](https://www.pivotaltracker.com/story/show/177419110)] If we receive an error after a right result the CGN detail screen show an inconsistent result ([#2927](https://github.com/pagopa/io-app/issues/2927)) ([f24c9a1](https://github.com/pagopa/io-app/commit/f24c9a1b6ab79f0f29cb0182ffb953532ce88f2c))
* **Carta Giovani Nazionale:** [[#177455388](https://www.pivotaltracker.com/story/show/177455388)] Footer text on CGN information screen shows the wrong text referring to Cashback ([#2932](https://github.com/pagopa/io-app/issues/2932)) ([e21866c](https://github.com/pagopa/io-app/commit/e21866c58b554217a389a82b6624ae8207f49f08))


### Chores

* [[#176918290](https://www.pivotaltracker.com/story/show/176918290)] Check broken urls in *.tsx files ([#2818](https://github.com/pagopa/io-app/issues/2818)) ([6e44188](https://github.com/pagopa/io-app/commit/6e44188bdb26635c15ac633f0fbe34ce00a5422a))
* [[#176941075](https://www.pivotaltracker.com/story/show/176941075)] Added mixpanel tracking for color scheme ([#2901](https://github.com/pagopa/io-app/issues/2901)) ([fe6a66d](https://github.com/pagopa/io-app/commit/fe6a66d38058bc0dbf74312452a503c27909ffc0))
* [[#177320696](https://www.pivotaltracker.com/story/show/177320696)] Update services web url ([#2897](https://github.com/pagopa/io-app/issues/2897)) ([96d763e](https://github.com/pagopa/io-app/commit/96d763ee71223528382bbf646cebe2010a0bacfa))
* Increase run-tests performance on CircleCI ([#2906](https://github.com/pagopa/io-app/issues/2906)) ([ece9a83](https://github.com/pagopa/io-app/commit/ece9a83bd7ee931a98b2b9dcbfc46179b6442c57))
* **Bonus Pagamenti Digitali:** [[#177140866](https://www.pivotaltracker.com/story/show/177140866)] Remove privative feature flag ([#2912](https://github.com/pagopa/io-app/issues/2912)) ([3fc099b](https://github.com/pagopa/io-app/commit/3fc099b26284d043690a618136c72cbe2ee95b1c))
* **Carta Giovani Nazionale:** [[#177142013](https://www.pivotaltracker.com/story/show/177142013)] Adds UI Fixes to CgnDetailScreen and removes unnecessary component and tests ([#2857](https://github.com/pagopa/io-app/issues/2857)) ([9cc6064](https://github.com/pagopa/io-app/commit/9cc6064f73e4c5de1e87a26759826384b9b623af))
* **Carta Giovani Nazionale:** [[#177403331](https://www.pivotaltracker.com/story/show/177403331)] Adds the missing CGN action for analytics purposes ([#2925](https://github.com/pagopa/io-app/issues/2925)) ([34be805](https://github.com/pagopa/io-app/commit/34be80515a5c94745f511a979a38164e7d703bfd))
* **Carta Giovani Nazionale:** [[#177437163](https://www.pivotaltracker.com/story/show/177437163)] Fixes mocked merchant for internal beta ([#2928](https://github.com/pagopa/io-app/issues/2928)) ([1a7f420](https://github.com/pagopa/io-app/commit/1a7f42084a62f77548f564cb3126d80701cba973))
* **release:** 1.23.0-rc.6 ([95374a6](https://github.com/pagopa/io-app/commit/95374a6ce6c66ca6c6791c600fb5132e762cc28d))

## [1.23.0-rc.6](https://github.com/pagopa/io-app/compare/1.23.0-rc.5...1.23.0-rc.6) (2021-03-19)


### Features

* **Bonus Pagamenti Digitali:** [[#177144320](https://www.pivotaltracker.com/story/show/177144320),[#177144482](https://www.pivotaltracker.com/story/show/177144482)] Insert privative card number ([#2905](https://github.com/pagopa/io-app/issues/2905)) ([d52a9ae](https://github.com/pagopa/io-app/commit/d52a9ae2ee5c4e2a23df31c390aeaf5e0cc64654))
* **Bonus Pagamenti Digitali:** [[#177144429](https://www.pivotaltracker.com/story/show/177144429)] Add mixpanel tracking for privative workflow ([#2903](https://github.com/pagopa/io-app/issues/2903)) ([a68198a](https://github.com/pagopa/io-app/commit/a68198ac41ed954e9b1505e95f168f950ea456dc))
* **Bonus Pagamenti Digitali:** [[#177144784](https://www.pivotaltracker.com/story/show/177144784)] Add privative card to wallet screen ([#2916](https://github.com/pagopa/io-app/issues/2916)) ([d8cd34c](https://github.com/pagopa/io-app/commit/d8cd34c0e3106b517b7da0fd998666fa760b4a7f))
* **Bonus Pagamenti Digitali:** [[#177244740](https://www.pivotaltracker.com/story/show/177244740)] In the "co-badge add card to wallet" screen, the disclaimer bold text now does not always wrap [#2911](https://github.com/pagopa/io-app/issues/2911) ([7315b64](https://github.com/pagopa/io-app/commit/7315b64346a486af4070186e7f27a356b0d3231c))
* **Bonus Pagamenti Digitali:** [[#177306957](https://www.pivotaltracker.com/story/show/177306957)] Add ko service error screen ([#2904](https://github.com/pagopa/io-app/issues/2904)) ([f7276c6](https://github.com/pagopa/io-app/commit/f7276c683cd60e5819fad9b323d26641d3220a27))
* **Bonus Pagamenti Digitali:** [[#177338693](https://www.pivotaltracker.com/story/show/177338693)] Changed style for close button in PrivativeIssuerKoDisabled ([#2909](https://github.com/pagopa/io-app/issues/2909)) ([af2a860](https://github.com/pagopa/io-app/commit/af2a8607df8c8f7938cbe5115d2482c6d7d22797))
* **Bonus Pagamenti Digitali:** [[#177339683](https://www.pivotaltracker.com/story/show/177339683)] Revert change test config [#2900](https://github.com/pagopa/io-app/issues/2900) ([cae0a0b](https://github.com/pagopa/io-app/commit/cae0a0bd572bc6303a1d850b96f641dd8bc9099e))
* **Bonus Pagamenti Digitali:** [[#177362328](https://www.pivotaltracker.com/story/show/177362328)] Update loyalty logo size for privative card & privative wallet card preview [#2907](https://github.com/pagopa/io-app/issues/2907) ([27f6b09](https://github.com/pagopa/io-app/commit/27f6b09db73c5f328da8a007629a6d97790135a4))
* **Bonus Pagamenti Digitali:** [[#177366768](https://www.pivotaltracker.com/story/show/177366768)] Changed the blurred pan representation for all the wallet components ([#2919](https://github.com/pagopa/io-app/issues/2919)) ([6b9411c](https://github.com/pagopa/io-app/commit/6b9411c8b9cbed1146006dc20dcc2f4e82bf0c9f))
* **Bonus Pagamenti Digitali:** [[#177398006](https://www.pivotaltracker.com/story/show/177398006)] Change copy and cta text for PrivativeKoNotFound ([#2918](https://github.com/pagopa/io-app/issues/2918)) ([1c98a49](https://github.com/pagopa/io-app/commit/1c98a49b0faa571a61cdc214c20df20ab290ac7a))
* **Carta Giovani Nazionale:** [[#176655458](https://www.pivotaltracker.com/story/show/176655458)] Enables CGN Activation CTA from message/service detail ([#2893](https://github.com/pagopa/io-app/issues/2893)) ([bd89a32](https://github.com/pagopa/io-app/commit/bd89a327caad410a18807b802b4fb90d5a786475))
* **Carta Giovani Nazionale:** [[#176715099](https://www.pivotaltracker.com/story/show/176715099)] Introduces the CGN folded card for wallet preview ([#2898](https://github.com/pagopa/io-app/issues/2898)) ([3492261](https://github.com/pagopa/io-app/commit/349226119e98b714f93d10960ddaca86aa3f60da))
* **Carta Giovani Nazionale:** [[#176959164](https://www.pivotaltracker.com/story/show/176959164),[#177266269](https://www.pivotaltracker.com/story/show/177266269)] Add analytics on cgn flow ([#2887](https://github.com/pagopa/io-app/issues/2887)) ([a445fda](https://github.com/pagopa/io-app/commit/a445fdad70e360fceab761476e018014cc8c6ea4))
* **Carta Giovani Nazionale:** [[#176959393](https://www.pivotaltracker.com/story/show/176959393),[#177244360](https://www.pivotaltracker.com/story/show/177244360)] Implements the screen to request and copy for an OTP code related to the CGN ([#2908](https://github.com/pagopa/io-app/issues/2908)) ([f7aa17a](https://github.com/pagopa/io-app/commit/f7aa17afa153399d4dd23e0fc8c130f87db38007))
* **Carta Giovani Nazionale:** [[#177062520](https://www.pivotaltracker.com/story/show/177062520),[#177062719](https://www.pivotaltracker.com/story/show/177062719)] Add start/status Eyca API requests implementation, actions, reduces and saga logic ([#2855](https://github.com/pagopa/io-app/issues/2855)) ([6cf8848](https://github.com/pagopa/io-app/commit/6cf88487d63f80ea111dda3d53bd0db7d6a680f4))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#177357472](https://www.pivotaltracker.com/story/show/177357472)] Wrong decode during the add of a new privative card to the wallet ([#2902](https://github.com/pagopa/io-app/issues/2902)) ([0ac7d0c](https://github.com/pagopa/io-app/commit/0ac7d0c487ab4d1456ce966ddccc0988085702bc))
* [[#176740861](https://www.pivotaltracker.com/story/show/176740861)] Remove from store/readState a not found service ([#2868](https://github.com/pagopa/io-app/issues/2868)) ([64c4a41](https://github.com/pagopa/io-app/commit/64c4a41132982cabe314b4df636a8796beaa4cd9))
* **Bonus Pagamenti Digitali:** [[#177368806](https://www.pivotaltracker.com/story/show/177368806)] Wrong align for the bottom-left text of the privative & cobadge cards ([#2910](https://github.com/pagopa/io-app/issues/2910)) ([d0dc2b3](https://github.com/pagopa/io-app/commit/d0dc2b3eb507f03b9832bc6c9551b7ffc016cc95))
* **Bonus Pagamenti Digitali:** [[#177378257](https://www.pivotaltracker.com/story/show/177378257)] When viewing the details of a bpd transaction with a cashback value equal to 0, the warning on the maximum value reached is displayed  ([#2914](https://github.com/pagopa/io-app/issues/2914)) ([485492d](https://github.com/pagopa/io-app/commit/485492da4fb78fa4c042a7ed35513ff20e81a665))
* **Carta Giovani Nazionale:** [[#177367873](https://www.pivotaltracker.com/story/show/177367873)] Transactions header in wallet home shows before the required scroll position if CGN informations are available [#2913](https://github.com/pagopa/io-app/issues/2913) ([2fc53f8](https://github.com/pagopa/io-app/commit/2fc53f8a09338dcb360ebf8e0c7b4174514c11de))
* **Carta Giovani Nazionale:** [[#177385897](https://www.pivotaltracker.com/story/show/177385897)] CGN Details doesn't load automatically when activation is completed [#2915](https://github.com/pagopa/io-app/issues/2915) ([9040e89](https://github.com/pagopa/io-app/commit/9040e89ae5702ce0b68fdb247906fc69fd16ff25))


### Chores

* [[#176918290](https://www.pivotaltracker.com/story/show/176918290)] Check broken urls in *.tsx files ([#2818](https://github.com/pagopa/io-app/issues/2818)) ([6e44188](https://github.com/pagopa/io-app/commit/6e44188bdb26635c15ac633f0fbe34ce00a5422a))
* [[#176941075](https://www.pivotaltracker.com/story/show/176941075)] Added mixpanel tracking for color scheme ([#2901](https://github.com/pagopa/io-app/issues/2901)) ([fe6a66d](https://github.com/pagopa/io-app/commit/fe6a66d38058bc0dbf74312452a503c27909ffc0))
* [[#177320696](https://www.pivotaltracker.com/story/show/177320696)] Update services web url ([#2897](https://github.com/pagopa/io-app/issues/2897)) ([96d763e](https://github.com/pagopa/io-app/commit/96d763ee71223528382bbf646cebe2010a0bacfa))
* Increase run-tests performance on CircleCI ([#2906](https://github.com/pagopa/io-app/issues/2906)) ([ece9a83](https://github.com/pagopa/io-app/commit/ece9a83bd7ee931a98b2b9dcbfc46179b6442c57))
* **Bonus Pagamenti Digitali:** [[#177140866](https://www.pivotaltracker.com/story/show/177140866)] Remove privative feature flag ([#2912](https://github.com/pagopa/io-app/issues/2912)) ([3fc099b](https://github.com/pagopa/io-app/commit/3fc099b26284d043690a618136c72cbe2ee95b1c))

## [1.23.0-rc.5](https://github.com/pagopa/io-app/compare/1.23.0-rc.4...1.23.0-rc.5) (2021-03-15)


### Features

* [[#177012479](https://www.pivotaltracker.com/story/show/177012479)] Tracking inbox messages count with mix panel ([#2890](https://github.com/pagopa/io-app/issues/2890)) ([9c19f25](https://github.com/pagopa/io-app/commit/9c19f2557a7a789ed0aa84ad5a69dfbe10146d31))
* **Bonus Pagamenti Digitali:** [[#177145461](https://www.pivotaltracker.com/story/show/177145461)] Show privative cards in wallet home ([#2878](https://github.com/pagopa/io-app/issues/2878)) ([58b1098](https://github.com/pagopa/io-app/commit/58b109825f9ec9c3a0f6c46f69153d8d177978eb))
* **Bonus Pagamenti Digitali:** [[#177164415](https://www.pivotaltracker.com/story/show/177164415)] Privative card detail screen ([#2885](https://github.com/pagopa/io-app/issues/2885)) ([bb5cb11](https://github.com/pagopa/io-app/commit/bb5cb11f63aab1c0a3224a3787c3fbd21b67c95b))
* **Bonus Pagamenti Digitali:** [[#177243608](https://www.pivotaltracker.com/story/show/177243608)] Added draft screens for privative cards onboarding workflow ([#2891](https://github.com/pagopa/io-app/issues/2891)) ([ac185da](https://github.com/pagopa/io-app/commit/ac185dacafd598387ed15af5d7fdb6fd47339283))
* **Bonus Pagamenti Digitali:** [[#177243713](https://www.pivotaltracker.com/story/show/177243713),[#177144863](https://www.pivotaltracker.com/story/show/177144863),[#177144964](https://www.pivotaltracker.com/story/show/177144964)] Manages privative search loading and ko. ([#2894](https://github.com/pagopa/io-app/issues/2894)) ([065ee09](https://github.com/pagopa/io-app/commit/065ee09b52e3aeb965cd02ac44cf2e0746336b54))
* **Bonus Pagamenti Digitali:** [[#177339683](https://www.pivotaltracker.com/story/show/177339683)] Change configuration to UAT ([#2899](https://github.com/pagopa/io-app/issues/2899)) ([d269dc4](https://github.com/pagopa/io-app/commit/d269dc40530bfb44de1adfff1e6d05158d686d31))
* **Carta Giovani Nazionale:** [[#176961686](https://www.pivotaltracker.com/story/show/176961686)] Introduces CGN Card Component ([#2877](https://github.com/pagopa/io-app/issues/2877)) ([d82b6ef](https://github.com/pagopa/io-app/commit/d82b6ef698b3e275d431397214e40fd5182f5cd3))
* **Carta Giovani Nazionale:** [[#177058904](https://www.pivotaltracker.com/story/show/177058904)] Introduces the Bottom Sheet that shows all the informations about an available discount for CGN ([#2888](https://github.com/pagopa/io-app/issues/2888)) ([3c08d46](https://github.com/pagopa/io-app/commit/3c08d461f6f0d940d0aed3464071aeb64d7d53c4))


### Bug Fixes

* **Carta Giovani Nazionale:** [[#176942137](https://www.pivotaltracker.com/story/show/176942137)] Features Card Carousel shows empty items section ([#2828](https://github.com/pagopa/io-app/issues/2828)) ([2c72029](https://github.com/pagopa/io-app/commit/2c720296b7e6f685004e276b2f47e2bcfb03ed04))
* **Carta Giovani Nazionale:** [[#177303103](https://www.pivotaltracker.com/story/show/177303103)] First tap on merchants list item fails [#2895](https://github.com/pagopa/io-app/issues/2895) ([546dbef](https://github.com/pagopa/io-app/commit/546dbefa81970f0c16cf212228acb038d48b2afc))

## [1.23.0-rc.4](https://github.com/pagopa/io-app/compare/1.23.0-rc.3...1.23.0-rc.4) (2021-03-11)


### Features

* **Carta Giovani Nazionale:** [[#176959185](https://www.pivotaltracker.com/story/show/176959185)] Introduces the screen to check on Merchant detail conventioned to CGN ([#2886](https://github.com/pagopa/io-app/issues/2886)) ([db50f36](https://github.com/pagopa/io-app/commit/db50f3600b01a72d2f4b83b0cbd8f38f37baefa0))
* **Carta Giovani Nazionale:** [[#176959374](https://www.pivotaltracker.com/story/show/176959374)] Add a component to show the OTP code and its expiration time ([#2892](https://github.com/pagopa/io-app/issues/2892)) ([e679d69](https://github.com/pagopa/io-app/commit/e679d693104a88d48af3ce538c61aac02404e265))
* **Carta Giovani Nazionale:** [[#177059013](https://www.pivotaltracker.com/story/show/177059013)] Introduces the component to display a discount value for a CGN merchant ([#2884](https://github.com/pagopa/io-app/issues/2884)) ([a211fa5](https://github.com/pagopa/io-app/commit/a211fa51bf484d2ee9cb722f928a60ada461f215))


### Bug Fixes

* [[#177298671](https://www.pivotaltracker.com/story/show/177298671)] On message pressed Service details is shown instead of Message details ([#2889](https://github.com/pagopa/io-app/issues/2889)) ([9fe615b](https://github.com/pagopa/io-app/commit/9fe615beb68f629cabe1c278c99dddc1aad807ae))


### Chores

* [[#176433685](https://www.pivotaltracker.com/story/show/176433685)] Track Instabug report open/close ([#2727](https://github.com/pagopa/io-app/issues/2727)) ([955524c](https://github.com/pagopa/io-app/commit/955524ca1d4babf34ee2427fc6ea3345c8b5773e))

## [1.23.0-rc.3](https://github.com/pagopa/io-app/compare/1.23.0-rc.2...1.23.0-rc.3) (2021-03-10)


### Features

* **Bonus Pagamenti Digitali:** [[#177142050](https://www.pivotaltracker.com/story/show/177142050),[#177142212](https://www.pivotaltracker.com/story/show/177142212)] Support search privative card API ([#2881](https://github.com/pagopa/io-app/issues/2881)) ([f856dba](https://github.com/pagopa/io-app/commit/f856dba8c3e095b32a098ce985c635f5e6231e06))
* **Bonus Pagamenti Digitali:** [[#177142282](https://www.pivotaltracker.com/story/show/177142282)] Manage add supermarket card item ([#2879](https://github.com/pagopa/io-app/issues/2879)) ([572f28e](https://github.com/pagopa/io-app/commit/572f28eb111b44cc89f9331502735a547c8df767))
* **Bonus Pagamenti Digitali:** [[#177142358](https://www.pivotaltracker.com/story/show/177142358)] Added privative issuers configuration and choice screen  ([#2876](https://github.com/pagopa/io-app/issues/2876)) ([e8b559a](https://github.com/pagopa/io-app/commit/e8b559a4e6fa015f4ca02e323209efb7010983c1))
* **Carta Giovani Nazionale:** [[#176959318](https://www.pivotaltracker.com/story/show/176959318),[#177244438](https://www.pivotaltracker.com/story/show/177244438),[#177244411](https://www.pivotaltracker.com/story/show/177244411)] Add OTP generation network / actions / saga / reducer ([#2882](https://github.com/pagopa/io-app/issues/2882)) ([04c9905](https://github.com/pagopa/io-app/commit/04c99053b10fa9b1adee174ae21d2908a2dcdf2a))


### Bug Fixes

* [[#177281052](https://www.pivotaltracker.com/story/show/177281052)] Services list could display not found page and zoom is allowed ([#2883](https://github.com/pagopa/io-app/issues/2883)) ([f4d2342](https://github.com/pagopa/io-app/commit/f4d234231bcfbf972ca3546f496d4fe5acaf5906))


### Chores

* [[#177241763](https://www.pivotaltracker.com/story/show/177241763)] Change Instabug report hint text ([#2875](https://github.com/pagopa/io-app/issues/2875)) ([1c20674](https://github.com/pagopa/io-app/commit/1c2067461149ccfcaa1abf263f3c4d2bb66edde0))

## [1.23.0-rc.2](https://github.com/pagopa/io-app/compare/1.23.0-rc.1...1.23.0-rc.2) (2021-03-09)


### Features

* **Bonus Pagamenti Digitali:** [[#177141940](https://www.pivotaltracker.com/story/show/177141940)] Added screens & navigation stubs for privative card ([#2861](https://github.com/pagopa/io-app/issues/2861)) ([3ef249f](https://github.com/pagopa/io-app/commit/3ef249f7e813eba485f069e5ae93af3137f85210))
* **Bonus Pagamenti Digitali:** [[#177161766](https://www.pivotaltracker.com/story/show/177161766)] Add orchestration workunit for privative card ([#2869](https://github.com/pagopa/io-app/issues/2869)) ([fe95e91](https://github.com/pagopa/io-app/commit/fe95e9121d425291bbdc3e4cd13dc33214416f23))
* **Bonus Pagamenti Digitali:** [[#177187748](https://www.pivotaltracker.com/story/show/177187748)] Revert unlock the search for SIA and ICCREA (for test only) [#2865](https://github.com/pagopa/io-app/issues/2865) ([82180af](https://github.com/pagopa/io-app/commit/82180af7e9f8ffa48ab5ce805c0a313c1a90fd22))
* **Carta Giovani Nazionale:** [[#176958889](https://www.pivotaltracker.com/story/show/176958889)] Implementation of the redux store/actions section for Merchants list load and storage ([#2843](https://github.com/pagopa/io-app/issues/2843)) ([0ec802b](https://github.com/pagopa/io-app/commit/0ec802b4a8cda4baef56c09754ca33e6eabe9bff))
* **Carta Giovani Nazionale:** [[#176959176](https://www.pivotaltracker.com/story/show/176959176)] UI Implementation of Merchants list and search screen for CGN available discounts ([#2840](https://github.com/pagopa/io-app/issues/2840)) ([bea650e](https://github.com/pagopa/io-app/commit/bea650e40c8a1efb0b6cf3e46a1b803cdfd9fd12))
* **Carta Giovani Nazionale:** [[#176959207](https://www.pivotaltracker.com/story/show/176959207)] UI Implementation of the List item component for CGN Conventioned Merchant  ([#2836](https://github.com/pagopa/io-app/issues/2836)) ([bd7046a](https://github.com/pagopa/io-app/commit/bd7046a271a4f100e36e5135427c4746665be937))
* **Carta Giovani Nazionale:** [[#177063526](https://www.pivotaltracker.com/story/show/177063526)] Introduces scaffolding for action/reducer of EYCA details and activation process ([#2853](https://github.com/pagopa/io-app/issues/2853)) ([fbceb75](https://github.com/pagopa/io-app/commit/fbceb7581ef594dd73b26cb4ed721f1f1cd8aed4))
* [[#177226606](https://www.pivotaltracker.com/story/show/177226606)] Load local services in a embedded WebView ([#2873](https://github.com/pagopa/io-app/issues/2873)) ([4637197](https://github.com/pagopa/io-app/commit/4637197f229b292440eff5ba235132febc80d28d))
* [[#177264498](https://www.pivotaltracker.com/story/show/177264498)] Diners Logo Update [#2880](https://github.com/pagopa/io-app/issues/2880) ([07f9f12](https://github.com/pagopa/io-app/commit/07f9f12a4097721ec5237c9e222c7fc9bb98ef2f))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176993827](https://www.pivotaltracker.com/story/show/176993827)] In SuperCashbackRanking bottom sheet text is selectable ([#2866](https://github.com/pagopa/io-app/issues/2866)) ([faf26fe](https://github.com/pagopa/io-app/commit/faf26fe675d78c7fc663df24e20a67f0370fbfa4))
* [[#176903407](https://www.pivotaltracker.com/story/show/176903407)] Inhibit dark mode on Android devices ([#2854](https://github.com/pagopa/io-app/issues/2854)) ([6f14f9d](https://github.com/pagopa/io-app/commit/6f14f9d2c71ff9314d8c1c4d43ff10305493a0fd))
* [[#177182357](https://www.pivotaltracker.com/story/show/177182357)] Aborting profile deletion causes a crash ([#2863](https://github.com/pagopa/io-app/issues/2863)) ([37b7e7b](https://github.com/pagopa/io-app/commit/37b7e7b0b7aae0eaaacb30e7daaa160d811d729a))


### Chores

* [[#176981388](https://www.pivotaltracker.com/story/show/176981388)] Credit card onboarding attempt: store info about 3DS2 ([#2858](https://github.com/pagopa/io-app/issues/2858)) ([60eac27](https://github.com/pagopa/io-app/commit/60eac277178090df2085548b10f035522102f20d))
* [[#177204492](https://www.pivotaltracker.com/story/show/177204492)] Update/Correct README ([#2871](https://github.com/pagopa/io-app/issues/2871)) ([eca840c](https://github.com/pagopa/io-app/commit/eca840c03b9072b7a33d7c21a933be0635a23c30))
* Clean changelog ([#2864](https://github.com/pagopa/io-app/issues/2864)) ([256bf4b](https://github.com/pagopa/io-app/commit/256bf4b68457395800f9005d9ca136c81f8ab6ba))

## [1.23.0-rc.1](https://github.com/pagopa/io-app/compare/1.23.0-rc.0...1.23.0-rc.1) (2021-03-03)


### Features

* **Bonus Pagamenti Digitali:** [[#177187748](https://www.pivotaltracker.com/story/show/177187748)] Unlock the search for SIA and ICCREA (for test only) ([#2862](https://github.com/pagopa/io-app/issues/2862)) ([8f29540](https://github.com/pagopa/io-app/commit/8f29540e987513d201c52333f31c195e45b73990))

## [1.23.0-rc.0](https://github.com/pagopa/io-app/compare/1.22.0-rc.1...1.23.0-rc.0) (2021-03-03)


### Features

* **Bonus Pagamenti Digitali:** [[#177141889](https://www.pivotaltracker.com/story/show/177141889)] Added Privative cards actions, store & reducers ([#2860](https://github.com/pagopa/io-app/issues/2860)) ([d9fac56](https://github.com/pagopa/io-app/commit/d9fac567496702fae8c757c3525b97e24e322e47))
* **Carta Giovani Nazionale:** [[#176870737](https://www.pivotaltracker.com/story/show/176870737)] Implements CGN Activation Workflow by using the specific GET Status API for polling  ([#2812](https://github.com/pagopa/io-app/issues/2812)) ([406cb03](https://github.com/pagopa/io-app/commit/406cb0357f91341879a3b45252f34711d5bde14c))


### Chores

* **Bonus Pagamenti Digitali:** [[#176842973](https://www.pivotaltracker.com/story/show/176842973)] Add tests for the CoBadge components ([#2826](https://github.com/pagopa/io-app/issues/2826)) ([0860f77](https://github.com/pagopa/io-app/commit/0860f77fc2d824a0405ba9424129a755f212df6f))
* **Bonus Pagamenti Digitali:** [[#177140858](https://www.pivotaltracker.com/story/show/177140858)] Add privative feature flag ([#2859](https://github.com/pagopa/io-app/issues/2859)) ([e9f08e3](https://github.com/pagopa/io-app/commit/e9f08e36a4d653972ecf17af6326675d09a2fa44))
* drop react-native-qrcode-scanner patch ([#2735](https://github.com/pagopa/io-app/issues/2735)) ([8b59304](https://github.com/pagopa/io-app/commit/8b5930436c14d2435f2da375d84fbb11e05ef3ec))
* **deps:** bump aiohttp from 3.6.2 to 3.7.4 in /scripts/check_urls ([#2850](https://github.com/pagopa/io-app/issues/2850)) ([39c5798](https://github.com/pagopa/io-app/commit/39c5798737c5188a7a4de2b240f0e1d94beeac9a))

## [1.22.0-rc.1](https://github.com/pagopa/io-app/compare/1.22.0-rc.0...1.22.0-rc.1) (2021-02-25)


### Features

* [[#176981563](https://www.pivotaltracker.com/story/show/176981563)] Update MAESTRO from arriving payment method to valid payment method ([#2831](https://github.com/pagopa/io-app/issues/2831)) ([4e996f4](https://github.com/pagopa/io-app/commit/4e996f482517a66d4807405b2bbbc84fe3d1ca8d))
* [[#177066306](https://www.pivotaltracker.com/story/show/177066306)] Handle and show details about payment outcome ([#2845](https://github.com/pagopa/io-app/issues/2845)) ([6746a45](https://github.com/pagopa/io-app/commit/6746a45da89b5a32d5a21b93aa378b5682c1529c))
* **Carta Giovani Nazionale:** [[#176703766](https://www.pivotaltracker.com/story/show/176703766)] CGN Detail base screen component and informations ([#2807](https://github.com/pagopa/io-app/issues/2807)) ([ea58189](https://github.com/pagopa/io-app/commit/ea581892a5d7ddb654c7000c1443f4f6b0048554))


### Chores

* [[#176981159](https://www.pivotaltracker.com/story/show/176981159),[#177092221](https://www.pivotaltracker.com/story/show/177092221)] Make credit card onboarding compliant with 3DS2 and track onboarding events ([#2848](https://github.com/pagopa/io-app/issues/2848)) ([6b816a6](https://github.com/pagopa/io-app/commit/6b816a66ad2f94ba634b7a4162ebc22f25d6a712))
* [[#176983007](https://www.pivotaltracker.com/story/show/176983007)] Restore payment attempt saving ([#2846](https://github.com/pagopa/io-app/issues/2846)) ([9d88060](https://github.com/pagopa/io-app/commit/9d880607a1940688327db4f413e250bcbea4ecab))
* [[#176997301](https://www.pivotaltracker.com/story/show/176997301),[#176997292](https://www.pivotaltracker.com/story/show/176997292)] Fixed organization name's header margin right on service and message detail  ([#2834](https://github.com/pagopa/io-app/issues/2834)) ([ee04a75](https://github.com/pagopa/io-app/commit/ee04a75b69ae0fed68e16134656c6744e99606be))
* [[#177016139](https://www.pivotaltracker.com/story/show/177016139)] When a message has a paid payment, show a banner to inform ([#2847](https://github.com/pagopa/io-app/issues/2847)) ([bc5fd61](https://github.com/pagopa/io-app/commit/bc5fd61115636b975586f155da1d951f8f720ab0))
* [[#177035521](https://www.pivotaltracker.com/story/show/177035521)] Track new events about payment flow 3DS2 ([#2849](https://github.com/pagopa/io-app/issues/2849)) ([4e17f53](https://github.com/pagopa/io-app/commit/4e17f53e5a926d3c910e4316852b462fe6a956a3))

## [1.22.0-rc.0](https://github.com/pagopa/io-app/compare/1.21.0-rc.5...1.22.0-rc.0) (2021-02-25)


### Features

* [[#176980827](https://www.pivotaltracker.com/story/show/176980827)] Don't allow user to add a credit card when insert a cardholder with accented characters ([#2833](https://github.com/pagopa/io-app/issues/2833)) ([7b0c441](https://github.com/pagopa/io-app/commit/7b0c4410f3175f2bab456fd98297ac016c558b34))
* [[#176981284](https://www.pivotaltracker.com/story/show/176981284),[#176981509](https://www.pivotaltracker.com/story/show/176981509)] Show the webview outcome message for the add credit card or payment operation ([#2842](https://github.com/pagopa/io-app/issues/2842)) ([864feb4](https://github.com/pagopa/io-app/commit/864feb4f594d7a56bda28639618032ac87110920))
* **Carta Giovani Nazionale:** [[#176456924](https://www.pivotaltracker.com/story/show/176456924),[#176655324](https://www.pivotaltracker.com/story/show/176655324),[#176655351](https://www.pivotaltracker.com/story/show/176655351),[#176655437](https://www.pivotaltracker.com/story/show/176655437),[#176655260](https://www.pivotaltracker.com/story/show/176655260),[#176655162](https://www.pivotaltracker.com/story/show/176655162),[#176456839](https://www.pivotaltracker.com/story/show/176456839)] Adds UI on CGN activation workflow ([#2758](https://github.com/pagopa/io-app/issues/2758)) ([eb6cd28](https://github.com/pagopa/io-app/commit/eb6cd28a15abd50d66f49cd849f5ce48a5c3f8a4))
* **Carta Giovani Nazionale:** [[#176715047](https://www.pivotaltracker.com/story/show/176715047)] Load CGN details from wallet section ([#2773](https://github.com/pagopa/io-app/issues/2773)) ([b915c02](https://github.com/pagopa/io-app/commit/b915c0242f31c26671afff6f21565d4c6ac85c6e))
* [[#176981421](https://www.pivotaltracker.com/story/show/176981421),[#176983158](https://www.pivotaltracker.com/story/show/176983158)] Make payment compliant with 3DS2 ([#2837](https://github.com/pagopa/io-app/issues/2837)) ([5ce56e1](https://github.com/pagopa/io-app/commit/5ce56e182688ab7af8fc202811affbe74fb87e09))
* [[#176983293](https://www.pivotaltracker.com/story/show/176983293)] Add a WebView component to support payments 3DS2 ([#2832](https://github.com/pagopa/io-app/issues/2832)) ([43c2605](https://github.com/pagopa/io-app/commit/43c2605a322ae8a97c1bbe1ddd5201ffc9a9a9a6))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176202932](https://www.pivotaltracker.com/story/show/176202932)] After remove a credit card from the wallet, a legacy screen is displayed instead of returning to the wallet ([#2820](https://github.com/pagopa/io-app/issues/2820)) ([8f86659](https://github.com/pagopa/io-app/commit/8f86659a5105312086da6f9e04c72c3b03365647))
* [[#176660226](https://www.pivotaltracker.com/story/show/176660226)] Fix iPhone 12 (Mini, Pro...) home button overlapping onto the tab bar ([#2795](https://github.com/pagopa/io-app/issues/2795)) ([d6cec5c](https://github.com/pagopa/io-app/commit/d6cec5cbd5dd1596bbba88b990d8fa93c54af97a))
* **Bonus Pagamenti Digitali:** [[#176268541](https://www.pivotaltracker.com/story/show/176268541)] The reason and the abiCode of bpdTransactionsLoad.failure it is not tracked ([#2819](https://github.com/pagopa/io-app/issues/2819)) ([a500dc7](https://github.com/pagopa/io-app/commit/a500dc787d5c01bcc634162ffb7effa27b62d086))
* **Carta Giovani Nazionale:** [[#176963464](https://www.pivotaltracker.com/story/show/176963464)] Fixes the API specifications for CGN after type and attributes renaming [#2829](https://github.com/pagopa/io-app/issues/2829) ([b8bd4aa](https://github.com/pagopa/io-app/commit/b8bd4aa506689cce9fc68b9c07e1fbd550eff8fa))
* **Payments:** [[#175856384](https://www.pivotaltracker.com/story/show/175856384)] Refresh session token onboarding card ([#2490](https://github.com/pagopa/io-app/issues/2490)) ([546419c](https://github.com/pagopa/io-app/commit/546419cf351c28da192e1a71680223fda3636868))


### Chores

* **Bonus Pagamenti Digitali:** [[#176842043](https://www.pivotaltracker.com/story/show/176842043)] Add tests for cobadge workflow and orchestration screens ([#2803](https://github.com/pagopa/io-app/issues/2803)) ([058ec7d](https://github.com/pagopa/io-app/commit/058ec7dd146917e2a95ed6e467d1ab66bf6d229d))
* **Bonus Pagamenti Digitali:** [[#177015049](https://www.pivotaltracker.com/story/show/177015049)] Update copy for add cobadge screen disclaimer ([#2839](https://github.com/pagopa/io-app/issues/2839)) ([7589793](https://github.com/pagopa/io-app/commit/75897933c6c42532a11d8f302771d71ec83a3da7))
* [[#177044503](https://www.pivotaltracker.com/story/show/177044503)] No PSP assigned page - copy fix ([#2841](https://github.com/pagopa/io-app/issues/2841)) ([a078ee3](https://github.com/pagopa/io-app/commit/a078ee38d3ebda73571e943b4e46ec4c0644dd0a))

## [1.21.0-rc.5](https://github.com/pagopa/io-app/compare/1.21.0-rc.4...1.21.0-rc.5) (2021-02-15)

## [1.21.0-rc.4](https://github.com/pagopa/io-app/compare/1.21.0-rc.3...1.21.0-rc.4) (2021-02-15)


### Features

* [[#176825286](https://www.pivotaltracker.com/story/show/176825286),[#176323469](https://www.pivotaltracker.com/story/show/176323469)] Features Carousel: Items are now shown depending on local and remote feature flag. BPD item is shown only when user is not enrolled to the program, hidden if loading or the information is not available ([#2793](https://github.com/pagopa/io-app/issues/2793)) ([435cde1](https://github.com/pagopa/io-app/commit/435cde196b6338e69bd139deee15fa06f2d78273))
* **Services:** [[#176919053](https://www.pivotaltracker.com/story/show/176919053)] Remove services tab counter badge and item unread badge indicator ([#2823](https://github.com/pagopa/io-app/issues/2823)) ([39c0be5](https://github.com/pagopa/io-app/commit/39c0be5a83e3cff2acffdef43d5afd3213d8f58b))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176023332](https://www.pivotaltracker.com/story/show/176023332)] If the unsubscription to bpd fails, exiting and re-entering the detail screen, the error toast is displayed again ([#2822](https://github.com/pagopa/io-app/issues/2822)) ([9a872e6](https://github.com/pagopa/io-app/commit/9a872e6d9247771f71ec31a1b760188d95212b1b))
* **Bonus Pagamenti Digitali:** [[#176551362](https://www.pivotaltracker.com/story/show/176551362)] Not all the getWalletV2 call are tracked ([#2815](https://github.com/pagopa/io-app/issues/2815)) ([a286f21](https://github.com/pagopa/io-app/commit/a286f21a1e7934375eac1202491fb3aea530a564))
* **Bonus Pagamenti Digitali:** [[#176903622](https://www.pivotaltracker.com/story/show/176903622)] Wrong back navigation when the workflow start from the new added bancomat bottomsheet ([#2813](https://github.com/pagopa/io-app/issues/2813)) ([a1381c7](https://github.com/pagopa/io-app/commit/a1381c7e2f9cb1283955bae6c2540456f1589364))
* **Bonus Pagamenti Digitali:** [[#176940152](https://www.pivotaltracker.com/story/show/176940152)] The BANCOMAT detail icons is (!) instead of (i) ([#2827](https://github.com/pagopa/io-app/issues/2827)) ([ec75063](https://github.com/pagopa/io-app/commit/ec75063400950bd2140100c698bf62eb457417d3))
* **Carta Giovani Nazionale:** [[#176905852](https://www.pivotaltracker.com/story/show/176905852)] Updated CGN spec url to master branch of IO Backend repository ([#2814](https://github.com/pagopa/io-app/issues/2814)) ([3995303](https://github.com/pagopa/io-app/commit/399530315e3a5d0f1a165d12805fd601edbd35cb))


### Chores

* [[#176900759](https://www.pivotaltracker.com/story/show/176900759)] Extend urls checking to *.ts source files ([#2811](https://github.com/pagopa/io-app/issues/2811)) ([eb94f57](https://github.com/pagopa/io-app/commit/eb94f57e3fbc724d4d68df62268d71151637f870))
* **Bonus Pagamenti Digitali:** [[#176918770](https://www.pivotaltracker.com/story/show/176918770)] Update copy when adding a co-badge card to the wallet ([4af4fb0](https://github.com/pagopa/io-app/commit/4af4fb06721f57677385e419b945faa413d62f2e))

## [1.21.0-rc.3](https://github.com/pagopa/io-app/compare/1.21.0-rc.2...1.21.0-rc.3) (2021-02-11)


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176895859](https://www.pivotaltracker.com/story/show/176895859)] Wrong tracking format for handleSearchUserCoBadge errors [#2810](https://github.com/pagopa/io-app/issues/2810) ([6a4449a](https://github.com/pagopa/io-app/commit/6a4449a4b4fa471d9f87d6c10fa90622da8775f3))

## [1.21.0-rc.2](https://github.com/pagopa/io-app/compare/1.21.0-rc.1...1.21.0-rc.2) (2021-02-10)


### Features

* **Bonus Pagamenti Digitali:** [[#176339472](https://www.pivotaltracker.com/story/show/176339472)] Autoload wallet ([#2792](https://github.com/pagopa/io-app/issues/2792)) ([81c3bdf](https://github.com/pagopa/io-app/commit/81c3bdf801061104982f240885009cb070b805f2))
* **Bonus Pagamenti Digitali:** [[#176455937](https://www.pivotaltracker.com/story/show/176455937)] Error and loading screen transaction details ([#2755](https://github.com/pagopa/io-app/issues/2755)) ([ae071e4](https://github.com/pagopa/io-app/commit/ae071e4342bc09d02e5526898effbb2a7a3d12c8))
* **Bonus Pagamenti Digitali:** [[#176575120](https://www.pivotaltracker.com/story/show/176575120)] Graphical refactor entry point co-badge ([#2783](https://github.com/pagopa/io-app/issues/2783)) ([2a9427f](https://github.com/pagopa/io-app/commit/2a9427f6710015e478fd2a74d1817c0821d4a4dd))
* **Bonus Pagamenti Digitali:** [[#176576695](https://www.pivotaltracker.com/story/show/176576695),[#176578086](https://www.pivotaltracker.com/story/show/176578086),[#176578131](https://www.pivotaltracker.com/story/show/176578131)] Added search co-badge ko screens ([#2774](https://github.com/pagopa/io-app/issues/2774)) ([b455e36](https://github.com/pagopa/io-app/commit/b455e36020a5a7d48d748f25732edd02a4a4df72))
* **Carta Giovani Nazionale:** [[#176592286](https://www.pivotaltracker.com/story/show/176592286),[#176592319](https://www.pivotaltracker.com/story/show/176592319),[#176443259](https://www.pivotaltracker.com/story/show/176443259),[#176443215](https://www.pivotaltracker.com/story/show/176443215)] CGN Activation workflow implementation ([#2749](https://github.com/pagopa/io-app/issues/2749)) ([aa362a6](https://github.com/pagopa/io-app/commit/aa362a62ec87b58a193c0d8e1d3850bba4f5ed19))


### Bug Fixes

* [[#176821234](https://www.pivotaltracker.com/story/show/176821234)] remove iuv reference ([#2787](https://github.com/pagopa/io-app/issues/2787)) ([30a9b2b](https://github.com/pagopa/io-app/commit/30a9b2b36ad1c4d1fbe2de288dae4ca1fa0036b6))
* [[#176869229](https://www.pivotaltracker.com/story/show/176869229)] SERVICES_DETAIL_LOADING_STATS event is sent on every service detail loaded ([#2800](https://github.com/pagopa/io-app/issues/2800)) ([7d2137f](https://github.com/pagopa/io-app/commit/7d2137f6a179cbb7bc963defd729abc181811055))
* [[#176843412](https://www.pivotaltracker.com/story/show/176843412)] fixes shadow on credit cards for android ([#2805](https://github.com/pagopa/io-app/issues/2805)) ([fe4d3b0](https://github.com/pagopa/io-app/commit/fe4d3b0782772d28dd5bc3570bd33967d6491dff))


### Chores

* **Bonus Pagamenti Digitali:** [[#176617091](https://www.pivotaltracker.com/story/show/176617091)] Add cobadge tracking ([#2798](https://github.com/pagopa/io-app/issues/2798)) ([048b0e2](https://github.com/pagopa/io-app/commit/048b0e23eabcdd7bc5448a013fe5a0e26458e67e))
* **Bonus Pagamenti Digitali:** [[#176844720](https://www.pivotaltracker.com/story/show/176844720)] Remove cobadge feature flag ([#2802](https://github.com/pagopa/io-app/issues/2802)) ([0fe3307](https://github.com/pagopa/io-app/commit/0fe33075b06dcfc4287fd99f560510d7c6bf17db))

## [1.21.0-rc.1](https://github.com/pagopa/io-app/compare/1.21.0-rc.0...1.21.0-rc.1) (2021-02-09)


### Features

* **Bonus Pagamenti Digitali:** [[#176578587](https://www.pivotaltracker.com/story/show/176578587)] Update the co-badge in app payment badge ([#2797](https://github.com/pagopa/io-app/issues/2797)) ([16a0517](https://github.com/pagopa/io-app/commit/16a05174924bc6e6462bc04b5a496b4f7f45696b))

## [1.21.0-rc.0](https://github.com/pagopa/io-app/compare/1.20.0-rc.2...1.21.0-rc.0) (2021-02-09)


### Features

* **Bonus Pagamenti Digitali:** [[#176576458](https://www.pivotaltracker.com/story/show/176576458),[#176576505](https://www.pivotaltracker.com/story/show/176576505)] Added co-badge abi config ko screens ([#2768](https://github.com/pagopa/io-app/issues/2768)) ([ee6b8e3](https://github.com/pagopa/io-app/commit/ee6b8e39497b765c3763b53665cb48c3a85b20e2))
* **Bonus Pagamenti Digitali:** [[#176739150](https://www.pivotaltracker.com/story/show/176739150)] Chose to add cobadge or credit card screen ([#2778](https://github.com/pagopa/io-app/issues/2778)) ([867b608](https://github.com/pagopa/io-app/commit/867b60889cce0f985f7c5b93940089b66d823839))
* **Bonus Pagamenti Digitali:** [[#176842170](https://www.pivotaltracker.com/story/show/176842170)] Ask identification to unsubscribe from cashback ([#2794](https://github.com/pagopa/io-app/issues/2794)) ([a503f12](https://github.com/pagopa/io-app/commit/a503f12cbff4cc5058fe9870cf1c5993e3a17c5c))


### Bug Fixes

* [[#175419820](https://www.pivotaltracker.com/story/show/175419820)] Restore screen brightness ([#2728](https://github.com/pagopa/io-app/issues/2728)) ([385a3b5](https://github.com/pagopa/io-app/commit/385a3b508af9981a87852c15106d79e2c0ac2e98))
* [[#176476117](https://www.pivotaltracker.com/story/show/176476117)] Improved localization of TouchID dialog on Android [#2788](https://github.com/pagopa/io-app/issues/2788) ([f4b64ca](https://github.com/pagopa/io-app/commit/f4b64ca61549d280da29d952d8b82e5a233967b4))


### Chores

* **Bonus Pagamenti Digitali:** [[#176848601](https://www.pivotaltracker.com/story/show/176848601)] Privacy policy CTA localization update [#2799](https://github.com/pagopa/io-app/issues/2799) ([1ca5dc9](https://github.com/pagopa/io-app/commit/1ca5dc913f95515b794dd4357333a6324b73310e))

## [1.20.0-rc.2](https://github.com/pagopa/io-app/compare/1.20.0-rc.1...1.20.0-rc.2) (2021-02-05)


### Bug Fixes

* **Carta Giovani Nazionale:** [[#176824599](https://www.pivotaltracker.com/story/show/176824599)] Show CGN item when the user is not BPD enrolled  ([#2790](https://github.com/pagopa/io-app/issues/2790)) ([6007a88](https://github.com/pagopa/io-app/commit/6007a88ffa5adce92f063e224e4758f81c22ae71))

## [1.20.0-rc.1](https://github.com/pagopa/io-app/compare/1.20.0-rc.0...1.20.0-rc.1) (2021-02-05)


### Features

* **Bonus Pagamenti Digitali:** [[#176575663](https://www.pivotaltracker.com/story/show/176575663)] Added Start onboarding cobadge screen ([#2760](https://github.com/pagopa/io-app/issues/2760)) ([48d54a1](https://github.com/pagopa/io-app/commit/48d54a18f367f8424b8de9ce5f03fba75a2b5e33))
* **Bonus Pagamenti Digitali:** [[#176578322](https://www.pivotaltracker.com/story/show/176578322)] Visualize iteratively co-badge card that can be added to the wallet ([#2770](https://github.com/pagopa/io-app/issues/2770)) ([187b665](https://github.com/pagopa/io-app/commit/187b6654a55b9a4f378794065de05f1cb831b625))
* **Bonus Pagamenti Digitali:** [[#176738620](https://www.pivotaltracker.com/story/show/176738620)] Choose card type before starting the co-badge onboarding workflow ([#2766](https://github.com/pagopa/io-app/issues/2766)) ([28bb25e](https://github.com/pagopa/io-app/commit/28bb25ea7c3a6553f876744cdbd8a163e951dcd7))
* **Bonus Pagamenti Digitali:** [[#176786909](https://www.pivotaltracker.com/story/show/176786909)] Added start onboarding co-badge for all abi screen ([#2777](https://github.com/pagopa/io-app/issues/2777)) ([09aa68c](https://github.com/pagopa/io-app/commit/09aa68c9aaab8ece5485675ee420333eb364814d))
* **Carta Giovani Nazionale:** [[#176443367](https://www.pivotaltracker.com/story/show/176443367)] Activation Saga handler ([#2742](https://github.com/pagopa/io-app/issues/2742)) ([60b3f5c](https://github.com/pagopa/io-app/commit/60b3f5caa029163ff53d818ad37f54f63905378a))
* **Carta Giovani Nazionale:** [[#176715047](https://www.pivotaltracker.com/story/show/176715047)] Adds the CGN card carousel  ([#2769](https://github.com/pagopa/io-app/issues/2769)) ([fa583bc](https://github.com/pagopa/io-app/commit/fa583bcc8f5dca1ae211dab1a982efac680619d4))


### Bug Fixes

* [[#176097298](https://www.pivotaltracker.com/story/show/176097298)] card showing the bottom borders ([#2653](https://github.com/pagopa/io-app/issues/2653)) ([f731ca1](https://github.com/pagopa/io-app/commit/f731ca1228de748d54de0c4feb4dcd91328d7b17))
* [[#176481360](https://www.pivotaltracker.com/story/show/176481360)] CIE "Where can I find my PIN" bottom sheet text must not be selectable ([#2781](https://github.com/pagopa/io-app/issues/2781)) ([b204dbc](https://github.com/pagopa/io-app/commit/b204dbc61e5b24a94881c4b390d165f01da52745))
* [[#176778241](https://www.pivotaltracker.com/story/show/176778241)] On bug report can't share the screenshot ([#2772](https://github.com/pagopa/io-app/issues/2772)) ([4b6611f](https://github.com/pagopa/io-app/commit/4b6611f0ce3bd9fbc93b3aaca617d3cc3aa411cb))


### Chores

* **Bonus Pagamenti Digitali:** [[#176816895](https://www.pivotaltracker.com/story/show/176816895)] Add feature flag for cobadge workflow ([#2786](https://github.com/pagopa/io-app/issues/2786)) ([fad5740](https://github.com/pagopa/io-app/commit/fad574047612f82ce0aac2de11e72aca3a57849c))
* [[#176778467](https://www.pivotaltracker.com/story/show/176778467)] Track loading services details stats ([#2785](https://github.com/pagopa/io-app/issues/2785)) ([f3f56de](https://github.com/pagopa/io-app/commit/f3f56deb41f912365c75b61c29c45638e5d97f1e))

## [1.20.0-rc.0](https://github.com/pagopa/io-app/compare/1.19.0-rc.2...1.20.0-rc.0) (2021-02-02)


### Features

* **Bonus Pagamenti Digitali:** [[#175741693](https://www.pivotaltracker.com/story/show/175741693)] Remove timestamp from transactions when it's equal to 00:00 ([#2734](https://github.com/pagopa/io-app/issues/2734)) ([b19d3f1](https://github.com/pagopa/io-app/commit/b19d3f1cf4bed44577429528dac970061797aa72))
* **Bonus Pagamenti Digitali:** [[#176553194](https://www.pivotaltracker.com/story/show/176553194)] implements supermarket loyalty card ([#2748](https://github.com/pagopa/io-app/issues/2748)) ([6d8571f](https://github.com/pagopa/io-app/commit/6d8571f27009496f37aa33fcb89f879aae1b5552))
* **Bonus Pagamenti Digitali:** [[#176559650](https://www.pivotaltracker.com/story/show/176559650)] Actions, store & reducers for co-badge ([#2747](https://github.com/pagopa/io-app/issues/2747)) ([6c3e30b](https://github.com/pagopa/io-app/commit/6c3e30b2b9f4798509f7ecb839cdef19a6aa87e8))
* **Bonus Pagamenti Digitali:** [[#176559662](https://www.pivotaltracker.com/story/show/176559662)] Navigation & screen stubs for co-badge workflow ([#2750](https://github.com/pagopa/io-app/issues/2750)) ([4c2654f](https://github.com/pagopa/io-app/commit/4c2654f0cafee8e9899c88d7e547fa50aca919b9))
* **Bonus Pagamenti Digitali:** [[#176559982](https://www.pivotaltracker.com/story/show/176559982),[#176560026](https://www.pivotaltracker.com/story/show/176560026)] Load user cobadge pans  ([#2759](https://github.com/pagopa/io-app/issues/2759)) ([315b0f4](https://github.com/pagopa/io-app/commit/315b0f44b286d692d096efa954a6cc144628e608))
* [[#176311366](https://www.pivotaltracker.com/story/show/176311366)] Added "Send screenshot" checkbox to the add card screen's contextual help funnel ([#2670](https://github.com/pagopa/io-app/issues/2670)) ([178a8c7](https://github.com/pagopa/io-app/commit/178a8c7fa0358a80fed9430f68acdee0c4b0fea3))
* **Bonus Pagamenti Digitali:** [[#176575256](https://www.pivotaltracker.com/story/show/176575256)] Co-badge card onboarding workflow ([#2752](https://github.com/pagopa/io-app/issues/2752)) ([390d2d4](https://github.com/pagopa/io-app/commit/390d2d4e68bcf491ce14a4af994390905f08adee))
* [[#173962963](https://www.pivotaltracker.com/story/show/173962963)] Expanded header icons touch area ([#2644](https://github.com/pagopa/io-app/issues/2644)) ([6bd6c25](https://github.com/pagopa/io-app/commit/6bd6c2543306c8ad1fe7bceaed4c7d17f28452dc))
* [[#174034081](https://www.pivotaltracker.com/story/show/174034081)] Unlock code is persisted across logins if citizen doesn't change (2nd attempt) ([#2767](https://github.com/pagopa/io-app/issues/2767)) ([7994983](https://github.com/pagopa/io-app/commit/79949834e23715508c81eba68a57c5545fc3a8f2))
* **Bonus Pagamenti Digitali:** [[#176575992](https://www.pivotaltracker.com/story/show/176575992)] Add cobadge load configuration API ([#2756](https://github.com/pagopa/io-app/issues/2756)) ([58db5d1](https://github.com/pagopa/io-app/commit/58db5d14d5521a679949933a1562a252b64cab4f))
* **Bonus Pagamenti Digitali:** [[#176578578](https://www.pivotaltracker.com/story/show/176578578)] Cobadge card preview ([#2746](https://github.com/pagopa/io-app/issues/2746)) ([3a49eb8](https://github.com/pagopa/io-app/commit/3a49eb8cd1d77c88975a25ba19c48ae86acd0bc2))
* **Bonus Pagamenti Digitali:** [[#176578587](https://www.pivotaltracker.com/story/show/176578587)] Cobadge detail screen ([#2751](https://github.com/pagopa/io-app/issues/2751)) ([0192964](https://github.com/pagopa/io-app/commit/0192964ada9a2f9aa13ab8490138b25d275e554c))
* **Carta Giovani Nazionale:** [[#176443163](https://www.pivotaltracker.com/story/show/176443163)] New bonuses available visibility and start cgn flow logic ([#2733](https://github.com/pagopa/io-app/issues/2733)) ([4e4e1b6](https://github.com/pagopa/io-app/commit/4e4e1b6640f0d8f996debf3411b86f86456f1030))
* **Services:** [[#176676680](https://www.pivotaltracker.com/story/show/176676680),[#176606850](https://www.pivotaltracker.com/story/show/176606850),[#176513922](https://www.pivotaltracker.com/story/show/176513922)] Improve services caching and loading ([#2765](https://github.com/pagopa/io-app/issues/2765)) ([e1ee048](https://github.com/pagopa/io-app/commit/e1ee04835d785e8e48aaa7c66633abdba0d3d328))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176477833](https://www.pivotaltracker.com/story/show/176477833)] Fixed mistake that inhibited BPD CTA to properly show ([#2738](https://github.com/pagopa/io-app/issues/2738)) ([86f3404](https://github.com/pagopa/io-app/commit/86f3404e6903cafc29333566fe3402990782e521))
* **Bonus Pagamenti Digitali:** [[#176720702](https://www.pivotaltracker.com/story/show/176720702)] Cobadge add-wallet payload has an invalid date format ([#2761](https://github.com/pagopa/io-app/issues/2761)) ([9e1a40a](https://github.com/pagopa/io-app/commit/9e1a40a6d8835e5684c85fa0568503b44a08392d))


### Chores

* [[#176175845](https://www.pivotaltracker.com/story/show/176175845)] removes transactions list from the transactions screen ([#2628](https://github.com/pagopa/io-app/issues/2628)) ([ec5437b](https://github.com/pagopa/io-app/commit/ec5437bc3d1a2bf2c346aff7b89dfd1ce134fba6))
* **Bonus Pagamenti Digitali:** [[#176737219](https://www.pivotaltracker.com/story/show/176737219)] milestone copy ([#2763](https://github.com/pagopa/io-app/issues/2763)) ([29f93eb](https://github.com/pagopa/io-app/commit/29f93ebd7fd26ef75034843a44b0926c4bf9f7b0))
* [[#176614756](https://www.pivotaltracker.com/story/show/176614756)] Use [@pagopa](https://github.com/pagopa) packages from npm registry ([#2754](https://github.com/pagopa/io-app/issues/2754)) ([434d0e4](https://github.com/pagopa/io-app/commit/434d0e4307acc941f390a8a5e1de89cba0b03e40))

## [1.19.0-rc.2](https://github.com/pagopa/io-app/compare/1.19.0-rc.1...1.19.0-rc.2) (2021-01-22)


### Bug Fixes

* [[#176607041](https://www.pivotaltracker.com/story/show/176607041)] Hashed CF is reset on logout [#2745](https://github.com/pagopa/io-app/issues/2745) ([f8dbaf9](https://github.com/pagopa/io-app/commit/f8dbaf9b6a6d73ae9d6e4f2eda50eb4035afa765))

## [1.19.0-rc.1](https://github.com/pagopa/io-app/compare/1.19.0-rc.0...1.19.0-rc.1) (2021-01-21)


### Features

* **Carta Giovani Nazionale:** [[#176443044](https://www.pivotaltracker.com/story/show/176443044)] Adds directories skeleton for CGN implementation ([#2718](https://github.com/pagopa/io-app/issues/2718)) ([5bc6f7b](https://github.com/pagopa/io-app/commit/5bc6f7b3a95863d42cdc2d3e636513b6c0880513))
* **Payments:** [[#176409411](https://www.pivotaltracker.com/story/show/176409411)] Update message detail info ([#2729](https://github.com/pagopa/io-app/issues/2729)) ([b9faf1a](https://github.com/pagopa/io-app/commit/b9faf1a7b2cdf417b7f7cc611acffa21441f6f8a))
* [[#176434157](https://www.pivotaltracker.com/story/show/176434157)] Remove payment CTA and expired badge ([#2741](https://github.com/pagopa/io-app/issues/2741)) ([fa4efed](https://github.com/pagopa/io-app/commit/fa4efed5e11325d1aaf8d70a35a668e067a839c5))


### Bug Fixes

* **Payments:** [[#175857824](https://www.pivotaltracker.com/story/show/175857824)] dispatched sessionExpired on getWallets failure ([#2481](https://github.com/pagopa/io-app/issues/2481)) ([24f09f5](https://github.com/pagopa/io-app/commit/24f09f53c2342db93d425195abe0523aac5659a5))
* [[#176455315](https://www.pivotaltracker.com/story/show/176455315),[#176417779](https://www.pivotaltracker.com/story/show/176417779)] Persist payment/message status  ([#2736](https://github.com/pagopa/io-app/issues/2736)) ([e97c483](https://github.com/pagopa/io-app/commit/e97c483d720d0764e92c17674902b8446f338bad))


### Chores

* [[#176497587](https://www.pivotaltracker.com/story/show/176497587)] Store hashed fiscal code ([#2732](https://github.com/pagopa/io-app/issues/2732)) ([dd266a5](https://github.com/pagopa/io-app/commit/dd266a55658df22842a0834b2b0c218a1b6ee815))

## [1.19.0-rc.0](https://github.com/pagopa/io-app/compare/1.18.0-rc.3...1.19.0-rc.0) (2021-01-19)


### Bug Fixes

* [[#175501909](https://www.pivotaltracker.com/story/show/175501909)] Move Contextual Help "Why A Fee" to ConfirmPaymentMethodScreen ([#2430](https://github.com/pagopa/io-app/issues/2430)) ([8df4587](https://github.com/pagopa/io-app/commit/8df45875610dc9f699837572a9f3d608f3a7abe7))

## [1.18.0-rc.3](https://github.com/pagopa/io-app/compare/1.18.0-rc.2...1.18.0-rc.3) (2021-01-15)


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176516558](https://www.pivotaltracker.com/story/show/176516558)] Missing integer formatting for transactions number & ranking ([#2731](https://github.com/pagopa/io-app/issues/2731)) ([26ebc27](https://github.com/pagopa/io-app/commit/26ebc273c4f21fbb76460f311a288d45262090e8))

## [1.18.0-rc.2](https://github.com/pagopa/io-app/compare/1.18.0-rc.1...1.18.0-rc.2) (2021-01-15)


### Features

* **Bonus Pagamenti Digitali:** [[#176457237](https://www.pivotaltracker.com/story/show/176457237)] Remove disabled account from BPay found list ([#2720](https://github.com/pagopa/io-app/issues/2720)) ([d147418](https://github.com/pagopa/io-app/commit/d14741817c6d31847e7db4a0f22e3d8db37c051a))
* [[#176176848](https://www.pivotaltracker.com/story/show/176176848)] Added explanatory bottom sheet for in-app payments card section ([#2709](https://github.com/pagopa/io-app/issues/2709)) ([3894150](https://github.com/pagopa/io-app/commit/389415068a8f3eb2223f5a508412e93bfa802472))
* [[#176479978](https://www.pivotaltracker.com/story/show/176479978)] Add react native bundle visualizer as dev dependency ([#2719](https://github.com/pagopa/io-app/issues/2719)) ([e2eced4](https://github.com/pagopa/io-app/commit/e2eced4b4ba0f76c7812c5158c9c846db5936047))
* **Bonus Pagamenti Digitali:** [[#176484406](https://www.pivotaltracker.com/story/show/176484406)] Remove first place from supercashback ranking ([#2725](https://github.com/pagopa/io-app/issues/2725)) ([6067156](https://github.com/pagopa/io-app/commit/60671563ccbcb06b94026336042bd7b7531e8e74))
* **Bonus Vacanze:** [[#176309802](https://www.pivotaltracker.com/story/show/176309802)] Remove bonus vacanze cta [#2711](https://github.com/pagopa/io-app/issues/2711) ([c313b37](https://github.com/pagopa/io-app/commit/c313b3771c4af331ec7cbeb8489c8fc2648fe2ff))
* **Carta Giovani Nazionale:** [[#176442968](https://www.pivotaltracker.com/story/show/176442968)] Adds CGN Feature Flag [#2714](https://github.com/pagopa/io-app/issues/2714) ([5f9edcb](https://github.com/pagopa/io-app/commit/5f9edcb0374c3e2d60c46f1a0489365bb7c71fd3))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176496182](https://www.pivotaltracker.com/story/show/176496182)] SuggestBpdActivationScreen displays always a "pagoBANCOMAT" title [#2724](https://github.com/pagopa/io-app/issues/2724) ([a70a75f](https://github.com/pagopa/io-app/commit/a70a75f284b24da8331788e5b010e3fd9b1e5dd8))
* [[#176225603](https://www.pivotaltracker.com/story/show/176225603)] PSP Icon removal ([#2690](https://github.com/pagopa/io-app/issues/2690)) ([fe949e5](https://github.com/pagopa/io-app/commit/fe949e5deccc3846deddec74399a7f69ec9efc84))
* [[#176290749](https://www.pivotaltracker.com/story/show/176290749)] Fiscal-code fac-simile entries are not readable on some Xiaomi devices ([#2713](https://github.com/pagopa/io-app/issues/2713)) ([83cada8](https://github.com/pagopa/io-app/commit/83cada83d89d04bcab579db7ff0ab99f96287ae2))


### Chores

* **Bonus Pagamenti Digitali:** [[#176436807](https://www.pivotaltracker.com/story/show/176436807)] Improve and fix backoff delay reducer ([#2706](https://github.com/pagopa/io-app/issues/2706)) ([390c4e6](https://github.com/pagopa/io-app/commit/390c4e637eef5a433a14a28c5ac75ff5e6b1f410))
* **Bonus Pagamenti Digitali:** [[#176498731](https://www.pivotaltracker.com/story/show/176498731)] Add new bpd ranking config flag ([#2726](https://github.com/pagopa/io-app/issues/2726)) ([2967024](https://github.com/pagopa/io-app/commit/296702436fff70ec6ac33502b12fc1844a2273ef))
* **Bonus Vacanze:** [[#176459696](https://www.pivotaltracker.com/story/show/176459696)] Remove API handlers and saga of start/get eligibilityCheck  ([#2715](https://github.com/pagopa/io-app/issues/2715)) ([93616c7](https://github.com/pagopa/io-app/commit/93616c779d06cf3b0910566dc126e78bd9642288))

## [1.18.0-rc.1](https://github.com/pagopa/io-app/compare/1.18.0-rc.0...1.18.0-rc.1) (2021-01-11)


### Features

* [[#175272158](https://www.pivotaltracker.com/story/show/175272158)] Refactored CIE PIN screen to functional, added informative bottom sheet ([#2612](https://github.com/pagopa/io-app/issues/2612)) ([f05a443](https://github.com/pagopa/io-app/commit/f05a4437af1f6588dafcea2f3aa871fd0e42e2e7))
* [[#176424621](https://www.pivotaltracker.com/story/show/176424621)] Upgrades TypeScript to 4.1 ([#2596](https://github.com/pagopa/io-app/issues/2596)) ([4a40558](https://github.com/pagopa/io-app/commit/4a405589d8c8ad01b2cd02cbcec4bab3ab462efb))
* **Bonus Pagamenti Digitali:** [[#175890963](https://www.pivotaltracker.com/story/show/175890963)] Adds the screen to see all BPay accounts to add ([#2697](https://github.com/pagopa/io-app/issues/2697)) ([8d8d6cf](https://github.com/pagopa/io-app/commit/8d8d6cffbee489af79f7c2c0b2c2542f7460a1a4))
* **Bonus Pagamenti Digitali:** [[#176417281](https://www.pivotaltracker.com/story/show/176417281)] Return to wallet after add BPay ([#2703](https://github.com/pagopa/io-app/issues/2703)) ([08c036e](https://github.com/pagopa/io-app/commit/08c036e34d37eb70873ef9fd34a9f719179affea))
* **Bonus Pagamenti Digitali:** [[#176432457](https://www.pivotaltracker.com/story/show/176432457)] Remove navigation bar from the BPay detail screen ([#2699](https://github.com/pagopa/io-app/issues/2699)) ([53a6b21](https://github.com/pagopa/io-app/commit/53a6b215239fdb9076920f2c315423acfb1cc14e))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176193377](https://www.pivotaltracker.com/story/show/176193377)] Ask to send cf only on new assistance request ([#2710](https://github.com/pagopa/io-app/issues/2710)) ([fe7ba13](https://github.com/pagopa/io-app/commit/fe7ba13adbebdbf9dc2f0818446e69520ceb523b))
* **Bonus Pagamenti Digitali:** [[#176350129](https://www.pivotaltracker.com/story/show/176350129)] Link inside bottom sheet is not tappable ([#2701](https://github.com/pagopa/io-app/issues/2701)) ([726af95](https://github.com/pagopa/io-app/commit/726af951ca64b29738849bcd6872ce1f01e6eda8))
* **Bonus Pagamenti Digitali:** [[#176365811](https://www.pivotaltracker.com/story/show/176365811)] Set support token as instabug user attribute ([#2688](https://github.com/pagopa/io-app/issues/2688)) ([3b88170](https://github.com/pagopa/io-app/commit/3b881705ea5692cdb4144a4e41692b2dbd25d82b))
* **Bonus Pagamenti Digitali:** [[#176437020](https://www.pivotaltracker.com/story/show/176437020)] BPay card in onboarding screen had shadow cut on Android [#2705](https://github.com/pagopa/io-app/issues/2705) ([4f6a802](https://github.com/pagopa/io-app/commit/4f6a802d01399ff5bdadd1d8e4d4f0d3441bbf5b))
* **Bonus Pagamenti Digitali:** [[#176437454](https://www.pivotaltracker.com/story/show/176437454)] Bpay logo had low quality [#2707](https://github.com/pagopa/io-app/issues/2707) ([f27079c](https://github.com/pagopa/io-app/commit/f27079c2fd8d5a8a99673f0ddcdc15cd83048a27))

## [1.18.0-rc.0](https://github.com/pagopa/io-app/compare/1.17.0-rc.2...1.18.0-rc.0) (2021-01-11)


### Features

* **Bonus Pagamenti Digitali:** [[#176426698](https://www.pivotaltracker.com/story/show/176426698)] Fix format amount [#2692](https://github.com/pagopa/io-app/issues/2692) ([543d63c](https://github.com/pagopa/io-app/commit/543d63c6086e9100b8507f3c47b3ab5083eb559f))

## [1.17.0-rc.2](https://github.com/pagopa/io-app/compare/1.17.0-rc.1...1.17.0-rc.2) (2021-01-08)


### Features

* **Bonus Pagamenti Digitali:** [[#175883232](https://www.pivotaltracker.com/story/show/175883232)] Send BPay actions to mixpanel ([#2678](https://github.com/pagopa/io-app/issues/2678)) ([44f2978](https://github.com/pagopa/io-app/commit/44f2978bd943d9f535c9d16352da54d1184dc7df))
* **Bonus Pagamenti Digitali:** [[#175883367](https://www.pivotaltracker.com/story/show/175883367),[#175883472](https://www.pivotaltracker.com/story/show/175883472)] Wallet BPay visualization ([#2682](https://github.com/pagopa/io-app/issues/2682)) ([e39332f](https://github.com/pagopa/io-app/commit/e39332fc43e05b2776fd55f187943e07fd5c229e))
* **Bonus Pagamenti Digitali:** [[#175889262](https://www.pivotaltracker.com/story/show/175889262),[#175889280](https://www.pivotaltracker.com/story/show/175889280)] Add bpay/list API ([#2662](https://github.com/pagopa/io-app/issues/2662)) ([fbd4b67](https://github.com/pagopa/io-app/commit/fbd4b67bddb296a44dfc2b1d097ab3133871ffaa))
* **Bonus Pagamenti Digitali:** [[#175889351](https://www.pivotaltracker.com/story/show/175889351),[#175889362](https://www.pivotaltracker.com/story/show/175889362),[#175889493](https://www.pivotaltracker.com/story/show/175889493),[#175890975](https://www.pivotaltracker.com/story/show/175890975)] Action, store & reducer Bpay ([#2673](https://github.com/pagopa/io-app/issues/2673)) ([3f9bb70](https://github.com/pagopa/io-app/commit/3f9bb700cf7ed2f7d5263a9ab74aa2ee2cda22db))
* **Bonus Pagamenti Digitali:** [[#175890863](https://www.pivotaltracker.com/story/show/175890863),[#175883224](https://www.pivotaltracker.com/story/show/175883224)] Creates base component for bpay search funnel ([#2681](https://github.com/pagopa/io-app/issues/2681)) ([f44d049](https://github.com/pagopa/io-app/commit/f44d0494817c84bcd06c163985198ba16cf2fb73))
* **Bonus Pagamenti Digitali:** [[#175890882](https://www.pivotaltracker.com/story/show/175890882)] Update caption for BPay ko & loading screens ([#2680](https://github.com/pagopa/io-app/issues/2680)) ([9dc52bd](https://github.com/pagopa/io-app/commit/9dc52bd400662999749b94efc5974ef9aa9ea94a))
* **Bonus Pagamenti Digitali:** [[#176401375](https://www.pivotaltracker.com/story/show/176401375)] Update BPay description and numberObfuscated [#2685](https://github.com/pagopa/io-app/issues/2685) ([cc67d74](https://github.com/pagopa/io-app/commit/cc67d7485366af1214eb58656fed57e240478073))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176397291](https://www.pivotaltracker.com/story/show/176397291)] Favorite wallet info is lost ([#2683](https://github.com/pagopa/io-app/issues/2683)) ([3cd4584](https://github.com/pagopa/io-app/commit/3cd4584b97aecd8a4bc09b4925cec48ee8882d8e))

## [1.17.0-rc.1](https://github.com/pagopa/io-app/compare/1.17.0-rc.0...1.17.0-rc.1) (2021-01-05)


### Features

* **Bonus Pagamenti Digitali:** [[#176318970](https://www.pivotaltracker.com/story/show/176318970)] Avoid call bpd API if the user is not enrolled ([#2663](https://github.com/pagopa/io-app/issues/2663)) ([d0582ef](https://github.com/pagopa/io-app/commit/d0582ef1e203619e557baf4cdc8135b1b760142f))
* [[#176222893](https://www.pivotaltracker.com/story/show/176222893)] increased delay between user profile activation retries [#2664](https://github.com/pagopa/io-app/issues/2664) ([5c0c90f](https://github.com/pagopa/io-app/commit/5c0c90f201ceea2bcd8a527873ff1afc2ad236f8))
* [[#176299898](https://www.pivotaltracker.com/story/show/176299898)] Amex warning (transaction >1000 EUR) ([#2671](https://github.com/pagopa/io-app/issues/2671)) ([8e171d3](https://github.com/pagopa/io-app/commit/8e171d36c13a6ed220b27278da9972acf6d2d5fc))
* **Payments:** [[#176364017](https://www.pivotaltracker.com/story/show/176364017)] Use /v1/psps/selected instead of deprecated /v1/psps ([#2675](https://github.com/pagopa/io-app/issues/2675)) ([a8bd66a](https://github.com/pagopa/io-app/commit/a8bd66a34cd9edccef274e1335e321fa4c137ce9))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176338423](https://www.pivotaltracker.com/story/show/176338423)] Wrong cashback detail by selecting card preview ([#2669](https://github.com/pagopa/io-app/issues/2669)) ([2257488](https://github.com/pagopa/io-app/commit/225748826ec36dd79f76dd48c20200858e6d86dd))

## [1.17.0-rc.0](https://github.com/pagopa/io-app/compare/1.16.0-rc.1...1.17.0-rc.0) (2021-01-01)


### Features

* **Bonus Pagamenti Digitali:** [[#176177351](https://www.pivotaltracker.com/story/show/176177351)] Refactored AddCardScreen component and added bottom sheet ([#2635](https://github.com/pagopa/io-app/issues/2635)) ([72e8d3c](https://github.com/pagopa/io-app/commit/72e8d3cd9d975e034c8e77db93661d804afc5a6a))
* **Bonus Pagamenti Digitali:** [[#176300242](https://www.pivotaltracker.com/story/show/176300242)] Handles the status message on ranking bottom sheet ([#2657](https://github.com/pagopa/io-app/issues/2657)) ([221744c](https://github.com/pagopa/io-app/commit/221744c0813a8445dfd99baa545bc311e6d0c9ff))
* [[#175900141](https://www.pivotaltracker.com/story/show/175900141)] Added profile deletion abort tracking ([#2649](https://github.com/pagopa/io-app/issues/2649)) ([c9ecf62](https://github.com/pagopa/io-app/commit/c9ecf62d0ae5920ff5d3166e8493b9bb0db798cf))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176248270](https://www.pivotaltracker.com/story/show/176248270)] Fixes the bad alignment on cashback value ([#2659](https://github.com/pagopa/io-app/issues/2659)) ([305df5f](https://github.com/pagopa/io-app/commit/305df5fdcd0340a5c2ef436eb0990d3c6218d2ee))

## [1.16.0-rc.1](https://github.com/pagopa/io-app/compare/1.16.0-rc.0...1.16.0-rc.1) (2020-12-29)


### Features

* **Bonus Pagamenti Digitali:** [[#175263933](https://www.pivotaltracker.com/story/show/175263933)] Add BPD/citizen/ranking API ([#2623](https://github.com/pagopa/io-app/issues/2623)) ([1495859](https://github.com/pagopa/io-app/commit/1495859ed6647b777ce1546036f3060c0f45257a))
* **Bonus Pagamenti Digitali:** [[#176072451](https://www.pivotaltracker.com/story/show/176072451)] Added "share you screenshot" checkbox to "Write to the IO team" screen ([#2545](https://github.com/pagopa/io-app/issues/2545)) ([063e09d](https://github.com/pagopa/io-app/commit/063e09d455a9ea19338c64daacec6acfd953f4e6))
* **Bonus Pagamenti Digitali:** [[#176191342](https://www.pivotaltracker.com/story/show/176191342)] Super Cashback ranking components ([#2629](https://github.com/pagopa/io-app/issues/2629)) ([e0f80f6](https://github.com/pagopa/io-app/commit/e0f80f62e07ec092cb986a2d0bd633be9be778f8))
* **Bonus Pagamenti Digitali:** [[#176191528](https://www.pivotaltracker.com/story/show/176191528),[#176269223](https://www.pivotaltracker.com/story/show/176269223)] Supercashback graphical component and textual summary update ([#2633](https://github.com/pagopa/io-app/issues/2633)) ([162bb6f](https://github.com/pagopa/io-app/commit/162bb6f8785eb8b596da5f644a02b1827c0d9178))
* **Bonus Pagamenti Digitali:** [[#176191591](https://www.pivotaltracker.com/story/show/176191591)] Open ranking details when tap on ranking preview ([#2652](https://github.com/pagopa/io-app/issues/2652)) ([0f75590](https://github.com/pagopa/io-app/commit/0f755905b0e3598ba4af1fb3fa2d2e66141b3ce4))
* **Bonus Pagamenti Digitali:** [[#176192263](https://www.pivotaltracker.com/story/show/176192263)] New symbols for cashback state ([#2624](https://github.com/pagopa/io-app/issues/2624)) ([6542818](https://github.com/pagopa/io-app/commit/65428189c904461444430bccb64ecc4a67e703e0))
* **Bonus Pagamenti Digitali:** [[#176193672](https://www.pivotaltracker.com/story/show/176193672),[#176193494](https://www.pivotaltracker.com/story/show/176193494)] Last update component ([#2617](https://github.com/pagopa/io-app/issues/2617)) ([79afda3](https://github.com/pagopa/io-app/commit/79afda338a212ad219fb2a714cab04de8399242b))
* **Bonus Pagamenti Digitali:** [[#176204744](https://www.pivotaltracker.com/story/show/176204744)] Backoff delay on load BPD data ([#2654](https://github.com/pagopa/io-app/issues/2654)) ([2d4a382](https://github.com/pagopa/io-app/commit/2d4a382a8fd716e9e18d2f46bc506e2d504928bf))
* **Bonus Pagamenti Digitali:** [[#176240699](https://www.pivotaltracker.com/story/show/176240699),[#175891337](https://www.pivotaltracker.com/story/show/175891337),[#176166370](https://www.pivotaltracker.com/story/show/176166370)] Convert BPD activation status to pot, prevent cashback logo flickering on Android  ([#2639](https://github.com/pagopa/io-app/issues/2639)) ([214f241](https://github.com/pagopa/io-app/commit/214f241851674d762a6c63e1a9a7ff9db06ab965))
* **Bonus Pagamenti Digitali:** [[#176269102](https://www.pivotaltracker.com/story/show/176269102)] Add information about the money transfer date ([#2643](https://github.com/pagopa/io-app/issues/2643)) ([06b8bd1](https://github.com/pagopa/io-app/commit/06b8bd11fae6e0ca947154cc54cc97688a6cfe20))
* **Bonus Pagamenti Digitali:** [[#176269197](https://www.pivotaltracker.com/story/show/176269197)] Add display / edit IBAN component to BpdClosedPeriod ([#2642](https://github.com/pagopa/io-app/issues/2642)) ([cc51577](https://github.com/pagopa/io-app/commit/cc515778ac43c4db4519ef33db2c937bf7fa3caf))
* **Bonus Pagamenti Digitali:** [[#176272983](https://www.pivotaltracker.com/story/show/176272983)] Ranking not ready component & bottomsheet ([#2641](https://github.com/pagopa/io-app/issues/2641)) ([afcb441](https://github.com/pagopa/io-app/commit/afcb44134730c6ef29d56a9c34a8a33a227676e2))
* **Bonus Pagamenti Digitali:** [[#176291611](https://www.pivotaltracker.com/story/show/176291611),[#176060226](https://www.pivotaltracker.com/story/show/176060226)] Bpd update data async action & common error handling ([#2651](https://github.com/pagopa/io-app/issues/2651)) ([f75a91c](https://github.com/pagopa/io-app/commit/f75a91c6b4536b88233bdd575b6ac521d3b228a2))
* **Bonus Pagamenti Digitali:** [[#176291649](https://www.pivotaltracker.com/story/show/176291649)] Track ranking api on Mixpanel ([#2655](https://github.com/pagopa/io-app/issues/2655)) ([b7b54c2](https://github.com/pagopa/io-app/commit/b7b54c2fc6e8b6f5e8c881822cc8d2d1018c9577))
* **Bonus Pagamenti Digitali:** [[#176301834](https://www.pivotaltracker.com/story/show/176301834)] Update grace period text ([#2656](https://github.com/pagopa/io-app/issues/2656)) ([04b041e](https://github.com/pagopa/io-app/commit/04b041ee0c6cd132e57f3197d729b20832f6fb52))
* **Bonus Pagamenti Digitali:** [[#176307536](https://www.pivotaltracker.com/story/show/176307536)] Disable update from BpdDetails [#2658](https://github.com/pagopa/io-app/issues/2658) ([c162cfd](https://github.com/pagopa/io-app/commit/c162cfd5a72676d222225755aeeb99170662464a))
* **Bonus Pagamenti Digitali:** [[#176307944](https://www.pivotaltracker.com/story/show/176307944)] Open IBAN insertion from message CTA ([#2660](https://github.com/pagopa/io-app/issues/2660)) ([7dc087e](https://github.com/pagopa/io-app/commit/7dc087e3777bd3968d422e3f30c4a1d1644a1502))
* **Bonus Vacanze:** [[#176257892](https://www.pivotaltracker.com/story/show/176257892)] Stop bonus vacanze ([#2650](https://github.com/pagopa/io-app/issues/2650)) ([6b18426](https://github.com/pagopa/io-app/commit/6b18426db93ca50f8e9940c0c6a683aac2124c19))


### Bug Fixes

* [[#176068510](https://www.pivotaltracker.com/story/show/176068510)] Removed status message in edit email screen ([#2647](https://github.com/pagopa/io-app/issues/2647)) ([5cf5dff](https://github.com/pagopa/io-app/commit/5cf5dff1ff9a5a9f9e1f3c2e6c6a665c4fe7dc88))
* **Bonus Pagamenti Digitali:** [[#176143732](https://www.pivotaltracker.com/story/show/176143732)] refresh wallet information before start the bpd onboarding ([#2626](https://github.com/pagopa/io-app/issues/2626)) ([15c074d](https://github.com/pagopa/io-app/commit/15c074d72ccc8fca0b63a02cfcf77399597130db))
* **Bonus Pagamenti Digitali:** [[#176291435](https://www.pivotaltracker.com/story/show/176291435)] Glitch on BpdNotActivableInformation [#2648](https://github.com/pagopa/io-app/issues/2648) ([518bc47](https://github.com/pagopa/io-app/commit/518bc479ef2b90d192ea49bb5fa9b1c4c8c80d08))

## [1.16.0-rc.0](https://github.com/pagopa/io-app/compare/1.15.0-rc.7...1.16.0-rc.0) (2020-12-23)


### Features

* [[#176167278](https://www.pivotaltracker.com/story/show/176167278)] Show message when remove profile if some bonus is active ([#2597](https://github.com/pagopa/io-app/issues/2597)) ([9b4d556](https://github.com/pagopa/io-app/commit/9b4d556b6a51336ffc75f6575c0f96e28e18479b))
* [[#176225664](https://www.pivotaltracker.com/story/show/176225664)] PSP copy change ([#2619](https://github.com/pagopa/io-app/issues/2619)) ([8eea071](https://github.com/pagopa/io-app/commit/8eea07102152bcb5a407b8a62ca344fce3d83c01))
* **Bonus Pagamenti Digitali:** [[#176143533](https://www.pivotaltracker.com/story/show/176143533)] Add info allowed method card detail ([#2606](https://github.com/pagopa/io-app/issues/2606)) ([6b19867](https://github.com/pagopa/io-app/commit/6b19867b01a16cbfe4cdfdd5bb4ec16b07deb7f8))
* **Bonus Pagamenti Digitali:** [[#176191325](https://www.pivotaltracker.com/story/show/176191325)] Store, reducer and networking placeholder for ranking ([#2620](https://github.com/pagopa/io-app/issues/2620)) ([0e73189](https://github.com/pagopa/io-app/commit/0e7318988cde02e2bfa971449dc0a227ce2d9804))
* **Bonus Pagamenti Digitali:** [[#176220886](https://www.pivotaltracker.com/story/show/176220886)] Cashback ranking remote activation ([#2627](https://github.com/pagopa/io-app/issues/2627)) ([c13166f](https://github.com/pagopa/io-app/commit/c13166f5e709ffc19cb5d207f53d97ad4e3eafa4))


### Bug Fixes

* [[#175949490](https://www.pivotaltracker.com/story/show/175949490)] Request current PIN before letting the user change it ([#2599](https://github.com/pagopa/io-app/issues/2599)) ([7b01871](https://github.com/pagopa/io-app/commit/7b01871587ee6561e8ace6d230f868861fb47043))
* **Bonus Pagamenti Digitali:** [[#175923444](https://www.pivotaltracker.com/story/show/175923444)] Bottom sheet should be closed on hardware back button press ([#2614](https://github.com/pagopa/io-app/issues/2614)) ([d3b11ca](https://github.com/pagopa/io-app/commit/d3b11ca022bcf3f1f9c15db60aa40812bca72295))


### Chores

* **deps:** bump ini from 1.3.5 to 1.3.8 ([#2594](https://github.com/pagopa/io-app/issues/2594)) ([e257e19](https://github.com/pagopa/io-app/commit/e257e19fa7fe9541dc46253298ef9a0828aa42ae))

## [1.15.0-rc.7](https://github.com/pagopa/io-app/compare/1.15.0-rc.6...1.15.0-rc.7) (2020-12-18)


### Features

* **Bonus Pagamenti Digitali:** [[#175883186](https://www.pivotaltracker.com/story/show/175883186)] Add remote contextual help to satispay screen ([#2609](https://github.com/pagopa/io-app/issues/2609)) ([37121aa](https://github.com/pagopa/io-app/commit/37121aaf2e51319d496e5009b5fdcd11c53254f2))
* [[#175953265](https://www.pivotaltracker.com/story/show/175953265)] Add bonus description ([#2497](https://github.com/pagopa/io-app/issues/2497)) ([f3bd818](https://github.com/pagopa/io-app/commit/f3bd818d6b08553fb06c7e05417ca4c17e6614d1))


### Chores

* **Bonus Pagamenti Digitali:** [[#176203167](https://www.pivotaltracker.com/story/show/176203167)] Satispay screens graphical refinements ([#2611](https://github.com/pagopa/io-app/issues/2611)) ([ebd0735](https://github.com/pagopa/io-app/commit/ebd0735fd326ec261b9cc390b662b6248e79f513))
* [[#176190732](https://www.pivotaltracker.com/story/show/176190732)] Allow Mixpanel to send push notification ([#2615](https://github.com/pagopa/io-app/issues/2615)) ([5aa4c3a](https://github.com/pagopa/io-app/commit/5aa4c3a82526d7e1d10a87fef014f4cdc61889d2))

## [1.15.0-rc.6](https://github.com/pagopa/io-app/compare/1.15.0-rc.5...1.15.0-rc.6) (2020-12-16)


### Features

* **Bonus Pagamenti Digitali:** [[#175883850](https://www.pivotaltracker.com/story/show/175883850),[#176166431](https://www.pivotaltracker.com/story/show/176166431),[#175883914](https://www.pivotaltracker.com/story/show/175883914),[#175883928](https://www.pivotaltracker.com/story/show/175883928)] Activate digital payments & add satispay screens ([#2601](https://github.com/pagopa/io-app/issues/2601)) ([5b66a1b](https://github.com/pagopa/io-app/commit/5b66a1bcff5aa7a8b250c1cc5849451fa9c7337a))


### Bug Fixes

* [[#176166635](https://www.pivotaltracker.com/story/show/176166635)] removes border from the paid badge [#2604](https://github.com/pagopa/io-app/issues/2604) ([fc3078d](https://github.com/pagopa/io-app/commit/fc3078daff88aee46c1bafff90e6b6a3528bfbe6))

## [1.15.0-rc.5](https://github.com/pagopa/io-app/compare/1.15.0-rc.4...1.15.0-rc.5) (2020-12-15)


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176129361](https://www.pivotaltracker.com/story/show/176129361)] Cashback payment method. Change footer buttons logic ([#2592](https://github.com/pagopa/io-app/issues/2592)) ([187fa70](https://github.com/pagopa/io-app/commit/187fa704f691b1f7d51f8a018e7f51c35e95848c))


### Chores

* **Bonus Pagamenti Digitali:** [[#176175954](https://www.pivotaltracker.com/story/show/176175954)] Missing transaction copy update ([#2600](https://github.com/pagopa/io-app/issues/2600)) ([cd57293](https://github.com/pagopa/io-app/commit/cd5729386405659cf84691a7ebf42272c1f4323a))

## [1.15.0-rc.4](https://github.com/pagopa/io-app/compare/1.15.0-rc.3...1.15.0-rc.4) (2020-12-15)


### Features

* **Bonus Pagamenti Digitali:** [[#175973060](https://www.pivotaltracker.com/story/show/175973060)] Change networking logic for bpd periods & amounts retrieval ([#2590](https://github.com/pagopa/io-app/issues/2590)) ([ebe4a02](https://github.com/pagopa/io-app/commit/ebe4a023750d3b1c3bfb0996a27e711c7ce54da8))

## [1.15.0-rc.3](https://github.com/pagopa/io-app/compare/1.15.0-rc.2...1.15.0-rc.3) (2020-12-15)


### Bug Fixes

* [[#176038688](https://www.pivotaltracker.com/story/show/176038688)] Fixed en locale typo [#2595](https://github.com/pagopa/io-app/issues/2595) ([a6bb953](https://github.com/pagopa/io-app/commit/a6bb9535f09362cd1106a9e6f7c1caf4e466f0c6))
* [[#176173361](https://www.pivotaltracker.com/story/show/176173361)] Wallets store doesn't use persist transform ([#2598](https://github.com/pagopa/io-app/issues/2598)) ([898feca](https://github.com/pagopa/io-app/commit/898fecac71d026de7b9125ffd3b665ecdc2addd4))

## [1.15.0-rc.2](https://github.com/pagopa/io-app/compare/1.15.0-rc.1...1.15.0-rc.2) (2020-12-15)


### Features

* **Bonus Pagamenti Digitali:** [[#175883179](https://www.pivotaltracker.com/story/show/175883179)] track satispay actions ([#2582](https://github.com/pagopa/io-app/issues/2582)) ([3646d4c](https://github.com/pagopa/io-app/commit/3646d4c718413d50ec71b763c353fe550c45e0d1))
* [[#173248858](https://www.pivotaltracker.com/story/show/173248858)] "Update IO" CTA web URL fallback added + fixed component method  ([#2491](https://github.com/pagopa/io-app/issues/2491)) ([99a9209](https://github.com/pagopa/io-app/commit/99a920919cb337363fb55121b7ff020a57c32d95))
* **Bonus Pagamenti Digitali:** [[#175898796](https://www.pivotaltracker.com/story/show/175898796)] Fixed IBAN insertion field font [#2588](https://github.com/pagopa/io-app/issues/2588) ([5ec0c94](https://github.com/pagopa/io-app/commit/5ec0c940c807dbc47cdfcecb89d62b18532afd82))
* **Bonus Pagamenti Digitali:** [[#176071117](https://www.pivotaltracker.com/story/show/176071117)] Refactor Bancomat analytics ([#2572](https://github.com/pagopa/io-app/issues/2572)) ([51d0cf6](https://github.com/pagopa/io-app/commit/51d0cf634d9d0d3cb35e33201ae0ed0d5fef289e))
* **Bonus Pagamenti Digitali:** [[#176091990](https://www.pivotaltracker.com/story/show/176091990)] Improve credit card error screen UI ([#2573](https://github.com/pagopa/io-app/issues/2573)) ([a1039b7](https://github.com/pagopa/io-app/commit/a1039b76e062a3fda4b55c82a9b198639ef5ce44))
* **Bonus Pagamenti Digitali:** [[#176092936](https://www.pivotaltracker.com/story/show/176092936)] Handles blocked bancomat items ([#2556](https://github.com/pagopa/io-app/issues/2556)) ([52da6c7](https://github.com/pagopa/io-app/commit/52da6c78f5ae01fe9f8cfc8009d8fba6580ded8b))
* **Bonus Pagamenti Digitali:** [[#176093031](https://www.pivotaltracker.com/story/show/176093031)] Setup Mixpanel push notification ([#2555](https://github.com/pagopa/io-app/issues/2555)) ([0cff182](https://github.com/pagopa/io-app/commit/0cff18243111ae496a808a55091c7ccbe83b7311))
* **Bonus Pagamenti Digitali:** [[#176094126](https://www.pivotaltracker.com/story/show/176094126),[#175991428](https://www.pivotaltracker.com/story/show/175991428)] Adds more info when missing transactions ([#2570](https://github.com/pagopa/io-app/issues/2570)) ([0977ab6](https://github.com/pagopa/io-app/commit/0977ab697d157dd6524daa99c5da00f4dd708d67))


### Bug Fixes

* [[#175822523](https://www.pivotaltracker.com/story/show/175822523)] Fix time format in MessageListItem ([#2431](https://github.com/pagopa/io-app/issues/2431)) ([0e90930](https://github.com/pagopa/io-app/commit/0e90930366f4165b9284625807d667e41c34d3ef))
* **Bonus Pagamenti Digitali:** [[#175990175](https://www.pivotaltracker.com/story/show/175990175)] fix double click on bancomat search ([#2585](https://github.com/pagopa/io-app/issues/2585)) ([87ed7f1](https://github.com/pagopa/io-app/commit/87ed7f138c83bcb7284b5168c4e1f48b7cf5f95c))
* **Bonus Pagamenti Digitali:** [[#176117520](https://www.pivotaltracker.com/story/show/176117520)] Restore service banner on Bancomat screens ([#2568](https://github.com/pagopa/io-app/issues/2568)) ([66edf3f](https://github.com/pagopa/io-app/commit/66edf3f97703683282913145fd6facd0c4df14ea))
* **Bonus Pagamenti Digitali:** [[#176137613](https://www.pivotaltracker.com/story/show/176137613)] Warning banner shows a wrong icon ([#2578](https://github.com/pagopa/io-app/issues/2578)) ([e407fa0](https://github.com/pagopa/io-app/commit/e407fa05923a30f81cfef977705d2bae6b382d33))


### Chores

* **Bonus Pagamenti Digitali:** [[#176078094](https://www.pivotaltracker.com/story/show/176078094)] Added supported credit cards page link ([#2548](https://github.com/pagopa/io-app/issues/2548)) ([70d1ca6](https://github.com/pagopa/io-app/commit/70d1ca69b8b9d7d6c19e639902a96c96864d258e))
* **Bonus Pagamenti Digitali:** [[#176095635](https://www.pivotaltracker.com/story/show/176095635)] Changed color to the amount of cashback received ([#2571](https://github.com/pagopa/io-app/issues/2571)) ([6e08b1e](https://github.com/pagopa/io-app/commit/6e08b1ed473f65ba8aaf9d1c54dfb13b4fcf5d9c))
* **Bonus Pagamenti Digitali:** [[#176114319](https://www.pivotaltracker.com/story/show/176114319)] Backoff retry on credit card insertion ([#2562](https://github.com/pagopa/io-app/issues/2562)) ([b469b63](https://github.com/pagopa/io-app/commit/b469b632f48634ff618161008fe46fa2a56b7208))
* **Bonus Pagamenti Digitali:** [[#176148630](https://www.pivotaltracker.com/story/show/176148630)] Add tests on SectionStatusComponent ([#2586](https://github.com/pagopa/io-app/issues/2586)) ([dcea2fd](https://github.com/pagopa/io-app/commit/dcea2fd16ea0cee980b031ec09e64428aa3acd00))

## [1.15.0-rc.1](https://github.com/pagopa/io-app/compare/1.15.0-rc.0...1.15.0-rc.1) (2020-12-10)


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175892077](https://www.pivotaltracker.com/story/show/175892077)] Fix safearea on trx button and scroll no transactions ([#2550](https://github.com/pagopa/io-app/issues/2550)) ([fa829f8](https://github.com/pagopa/io-app/commit/fa829f83697aa5b4bfbfc520827eb0f04d80ee68))


### Chores

* **Bonus Pagamenti Digitali:** [[#176039881](https://www.pivotaltracker.com/story/show/176039881)] upgrade bancomat research screen ([#2551](https://github.com/pagopa/io-app/issues/2551)) ([82192ee](https://github.com/pagopa/io-app/commit/82192ee200144ee7987fa312e42fe938d8dfa2c6))

## [1.15.0-rc.0](https://github.com/pagopa/io-app/compare/1.14.0-rc.1...1.15.0-rc.0) (2020-12-10)


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175991400](https://www.pivotaltracker.com/story/show/175991400)] Fixes overflow text on bottomsheet title ([#2552](https://github.com/pagopa/io-app/issues/2552)) ([49a0c7d](https://github.com/pagopa/io-app/commit/49a0c7d5b0443dd6081f3f9ee83abc11f9c21dce))
* **Bonus Pagamenti Digitali:** [[#176091299](https://www.pivotaltracker.com/story/show/176091299)] Resize bancomat confirmation bottomsheet ([#2553](https://github.com/pagopa/io-app/issues/2553)) ([51092a7](https://github.com/pagopa/io-app/commit/51092a7c17468c2fb64d71b57908c0615e271882))

## [1.14.0-rc.1](https://github.com/pagopa/io-app/compare/1.14.0-rc.0...1.14.0-rc.1) (2020-12-09)


### Features

* **Bonus Pagamenti Digitali:** [[#175165668](https://www.pivotaltracker.com/story/show/175165668),[#175165677](https://www.pivotaltracker.com/story/show/175165677)] IBAN code is now Monospace Bold and selectable on KO screens ([#2542](https://github.com/pagopa/io-app/issues/2542)) ([76e0dbf](https://github.com/pagopa/io-app/commit/76e0dbf2e9d782a5c8d689087a4950fe641c7fd8))
* **Bonus Pagamenti Digitali:** [[#176071266](https://www.pivotaltracker.com/story/show/176071266)] Dispatch action instead of calling saga for fetchTransactions and fetchWallets ([#2538](https://github.com/pagopa/io-app/issues/2538)) ([47b7f1f](https://github.com/pagopa/io-app/commit/47b7f1f2190a55318657e4af5f3b143c0e88d360))
* [[#176071893](https://www.pivotaltracker.com/story/show/176071893)] Make report attachments configurable [#2537](https://github.com/pagopa/io-app/issues/2537) ([d60b0f2](https://github.com/pagopa/io-app/commit/d60b0f2354c8438520ff091a9a58136882cc5b55))
* **Bonus Pagamenti Digitali:** [[#176074721](https://www.pivotaltracker.com/story/show/176074721)] Add payment method status badge ([#2543](https://github.com/pagopa/io-app/issues/2543)) ([de45d79](https://github.com/pagopa/io-app/commit/de45d79560ce8b9d41338d2ffdd2dcdaeee2ccd3))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175896616](https://www.pivotaltracker.com/story/show/175896616)] Fixes scrollview snap on android ([#2541](https://github.com/pagopa/io-app/issues/2541)) ([2fe78cc](https://github.com/pagopa/io-app/commit/2fe78ccb07328855634c99ed7f0affce14584bd6))
* **Bonus Pagamenti Digitali:** [[#176076602](https://www.pivotaltracker.com/story/show/176076602)] Fixes cut text on add method bs ([#2544](https://github.com/pagopa/io-app/issues/2544)) ([12b0cd5](https://github.com/pagopa/io-app/commit/12b0cd5446d017e0c29fc89d835a6ccfbf9f1696))


### Chores

* **Bonus Pagamenti Digitali:** [[#176069568](https://www.pivotaltracker.com/story/show/176069568)] Why other cards? ([#2546](https://github.com/pagopa/io-app/issues/2546)) ([89f0bb9](https://github.com/pagopa/io-app/commit/89f0bb972406ce187cf3194eefa22042b34d0371))

## [1.14.0-rc.0](https://github.com/pagopa/io-app/compare/1.13.0-rc.1...1.14.0-rc.0) (2020-12-09)

## [1.13.0-rc.1](https://github.com/pagopa/io-app/compare/1.13.0-rc.0...1.13.0-rc.1) (2020-12-09)


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176068210](https://www.pivotaltracker.com/story/show/176068210)] Remove beta references ([#2535](https://github.com/pagopa/io-app/issues/2535)) ([1e4ffb4](https://github.com/pagopa/io-app/commit/1e4ffb4e80c4bc9b28d64fd9928db8273aaafb21))

## [1.13.0-rc.0](https://github.com/pagopa/io-app/compare/1.12.0-rc.1...1.13.0-rc.0) (2020-12-08)


### Features

* **Bonus Pagamenti Digitali:** [[#176050060](https://www.pivotaltracker.com/story/show/176050060)] Wallets home rework ([#2529](https://github.com/pagopa/io-app/issues/2529)) ([74df78d](https://github.com/pagopa/io-app/commit/74df78d1148e646463bd0835468530376e1b80ce))
* **Bonus Pagamenti Digitali:** [[#176052891](https://www.pivotaltracker.com/story/show/176052891)] Adds logic to persist loaded wallets ([#2525](https://github.com/pagopa/io-app/issues/2525)) ([675c1ee](https://github.com/pagopa/io-app/commit/675c1ee6670aee58f0e3f8e1c58bb669f07fa6c3))
* **Bonus Pagamenti Digitali:** [[#176053058](https://www.pivotaltracker.com/story/show/176053058)] Implements new Add button on wallet home screen ([#2528](https://github.com/pagopa/io-app/issues/2528)) ([c7d23b6](https://github.com/pagopa/io-app/commit/c7d23b6d8f03afae45b699588b54406a87e1a818))
* **Bonus Pagamenti Digitali:** [[#176053275](https://www.pivotaltracker.com/story/show/176053275)] BPDDetailScreen ([#2527](https://github.com/pagopa/io-app/issues/2527)) ([e9eb0cb](https://github.com/pagopa/io-app/commit/e9eb0cb0666d1ee8c2b3b5c80e4dbd720fa36b61))
* **Bonus Pagamenti Digitali:** [[#176058079](https://www.pivotaltracker.com/story/show/176058079)] support backoff retry ([#2530](https://github.com/pagopa/io-app/issues/2530)) ([9a16896](https://github.com/pagopa/io-app/commit/9a16896c28ba3f3a013bc5dcddf23de1371d856c))
* **Bonus Pagamenti Digitali:** [[#176058971](https://www.pivotaltracker.com/story/show/176058971)] Update ErrorPaymentMethodsScreen ([#2532](https://github.com/pagopa/io-app/issues/2532)) ([e213fb4](https://github.com/pagopa/io-app/commit/e213fb4a951d57cd37cf7931ae73441df88956c3))
* **Bonus Pagamenti Digitali:** [[#176059090](https://www.pivotaltracker.com/story/show/176059090)] Adds SectionStatusComponent to email and bpd details screen ([#2531](https://github.com/pagopa/io-app/issues/2531)) ([24ff8c2](https://github.com/pagopa/io-app/commit/24ff8c22edfc82486fca72c629a950a1c7532141))

## [1.12.0-rc.1](https://github.com/pagopa/io-app/compare/1.12.0-rc.0...1.12.0-rc.1) (2020-12-07)


### Features

* [[#176015857](https://www.pivotaltracker.com/story/show/176015857)] Adds FAQ on AddCardScreen and AddMethodScreen ([#2507](https://github.com/pagopa/io-app/issues/2507)) ([a223a8b](https://github.com/pagopa/io-app/commit/a223a8b34c21cc1fe936499462f3a894fa8b6bb1))
* [[#176032092](https://www.pivotaltracker.com/story/show/176032092)] Change codecov settings [#2506](https://github.com/pagopa/io-app/issues/2506) ([94fcd68](https://github.com/pagopa/io-app/commit/94fcd68d4942529e352967d2f1d457a2035a9c78))
* **Bonus Pagamenti Digitali:** [[#175044623](https://www.pivotaltracker.com/story/show/175044623)] add contextual help onboarding bancomat ([#2518](https://github.com/pagopa/io-app/issues/2518)) ([a87c073](https://github.com/pagopa/io-app/commit/a87c073f29e2698f7f476d76160fde2cd8399f27))
* **Bonus Pagamenti Digitali:** [[#176014374](https://www.pivotaltracker.com/story/show/176014374)] Show section banner status ([#2513](https://github.com/pagopa/io-app/issues/2513)) ([16c599d](https://github.com/pagopa/io-app/commit/16c599d4d4374296b7107988229c03607e1b9a12))
* **Bonus Pagamenti Digitali:** [[#176027175](https://www.pivotaltracker.com/story/show/176027175)] Adds client for ABI list to static contents ([#2508](https://github.com/pagopa/io-app/issues/2508)) ([75bb74e](https://github.com/pagopa/io-app/commit/75bb74eaaf0f54d02d648ee998271612978cb932))
* **Bonus Pagamenti Digitali:** [[#176031992](https://www.pivotaltracker.com/story/show/176031992)] Handle wallet failure in bpd detail screen  ([#2514](https://github.com/pagopa/io-app/issues/2514)) ([15db0a4](https://github.com/pagopa/io-app/commit/15db0a49cb10ec7574d11216be91fed799084088))
* **Bonus Pagamenti Digitali:** [[#176033170](https://www.pivotaltracker.com/story/show/176033170)] Show BPDCard if wallets has error ([#2512](https://github.com/pagopa/io-app/issues/2512)) ([6c4e594](https://github.com/pagopa/io-app/commit/6c4e5949c728e5eca94818885db85f41ba1ce797))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175717738](https://www.pivotaltracker.com/story/show/175717738)] Fix android goback button on BPD Cashback ([#2489](https://github.com/pagopa/io-app/issues/2489)) ([3bf7b21](https://github.com/pagopa/io-app/commit/3bf7b21876430ebbc13205569c36ccec9177a241))
* **Bonus Pagamenti Digitali:** [[#176007328](https://www.pivotaltracker.com/story/show/176007328)] Overflow of payment method representation component (used in bpd toggle) ([#2493](https://github.com/pagopa/io-app/issues/2493)) ([d4416fd](https://github.com/pagopa/io-app/commit/d4416fdc7eabdcc93995d28c9e83ca3f4dbffb0a))
* **Bonus Pagamenti Digitali:** [[#176027161](https://www.pivotaltracker.com/story/show/176027161)] When a link inside a contextual help is pressed, the modal is not automatically closed  ([#2516](https://github.com/pagopa/io-app/issues/2516)) ([064ac0d](https://github.com/pagopa/io-app/commit/064ac0d20173aad4fcd0c3d2e0ef79a9a37a107f))
* **Bonus Pagamenti Digitali:** [[#176027176](https://www.pivotaltracker.com/story/show/176027176)] Corrected bancomat string fallback ([#2517](https://github.com/pagopa/io-app/issues/2517)) ([1393b32](https://github.com/pagopa/io-app/commit/1393b322129e15f5d80bc57fc1d1de76a3922371))
* **Bonus Pagamenti Digitali:** [[#176033245](https://www.pivotaltracker.com/story/show/176033245)] Android duplicate IBAN insertion ([#2511](https://github.com/pagopa/io-app/issues/2511)) ([2910846](https://github.com/pagopa/io-app/commit/29108464b23414b40e971d6c04ae422a6ddff274))

## [1.12.0-rc.0](https://github.com/pagopa/io-app/compare/1.11.0-rc.2...1.12.0-rc.0) (2020-12-07)


### Features

* **Bonus pagamenti digitali:** Typo in self-declaration screen ([#2503](https://github.com/pagopa/io-app/issues/2503)) ([f4ce213](https://github.com/pagopa/io-app/commit/f4ce2138ed173523b4c60651cc5584bd680a0794))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#176007673](https://www.pivotaltracker.com/story/show/176007673)] Update index.yml ([#2492](https://github.com/pagopa/io-app/issues/2492)) ([a43a3fb](https://github.com/pagopa/io-app/commit/a43a3fb5c37085ad1bd27d604da095493f88f608))


### Chores

* **Bonus Pagamenti Digitali:** [[#176015967](https://www.pivotaltracker.com/story/show/176015967)] Wallet Contextual Help Text Update [#2496](https://github.com/pagopa/io-app/issues/2496) ([5fbb36b](https://github.com/pagopa/io-app/commit/5fbb36bd64af1998da2fb708b0a872c7cf6e1dfd))

## [1.11.0-rc.2](https://github.com/pagopa/io-app/compare/1.11.0-rc.1...1.11.0-rc.2) (2020-12-03)


### Features

* **Bonus pagamenti digitali:** Valid transactions text update ([#2487](https://github.com/pagopa/io-app/issues/2487)) ([9594272](https://github.com/pagopa/io-app/commit/9594272f716871f4e84424bbe2d083b7721fc070))
* **Bonus Pagamenti Digitali:** [[#175777655](https://www.pivotaltracker.com/story/show/175777655)] Display bank fallback if logo is not available in bancomat card ([#2488](https://github.com/pagopa/io-app/issues/2488)) ([70eedd7](https://github.com/pagopa/io-app/commit/70eedd7e30ae91e5ebad2bbe422afdc5b9355a23))


### Chores

* **Bonus Pagamenti Digitali:** [[#175991108](https://www.pivotaltracker.com/story/show/175991108)] Copy updates [#2486](https://github.com/pagopa/io-app/issues/2486) ([cdb8f43](https://github.com/pagopa/io-app/commit/cdb8f43db09fde32d59abe8a1a3b093fe6cc27c5))

## [1.11.0-rc.1](https://github.com/pagopa/io-app/compare/1.11.0-rc.0...1.11.0-rc.1) (2020-12-03)


### Features

* [[#175375298](https://www.pivotaltracker.com/story/show/175375298)] Add choice to send support token on Instabug reporting ([#2461](https://github.com/pagopa/io-app/issues/2461)) ([dce7980](https://github.com/pagopa/io-app/commit/dce7980f7bf5b8b2a8c9aa9fba08b8f8e5a40325))
* **Bonus pagamenti digitali:** [[#175975866](https://www.pivotaltracker.com/story/show/175975866)] BPD copy updates ([#2482](https://github.com/pagopa/io-app/issues/2482)) ([8a0a2d8](https://github.com/pagopa/io-app/commit/8a0a2d8c85a198a60e32be49cefb8e0acecda3ec))
* **Bonus Pagamenti Digitali:** [[#175044647](https://www.pivotaltracker.com/story/show/175044647),[#175044584](https://www.pivotaltracker.com/story/show/175044584),[#175044536](https://www.pivotaltracker.com/story/show/175044536),[#175311259](https://www.pivotaltracker.com/story/show/175311259)] Add Contextual help to cashback screens ([#2473](https://github.com/pagopa/io-app/issues/2473)) ([cc05a59](https://github.com/pagopa/io-app/commit/cc05a597585e0bc5750512f1525d684e2c6b5b0e))
* **Bonus Pagamenti Digitali:** [[#175164698](https://www.pivotaltracker.com/story/show/175164698)] Display bancomat bottomsheet after adding a new bancomat ([#2466](https://github.com/pagopa/io-app/issues/2466)) ([e9fa29d](https://github.com/pagopa/io-app/commit/e9fa29d17a8564f581ebc21e46202314f62ed50f))
* **Bonus Pagamenti Digitali:** [[#175909052](https://www.pivotaltracker.com/story/show/175909052)] Display only internal payment methods ([#2471](https://github.com/pagopa/io-app/issues/2471)) ([e5eb533](https://github.com/pagopa/io-app/commit/e5eb533701f8d65a547760b31ddde636454192c2))
* **Bonus Pagamenti Digitali:** [[#175931579](https://www.pivotaltracker.com/story/show/175931579)] digital payment is incoming ([#2457](https://github.com/pagopa/io-app/issues/2457)) ([238e3a3](https://github.com/pagopa/io-app/commit/238e3a3ea20ed0614b1fd23bfc7dc49a3e7b3374))
* **Bonus Pagamenti Digitali:** [[#175971953](https://www.pivotaltracker.com/story/show/175971953)] No retries and increased timeout for PM requests ([#2484](https://github.com/pagopa/io-app/issues/2484)) ([ffce56d](https://github.com/pagopa/io-app/commit/ffce56d4b6c3b338f2d6e428edbf63f1ad3fc968))
* **Bonus Pagamenti Digitali:** [[#175989320](https://www.pivotaltracker.com/story/show/175989320)] enable BPD ([#2485](https://github.com/pagopa/io-app/issues/2485)) ([490e2d3](https://github.com/pagopa/io-app/commit/490e2d37b7678825d7ae681df97606736460ef8a))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175765023](https://www.pivotaltracker.com/story/show/175765023)] Fixes on Add Bancomat Screen ([#2449](https://github.com/pagopa/io-app/issues/2449)) ([0d56ddf](https://github.com/pagopa/io-app/commit/0d56ddf4f456ff97e9cb94109e217f0da6e47868))
* **Bonus Pagamenti Digitali:** [[#175931000](https://www.pivotaltracker.com/story/show/175931000)] Convert date formatting with i18n ([#2467](https://github.com/pagopa/io-app/issues/2467)) ([724aa8a](https://github.com/pagopa/io-app/commit/724aa8a0def4866fcc6be870336c91980a487483))
* **Bonus Pagamenti Digitali:** [[#175973388](https://www.pivotaltracker.com/story/show/175973388)] Fixes BPD card spaces ([#2480](https://github.com/pagopa/io-app/issues/2480)) ([10ce988](https://github.com/pagopa/io-app/commit/10ce98888c6d4f947db538f9d73bd24bed2e342c))


### Chores

* **Bonus Pagamenti Digitali:** [[#175963022](https://www.pivotaltracker.com/story/show/175963022)] Minor networking improvement ([#2476](https://github.com/pagopa/io-app/issues/2476)) ([12b4333](https://github.com/pagopa/io-app/commit/12b433313cd83ad41d3b7f890aa2110171308cab))

## [1.11.0-rc.0](https://github.com/pagopa/io-app/compare/1.10.0-rc.5...1.11.0-rc.0) (2020-12-02)


### Features

* **Bonus Pagamenti Digitali:** [[#175883778](https://www.pivotaltracker.com/story/show/175883778),[#175883201](https://www.pivotaltracker.com/story/show/175883201),[#175883970](https://www.pivotaltracker.com/story/show/175883970)] Onboard Satispay account orchestration ([#2444](https://github.com/pagopa/io-app/issues/2444)) ([48b6d91](https://github.com/pagopa/io-app/commit/48b6d915aa397435438fbaa713602ec6ab8388f9))
* **Bonus Pagamenti Digitali:** [[#175919231](https://www.pivotaltracker.com/story/show/175919231)] Update self declaration screen ([#2464](https://github.com/pagopa/io-app/issues/2464)) ([ea7218e](https://github.com/pagopa/io-app/commit/ea7218e99a37f2e4e5c2d51ca2a325fcfffd0cce))
* **Bonus Pagamenti Digitali:** [[#175932765](https://www.pivotaltracker.com/story/show/175932765)] Start cashback from CTA ([#2465](https://github.com/pagopa/io-app/issues/2465)) ([4865bb1](https://github.com/pagopa/io-app/commit/4865bb1fb06bd077a8e24271f4c889de49ea649e))
* **Bonus Pagamenti Digitali:** [[#175949561](https://www.pivotaltracker.com/story/show/175949561)] Display cashback future periods ("Inactive") in wallet ([#2470](https://github.com/pagopa/io-app/issues/2470)) ([08e1e9d](https://github.com/pagopa/io-app/commit/08e1e9d044bdb0ccc40a3cd23970442e8bc0e9b0))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175923455](https://www.pivotaltracker.com/story/show/175923455)] Fixes copy button press on android [#2469](https://github.com/pagopa/io-app/issues/2469) ([9b73c1f](https://github.com/pagopa/io-app/commit/9b73c1f13e4932bbf7f8cee0610ba6ec50722e1e))
* **Bonus Pagamenti Digitali:** [[#175934342](https://www.pivotaltracker.com/story/show/175934342)] Onboarding credit card failure instead of success [#2459](https://github.com/pagopa/io-app/issues/2459) ([6ca2db2](https://github.com/pagopa/io-app/commit/6ca2db29b01d805839b4e94d608bbb4368fd86c2))
* [[#173745888](https://www.pivotaltracker.com/story/show/173745888)] Ingress screen contextual help [#2478](https://github.com/pagopa/io-app/issues/2478) ([f53125e](https://github.com/pagopa/io-app/commit/f53125e045a117928c31efb99180dabf3672e5ec))
* [[#175848198](https://www.pivotaltracker.com/story/show/175848198),[#175641468](https://www.pivotaltracker.com/story/show/175641468)] Fixed: overlapping label when message is too long, label text not being centered in its wrapper ([#2475](https://github.com/pagopa/io-app/issues/2475)) ([676bd90](https://github.com/pagopa/io-app/commit/676bd9006b0278f32f390a0102eb8df7c0f9552a))
* **Bonus Pagamenti Digitali:** [[#175953061](https://www.pivotaltracker.com/story/show/175953061)] Fix overflow in transaction item ([#2477](https://github.com/pagopa/io-app/issues/2477)) ([8f19134](https://github.com/pagopa/io-app/commit/8f19134dc401a18336d4c9bd1a2a182962df38a6))


### Chores

* **Bonus Pagamenti Digitali:** [[#175953788](https://www.pivotaltracker.com/story/show/175953788)] General FAQ update [#2472](https://github.com/pagopa/io-app/issues/2472) ([e7d4289](https://github.com/pagopa/io-app/commit/e7d42894539c1e581050c920a059b864ae0dfdc0))
* [[#175855068](https://www.pivotaltracker.com/story/show/175855068)] Mixpanel user id reconciliation ([#2439](https://github.com/pagopa/io-app/issues/2439)) ([0d51036](https://github.com/pagopa/io-app/commit/0d51036cd38bb1aad50b8af0d6ccc84871b2cd77))
* [[#175948985](https://www.pivotaltracker.com/story/show/175948985)] Update bpd copy [#2474](https://github.com/pagopa/io-app/issues/2474) ([b17767f](https://github.com/pagopa/io-app/commit/b17767f40a9c4b0d68a69036fd2e7a283c1c82ab))

## [1.10.0-rc.5](https://github.com/pagopa/io-app/compare/1.10.0-rc.4...1.10.0-rc.5) (2020-11-30)


### Features

* **Bonus Pagamenti Digitali:** [[#175883276](https://www.pivotaltracker.com/story/show/175883276)] Adds the SatispayCard Wallet preview ([#2456](https://github.com/pagopa/io-app/issues/2456)) ([5892971](https://github.com/pagopa/io-app/commit/589297160d756b420e35528ad7d22f87fc225bea))
* **Bonus Pagamenti Digitali:** [[#175883374](https://www.pivotaltracker.com/story/show/175883374)] Satispay detail screen ([#2458](https://github.com/pagopa/io-app/issues/2458)) ([f888614](https://github.com/pagopa/io-app/commit/f888614fcf3c5839dfbadbf5fa015817c72ebfcb))
* **Bonus Pagamenti Digitali:** [[#175883764](https://www.pivotaltracker.com/story/show/175883764)] Satispay screens and navigation ([#2443](https://github.com/pagopa/io-app/issues/2443)) ([c095f94](https://github.com/pagopa/io-app/commit/c095f94abb7168ec3ba32ce682cc85d172dc4212))


### Bug Fixes

* [[#175877314](https://www.pivotaltracker.com/story/show/175877314)] An error occurred while opening external web url ([#2445](https://github.com/pagopa/io-app/issues/2445)) ([b87e4eb](https://github.com/pagopa/io-app/commit/b87e4ebdba03483b9ee1a5b3b0a64dc99266afe0))
* [[#175922873](https://www.pivotaltracker.com/story/show/175922873)] Birthday is wrong in FiscalCode screen ([#2453](https://github.com/pagopa/io-app/issues/2453)) ([d93b679](https://github.com/pagopa/io-app/commit/d93b679322a72774984e0230f37ad02eca262ce4))
* **Bonus Pagamenti Digitali:** [[#175938380](https://www.pivotaltracker.com/story/show/175938380)] restore bonus is incoming ([#2462](https://github.com/pagopa/io-app/issues/2462)) ([bebc071](https://github.com/pagopa/io-app/commit/bebc0710a497d40081e845729a159eaa4aa8a6ef))


### Chores

* **Payments:** [[#175845944](https://www.pivotaltracker.com/story/show/175845944)] Dispatch action to MixPanel on credit card addition failure [#2460](https://github.com/pagopa/io-app/issues/2460) ([3af4f1c](https://github.com/pagopa/io-app/commit/3af4f1c53eecbfde478cc1d8c230c2875c330bcd))

## [1.10.0-rc.4](https://github.com/pagopa/io-app/compare/1.10.0-rc.3...1.10.0-rc.4) (2020-11-29)


### Features

* **Bonus Pagamenti Digitali:** [[#175883088](https://www.pivotaltracker.com/story/show/175883088)] Adds page to select the digital method to add ([#2447](https://github.com/pagopa/io-app/issues/2447)) ([4f511da](https://github.com/pagopa/io-app/commit/4f511daff01e9faf1e0f5e4d472881a3c3acaee1))
* **Bonus Pagamenti Digitali:** [[#175923816](https://www.pivotaltracker.com/story/show/175923816)] Show that cashback is incoming ([#2454](https://github.com/pagopa/io-app/issues/2454)) ([bda7583](https://github.com/pagopa/io-app/commit/bda7583763939a3dd1bc497d435f4ab8a220f99f))
* **Bonus Pagamenti Digitali:** [[#175926004](https://www.pivotaltracker.com/story/show/175926004)] Show incoming payment methods ([#2455](https://github.com/pagopa/io-app/issues/2455)) ([6c775b2](https://github.com/pagopa/io-app/commit/6c775b273efa58ffe1e3d597c1443c5b48d7911f))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175922698](https://www.pivotaltracker.com/story/show/175922698)] On credit card insertion CTA is disabled ([#2451](https://github.com/pagopa/io-app/issues/2451)) ([4535941](https://github.com/pagopa/io-app/commit/4535941ff0873d4e3f22fff02bcb105f1a9dc8a8))
* **Bonus Pagamenti Digitali:** [[#175922831](https://www.pivotaltracker.com/story/show/175922831)] CTA text is wrong in bonus vacanze details screen [#2452](https://github.com/pagopa/io-app/issues/2452) ([f3917a3](https://github.com/pagopa/io-app/commit/f3917a322fbee528f7f0a1950c279c60badcd6a5))

## [1.10.0-rc.3](https://github.com/pagopa/io-app/compare/1.10.0-rc.2...1.10.0-rc.3) (2020-11-27)

## [1.10.0-rc.2](https://github.com/pagopa/io-app/compare/1.10.0-rc.1...1.10.0-rc.2) (2020-11-27)


### Features

* [[#175876595](https://www.pivotaltracker.com/story/show/175876595)] Adds alert when adding new method in bpd [#2434](https://github.com/pagopa/io-app/issues/2434) ([9e51f3a](https://github.com/pagopa/io-app/commit/9e51f3a54f64140366b5bcfb3011ff29c533fbf0))
* **Bonus Pagamenti Digitali:** [[#175796418](https://www.pivotaltracker.com/story/show/175796418)] Send support token within bug report ([#2409](https://github.com/pagopa/io-app/issues/2409)) ([ff4b0f6](https://github.com/pagopa/io-app/commit/ff4b0f6eec44d341c9f611bb0239b83fab7fa199))
* [[#175883641](https://www.pivotaltracker.com/story/show/175883641)] Support search Satispay API ([#2433](https://github.com/pagopa/io-app/issues/2433)) ([6758e5a](https://github.com/pagopa/io-app/commit/6758e5a1c98723c54ce104dc4e7805d830b39c44))
* **Bonus Pagamenti Digitali:** [[#175139165](https://www.pivotaltracker.com/story/show/175139165)] Declaration checkbox text is interactable ([#2427](https://github.com/pagopa/io-app/issues/2427)) ([71371ee](https://github.com/pagopa/io-app/commit/71371ee7033183af93c84b14ac72d2cec2eb1e07))
* **Bonus Pagamenti Digitali:** [[#175783832](https://www.pivotaltracker.com/story/show/175783832)] Alerts when BPD is already active ([#2420](https://github.com/pagopa/io-app/issues/2420)) ([bda6a45](https://github.com/pagopa/io-app/commit/bda6a45c6546daae559005748a245c958836daeb))
* **Bonus Pagamenti Digitali:** [[#175797662](https://www.pivotaltracker.com/story/show/175797662)] Display bancomat abi logo ([#2442](https://github.com/pagopa/io-app/issues/2442)) ([3f88d42](https://github.com/pagopa/io-app/commit/3f88d425091295cfb624831f9c30c1e219c2973a))
* **Bonus Pagamenti Digitali:** [[#175876762](https://www.pivotaltracker.com/story/show/175876762)] Prefill holder credit card form field ([#2437](https://github.com/pagopa/io-app/issues/2437)) ([6555f39](https://github.com/pagopa/io-app/commit/6555f3910fecba3c0ba64d250c64766f99c8655c))
* **Bonus Pagamenti Digitali:** [[#175876837](https://www.pivotaltracker.com/story/show/175876837)] Show disclaimer when activate bpd on a payment method ([#2440](https://github.com/pagopa/io-app/issues/2440)) ([601405c](https://github.com/pagopa/io-app/commit/601405c0506c206ab79fb06969b6ffa194f1808d))
* **Bonus Pagamenti Digitali:** [[#175883590](https://www.pivotaltracker.com/story/show/175883590)] Satispay and Bancomatpay selector ([#2429](https://github.com/pagopa/io-app/issues/2429)) ([1e22fb0](https://github.com/pagopa/io-app/commit/1e22fb0e75add62dc7475805411b1ab15f062415))
* **Bonus Pagamenti Digitali:** [[#175883670](https://www.pivotaltracker.com/story/show/175883670)] Support adding Satispay to wallet ([#2441](https://github.com/pagopa/io-app/issues/2441)) ([cb168f1](https://github.com/pagopa/io-app/commit/cb168f101370b22811003211a5356fd293a3c464))
* **Bonus Pagamenti Digitali:** [[#175883756](https://www.pivotaltracker.com/story/show/175883756)] Actions, store & reducer for Satispay onboarding ([#2436](https://github.com/pagopa/io-app/issues/2436)) ([20f7269](https://github.com/pagopa/io-app/commit/20f72694919ebe5ec6fe1466d91b03d05b1da646))
* **Bonus Pagamenti Digitali:** [[#175884177](https://www.pivotaltracker.com/story/show/175884177)] Adds BPay/Satispay card component ([#2438](https://github.com/pagopa/io-app/issues/2438)) ([ad27dcf](https://github.com/pagopa/io-app/commit/ad27dcf3ad120f632d88119ccb32d86537afdd79))


### Bug Fixes

* [[#174926807](https://www.pivotaltracker.com/story/show/174926807)] update Contextual Help home ([#2428](https://github.com/pagopa/io-app/issues/2428)) ([d4c1ff0](https://github.com/pagopa/io-app/commit/d4c1ff0216629c97e1fd6bcc0283c8c10f82885b))
* [[#175879918](https://www.pivotaltracker.com/story/show/175879918)] Add missing ca bancomat success code ([#2424](https://github.com/pagopa/io-app/issues/2424)) ([8268fb2](https://github.com/pagopa/io-app/commit/8268fb2aea035ffec90507828e5f43548d9f26b3))
* **Bonus Pagamenti Digitali:** [[#175697847](https://www.pivotaltracker.com/story/show/175697847)] Improve transaction details BS UI ([#2426](https://github.com/pagopa/io-app/issues/2426)) ([9c9e74c](https://github.com/pagopa/io-app/commit/9c9e74cd3e21574b6b24440735714846176e4c0f))
* **Bonus Pagamenti Digitali:** [[#175697866](https://www.pivotaltracker.com/story/show/175697866)] Shows an inline feedback to copy button ([#2425](https://github.com/pagopa/io-app/issues/2425)) ([b1a59e0](https://github.com/pagopa/io-app/commit/b1a59e0df50038344bd3cd281e790f3a30eaddb7))
* **Bonus Pagamenti Digitali:** [[#175717757](https://www.pivotaltracker.com/story/show/175717757),[#175876304](https://www.pivotaltracker.com/story/show/175876304)] Empty footer cuts screen content on BPD Detail ([#2423](https://github.com/pagopa/io-app/issues/2423)) ([09ed3f6](https://github.com/pagopa/io-app/commit/09ed3f6c04254473814dacb59313ac9b9e9aacfb))
* **Bonus Pagamenti Digitali:** [[#175897659](https://www.pivotaltracker.com/story/show/175897659)] Track the chosen abi [#2432](https://github.com/pagopa/io-app/issues/2432) ([0bd1dbf](https://github.com/pagopa/io-app/commit/0bd1dbf7ae5525d9e5720d476ab1b287c7457f65))
* **Bonus Pagamenti Digitali:** [[#175919180](https://www.pivotaltracker.com/story/show/175919180)] When bonus is incoming app shows an update alert ([#2448](https://github.com/pagopa/io-app/issues/2448)) ([90f21d5](https://github.com/pagopa/io-app/commit/90f21d55639c4398f7cb57f120e51342a6792e29))


### Chores

* **Bonus Pagamenti Digitali:** [[#175846429](https://www.pivotaltracker.com/story/show/175846429)] bpd copy updates ([#2450](https://github.com/pagopa/io-app/issues/2450)) ([d22aebc](https://github.com/pagopa/io-app/commit/d22aebc89e66e25b58d321316685ea2a2242b40a))

## [1.10.0-rc.1](https://github.com/pagopa/io-app/compare/1.10.0-rc.0...1.10.0-rc.1) (2020-11-24)


### Features

* **Bonus Pagamenti Digitali:** [[#174840894](https://www.pivotaltracker.com/story/show/174840894),[#175849556](https://www.pivotaltracker.com/story/show/175849556)] Managing the capabilities of a payment method, remove payment method button is not sticky ([#2410](https://github.com/pagopa/io-app/issues/2410)) ([80fc100](https://github.com/pagopa/io-app/commit/80fc100b65e5eca03142ff6c6a1d1875d7f09166))
* **Bonus Pagamenti Digitali:** [[#175115408](https://www.pivotaltracker.com/story/show/175115408)] Add self-declaration link ([#2407](https://github.com/pagopa/io-app/issues/2407)) ([d856b89](https://github.com/pagopa/io-app/commit/d856b89ce25e21cd0a7cd4bd619a9f27c6d73943))
* **Bonus Pagamenti Digitali:** [[#175477158](https://www.pivotaltracker.com/story/show/175477158)] BPD T&C and rules link ([#2417](https://github.com/pagopa/io-app/issues/2417)) ([85ca702](https://github.com/pagopa/io-app/commit/85ca7023bd4692cd76faa0d79bf2f3e0845d1a47))
* **Bonus Pagamenti Digitali:** [[#175488334](https://www.pivotaltracker.com/story/show/175488334),[#175760627](https://www.pivotaltracker.com/story/show/175760627)] Change the bancomat workflow & error handling, remove v-pay references ([#2396](https://github.com/pagopa/io-app/issues/2396)) ([2ec5b75](https://github.com/pagopa/io-app/commit/2ec5b7535d3adf611e0299fe6a111a2570bc3878))
* **Bonus Pagamenti Digitali:** [[#175718879](https://www.pivotaltracker.com/story/show/175718879)] Show remote faqs  ([#2419](https://github.com/pagopa/io-app/issues/2419)) ([5bf8066](https://github.com/pagopa/io-app/commit/5bf80664b5c82fd59da9703e07d21a032112d50c))
* **Bonus Pagamenti Digitali:** [[#175730280](https://www.pivotaltracker.com/story/show/175730280)] Handles transations button for no transaction available ([#2416](https://github.com/pagopa/io-app/issues/2416)) ([023ff1b](https://github.com/pagopa/io-app/commit/023ff1be0b00384b51039de93bc849ddca1f2d17))
* **Bonus Pagamenti Digitali:** [[#175780105](https://www.pivotaltracker.com/story/show/175780105)] Send missing action to mixpanel ([#2413](https://github.com/pagopa/io-app/issues/2413)) ([b5e4772](https://github.com/pagopa/io-app/commit/b5e47720f404f4976141ddd3c0702b89194a4f32))
* **Bonus Pagamenti Digitali:** [[#175796290](https://www.pivotaltracker.com/story/show/175796290),[#175778493](https://www.pivotaltracker.com/story/show/175778493),[#175778476](https://www.pivotaltracker.com/story/show/175778476)] Other channels payment method ([#2415](https://github.com/pagopa/io-app/issues/2415)) ([9492a3b](https://github.com/pagopa/io-app/commit/9492a3bde07638350d808e027c0b7fbccaea8b80))
* **Bonus Pagamenti Digitali:** [[#175796300](https://www.pivotaltracker.com/story/show/175796300)] WalletV2 could be Card, CreditCard, Satispay, Bancomatpay ([#2406](https://github.com/pagopa/io-app/issues/2406)) ([59ea2ce](https://github.com/pagopa/io-app/commit/59ea2ce9d1b147517f0bcd733dfbab623f9f0b6f))
* **Bonus Pagamenti Digitali:** [[#175797741](https://www.pivotaltracker.com/story/show/175797741)] Cashback milestone component ([#2408](https://github.com/pagopa/io-app/issues/2408)) ([6d07afc](https://github.com/pagopa/io-app/commit/6d07afcf3ce8c6c88c82bf834c1a4aef22eecfe7))
* [[#175060536](https://www.pivotaltracker.com/story/show/175060536)] new design delete profile ([#2401](https://github.com/pagopa/io-app/issues/2401)) ([8fe7cff](https://github.com/pagopa/io-app/commit/8fe7cff334b89bf919fd9dd45843c37d78079ee3))
* [[#175850928](https://www.pivotaltracker.com/story/show/175850928)] Add changelog scope for bpd [#2414](https://github.com/pagopa/io-app/issues/2414) ([4749a5a](https://github.com/pagopa/io-app/commit/4749a5a44707100d8ac0a78ad8d9104f99bf4823))


### Bug Fixes

* [[#175741977](https://www.pivotaltracker.com/story/show/175741977)] Fixes cut sticky header ([#2400](https://github.com/pagopa/io-app/issues/2400)) ([d6bad36](https://github.com/pagopa/io-app/commit/d6bad3617527e605ecba48f230cd338e18a9bb00))
* **Bonus Pagamenti Digitali:** [[#175685244](https://www.pivotaltracker.com/story/show/175685244)] Copy updates ([#2411](https://github.com/pagopa/io-app/issues/2411)) ([da7484a](https://github.com/pagopa/io-app/commit/da7484a4b69c64ad117c68c0a3346c56e5f3c945))
* **Bonus Pagamenti Digitali:** [[#175797704](https://www.pivotaltracker.com/story/show/175797704)] Display bancomat in add payment method list when adding a new method from a payment ([#2405](https://github.com/pagopa/io-app/issues/2405)) ([fdfce64](https://github.com/pagopa/io-app/commit/fdfce64f2d17d16b6a77b64aa6b68822e5a37e7c))
* **Bonus Pagamenti Digitali:** [[#175846470](https://www.pivotaltracker.com/story/show/175846470)] Bonus logos update ([#2412](https://github.com/pagopa/io-app/issues/2412)) ([ea3549e](https://github.com/pagopa/io-app/commit/ea3549e56a430f76d618ef17a1117c8ed4aa124b))
* **bpd:** cashback item is displayed even when activation status is undefined ([d4d381d](https://github.com/pagopa/io-app/commit/d4d381d4d51124f616c46293b36164e3884e0602))

## [1.10.0-rc.0](https://github.com/pagopa/io-app/compare/1.9.0-rc.5...1.10.0-rc.0) (2020-11-19)


### Features

* **Bonus Pagamenti Digitali:** [[#175269056](https://www.pivotaltracker.com/story/show/175269056),[#175667950](https://www.pivotaltracker.com/story/show/175667950)] Implements transactions list organized by date ([#2383](https://github.com/pagopa/io-app/issues/2383)) ([0dca10f](https://github.com/pagopa/io-app/commit/0dca10f2b868cee9a2f34fb8366609ffac07f8fa))
* **Bonus Pagamenti Digitali:** [[#175271334](https://www.pivotaltracker.com/story/show/175271334),[#175271269](https://www.pivotaltracker.com/story/show/175271269),[#175272149](https://www.pivotaltracker.com/story/show/175272149)] Payment method not activable, other channels, and how it works bottomsheet ([#2373](https://github.com/pagopa/io-app/issues/2373)) ([4882289](https://github.com/pagopa/io-app/commit/48822895e9075f2d0b2e0f792fdd7dd3a94e423b))
* **Bonus Pagamenti Digitali:** [[#175579023](https://www.pivotaltracker.com/story/show/175579023)] FeaturedCards carousel in wallet home screen ([#2398](https://github.com/pagopa/io-app/issues/2398)) ([5b36805](https://github.com/pagopa/io-app/commit/5b36805dbc6adcfe1be0794bb242b1747dd51fd8))
* **Bonus Pagamenti Digitali:** [[#175683744](https://www.pivotaltracker.com/story/show/175683744)] UI Rework for Add payment methods list screen ([#2392](https://github.com/pagopa/io-app/issues/2392)) ([cb4f4bb](https://github.com/pagopa/io-app/commit/cb4f4bb6f5745c97f88c9b91ef6aa9e1db3cd288))
* **Bonus Pagamenti Digitali:** [[#175683801](https://www.pivotaltracker.com/story/show/175683801)] When credit card has been added, join BPD or enroll the new method to BPD ([#2399](https://github.com/pagopa/io-app/issues/2399)) ([86fb44c](https://github.com/pagopa/io-app/commit/86fb44c05378966e9879c828f463cedf663c22df))
* **Bonus Pagamenti Digitali:** [[#175717926](https://www.pivotaltracker.com/story/show/175717926),[#175717778](https://www.pivotaltracker.com/story/show/175717778),[#175717794](https://www.pivotaltracker.com/story/show/175717794)] Don't save rejected iban as valid iban, wrong "skip" CTA when edit iban from detail screen, added toast to confirm an IBAN insertion ([#2397](https://github.com/pagopa/io-app/issues/2397)) ([e5a331b](https://github.com/pagopa/io-app/commit/e5a331b1fda0622386c31d66035fce984cf491c3))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175700724](https://www.pivotaltracker.com/story/show/175700724)] Fixes wrong format of bpd amount ([#2376](https://github.com/pagopa/io-app/issues/2376)) ([1d6183b](https://github.com/pagopa/io-app/commit/1d6183b6c087d9b3c34a31483be4b3ce508af662))
* **instabug-report:** remove duplicated append tag ([0192451](https://github.com/pagopa/io-app/commit/0192451e81c97d3ea095950aa1fcfc837f6ccf2b))
* **instabug-report:** remove useless import ([47b6830](https://github.com/pagopa/io-app/commit/47b6830d52d99354205c038fb22b4538d3bd5866))


### Chores

* [[#175420010](https://www.pivotaltracker.com/story/show/175420010)] Added in Circle CI a job to test if the CIE button exists ([#2375](https://github.com/pagopa/io-app/issues/2375)) ([a3dd9d3](https://github.com/pagopa/io-app/commit/a3dd9d3776203c227f8ada0603b498cac005f7fb))
* [[#175612963](https://www.pivotaltracker.com/story/show/175612963)] Refactor MessageDueDate component ([#2382](https://github.com/pagopa/io-app/issues/2382)) ([abee48e](https://github.com/pagopa/io-app/commit/abee48e77e38a832ba70b5dce2e1dc3251c113e4))
* **Bonus Pagamenti Digitali:** [[#175785820](https://www.pivotaltracker.com/story/show/175785820)] Restore missing content [#2404](https://github.com/pagopa/io-app/issues/2404) ([f6ec61d](https://github.com/pagopa/io-app/commit/f6ec61d6b035f257f94b2edbed0485a9f2689d22))
* remove jest workers limit (using default) ([dc6c448](https://github.com/pagopa/io-app/commit/dc6c448225028a78d44c2bf246b789064804d43d))

## [1.9.0-rc.5](https://github.com/pagopa/io-app/compare/1.9.0-rc.4...1.9.0-rc.5) (2020-11-16)


### Features

* **Bonus Pagamenti Digitali:** [[#175311250](https://www.pivotaltracker.com/story/show/175311250), [#175044606](https://www.pivotaltracker.com/story/show/175044606), [#175044635](https://www.pivotaltracker.com/story/show/175044635)] Add bpd events to mixpanel ([#2391](https://github.com/pagopa/io-app/issues/2391)) ([33b974b](https://github.com/pagopa/io-app/commit/33b974b5c106736f96d9f88e24e3234cd26aef27))
* **Bonus Pagamenti Digitali:** [[#175433663](https://www.pivotaltracker.com/story/show/175433663)] Show bank name in bancomat toggle ([#2379](https://github.com/pagopa/io-app/issues/2379)) ([690afa6](https://github.com/pagopa/io-app/commit/690afa67627144a244880e7c0926dfce5d9ed7f6))
* **Bonus Pagamenti Digitali:** [[#175553856](https://www.pivotaltracker.com/story/show/175553856)] Wallet V1 compatibile with Wallet V2 ([#2390](https://github.com/pagopa/io-app/issues/2390)) ([2539fdb](https://github.com/pagopa/io-app/commit/2539fdbe3d4268a763d3435c2b4ca4725128ff41))
* **Bonus Pagamenti Digitali:** [[#175663885](https://www.pivotaltracker.com/story/show/175663885)] Bancomat detail screen ([#2388](https://github.com/pagopa/io-app/issues/2388)) ([8d99c3a](https://github.com/pagopa/io-app/commit/8d99c3a5e35e237ae9c8e6b53459d3764d1c4853))
* **Bonus Pagamenti Digitali:** [[#175682399](https://www.pivotaltracker.com/story/show/175682399)] Bancomat card preview in wallet ([#2386](https://github.com/pagopa/io-app/issues/2386)) ([126df64](https://github.com/pagopa/io-app/commit/126df643d07aba3f7b9c491ca8483f92113cb259))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175717721](https://www.pivotaltracker.com/story/show/175717721)] Fixes cashback amount cut on android ([#2384](https://github.com/pagopa/io-app/issues/2384)) ([3f21c9c](https://github.com/pagopa/io-app/commit/3f21c9cdaba38364294213349f97b286c3090b82))
* **Bonus Pagamenti Digitali:** [[#175745708](https://www.pivotaltracker.com/story/show/175745708)] Clean store after unsubscription ([#2394](https://github.com/pagopa/io-app/issues/2394)) ([bb15787](https://github.com/pagopa/io-app/commit/bb15787653c1676a500bd663cc50542f38926bfe))
* **Bonus Vacanze:** [[#175744639](https://www.pivotaltracker.com/story/show/175744639)] Bancomat expiration date is build as invalid  ([#2393](https://github.com/pagopa/io-app/issues/2393)) ([3547f9f](https://github.com/pagopa/io-app/commit/3547f9fc7a972ae04808b6b92586d220b8a53524))

## [1.9.0-rc.4](https://github.com/pagopa/io-app/compare/1.9.0-rc.3...1.9.0-rc.4) (2020-11-14)


### Features

* [[#174932718](https://www.pivotaltracker.com/story/show/174932718)] Track bpd onboarding & iban actions ([#2371](https://github.com/pagopa/io-app/issues/2371)) ([4f9834b](https://github.com/pagopa/io-app/commit/4f9834b8eceb13809839d679dc7a93e78b0662a3))
* **Bonus Pagamenti Digitali:** [[#175265955](https://www.pivotaltracker.com/story/show/175265955)] Bpd payment method refinement ([#2364](https://github.com/pagopa/io-app/issues/2364)) ([82e58cf](https://github.com/pagopa/io-app/commit/82e58cf719047bb62be666104ff729dcd6ca1ea5))
* **Bonus Pagamenti Digitali:** [[#175268938](https://www.pivotaltracker.com/story/show/175268938)] Add base component for DailyTransaction section header ([#2366](https://github.com/pagopa/io-app/issues/2366)) ([05b5752](https://github.com/pagopa/io-app/commit/05b5752534ff588c05481467449fa81ece224d08))
* **Bonus Pagamenti Digitali:** [[#175269135](https://www.pivotaltracker.com/story/show/175269135),[#175271447](https://www.pivotaltracker.com/story/show/175271447)] BPD Transaction summary component with BottomSheet Info box ([#2372](https://github.com/pagopa/io-app/issues/2372)) ([25a3001](https://github.com/pagopa/io-app/commit/25a3001931955261f5106e0849744c0457003c77))
* **Bonus Pagamenti Digitali:** [[#175271100](https://www.pivotaltracker.com/story/show/175271100)] confirmation on activate/deactivate bpd on payment method ([#2369](https://github.com/pagopa/io-app/issues/2369)) ([f68b937](https://github.com/pagopa/io-app/commit/f68b937e04befff458063968e5874563e80807f5))
* **Bonus Pagamenti Digitali:** [[#175420435](https://www.pivotaltracker.com/story/show/175420435)] Add payment method after onboarding if the wallet is empty ([#2365](https://github.com/pagopa/io-app/issues/2365)) ([3a78657](https://github.com/pagopa/io-app/commit/3a786578a86b4425d2a4ed3043c4f89d722bf5c5))
* **Bonus Pagamenti Digitali:** [[#175663318](https://www.pivotaltracker.com/story/show/175663318)] Handle pans response with messages ([#2370](https://github.com/pagopa/io-app/issues/2370)) ([ac80ca3](https://github.com/pagopa/io-app/commit/ac80ca3d26fc3432d1e95cbd880f0d86f048c4f5))
* **Bonus Pagamenti Digitali:** [[#175686157](https://www.pivotaltracker.com/story/show/175686157)] CTA under keyboard while IBAN insertion ([#2374](https://github.com/pagopa/io-app/issues/2374)) ([c33b98b](https://github.com/pagopa/io-app/commit/c33b98b797047faaa625862acdf06bcf7e2312f2))
* [[#175708197](https://www.pivotaltracker.com/story/show/175708197)] Report an issue about credit card onboarding ([#2378](https://github.com/pagopa/io-app/issues/2378)) ([c19cf41](https://github.com/pagopa/io-app/commit/c19cf41fd062561ddacc3889122c0acda1b87d55))
* [[#175729293](https://www.pivotaltracker.com/story/show/175729293)] Upgrade react-native-cie v0.3.3 ([#2385](https://github.com/pagopa/io-app/issues/2385)) ([cda5458](https://github.com/pagopa/io-app/commit/cda5458e9a44b94041628e1204aba62cf9f23436))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175715662](https://www.pivotaltracker.com/story/show/175715662)] Buttons in bottomsheet don't dispatch onPress event ([#2381](https://github.com/pagopa/io-app/issues/2381)) ([16416b3](https://github.com/pagopa/io-app/commit/16416b3c865420ff1f8a98161e81173fe8ae836c))

## [1.9.0-rc.3](https://github.com/pagopa/io-app/compare/1.9.0-rc.2...1.9.0-rc.3) (2020-11-11)


### Features

* **Bonus Pagamenti Digitali:** [[#175265262](https://www.pivotaltracker.com/story/show/175265262)] BPD Cashback Cards carousel ([#2347](https://github.com/pagopa/io-app/issues/2347)) ([8480d0f](https://github.com/pagopa/io-app/commit/8480d0f6cf18cfd3ee9988fa7c85454ad996de37))
* [[#175488816](https://www.pivotaltracker.com/story/show/175488816)] change payment label to wallet ([#2356](https://github.com/pagopa/io-app/issues/2356)) ([9b3e602](https://github.com/pagopa/io-app/commit/9b3e60222068319390ee8fa874462cc37df52fc2))
* [[#175659067](https://www.pivotaltracker.com/story/show/175659067)] Using placeholder in yaml/locale ([#2363](https://github.com/pagopa/io-app/issues/2363)) ([7fb9fb6](https://github.com/pagopa/io-app/commit/7fb9fb621f50994520a8c9dc36c8f96deb273455))
* **Bonus Pagamenti Digitali:** [[#175266668](https://www.pivotaltracker.com/story/show/175266668)] Unsubscribe from bpd ([#2355](https://github.com/pagopa/io-app/issues/2355)) ([a051b09](https://github.com/pagopa/io-app/commit/a051b099166c4f65890f23187158404d491a4484))
* **Bonus Pagamenti Digitali:** [[#175269179](https://www.pivotaltracker.com/story/show/175269179)] Transaction details ([#2354](https://github.com/pagopa/io-app/issues/2354)) ([7d867d9](https://github.com/pagopa/io-app/commit/7d867d9c6ed810892188448a94bd10a4e4cd6b75))
* **Bonus Pagamenti Digitali:** [[#175488300](https://www.pivotaltracker.com/story/show/175488300),[#175662744](https://www.pivotaltracker.com/story/show/175662744)] Iban insertion and workflow (rework due to change request) ([#2360](https://github.com/pagopa/io-app/issues/2360)) ([fde14e7](https://github.com/pagopa/io-app/commit/fde14e71addfd6448135e066c63388fed168be08))


### Bug Fixes

* [[#175620603](https://www.pivotaltracker.com/story/show/175620603)] Pay CTA produces no action ([#2351](https://github.com/pagopa/io-app/issues/2351)) ([f84aab4](https://github.com/pagopa/io-app/commit/f84aab423c5e4440073818896d9ae6a02416fe31))
* **Payments:** [[#175553092](https://www.pivotaltracker.com/story/show/175553092)] Detect ONLY supported credit card circuit. If unsupported must detect UNKNOWN ([#2337](https://github.com/pagopa/io-app/issues/2337)) ([e012392](https://github.com/pagopa/io-app/commit/e012392a72589222844c23f7ee4cfe82c70dd68e))


### Chores

* **Bonus Pagamenti Digitali:** [[#175636284](https://www.pivotaltracker.com/story/show/175636284)] Add tests for bpdsummarycomponent & bpdAllPeriodsWithAmountSelector ([#2352](https://github.com/pagopa/io-app/issues/2352)) ([b38b2fc](https://github.com/pagopa/io-app/commit/b38b2fc4d44c2cd2005b37e73991fe8799e4f703))
* **Bonus Pagamenti Digitali:** [[#175659272](https://www.pivotaltracker.com/story/show/175659272),[#175412288](https://www.pivotaltracker.com/story/show/175412288)] Sync IBAN API to last specs ([#2361](https://github.com/pagopa/io-app/issues/2361)) ([7dd4ec9](https://github.com/pagopa/io-app/commit/7dd4ec9facffa72d05e9374a088345015f697550))

## [1.9.0-rc.2](https://github.com/pagopa/io-app/compare/1.9.0-rc.1...1.9.0-rc.2) (2020-11-06)


### Features

* **Bonus Pagamenti Digitali:** [[#174848741](https://www.pivotaltracker.com/story/show/174848741)] Display IBAN information from bpd details screen ([#2328](https://github.com/pagopa/io-app/issues/2328)) ([a6c2cfb](https://github.com/pagopa/io-app/commit/a6c2cfb2853e04b21be3c8c4fe8b1ad22f464bc9))
* **Bonus Pagamenti Digitali:** [[#175263506](https://www.pivotaltracker.com/story/show/175263506)] Create BPD card component ([#2338](https://github.com/pagopa/io-app/issues/2338)) ([c9abaef](https://github.com/pagopa/io-app/commit/c9abaef60cc6540d118bfa153c5628f63da68522))
* **Bonus Pagamenti Digitali:** [[#175265215](https://www.pivotaltracker.com/story/show/175265215)] Handle different status on BPD card component ([#2343](https://github.com/pagopa/io-app/issues/2343)) ([ba8b3e7](https://github.com/pagopa/io-app/commit/ba8b3e71af700f027a35e2aaf312e37eca88befc))
* **Bonus Pagamenti Digitali:** [[#175266102](https://www.pivotaltracker.com/story/show/175266102)] Add summary (graphical and textual) for period transactions and amount component ([#2332](https://github.com/pagopa/io-app/issues/2332)) ([965fea2](https://github.com/pagopa/io-app/commit/965fea2fac969a2a71e2af093be07216346a36df))
* **Bonus Pagamenti Digitali:** [[#175266374](https://www.pivotaltracker.com/story/show/175266374)] Bpd details screen draft organization ([#2327](https://github.com/pagopa/io-app/issues/2327)) ([66a046a](https://github.com/pagopa/io-app/commit/66a046aa9de5f88b22d2b73db91e05cde9a31633))
* **Bonus Pagamenti Digitali:** [[#175268877](https://www.pivotaltracker.com/story/show/175268877)] Transaction item & draft transaction list ([#2344](https://github.com/pagopa/io-app/issues/2344)) ([2a2d70d](https://github.com/pagopa/io-app/commit/2a2d70d280288fdc98da88d923eda300415120d1))
* **Bonus Pagamenti Digitali:** [[#175515542](https://www.pivotaltracker.com/story/show/175515542),[#175266771](https://www.pivotaltracker.com/story/show/175266771)] Add entrypoint for draft Transactions screen ([#2330](https://github.com/pagopa/io-app/issues/2330)) ([e79f77e](https://github.com/pagopa/io-app/commit/e79f77e02ff04d4cb623a2106080a8445777403c))
* **Bonus Pagamenti Digitali:** [[#175565890](https://www.pivotaltracker.com/story/show/175565890)] Add raw components to bpd period details ([#2339](https://github.com/pagopa/io-app/issues/2339)) ([3ace71f](https://github.com/pagopa/io-app/commit/3ace71fb00caddc3f4a852b827d27a2da5c18073))
* **Bonus Pagamenti Digitali:** [[#175617105](https://www.pivotaltracker.com/story/show/175617105)] Decode trxDate WinningTransactionResource ([#2349](https://github.com/pagopa/io-app/issues/2349)) ([425af63](https://github.com/pagopa/io-app/commit/425af631df650ba59ceab6cee9851b187b93bf6e))
* **Payments:** [[#175517468](https://www.pivotaltracker.com/story/show/175517468)] Save credit card insertion attempts ([#2335](https://github.com/pagopa/io-app/issues/2335)) ([d7dbc11](https://github.com/pagopa/io-app/commit/d7dbc110ed47ced001e911da58dd3b0a0d092d28))


### Bug Fixes

* [[#175540991](https://www.pivotaltracker.com/story/show/175540991)] refine message state ([#2345](https://github.com/pagopa/io-app/issues/2345)) ([9804d72](https://github.com/pagopa/io-app/commit/9804d723d8ed5a3d751ba5694b46ba7a55d80c84))
* [[#175574457](https://www.pivotaltracker.com/story/show/175574457)] Update payment-notice-pagopa.png [#2340](https://github.com/pagopa/io-app/issues/2340) ([a358f91](https://github.com/pagopa/io-app/commit/a358f91e33587ccd76e4ae0e132ca35018e89746))


### Chores

* **Bonus Pagamenti Digitali:** [[#175589933](https://www.pivotaltracker.com/story/show/175589933)] Sync PM/walletV2 spec ([#2342](https://github.com/pagopa/io-app/issues/2342)) ([fb996ed](https://github.com/pagopa/io-app/commit/fb996edf94bc7365f44f8bd20eb01f9d9b70522a))

## [1.9.0-rc.1](https://github.com/pagopa/io-app/compare/1.9.0-rc.0...1.9.0-rc.1) (2020-11-04)


### Features

* [[#165090272](https://www.pivotaltracker.com/story/show/165090272)] Credit Card Brand Recognition ([#2319](https://github.com/pagopa/io-app/issues/2319)) ([4bed662](https://github.com/pagopa/io-app/commit/4bed6624f50e99b1a201f21f0bdbf3770e007281))
* [[#174966797](https://www.pivotaltracker.com/story/show/174966797)] change message state when expiring or expired ([#2316](https://github.com/pagopa/io-app/issues/2316)) ([ab16e0d](https://github.com/pagopa/io-app/commit/ab16e0dfc505c36bac603ed9f0ee95940b2249f4))
* [[#175285929](https://www.pivotaltracker.com/story/show/175285929)] Adds an alert when bonus is not yet supported by the app ([#2322](https://github.com/pagopa/io-app/issues/2322)) ([41abc58](https://github.com/pagopa/io-app/commit/41abc58c5508942b31591ef941bf6a05c8819a23))
* **Bonus Pagamenti Digitali:** [[#175253344](https://www.pivotaltracker.com/story/show/175253344)] Implements Bottom sheet with react-native-bottom-sheet ([#2320](https://github.com/pagopa/io-app/issues/2320)) ([c3b8e0b](https://github.com/pagopa/io-app/commit/c3b8e0ba2b686bc18d0f07a58f142c02b614e33b))
* **Bonus Pagamenti Digitali:** [[#175263873](https://www.pivotaltracker.com/story/show/175263873)] Add BPD award periods api ([#2324](https://github.com/pagopa/io-app/issues/2324)) ([adc5312](https://github.com/pagopa/io-app/commit/adc5312659c9183633f1f01d5ec14182b192c9e3))
* **Bonus Pagamenti Digitali:** [[#175263900](https://www.pivotaltracker.com/story/show/175263900)] Add winning transaction API ([#2333](https://github.com/pagopa/io-app/issues/2333)) ([4c3bbae](https://github.com/pagopa/io-app/commit/4c3bbaea43fc872b9d3c8e3cde3cbcb78397b80a))
* **Bonus Pagamenti Digitali:** [[#175263981](https://www.pivotaltracker.com/story/show/175263981)]  Add BPD cashback amount API ([#2329](https://github.com/pagopa/io-app/issues/2329)) ([72e9aa7](https://github.com/pagopa/io-app/commit/72e9aa7e0547f5b3790ca03bab2ef19e1e6cabd1))
* **Bonus Pagamenti Digitali:** [[#175349901](https://www.pivotaltracker.com/story/show/175349901),[#175477189](https://www.pivotaltracker.com/story/show/175477189)] Action, store and reducer for bpd details and transactions ([#2321](https://github.com/pagopa/io-app/issues/2321)) ([8ab3bea](https://github.com/pagopa/io-app/commit/8ab3bea21fb48e7957547db333a351fa367f40df))


### Bug Fixes

* [[#173988115](https://www.pivotaltracker.com/story/show/173988115)] Fix insert manual payment item ([#2334](https://github.com/pagopa/io-app/issues/2334)) ([7dadbe5](https://github.com/pagopa/io-app/commit/7dadbe54fea10a64a44f39110dbef061b8a84f66))
* [[#175438360](https://www.pivotaltracker.com/story/show/175438360)] send CIE_AUTHENTICATION_ERROR as code to mixpanel ([#2326](https://github.com/pagopa/io-app/issues/2326)) ([3fe0643](https://github.com/pagopa/io-app/commit/3fe0643a3890fae1d1bafccc6b64d7496a9348e8))
* [[#175482067](https://www.pivotaltracker.com/story/show/175482067)] Link near footer button not clickable ([#2336](https://github.com/pagopa/io-app/issues/2336)) ([f148901](https://github.com/pagopa/io-app/commit/f1489013fb28c2c47b73cc804f86360c671900cb))
* [[#175487236](https://www.pivotaltracker.com/story/show/175487236)] Update react-native-cie v0.3.2 ([#2325](https://github.com/pagopa/io-app/issues/2325)) ([7d30592](https://github.com/pagopa/io-app/commit/7d30592764085bcff73922b17b45d6a1917a4017))
* [[#175492840](https://www.pivotaltracker.com/story/show/175492840)] removes tool-versions file ([#2323](https://github.com/pagopa/io-app/issues/2323)) ([3a522aa](https://github.com/pagopa/io-app/commit/3a522aa9afd4bd878c57e02bc02f06159a2fb688))

## [1.9.0-rc.0](https://github.com/pagopa/io-app/compare/1.8.0-rc.7...1.9.0-rc.0) (2020-10-28)


### Features

* [[#174575010](https://www.pivotaltracker.com/story/show/174575010)] Add showroom listitem ([#2317](https://github.com/pagopa/io-app/issues/2317)) ([72c0200](https://github.com/pagopa/io-app/commit/72c020058ae00388d654eb10d1cdb4f1442306c3))


### Chores

* **Bonus Pagamenti Digitali:** [[#175419552](https://www.pivotaltracker.com/story/show/175419552)] Enhance add bancomat response ([#2315](https://github.com/pagopa/io-app/issues/2315)) ([1705c39](https://github.com/pagopa/io-app/commit/1705c39d181abafd1bcda93f8751d0274d4c2259))
* [[#174257087](https://www.pivotaltracker.com/story/show/174257087)] Update clipboard module ([#2318](https://github.com/pagopa/io-app/issues/2318)) ([ee084c9](https://github.com/pagopa/io-app/commit/ee084c9c8c4994cee42442d4ca01f20d81239b7a))

## [1.8.0-rc.7](https://github.com/pagopa/io-app/compare/1.8.0-rc.6...1.8.0-rc.7) (2020-10-23)

## [1.8.0-rc.6](https://github.com/pagopa/io-app/compare/1.8.0-rc.5...1.8.0-rc.6) (2020-10-23)

## [1.8.0-rc.5](https://github.com/pagopa/io-app/compare/1.8.0-rc.4...1.8.0-rc.5) (2020-10-23)


### Features

* **Bonus Pagamenti Digitali:** [[#174794326](https://www.pivotaltracker.com/story/show/174794326),[#174794981](https://www.pivotaltracker.com/story/show/174794981),[#175186046](https://www.pivotaltracker.com/story/show/175186046)] BPD payment instruments API ([#2305](https://github.com/pagopa/io-app/issues/2305)) ([af65bdf](https://github.com/pagopa/io-app/commit/af65bdf9ef21fcf902f02ca0b2b73a6eb5715d2b))
* **Bonus Pagamenti Digitali:** [[#174863016](https://www.pivotaltracker.com/story/show/174863016)] Enroll payment methods to bpd while onboarding ([#2301](https://github.com/pagopa/io-app/issues/2301)) ([b26fe2d](https://github.com/pagopa/io-app/commit/b26fe2d7c93a171505cf752d55e423c2b54961c1))
* **Bonus Pagamenti Digitali:** [[#175010541](https://www.pivotaltracker.com/story/show/175010541)] Show&Modify bpd activation on a payment method ([#2298](https://github.com/pagopa/io-app/issues/2298)) ([01b28f4](https://github.com/pagopa/io-app/commit/01b28f49f13a76ecfbc598dd701f45b32277a338))
* **Bonus Pagamenti Digitali:** [[#175164503](https://www.pivotaltracker.com/story/show/175164503)] Activate bpd on new onboarded Bancomat ([#2307](https://github.com/pagopa/io-app/issues/2307)) ([a2e4440](https://github.com/pagopa/io-app/commit/a2e4440d0c155d05b119d2045d41d82b2623149c))
* **Bonus Pagamenti Digitali:** [[#175185419](https://www.pivotaltracker.com/story/show/175185419)] Nesting WalletV2 inside Wallet ([#2310](https://github.com/pagopa/io-app/issues/2310)) ([b42f7d1](https://github.com/pagopa/io-app/commit/b42f7d1f87300cc137bd913631922ddc1bb1fa61))
* **Bonus Pagamenti Digitali:** [[#175185419](https://www.pivotaltracker.com/story/show/175185419)] Support wallet V2  ([#2300](https://github.com/pagopa/io-app/issues/2300)) ([aef07b7](https://github.com/pagopa/io-app/commit/aef07b7ef5246de2b2cbb4f6c37b989fbc249a64))
* **Bonus Pagamenti Digitali:** [[#175329974](https://www.pivotaltracker.com/story/show/175329974)] Test enable/disable bpd on payment method ([#2304](https://github.com/pagopa/io-app/issues/2304)) ([37938e2](https://github.com/pagopa/io-app/commit/37938e2d11d1b689077c04c15fe0ab55f6263300))
* **Bonus Pagamenti Digitali:** [[#175401460](https://www.pivotaltracker.com/story/show/175401460)] Remove all WalletV2 placeholders and use the real type and implementation ([#2311](https://github.com/pagopa/io-app/issues/2311)) ([9528094](https://github.com/pagopa/io-app/commit/9528094f9d06e40ad251e2800849530729b8144a))(https://www.pivotaltracker.com/story/show/175329974) [#174794326](https://www.pivotaltracker.com/story/show/174794326) [#174794326](https://www.pivotaltracker.com/story/show/174794326) [#175329974](https://www.pivotaltracker.com/story/show/175329974)
* [[#175403207](https://www.pivotaltracker.com/story/show/175403207)] Enhance CIE iOS authentication start-up ([#2312](https://github.com/pagopa/io-app/issues/2312)) ([68bbd4c](https://github.com/pagopa/io-app/commit/68bbd4c65c7569889aa41473753acd2b9af96fbb))


### Bug Fixes

* [[#174227407](https://www.pivotaltracker.com/story/show/174227407)] Remove multiple notification ([#2295](https://github.com/pagopa/io-app/issues/2295)) ([1b83fcb](https://github.com/pagopa/io-app/commit/1b83fcb2a642530edb49524da8729f8c9b93e9e3))
* **Bonus Pagamenti Digitali:** [[#175396286](https://www.pivotaltracker.com/story/show/175396286)] Handle 404 for bpd payment activation status ([#2309](https://github.com/pagopa/io-app/issues/2309)) ([011489c](https://github.com/pagopa/io-app/commit/011489cf788e7f1f76ae3fdbdba64c18f8ff33c4))
* **Bonus Pagamenti Digitali:** [[#175410649](https://www.pivotaltracker.com/story/show/175410649)] Codec fails on add bancomat response ([#2313](https://github.com/pagopa/io-app/issues/2313)) ([60a691f](https://github.com/pagopa/io-app/commit/60a691f93d3c2090233c07454cd719539da31f32))

## [1.8.0-rc.4](https://github.com/pagopa/io-app/compare/1.8.0-rc.0...1.8.0-rc.4) (2020-10-21)


### Features

* [[#175228211](https://www.pivotaltracker.com/story/show/175228211)] Update Internationalization section in README ([#2297](https://github.com/pagopa/io-app/issues/2297)) ([b9685d6](https://github.com/pagopa/io-app/commit/b9685d6deb95a78107915b659d84ac827989256a))


### Bug Fixes

* **Payments:** [[#175300578](https://www.pivotaltracker.com/story/show/175300578)] Transaction read state is lost across multiple sessions ([#2296](https://github.com/pagopa/io-app/issues/2296)) ([eb1e5a3](https://github.com/pagopa/io-app/commit/eb1e5a3826eb955671e3e9c7af1da0dc1ff64f96))


### Chores

* **Bonus Pagamenti Digitali:** [[#175329922](https://www.pivotaltracker.com/story/show/175329922)] Add Bpd Test Overlay [#2303](https://github.com/pagopa/io-app/issues/2303) ([407e7f4](https://github.com/pagopa/io-app/commit/407e7f46a5d86e225fa1b758cd1c634d9e6cd73b))

## [1.8.0-rc.0](https://github.com/pagopa/io-app/compare/1.7.0-rc.10...1.8.0-rc.0) (2020-10-19)


### Features

* [[#175114153](https://www.pivotaltracker.com/story/show/175114153)] Force update birthplace FiscalCodeScreen ([#2277](https://github.com/pagopa/io-app/issues/2277)) ([77adaee](https://github.com/pagopa/io-app/commit/77adaee7e67ca15686a22fa5166f57a82646cf4e))
* **Bonus Pagamenti Digitali:** [[#175012088](https://www.pivotaltracker.com/story/show/175012088)] Adds the AddBancomatScreen for Bancomat onboarding ([#2285](https://github.com/pagopa/io-app/issues/2285)) ([d0767a8](https://github.com/pagopa/io-app/commit/d0767a87a79e4744c3f59884ac019bac00829f11))
* **Bonus Pagamenti Digitali:** [[#175012088](https://www.pivotaltracker.com/story/show/175012088)] Select available Bancomats to add ([#2282](https://github.com/pagopa/io-app/issues/2282)) ([1c319b3](https://github.com/pagopa/io-app/commit/1c319b3916494088a170d345bba454f6e31a4e9e))
* **Bonus Pagamenti Digitali:** [[#175185611](https://www.pivotaltracker.com/story/show/175185611)] Add pans to wallet ([#2286](https://github.com/pagopa/io-app/issues/2286)) ([abd1906](https://github.com/pagopa/io-app/commit/abd1906bb3c51920833cf9c8ec950f861d008beb))
* **Bonus Pagamenti Digitali:** [[#175242818](https://www.pivotaltracker.com/story/show/175242818)] Connects Add Bancomat screen with business logic and redux state ([#2288](https://github.com/pagopa/io-app/issues/2288)) ([85ec97c](https://github.com/pagopa/io-app/commit/85ec97c92ed974118296c5d78fa72b592f0a06ca))
* **Bonus Pagamenti Digitali:** [[#175308311](https://www.pivotaltracker.com/story/show/175308311)] Link "add bancomat to wallet" with networking logic ([#2299](https://github.com/pagopa/io-app/issues/2299)) ([b44450b](https://github.com/pagopa/io-app/commit/b44450b93c57378f9ce87979a09fcb6a4f5de390))


### Bug Fixes

* [[#175252607](https://www.pivotaltracker.com/story/show/175252607)] update CIE tab label [#2290](https://github.com/pagopa/io-app/issues/2290) ([2b8deb1](https://github.com/pagopa/io-app/commit/2b8deb115a3301aa2f5b3c14694635891e8bef87))
* [[#175271222](https://www.pivotaltracker.com/story/show/175271222)] Bonus available selector creates a new object on every call ([#2292](https://github.com/pagopa/io-app/issues/2292)) ([f53f8e1](https://github.com/pagopa/io-app/commit/f53f8e1de363526ebcf0eeaa3080973a1d47c447))


### Chores

* [[#173146736](https://www.pivotaltracker.com/story/show/173146736)] update contextual help ([#2287](https://github.com/pagopa/io-app/issues/2287)) ([3a62c81](https://github.com/pagopa/io-app/commit/3a62c8148fb288f4fd6d2c6396676bdf7bf38d15))
* [[#174966784](https://www.pivotaltracker.com/story/show/174966784)] Update README ([#2280](https://github.com/pagopa/io-app/issues/2280)) ([bd9c505](https://github.com/pagopa/io-app/commit/bd9c50577f325990568e6636bd5a61af0ac27c85))
* Remove v pay as supported payment method from FAQ ([#2302](https://github.com/pagopa/io-app/issues/2302)) ([db4e69c](https://github.com/pagopa/io-app/commit/db4e69c6a1515e3705458f53b230e02300bb7f16))

## [1.7.0-rc.10](https://github.com/pagopa/io-app/compare/1.7.0-rc.9...1.7.0-rc.10) (2020-10-09)


### Features

* [[#175165123](https://www.pivotaltracker.com/story/show/175165123)] add subtitle in change code item [#2278](https://github.com/pagopa/io-app/issues/2278) ([acd2b18](https://github.com/pagopa/io-app/commit/acd2b1891198eaa8556412d60013a6f66565db1c))
* **Bonus Pagamenti Digitali:** [[#175011093](https://www.pivotaltracker.com/story/show/175011093),[#175011182](https://www.pivotaltracker.com/story/show/175011182)] Add bancomat entrypoint and stub navigation ([#2269](https://github.com/pagopa/io-app/issues/2269)) ([c98a4e8](https://github.com/pagopa/io-app/commit/c98a4e8efa3b9bdaf434b2cd86fa945f27361e49))
* **Bonus Pagamenti Digitali:** [[#175011879](https://www.pivotaltracker.com/story/show/175011879)] Adds Bank selection and search screen ([#2255](https://github.com/pagopa/io-app/issues/2255)) ([369c77d](https://github.com/pagopa/io-app/commit/369c77dbd6a0c5a2103ca605cb6b660e104e7682))
* **Bonus Pagamenti Digitali:** [[#175011989](https://www.pivotaltracker.com/story/show/175011989),[#175012026](https://www.pivotaltracker.com/story/show/175012026),[#175012064](https://www.pivotaltracker.com/story/show/175012064)] Style for onboarding bancomat KO and loading screens ([#2276](https://github.com/pagopa/io-app/issues/2276)) ([bed6ab5](https://github.com/pagopa/io-app/commit/bed6ab589d085a800244cc850c7bdedd33c55299))
* **Bonus Pagamenti Digitali:** [[#175012295](https://www.pivotaltracker.com/story/show/175012295),[#175011188](https://www.pivotaltracker.com/story/show/175011188)] Onboarding bancomat workflow ([#2273](https://github.com/pagopa/io-app/issues/2273)) ([a9737be](https://github.com/pagopa/io-app/commit/a9737be5d0f0eec60cfe451701ea6fb368e433c3))
* **Bonus Pagamenti Digitali:** [[#175115845](https://www.pivotaltracker.com/story/show/175115845)] Add networking and store logic to support pans search ([#2263](https://github.com/pagopa/io-app/issues/2263)) ([cd92644](https://github.com/pagopa/io-app/commit/cd92644e197ae80ad54eb2b443fe7fb7f46720b1))
* **Bonus Pagamenti Digitali:** [[#175142335](https://www.pivotaltracker.com/story/show/175142335)] Connects Search Bank screen with store and remote data ([#2266](https://github.com/pagopa/io-app/issues/2266)) ([cad3dde](https://github.com/pagopa/io-app/commit/cad3dde170ab1f9138b7f776a63a80a4e0d8e850))
* **Bonus Pagamenti Digitali:** [[#175204419](https://www.pivotaltracker.com/story/show/175204419)] Connect search bank screen with onboarding bancomat business logic ([#2279](https://github.com/pagopa/io-app/issues/2279)) ([54ca830](https://github.com/pagopa/io-app/commit/54ca8300a39d3bb6469c0e14a5a85edd199b19e7))


### Bug Fixes

* **Android:** [[#175090703](https://www.pivotaltracker.com/story/show/175090703)] CTA text not aligned in the Android Bonus_Request_Information screen ([#2270](https://github.com/pagopa/io-app/issues/2270)) ([c033df4](https://github.com/pagopa/io-app/commit/c033df40a866e6684cea157439a33097b50b0e2d))
* [[#175132435](https://www.pivotaltracker.com/story/show/175132435)] update context help content for faqs ([#2275](https://github.com/pagopa/io-app/issues/2275)) ([f96be24](https://github.com/pagopa/io-app/commit/f96be24902fe616654bde49d4b857ac89b0b4c23))
* **Bonus Pagamenti Digitali:** [[#175207263](https://www.pivotaltracker.com/story/show/175207263)] Iban update request has wrong token ([#2281](https://github.com/pagopa/io-app/issues/2281)) ([b2b6ae4](https://github.com/pagopa/io-app/commit/b2b6ae4df10e3082d61e5e2d0c1339f277dce536))


### Chores

* **Bonus Pagamenti Digitali:** [[#175186882](https://www.pivotaltracker.com/story/show/175186882)] Sync code last PM API spec  ([#2274](https://github.com/pagopa/io-app/issues/2274)) ([c6a0f5f](https://github.com/pagopa/io-app/commit/c6a0f5fc78e68ca8ea9796793af12f4f28e14cab))

## [1.7.0-rc.9](https://github.com/pagopa/io-app/compare/1.7.0-rc.5...1.7.0-rc.9) (2020-10-08)


### Features

* **MyPortal:** [[#175076179](https://www.pivotaltracker.com/story/show/175076179)] Security improvements on webview component for services ([#2258](https://github.com/pagopa/io-app/issues/2258)) ([a2dcb2f](https://github.com/pagopa/io-app/commit/a2dcb2fb0616fa5c19690ae22f16f8231c51f84e))
* [[#175057500](https://www.pivotaltracker.com/story/show/175057500)] Modify label for transaction details ([#2251](https://github.com/pagopa/io-app/issues/2251)) ([3986236](https://github.com/pagopa/io-app/commit/3986236f32be83570fc1f498b73ff71fac1d3b75))
* **Bonus Pagamenti Digitali:** [[#174847319](https://www.pivotaltracker.com/story/show/174847319)] Iban insertion screen ([#2259](https://github.com/pagopa/io-app/issues/2259)) ([6351eff](https://github.com/pagopa/io-app/commit/6351eff07103a4bbd590be4eeee12ffd36fbaa18))
* **Bonus Pagamenti Digitali:** [[#174847335](https://www.pivotaltracker.com/story/show/174847335),[#174847371](https://www.pivotaltracker.com/story/show/174847371),[#174847398](https://www.pivotaltracker.com/story/show/174847398)] Iban ko screens ([#2261](https://github.com/pagopa/io-app/issues/2261)) ([adf9337](https://github.com/pagopa/io-app/commit/adf9337fe257249fbdf98af504701091313eb19c))
* **Bonus Pagamenti Digitali:** [[#174863094](https://www.pivotaltracker.com/story/show/174863094)] No payment methods available screen ([#2262](https://github.com/pagopa/io-app/issues/2262)) ([6fda0ec](https://github.com/pagopa/io-app/commit/6fda0ecdba249b000406a06873d471ebfaa53a51))
* **Bonus Pagamenti Digitali:** [[#175013470](https://www.pivotaltracker.com/story/show/175013470),[#174847416](https://www.pivotaltracker.com/story/show/174847416),[#174847513](https://www.pivotaltracker.com/story/show/174847513)] Onboarding Iban business logic workflow, actions and store ([#2252](https://github.com/pagopa/io-app/issues/2252)) ([a1546d5](https://github.com/pagopa/io-app/commit/a1546d5c1435d36911600e16a3d10ba9cfe138f9))
* **Bonus Pagamenti Digitali:** [[#175076682](https://www.pivotaltracker.com/story/show/175076682)] Load ABI list ([#2254](https://github.com/pagopa/io-app/issues/2254)) ([0e30730](https://github.com/pagopa/io-app/commit/0e30730f595b2b041b667fc88cf45fd123ffd51f))
* **Bonus Pagamenti Digitali:** [[#175096847](https://www.pivotaltracker.com/story/show/175096847)] Support internal tests ([#2260](https://github.com/pagopa/io-app/issues/2260)) ([a06825f](https://github.com/pagopa/io-app/commit/a06825fe576248fc5bcaa65e627843d1592c0dbc))
* **Bonus Pagamenti Digitali:** [[#175165785](https://www.pivotaltracker.com/story/show/175165785)] Remove api-key from BPD requests ([#2272](https://github.com/pagopa/io-app/issues/2272)) ([a7219ac](https://github.com/pagopa/io-app/commit/a7219ac5e76b0725fb5baf12564d251c3306734d))
* **MyPortal:** [[#175114980](https://www.pivotaltracker.com/story/show/175114980)] Implements check on loading error on Webview component ([#2264](https://github.com/pagopa/io-app/issues/2264)) ([13d2999](https://github.com/pagopa/io-app/commit/13d299919385d191b48e08097b041ca5a658a613))
* [[#175058139](https://www.pivotaltracker.com/story/show/175058139)] Remove subtitle change pin screen ([#2268](https://github.com/pagopa/io-app/issues/2268)) ([312eeef](https://github.com/pagopa/io-app/commit/312eeef7b96009d450a430166c35953192f53f9d))
* [[#175060613](https://www.pivotaltracker.com/story/show/175060613)] Modify screenshot deny logic android ([#2250](https://github.com/pagopa/io-app/issues/2250)) ([2e17847](https://github.com/pagopa/io-app/commit/2e17847e3a772e18dd2c0fde2b9f52172723a9a4))


### Bug Fixes

* **Bonus Pagamenti Digitali:** [[#175117682](https://www.pivotaltracker.com/story/show/175117682)] Citizen delete response cannot be decoded ([#2265](https://github.com/pagopa/io-app/issues/2265)) ([5520010](https://github.com/pagopa/io-app/commit/5520010a0d54f7ec448558c4f130feb4e8e8fe2a))
* [[#175072051](https://www.pivotaltracker.com/story/show/175072051)] use SafeAreaView from react-natvie instead react-navigation [#2267](https://github.com/pagopa/io-app/issues/2267) ([a180b73](https://github.com/pagopa/io-app/commit/a180b737e9b5170c137eaf7bb0a3f58a2ca78797))
* [[#175090750](https://www.pivotaltracker.com/story/show/175090750)] Wrong label shown in Touch-ID identification ([#2253](https://github.com/pagopa/io-app/issues/2253)) ([e59b628](https://github.com/pagopa/io-app/commit/e59b628ecccfb447e28d3b41ed886f0e4bf7325b))


### Chores

* [[#175095271](https://www.pivotaltracker.com/story/show/175095271)] Prettify the codebase [#2257](https://github.com/pagopa/io-app/issues/2257) ([3f4029c](https://github.com/pagopa/io-app/commit/3f4029c97879ab25ce3318c3d8cc34b95fe98ea9))

## [1.7.0-rc.5](https://github.com/pagopa/io-app/compare/1.7.0-rc.4...1.7.0-rc.5) (2020-10-01)


### Features

* **Bonus Pagamenti Digitali:** [[#174837969](https://www.pivotaltracker.com/story/show/174837969)] bpd information & tos screen ([#2231](https://github.com/pagopa/io-app/issues/2231)) ([526c64b](https://github.com/pagopa/io-app/commit/526c64bb0c1d2097a8da88cc25dbd060c96754d1))
* **Bonus Pagamenti Digitali:** [[#174838065](https://www.pivotaltracker.com/story/show/174838065)] Declaration screen ([#2228](https://github.com/pagopa/io-app/issues/2228)) ([72cbca6](https://github.com/pagopa/io-app/commit/72cbca6317c8b77f8fbbc2866c63f89775320040))
* **Bonus Pagamenti Digitali:** [[#174847263](https://www.pivotaltracker.com/story/show/174847263),[#174847196](https://www.pivotaltracker.com/story/show/174847196)] Add network logic to support upsert IBAN ([#2233](https://github.com/pagopa/io-app/issues/2233)) ([1132c8e](https://github.com/pagopa/io-app/commit/1132c8e251f82baa41492cf202d8d525848307f1))
* **Bonus Pagamenti Digitali:** [[#174858355](https://www.pivotaltracker.com/story/show/174858355)] iban insertion screen placeholder ([#2243](https://github.com/pagopa/io-app/issues/2243)) ([f7bf206](https://github.com/pagopa/io-app/commit/f7bf206323c3d81af8dfe97685f6418126bd7d5c))
* **Bonus Pagamenti Digitali:** [[#174860194](https://www.pivotaltracker.com/story/show/174860194)] Loading Activate bpd screen ([#2230](https://github.com/pagopa/io-app/issues/2230)) ([b5eafb7](https://github.com/pagopa/io-app/commit/b5eafb77a94042e2fc42f4018bf5cae9f71df4ea))
* **Bonus Pagamenti Digitali:** [[#174860317](https://www.pivotaltracker.com/story/show/174860317)] Loading bpd activation status screen ([#2229](https://github.com/pagopa/io-app/issues/2229)) ([e7af639](https://github.com/pagopa/io-app/commit/e7af63939e256320bf034392e2f13027b8504634))
* **Bonus Pagamenti Digitali:** [[#174970898](https://www.pivotaltracker.com/story/show/174970898)] Handle citizen not found as not enrolled to BPD ([#2246](https://github.com/pagopa/io-app/issues/2246)) ([a12bc03](https://github.com/pagopa/io-app/commit/a12bc03a4bf9cd5b4f199b1e0f6696d8d2021490))
* **Bonus Pagamenti Digitali:** [[#175011121](https://www.pivotaltracker.com/story/show/175011121)] Onboarding Bancomat screens placeholder ([#2239](https://github.com/pagopa/io-app/issues/2239)) ([494cebd](https://github.com/pagopa/io-app/commit/494cebd790b4b090456b27d0ac2fa0fa007a3d88))
* **Bonus Pagamenti Digitali:** [[#175013432](https://www.pivotaltracker.com/story/show/175013432)] iban navigation stack ([#2245](https://github.com/pagopa/io-app/issues/2245)) ([72184e0](https://github.com/pagopa/io-app/commit/72184e04867e01fdaa5eda1d58db9e917281e03d))
* **MyPortal:** [[#174865280](https://www.pivotaltracker.com/story/show/174865280)] Clean stored navigation params [#2227](https://github.com/pagopa/io-app/issues/2227) ([5b556b8](https://github.com/pagopa/io-app/commit/5b556b841cc4f58437806b9f9da5590620a218fc))
* [[#174864406](https://www.pivotaltracker.com/story/show/174864406)] Remove the not validated email block to request the download of data ([#2247](https://github.com/pagopa/io-app/issues/2247)) ([e60d9cb](https://github.com/pagopa/io-app/commit/e60d9cb2c5ee8a121824cf2bd7390a7ffb598b21))
* [[#175009115](https://www.pivotaltracker.com/story/show/175009115)] No identification required on credit card insertion ([#2237](https://github.com/pagopa/io-app/issues/2237)) ([d7689c0](https://github.com/pagopa/io-app/commit/d7689c0b4ea4bcc5f31b5b7ed85437390451632e))


### Bug Fixes

* **Bonus Vacanze:** [[#174985742](https://www.pivotaltracker.com/story/show/174985742)] Add consumed date row on bonus detail ([#2226](https://github.com/pagopa/io-app/issues/2226)) ([e9f669c](https://github.com/pagopa/io-app/commit/e9f669c069369c905c4d65db71408feeaa2b5603))
* [[#174768831](https://www.pivotaltracker.com/story/show/174768831)] Remove extra spaces TOS screen ([#2240](https://github.com/pagopa/io-app/issues/2240)) ([ef37152](https://github.com/pagopa/io-app/commit/ef37152faae9af472125f2fad3774c085b42c351))
* [[#174893081](https://www.pivotaltracker.com/story/show/174893081)] update payment faq ([#2242](https://github.com/pagopa/io-app/issues/2242)) ([9c76d5d](https://github.com/pagopa/io-app/commit/9c76d5dc42c27eedbb8c1b2eadc68235f320dd76))
* [[#174949682](https://www.pivotaltracker.com/story/show/174949682)] Fix duplicate keys on Keypad ([#2234](https://github.com/pagopa/io-app/issues/2234)) ([59fd59f](https://github.com/pagopa/io-app/commit/59fd59faab1851c557c3a25385648ba5fdd0f21d))
* **Bonus Vacanze:** [[#175058176](https://www.pivotaltracker.com/story/show/175058176)] Fixes the color of bonus status badge text [#2248](https://github.com/pagopa/io-app/issues/2248) ([1adf361](https://github.com/pagopa/io-app/commit/1adf361cb19becdc7905a3340dcf24f54451b27f))


### Chores

* [[#174976615](https://www.pivotaltracker.com/story/show/174976615)] Rename and move CTA components ([#2235](https://github.com/pagopa/io-app/issues/2235)) ([b2f3071](https://github.com/pagopa/io-app/commit/b2f30719a393793dd4d098f9d2c0621a6b545917))
* [[#175071475](https://www.pivotaltracker.com/story/show/175071475)] Remove sensible data from developer section ([#2249](https://github.com/pagopa/io-app/issues/2249)) ([2c626ef](https://github.com/pagopa/io-app/commit/2c626ef6f2a3b313f61c66ce293930695189d499))

## [1.7.0-rc.4](https://github.com/pagopa/io-app/compare/1.7.0-rc.3...1.7.0-rc.4) (2020-09-28)


### Features

* **Bonus Pagamenti Digitali:** [[#174839834](https://www.pivotaltracker.com/story/show/174839834)] Onboarding saga orchestration ([#2216](https://github.com/pagopa/io-app/issues/2216)) ([b432bbf](https://github.com/pagopa/io-app/commit/b432bbf4b5cdff5a4f26ac3d0ac6612102e4fb01))

## [1.7.0-rc.3](https://github.com/pagopa/io-app/compare/1.7.0-rc.0...1.7.0-rc.3) (2020-09-25)


### Features

* **Bonus Pagamenti Digitali:** [[#174838425](https://www.pivotaltracker.com/story/show/174838425)] Citizen enrollment and status ([#2219](https://github.com/pagopa/io-app/issues/2219)) ([bbd4fe0](https://github.com/pagopa/io-app/commit/bbd4fe07ef3ace5cc5410e8f74d0ff2efa5c07da))
* **Bonus Pagamenti Digitali:** [[#174858345](https://www.pivotaltracker.com/story/show/174858345)] Add navigation stack for bpd onboarding ([#2206](https://github.com/pagopa/io-app/issues/2206)) ([6c6dfbe](https://github.com/pagopa/io-app/commit/6c6dfbe156e433af182c31e3554875a6e1f13b47))
* **Bonus Pagamenti Digitali:** [[#174897872](https://www.pivotaltracker.com/story/show/174897872)] Draft state, action and reducers for bpd onboarding ([#2212](https://github.com/pagopa/io-app/issues/2212)) ([d5e3e3e](https://github.com/pagopa/io-app/commit/d5e3e3e4685003d06ee00d9a2911f7f10f51d328))
* **MyPortal:** [[#174801117](https://www.pivotaltracker.com/story/show/174801117)] Adds ServicesWebviewParams codec [#2209](https://github.com/pagopa/io-app/issues/2209) ([fbba2eb](https://github.com/pagopa/io-app/commit/fbba2ebb862040b265e75c99eb9926d16a2c0d7e))
* **MyPortal:** [[#174801172](https://www.pivotaltracker.com/story/show/174801172)] Screen component for region service external webview ([#2204](https://github.com/pagopa/io-app/issues/2204)) ([4f861e4](https://github.com/pagopa/io-app/commit/4f861e454edb51ef65ada25b14ecf7ff66f82582))
* [[#172911823](https://www.pivotaltracker.com/story/show/172911823)] Update pin without logout ([#2195](https://github.com/pagopa/io-app/issues/2195)) ([63b08ff](https://github.com/pagopa/io-app/commit/63b08ffd83794657ac24d718314b4379f11d37c5))
* **MyPortal:** [[#174801195](https://www.pivotaltracker.com/story/show/174801195)] Service detail CTA ([#2217](https://github.com/pagopa/io-app/issues/2217)) ([06fbb95](https://github.com/pagopa/io-app/commit/06fbb950a0818a64bb338b1e8eaf7f5446d97063))
* **MyPortal:** [[#174859517](https://www.pivotaltracker.com/story/show/174859517)] Checks token_name on CTA actions ([#2208](https://github.com/pagopa/io-app/issues/2208)) ([3627ac9](https://github.com/pagopa/io-app/commit/3627ac9d28d8270f031bd3a9dc91cd0ca705e74c))
* **MyPortal:** [[#174881082](https://www.pivotaltracker.com/story/show/174881082)] Adds the check on params coming from store and showing alerts if something is missing ([#2214](https://github.com/pagopa/io-app/issues/2214)) ([6eef55f](https://github.com/pagopa/io-app/commit/6eef55ff88b2f873afbc4596235fe42ea59fa061))
* **MyPortal:** [[#174883732](https://www.pivotaltracker.com/story/show/174883732)] Adds MD documentation on webview injected script and original JS file ([#2220](https://github.com/pagopa/io-app/issues/2220)) ([a32cf71](https://github.com/pagopa/io-app/commit/a32cf7104384fb45652eb60ee33402b3ba6aceb7))


### Bug Fixes

* [[#174953297](https://www.pivotaltracker.com/story/show/174953297)] Reminder CTA label is wrong localized ([#2222](https://github.com/pagopa/io-app/issues/2222)) ([0e38164](https://github.com/pagopa/io-app/commit/0e38164efc155291676719fa60027037c34e1099))
* **Payments:** [[#174804073](https://www.pivotaltracker.com/story/show/174804073)] Show IUV label for notice code ([#2223](https://github.com/pagopa/io-app/issues/2223)) ([89859af](https://github.com/pagopa/io-app/commit/89859afce0d4e161ac637ff7b388a24d91366b1c))


### Chores

* [[#174596045](https://www.pivotaltracker.com/story/show/174596045)] Change api call from getProfile to getSession ([#2201](https://github.com/pagopa/io-app/issues/2201)) ([a46f228](https://github.com/pagopa/io-app/commit/a46f22898de998cc50c88bf4a9b91e5a9ee53faf))
* [[#174922141](https://www.pivotaltracker.com/story/show/174922141)] Upgrade react-native-keychain  v6.2.0 ([#2215](https://github.com/pagopa/io-app/issues/2215)) ([b3b8c82](https://github.com/pagopa/io-app/commit/b3b8c8221da2c3bd1c57dc79ca7d455faa09f98c))
* Update typo in pick_psp.md ([#2221](https://github.com/pagopa/io-app/issues/2221)) ([5de4848](https://github.com/pagopa/io-app/commit/5de4848a3f21e96dce207e817393ed2fd4a2dde3))

## [1.7.0-rc.0](https://github.com/pagopa/io-app/compare/1.6.0-rc.3...1.7.0-rc.0) (2020-09-18)


### Features

* **Android:** [[#174715029](https://www.pivotaltracker.com/story/show/174715029)] Enable hermes [#2187](https://github.com/pagopa/io-app/issues/2187) ([d21b5d9](https://github.com/pagopa/io-app/commit/d21b5d90d54c185db9123e987d97b9889669d2c3))
* [[#173639055](https://www.pivotaltracker.com/story/show/173639055)] Display all cc in wallet section ([#2196](https://github.com/pagopa/io-app/issues/2196)) ([c7e5e66](https://github.com/pagopa/io-app/commit/c7e5e666a39215454c3c24f16aa06c90fb7448f7))
* [[#173847889](https://www.pivotaltracker.com/story/show/173847889)] Implements new test-login ([#2126](https://github.com/pagopa/io-app/issues/2126)) ([ddc2dd9](https://github.com/pagopa/io-app/commit/ddc2dd9b3e229e884f3b57ce912021ae1a6bf48f))
* [[#174803269](https://www.pivotaltracker.com/story/show/174803269)] Add feature flag for BPD [#2200](https://github.com/pagopa/io-app/issues/2200) ([932676d](https://github.com/pagopa/io-app/commit/932676da0d9004271e497ac890a495f66464d2fc))
* **Bonus Pagamenti Digitali:** [[#174816293](https://www.pivotaltracker.com/story/show/174816293),[#174796530](https://www.pivotaltracker.com/story/show/174796530)] Display BDP in bonus list ([#2207](https://github.com/pagopa/io-app/issues/2207)) ([ff2c805](https://github.com/pagopa/io-app/commit/ff2c8058ea809fc6e629df880ebaebeaa800fa01))
* **My Portal:** [[#174689160](https://www.pivotaltracker.com/story/show/174689160)] Adds the script to check if injection is completed ([#2194](https://github.com/pagopa/io-app/issues/2194)) ([a8b97d2](https://github.com/pagopa/io-app/commit/a8b97d2b11dbd57292a517c83ab1713ad2923354))
* **My Portal:** [[#174693542](https://www.pivotaltracker.com/story/show/174693542)] Support internal navigation with params ([#2183](https://github.com/pagopa/io-app/issues/2183)) ([30bb32f](https://github.com/pagopa/io-app/commit/30bb32f39317f4d01b5b54baa960fb7a1c2862af))
* **My Portal:** [[#174695208](https://www.pivotaltracker.com/story/show/174695208)] Saves a cookie on web playground ([#2198](https://github.com/pagopa/io-app/issues/2198)) ([9b98a37](https://github.com/pagopa/io-app/commit/9b98a3776b6f81c751566219eee4b99fcd1b4fdb))


### Bug Fixes

* [[#174704651](https://www.pivotaltracker.com/story/show/174704651)] Cannot use the style props for typography components ([#2197](https://github.com/pagopa/io-app/issues/2197)) ([72c12ba](https://github.com/pagopa/io-app/commit/72c12ba2418118214372be43bed3fe90943b0a1a))
* [[#174845929](https://www.pivotaltracker.com/story/show/174845929)] is_inbox_enabled never enabled ([#2203](https://github.com/pagopa/io-app/issues/2203)) ([6a080d2](https://github.com/pagopa/io-app/commit/6a080d2422763bd4476ad140cb9b201fce29847b))


### Chores

* [[#174821277](https://www.pivotaltracker.com/story/show/174821277)] Debug Identification PIN creation ([#2199](https://github.com/pagopa/io-app/issues/2199)) ([ba9513a](https://github.com/pagopa/io-app/commit/ba9513a83b9002ca94cf65a8398370969ac3b31e))

## [1.6.0-rc.3](https://github.com/pagopa/io-app/compare/1.6.0-rc.2...1.6.0-rc.3) (2020-09-10)

## [1.6.0-rc.2](https://github.com/pagopa/io-app/compare/1.6.0-rc.1...1.6.0-rc.2) (2020-09-10)


### Features

* **Bonus Vacanze:** [[#174693564](https://www.pivotaltracker.com/story/show/174693564)] Remove footer when bonus is not active ([#2182](https://github.com/pagopa/io-app/issues/2182)) ([cc1cb4f](https://github.com/pagopa/io-app/commit/cc1cb4f5ff5ce671efd3eb9a3bf2fbb6afc889f3))
* **My Portal:** [[#174618758](https://www.pivotaltracker.com/story/show/174618758),[#174574621](https://www.pivotaltracker.com/story/show/174574621)] Playground to test the event handling from an external webview ([#2178](https://github.com/pagopa/io-app/issues/2178)) ([82d63ec](https://github.com/pagopa/io-app/commit/82d63ec34f2d5cc2645524b340182e662e1f6e6e))
* [[#173190756](https://www.pivotaltracker.com/story/show/173190756)] Update profile on language selection ([#2184](https://github.com/pagopa/io-app/issues/2184)) ([a22f330](https://github.com/pagopa/io-app/commit/a22f330d7ad4e25df6c2cda134473d2989b4f7da))
* [[#174712071](https://www.pivotaltracker.com/story/show/174712071)] Update and sync preferred language ([#2186](https://github.com/pagopa/io-app/issues/2186)) ([7fa533f](https://github.com/pagopa/io-app/commit/7fa533fe92657752c9c38a58eb10f08061391443))
* **My Portal:** [[#174689080](https://www.pivotaltracker.com/story/show/174689080)] Improvements on Webview playground ([#2185](https://github.com/pagopa/io-app/issues/2185)) ([67cb09d](https://github.com/pagopa/io-app/commit/67cb09de53bda1b378802159dab786aaa6069903))
* [[#174736321](https://www.pivotaltracker.com/story/show/174736321)] Add markdown playground ([#2189](https://github.com/pagopa/io-app/issues/2189)) ([7ba4a46](https://github.com/pagopa/io-app/commit/7ba4a46ed57b33b35374a573f49f6635cb73143f))


### Bug Fixes

* **Payments:** [[#174552971](https://www.pivotaltracker.com/story/show/174552971)] Notice number is wrong composed ([#2180](https://github.com/pagopa/io-app/issues/2180)) ([607c29f](https://github.com/pagopa/io-app/commit/607c29f48c7c23e538c910246b0f65afd2bb4dce))
* **Payments:** [[#174646257](https://www.pivotaltracker.com/story/show/174646257)] Display notice in place of IUV ([#2177](https://github.com/pagopa/io-app/issues/2177)) ([183d5a0](https://github.com/pagopa/io-app/commit/183d5a01f09034c3eeaa7a64f1796ecdb130deed))
* **Payments:** [[#174733925](https://www.pivotaltracker.com/story/show/174733925)] Transactions are ordered from oldest to most recent ([#2190](https://github.com/pagopa/io-app/issues/2190)) ([3250abd](https://github.com/pagopa/io-app/commit/3250abd1990fc1e4b49b30c02e59b7bca5ffc151))

## [1.6.0-rc.1](https://github.com/pagopa/io-app/compare/1.6.0-rc.0...1.6.0-rc.1) (2020-09-03)


### Features

* [[#165057751](https://www.pivotaltracker.com/story/show/165057751)] Transpile typescript with babel ([#2151](https://github.com/pagopa/io-app/issues/2151)) ([43c24af](https://github.com/pagopa/io-app/commit/43c24af566e0879e6ed22a92cf786cee8c87e51b))
* [[#174295674](https://www.pivotaltracker.com/story/show/174295674)] Reworks the description extraction on payments ([#2171](https://github.com/pagopa/io-app/issues/2171)) ([f1a4432](https://github.com/pagopa/io-app/commit/f1a44326235418ce1afe6d017918c32f9a56c2df))
* [[#174296623](https://www.pivotaltracker.com/story/show/174296623),[#173353861](https://www.pivotaltracker.com/story/show/173353861)] Minor reworks and fixes on psp and confirm payment method screen ([#2166](https://github.com/pagopa/io-app/issues/2166)) ([34b3122](https://github.com/pagopa/io-app/commit/34b3122af56d7c2df49594f5605e7f33cf4f7990))
* [[#174321085](https://www.pivotaltracker.com/story/show/174321085)] Save Bonus Vacanze screenshot ([#2156](https://github.com/pagopa/io-app/issues/2156)) ([7acb8ad](https://github.com/pagopa/io-app/commit/7acb8ad52651f68ccd481940496423c022479bf1))
* [[#174338921](https://www.pivotaltracker.com/story/show/174338921)] Convert app version to simple text not a button ([#2163](https://github.com/pagopa/io-app/issues/2163)) ([a56e0af](https://github.com/pagopa/io-app/commit/a56e0af07335eb39c0578f4d889dd9b276ce6c58))
* [[#174361107](https://www.pivotaltracker.com/story/show/174361107)] Create new common style variables ([#2160](https://github.com/pagopa/io-app/issues/2160)) ([fe3f389](https://github.com/pagopa/io-app/commit/fe3f389f4fc35aea240b650bfc612428e5f12deb))
* [[#174361165](https://www.pivotaltracker.com/story/show/174361165)] Add core typography ([#2161](https://github.com/pagopa/io-app/issues/2161)) ([5189c3f](https://github.com/pagopa/io-app/commit/5189c3f0a594b066e57aca95cc1b28af07db4738))
* [[#174574704](https://www.pivotaltracker.com/story/show/174574704)] Add My Portal project as changelog-scope ([#2173](https://github.com/pagopa/io-app/issues/2173)) ([ee4f5fd](https://github.com/pagopa/io-app/commit/ee4f5fd82688fbea224a303bb5314a6fb16902b3))
* **Bonus Vacanze:** [[#174333382](https://www.pivotaltracker.com/story/show/174333382)] Add new footer and screenshot animation in bonus detail screen ([#2175](https://github.com/pagopa/io-app/issues/2175)) ([037e733](https://github.com/pagopa/io-app/commit/037e73313ec3fcd882b6667a1bcb21fd23f3460b))


### Bug Fixes

* [[#174160259](https://www.pivotaltracker.com/story/show/174160259)] Switch label to change text on switch value change ([#2168](https://github.com/pagopa/io-app/issues/2168)) ([78110e5](https://github.com/pagopa/io-app/commit/78110e5307144655d13a081dabb19563984f3449))
* [[#174294652](https://www.pivotaltracker.com/story/show/174294652)] Wrong calendar display name on preferences screen for some devices ([#2167](https://github.com/pagopa/io-app/issues/2167)) ([1ba2421](https://github.com/pagopa/io-app/commit/1ba242128428eff618e0b2c72b4efe723bc7477d))
* [[#174301199](https://www.pivotaltracker.com/story/show/174301199)] Fixes cut message for favourite method removal ([#2164](https://github.com/pagopa/io-app/issues/2164)) ([4f5a524](https://github.com/pagopa/io-app/commit/4f5a52471f9edec5389750b4fd8b4755cdf38d0a))
* [[#174317167](https://www.pivotaltracker.com/story/show/174317167)] Hide no pagopa network label if user choose to navigate to pick psp screen ([#2170](https://github.com/pagopa/io-app/issues/2170)) ([75d38cc](https://github.com/pagopa/io-app/commit/75d38cc9ae39e6e34e05e585869ae21ec3905d3b))
* [[#174572598](https://www.pivotaltracker.com/story/show/174572598)] Pivotal project id is treated as a string ([#2172](https://github.com/pagopa/io-app/issues/2172)) ([23d6ae4](https://github.com/pagopa/io-app/commit/23d6ae44f3b39e397e5732202da9f93187edd05b))
* Gemfile.lock to reduce vulnerabilities ([#2147](https://github.com/pagopa/io-app/issues/2147)) ([0f90b26](https://github.com/pagopa/io-app/commit/0f90b2639454560ce28014f21fd0375dbf224844))
* **Android:** [[#174437875](https://www.pivotaltracker.com/story/show/174437875)] StackOverflowException on Huawei P10 lite (and similar) when using the TextInputMask ([#2165](https://github.com/pagopa/io-app/issues/2165)) ([f5c6dc0](https://github.com/pagopa/io-app/commit/f5c6dc0f79414e9c0bd83740d4236e88bcf61dbf))
* **Payments:** [[#174627683](https://www.pivotaltracker.com/story/show/174627683)] Show notice code when description is unavailable ([#2176](https://github.com/pagopa/io-app/issues/2176)) ([2f73477](https://github.com/pagopa/io-app/commit/2f73477a9b3bb1e3413a91b9b8b93021876a7ccd))


### Chores

* [[#174006350](https://www.pivotaltracker.com/story/show/174006350)] Add support to changelog scope ([#2159](https://github.com/pagopa/io-app/issues/2159)) ([2a5ed3e](https://github.com/pagopa/io-app/commit/2a5ed3e5a75306c3f8031e6f21c571e52ef54b34))
* [[#174190519](https://www.pivotaltracker.com/story/show/174190519)] Change commands for release & build ([#2157](https://github.com/pagopa/io-app/issues/2157)) ([b199388](https://github.com/pagopa/io-app/commit/b1993884bc0813edcd9fc56707d01417a3e62350))
* [[#174293075](https://www.pivotaltracker.com/story/show/174293075),[#174458516](https://www.pivotaltracker.com/story/show/174458516)] Migrate from tslint to eslint ([#2169](https://github.com/pagopa/io-app/issues/2169)) ([1cc7335](https://github.com/pagopa/io-app/commit/1cc7335a6756f3761b01dca322cdcfa7f4c8712d))
* [[#174318137](https://www.pivotaltracker.com/story/show/174318137)] Upgrade typescript to 3.9.7 ([#2154](https://github.com/pagopa/io-app/issues/2154)) ([c969d08](https://github.com/pagopa/io-app/commit/c969d08fe847a82fd8a2d9e96f1d28633db515cb))
* [[#174318377](https://www.pivotaltracker.com/story/show/174318377)] Add symbolicate to urls ignored in Reactotron ([#2153](https://github.com/pagopa/io-app/issues/2153)) ([4fa36fc](https://github.com/pagopa/io-app/commit/4fa36fc28b6f83eb16b9fd2badc0660baec1ceac))
* [[#174337387](https://www.pivotaltracker.com/story/show/174337387)] Upgrade react-native-device-info to 5.6.4 ([#2155](https://github.com/pagopa/io-app/issues/2155)) ([128ed3d](https://github.com/pagopa/io-app/commit/128ed3d7259f747f9332314b61512d26ebb07bb4))
* **My Portal:** [[#174578457](https://www.pivotaltracker.com/story/show/174578457)] Adds a feature flag for myportal integration ([#2174](https://github.com/pagopa/io-app/issues/2174)) ([fd58379](https://github.com/pagopa/io-app/commit/fd583790dbf8891846aee93a12490d6a88a9bf3b))

## [1.6.0-rc.0](https://github.com/pagopa/io-app/compare/1.5.0-rc.3...1.6.0-rc.0) (2020-08-14)


### Chores

* [[#173888442](https://www.pivotaltracker.com/story/show/173888442)] Upgrade react-native-webview to 10.4.0 [#2146](https://github.com/pagopa/io-app/issues/2146) ([0b62844](https://github.com/pagopa/io-app/commit/0b62844c7eab54cb40a95cea5112cdb217eab6fd))
* [[#173917003](https://www.pivotaltracker.com/story/show/173917003)] Upgrade redux-saga to 1.1.3 ([#2148](https://github.com/pagopa/io-app/issues/2148)) ([3ab02d2](https://github.com/pagopa/io-app/commit/3ab02d293c5c928ba1b8b097300763311cab3549))

## [1.5.0-rc.3](https://github.com/pagopa/io-app/compare/1.5.0-rc.2...1.5.0-rc.3) (2020-08-12)


### Bug Fixes

* [[#174295714](https://www.pivotaltracker.com/story/show/174295714)] Crash on android 19 & share capability disabled on Android sdk <= 19 ([#2152](https://github.com/pagopa/io-app/issues/2152)) ([94f22c5](https://github.com/pagopa/io-app/commit/94f22c54f0368733081b56dbb9a1718ff396dc42))

## [1.5.0-rc.2](https://github.com/pagopa/io-app/compare/1.5.0-rc.1...1.5.0-rc.2) (2020-08-11)


### Features

* [[#172371297](https://www.pivotaltracker.com/story/show/172371297)] forwards additional events (identification/CIE) to mixpanel ([#1729](https://github.com/pagopa/io-app/issues/1729)) ([628fab6](https://github.com/pagopa/io-app/commit/628fab6299c8ebe6ff2126f1c6f45dca841986c2))
* [[#173735284](https://www.pivotaltracker.com/story/show/173735284)] Display support_url metadata ([#2149](https://github.com/pagopa/io-app/issues/2149)) ([1b65baa](https://github.com/pagopa/io-app/commit/1b65baa7635566669bc273dc72af25e31aa2499d))
* [[#174034065](https://www.pivotaltracker.com/story/show/174034065)] Add info about session expiration ([#2142](https://github.com/pagopa/io-app/issues/2142)) ([f93f804](https://github.com/pagopa/io-app/commit/f93f804a0ec29bb355088c2ba49f846217056caa))
* [[#174034065](https://www.pivotaltracker.com/story/show/174034065)] Show details about session expired ([#2150](https://github.com/pagopa/io-app/issues/2150)) ([1c6b6b6](https://github.com/pagopa/io-app/commit/1c6b6b62db31ddd8819169bef86a9ec369e684ba))
* [[#174213277](https://www.pivotaltracker.com/story/show/174213277)] Add more details in TransactionDetailScreen ([#2145](https://github.com/pagopa/io-app/issues/2145)) ([46b95a9](https://github.com/pagopa/io-app/commit/46b95a981d83aa7b1fd7eb527d74c38e9a5d5fcd))


### Bug Fixes

* [[#172625344](https://www.pivotaltracker.com/story/show/172625344)] Change icons order for base header [#1812](https://github.com/pagopa/io-app/issues/1812) ([e2f6a3f](https://github.com/pagopa/io-app/commit/e2f6a3ffb8f45d2ea27d442bbc309e83bc976e6c))
* [[#173217033](https://www.pivotaltracker.com/story/show/173217033)] Restores pin insertion when disabling the biometry ([#2140](https://github.com/pagopa/io-app/issues/2140)) ([bbfee11](https://github.com/pagopa/io-app/commit/bbfee1102d24135e3fa67adc8c960a8b1afc07e2))
* [[#173937093](https://www.pivotaltracker.com/story/show/173937093)] Add /v1/psps/all API ([#2091](https://github.com/pagopa/io-app/issues/2091)) ([63fa72f](https://github.com/pagopa/io-app/commit/63fa72f976222976bf7ab9cb77c4ee92d7b5edc3))
* [[#173937093](https://www.pivotaltracker.com/story/show/173937093)] Messages: refresh indicator not shown on iOS devices ([#2131](https://github.com/pagopa/io-app/issues/2131)) ([eb4b59f](https://github.com/pagopa/io-app/commit/eb4b59f9228e4909fe83f443b68f61c3f6078395))
* [[#173964550](https://www.pivotaltracker.com/story/show/173964550)] Fixes the calculation of the fee ([#2124](https://github.com/pagopa/io-app/issues/2124)) ([cd43abe](https://github.com/pagopa/io-app/commit/cd43abed705db7217af3c0033792543c7e4fee0f))
* [[#174160605](https://www.pivotaltracker.com/story/show/174160605)] Empty urls causes crash [Android] ([#2125](https://github.com/pagopa/io-app/issues/2125)) ([8df2082](https://github.com/pagopa/io-app/commit/8df208219289575a22348be21f3b9d4540953028))
* [[#174179069](https://www.pivotaltracker.com/story/show/174179069)] fix pin insertion overflow ([#2127](https://github.com/pagopa/io-app/issues/2127)) ([c3fc106](https://github.com/pagopa/io-app/commit/c3fc106ed64b2313da978724129cf4a9f3f087d0))
* [[#174186215](https://www.pivotaltracker.com/story/show/174186215)] wrong checkbox rendering in IngressScreen ([#2135](https://github.com/pagopa/io-app/issues/2135)) ([b0ea88d](https://github.com/pagopa/io-app/commit/b0ea88dd6891533d0a2c7f31226d2f883528c2c6))
* [[#174193232](https://www.pivotaltracker.com/story/show/174193232)] Keyboard remaining opened after confirm a manual payment on Android [#2136](https://github.com/pagopa/io-app/issues/2136) ([c6a0bb7](https://github.com/pagopa/io-app/commit/c6a0bb79bc995ea13c087dd1d7f93628e1d2e6e5))
* [[#174193291](https://www.pivotaltracker.com/story/show/174193291)] Fixes the sticky headers on message deadlines component ([#2129](https://github.com/pagopa/io-app/issues/2129)) ([1543a83](https://github.com/pagopa/io-app/commit/1543a834b4dc911e91f42a28f638cad7108a2576))
* [[#174193708](https://www.pivotaltracker.com/story/show/174193708),[#174004231](https://www.pivotaltracker.com/story/show/174004231)] Update italia-pagopa-commons from 1.2.0 to 1.3.0 ([#2132](https://github.com/pagopa/io-app/issues/2132)) ([98b0496](https://github.com/pagopa/io-app/commit/98b0496fac3489d6ee5e7ea6edd4a1e236904f60))
* [[#174212731](https://www.pivotaltracker.com/story/show/174212731)] Fixes the top spacing on section cards component [#2139](https://github.com/pagopa/io-app/issues/2139) ([2ef24d7](https://github.com/pagopa/io-app/commit/2ef24d761da99f86db03981b28a66ae47e2ca6a2))
* [[#174212919](https://www.pivotaltracker.com/story/show/174212919)] Show alert when deselecting a favourite method on method detail screen ([#2137](https://github.com/pagopa/io-app/issues/2137)) ([5884615](https://github.com/pagopa/io-app/commit/5884615c5a3e565a2923bf427ea79bf0acf5847e))
* [[#174252923](https://www.pivotaltracker.com/story/show/174252923)] Profile tab becomes untouchable after following specific navigation paths [#2144](https://github.com/pagopa/io-app/issues/2144) ([5aea422](https://github.com/pagopa/io-app/commit/5aea42214775414edc8feccc424450b03c77d016))


### Chores

* [[#174006281](https://www.pivotaltracker.com/story/show/174006281)] automatically append changelog prefix to pr title ([#2133](https://github.com/pagopa/io-app/issues/2133)) ([793e8e4](https://github.com/pagopa/io-app/commit/793e8e4cf7d031a56d60243cc6f6d5a7b93a8a88))
* [[#174161476](https://www.pivotaltracker.com/story/show/174161476)] Create unique fee showing conditions ([#2141](https://github.com/pagopa/io-app/issues/2141)) ([f9aa91e](https://github.com/pagopa/io-app/commit/f9aa91e602a3d1eff6ea29f365f0ff52cba8eb52))
* [[#174208450](https://www.pivotaltracker.com/story/show/174208450)] clean pod file ([#2130](https://github.com/pagopa/io-app/issues/2130)) ([a26b0ec](https://github.com/pagopa/io-app/commit/a26b0ec699593c61b0229ddad9ab4edb58420d31))
* [[#174212106](https://www.pivotaltracker.com/story/show/174212106)] Refactor openUrl ([#2143](https://github.com/pagopa/io-app/issues/2143)) ([bb1a5af](https://github.com/pagopa/io-app/commit/bb1a5af555b440d53b12586cbcd595d041f07460))
* [[#174228888](https://www.pivotaltracker.com/story/show/174228888)] Restore clean installation ([#2138](https://github.com/pagopa/io-app/issues/2138)) ([3dfee5f](https://github.com/pagopa/io-app/commit/3dfee5f069babbb7230b9d4114d3bd71d319f2a0))

## [1.5.0-rc.1](https://github.com/pagopa/io-app/compare/1.4.0-rc.2...1.5.0-rc.1) (2020-08-05)


### Features

* [[#173890674](https://www.pivotaltracker.com/story/show/173890674)] Refactoring props for accessibility events on base header ([#2087](https://github.com/pagopa/io-app/issues/2087)) ([d2f421e](https://github.com/pagopa/io-app/commit/d2f421e0bfc8e1c83b4a0a7931ab68a3d51a600f))
* [[#173984252](https://www.pivotaltracker.com/story/show/173984252)] Improves accessibility on wallet home ([#2104](https://github.com/pagopa/io-app/issues/2104)) ([b9eeb06](https://github.com/pagopa/io-app/commit/b9eeb06588de18132dd94430034b543bc11e5eb5))
* [[#174033394](https://www.pivotaltracker.com/story/show/174033394)] display ente beneficiario data ([#2106](https://github.com/pagopa/io-app/issues/2106)) ([73aeb26](https://github.com/pagopa/io-app/commit/73aeb26e5978898e1480c7bbf9396ad5311d2b2f))
* [[#174089908](https://www.pivotaltracker.com/story/show/174089908)] Improve accessibility bonus description screen ([#2118](https://github.com/pagopa/io-app/issues/2118)) ([b3dcb7b](https://github.com/pagopa/io-app/commit/b3dcb7b54e9255b79760359b01ac0cbd271d52d2))


### Bug Fixes

* [[#173263990](https://www.pivotaltracker.com/story/show/173263990)] Fixes wrong defined faq 8 text ([#2109](https://github.com/pagopa/io-app/issues/2109)) ([3366db5](https://github.com/pagopa/io-app/commit/3366db5db8ef0b39bd63378cf4b43138cff02b92))
* [[#173529079](https://www.pivotaltracker.com/story/show/173529079)] Alert text display cut on calendar perms ([#2110](https://github.com/pagopa/io-app/issues/2110)) ([46fe9c9](https://github.com/pagopa/io-app/commit/46fe9c9085661c0448e662fb3a8fc3d422ae6678))
* [[#174085364](https://www.pivotaltracker.com/story/show/174085364)] messagesStatus store section cleaning ([#2114](https://github.com/pagopa/io-app/issues/2114)) ([fbed0bf](https://github.com/pagopa/io-app/commit/fbed0bfde58ba7ad2a5298f87809086733ff6eff))
* [[#174099632](https://www.pivotaltracker.com/story/show/174099632)] Fix the back handler from transaction detail to cards transactions ([#2120](https://github.com/pagopa/io-app/issues/2120)) ([71895c7](https://github.com/pagopa/io-app/commit/71895c7a6006bd2fbdabb16bfc96b0124cb31836))
* [[#174115403](https://www.pivotaltracker.com/story/show/174115403)] add useCleartextTraffic to true ([#2119](https://github.com/pagopa/io-app/issues/2119)) ([7ceda47](https://github.com/pagopa/io-app/commit/7ceda474c3d0c018baf4891e758d3a58467653e3))
* [[#174119099](https://www.pivotaltracker.com/story/show/174119099)] Display app version ([#2122](https://github.com/pagopa/io-app/issues/2122)) ([4dd9763](https://github.com/pagopa/io-app/commit/4dd97634bcd69a294dff6d397fe3d8ae6211ea24))
* Don't use the arrows if there's no submenu. ([#2117](https://github.com/pagopa/io-app/issues/2117)) ([0ecd486](https://github.com/pagopa/io-app/commit/0ecd4868c65ce631179cfc9ff590b05c26cbbff6))


### Chores

* [[#173888215](https://www.pivotaltracker.com/story/show/173888215)] Upgrade React Native to 0.63.2 ([#2107](https://github.com/pagopa/io-app/issues/2107)) ([8decb5a](https://github.com/pagopa/io-app/commit/8decb5a90e43ffbf9ca09d8bface3ce290a4c7c2))
* [[#173987881](https://www.pivotaltracker.com/story/show/173987881)] Unify app version display ([#2111](https://github.com/pagopa/io-app/issues/2111)) ([9c4c04b](https://github.com/pagopa/io-app/commit/9c4c04b1416aec21f2c3002240546f7fe57ac659))
* [[#174010680](https://www.pivotaltracker.com/story/show/174010680)] Change checked urls with IO-cdn ([#2103](https://github.com/pagopa/io-app/issues/2103)) ([4c3a859](https://github.com/pagopa/io-app/commit/4c3a8599a3f97ef114818b17048bc3fe72458fd3))

## [1.4.0-rc.2](https://github.com/pagopa/io-app/compare/1.4.0-rc.1...1.4.0-rc.2) (2020-07-28)


### Features

* [[#172455914](https://www.pivotaltracker.com/story/show/172455914)] Organize available calendars by account ([#2098](https://github.com/pagopa/io-app/issues/2098)) ([8d5fbe5](https://github.com/pagopa/io-app/commit/8d5fbe52eaf50c292e7ac7bdf8519911a51fea75))
* [[#172519295](https://www.pivotaltracker.com/story/show/172519295)] Adds the check session on application state changes and on pin success insertion ([#1745](https://github.com/pagopa/io-app/issues/1745)) ([5db8cd1](https://github.com/pagopa/io-app/commit/5db8cd13d107f55e8d9ba5e2959445f84207a6e8))
* [[#173848517](https://www.pivotaltracker.com/story/show/173848517)] Parametric label and hint on inputPlaceholder ([#2088](https://github.com/pagopa/io-app/issues/2088)) ([a2b15be](https://github.com/pagopa/io-app/commit/a2b15be3dc6737d3bb3f7cfd9307a393e729103e))
* [[#173984179](https://www.pivotaltracker.com/story/show/173984179)] forces the focus on identification modal ([#2101](https://github.com/pagopa/io-app/issues/2101)) ([5a7f1ee](https://github.com/pagopa/io-app/commit/5a7f1ee36c8cbbde1045a9eb31ee02d1241fd0f5))


### Bug Fixes

* )[[#174005728](https://www.pivotaltracker.com/story/show/174005728),[#174005947](https://www.pivotaltracker.com/story/show/174005947)] All psp are filtered  ([#2099](https://github.com/pagopa/io-app/issues/2099)) ([8c6bca0](https://github.com/pagopa/io-app/commit/8c6bca0a436c66ae95a10748cfd41e4ea05c17df))
* [[#173984610](https://www.pivotaltracker.com/story/show/173984610)] Android alpha build is created at each master commit ([#2097](https://github.com/pagopa/io-app/issues/2097)) ([ae0a28d](https://github.com/pagopa/io-app/commit/ae0a28d1ee07ff53210548f9ef8e5ffa755f7972))
* disable fastlane tag creation ([#2095](https://github.com/pagopa/io-app/issues/2095)) ([06f4fc7](https://github.com/pagopa/io-app/commit/06f4fc7492d396bc77ea072c9cf2edcc944757be))


### Chores

* [[#173984555](https://www.pivotaltracker.com/story/show/173984555)] Change Android gradle versionName format ([#2096](https://github.com/pagopa/io-app/issues/2096)) ([a7d56ca](https://github.com/pagopa/io-app/commit/a7d56ca362838bf8f3f04cab2521fa6d1655958e))
* [[#173998756](https://www.pivotaltracker.com/story/show/173998756)] Fixes font-size on Markdown component ([#2100](https://github.com/pagopa/io-app/issues/2100)) ([78f571d](https://github.com/pagopa/io-app/commit/78f571d1d75c1972aa2df2b5d2ef5f243d667b6b))
* [[#174024289](https://www.pivotaltracker.com/story/show/174024289)] Disable e2e tests manual trigger for "build" workflow [#2105](https://github.com/pagopa/io-app/issues/2105) ([43c6de3](https://github.com/pagopa/io-app/commit/43c6de3173219e968e4d8e04b68196ec6fbee309))

## 1.4.0-rc.1 (2020-07-24)


### Features

* )Update index.yml ([#2002](https://github.com/pagopa/io-app/issues/2002)) ([10ab20f](https://github.com/pagopa/io-app/commit/10ab20fd476a0def5f4f3e547cf61fef4d5d308e))
* [[[#173640797](https://www.pivotaltracker.com/story/show/173640797)] Display alert for tablet ([#2007](https://github.com/pagopa/io-app/issues/2007)) ([2f61405](https://github.com/pagopa/io-app/commit/2f614051bc92d615ae5341a0f9dffacecba0b7a1))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([6504f53](https://github.com/pagopa/io-app/commit/6504f5306465751e0ce5febeb444af6a14bf4962))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([7bdfda6](https://github.com/pagopa/io-app/commit/7bdfda6b6f6f4bdb85f6d6e3f54678b0990542a6))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([f131243](https://github.com/pagopa/io-app/commit/f131243d18391282c7345ba9ce6bbb1dd7cd2be6))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([add6945](https://github.com/pagopa/io-app/commit/add6945e08399aa5c628034c8ad9a790947acd10))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([332da39](https://github.com/pagopa/io-app/commit/332da392a9c8bc752c3379c5dcb71b491ce2c4a8))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([762f66d](https://github.com/pagopa/io-app/commit/762f66da5ef3f6936e155eb9abb879e7af4937f6))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([e8b7de3](https://github.com/pagopa/io-app/commit/e8b7de34efe02e741cd0f7ac7e9ade16d4bde5d8))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([19cbc4a](https://github.com/pagopa/io-app/commit/19cbc4a25191b1735a635178e1d74db52f0213fb))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([58f7566](https://github.com/pagopa/io-app/commit/58f7566481180a3374c06829775f988d6d36c8e1))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([f470f2c](https://github.com/pagopa/io-app/commit/f470f2cd969ed74b8cf19154068b189f980391ba))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([eb5542e](https://github.com/pagopa/io-app/commit/eb5542e23cd362546cf829b57a5d5bd680177123))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([958a293](https://github.com/pagopa/io-app/commit/958a293a2f97129c26984261328b2049fd3680f0))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1982](https://github.com/pagopa/io-app/issues/1982)) ([b3fe3b8](https://github.com/pagopa/io-app/commit/b3fe3b8e858e178b72c88118d8f9fc207d9b23e8))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq ([#1995](https://github.com/pagopa/io-app/issues/1995)) ([b44f1d5](https://github.com/pagopa/io-app/commit/b44f1d5fee56098db6630dc1097d917325504909))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] Traduzione faq (2) [#1976](https://github.com/pagopa/io-app/issues/1976) ([f5b6c42](https://github.com/pagopa/io-app/commit/f5b6c425d9eefa5a634c800eff305a1a38df89dd))
* [[#172149906](https://www.pivotaltracker.com/story/show/172149906)] traduzione faq [#1975](https://github.com/pagopa/io-app/issues/1975) ([83d8591](https://github.com/pagopa/io-app/commit/83d85916e8c65c17ac853de5dc6f424ec12fde93))
* [[#172371262](https://www.pivotaltracker.com/story/show/172371262)] Add tests for identification reducers ([#1809](https://github.com/pagopa/io-app/issues/1809)) ([0af1ddb](https://github.com/pagopa/io-app/commit/0af1ddb3d6d96de87ffb186471058e29be4ec0c9))
* [[#172429524](https://www.pivotaltracker.com/story/show/172429524)] Show modal if rooted / jailbroken ([#1961](https://github.com/pagopa/io-app/issues/1961)) ([fa235ab](https://github.com/pagopa/io-app/commit/fa235ab2725126172464b631e79cc2d3e64dc8fd))
* [[#172526356](https://www.pivotaltracker.com/story/show/172526356)] Adds Screen to explain why CIE login is not available ([#1769](https://github.com/pagopa/io-app/issues/1769)) ([5bc9437](https://github.com/pagopa/io-app/commit/5bc9437ad2c5eeaa6019f01eec179807a534b618))
* [[#172800619](https://www.pivotaltracker.com/story/show/172800619)] unify styles of slided screens ([#1800](https://github.com/pagopa/io-app/issues/1800)) ([e401284](https://github.com/pagopa/io-app/commit/e4012841b97b17798ca928b6308e308f503cefdc))
* [[#172889149](https://www.pivotaltracker.com/story/show/172889149)] Automatic changelog and versioning generation ([#1838](https://github.com/pagopa/io-app/issues/1838)) ([e39eb31](https://github.com/pagopa/io-app/commit/e39eb31155e09afd5142538559cb5e09310b0fc9))
* [[#172962750](https://www.pivotaltracker.com/story/show/172962750)] Create feature flag for "bonus vacanze" & stub for folder hierarchy ([#1839](https://github.com/pagopa/io-app/issues/1839)) ([9b2a7e5](https://github.com/pagopa/io-app/commit/9b2a7e59d2b0a14c6c875652a1e0c05465371812))
* [[#172975727](https://www.pivotaltracker.com/story/show/172975727)] Adds the bonus information screen ([#1850](https://github.com/pagopa/io-app/issues/1850)) ([4ca3b57](https://github.com/pagopa/io-app/commit/4ca3b5721c71d7d8f4582385390d96a8e5fa7850))
* [[#172975907](https://www.pivotaltracker.com/story/show/172975907)] Adds a button to request a new bonus on the wallet home and displays the active bonus ([#1840](https://github.com/pagopa/io-app/issues/1840)) ([a18464a](https://github.com/pagopa/io-app/commit/a18464a7cdd54dc05991a31e2c5996bca5f71e8a))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] Add bonus-vacanze API support ([#1843](https://github.com/pagopa/io-app/issues/1843)) ([6cfb956](https://github.com/pagopa/io-app/commit/6cfb956596348991100493809ebc3fed38f2b329))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] Add get bonus from id API ([#1857](https://github.com/pagopa/io-app/issues/1857)) ([da0d8ac](https://github.com/pagopa/io-app/commit/da0d8accf82ac313d8b2180752c2521aeaaca4dc))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] Add qr_code type as array of items ([#1859](https://github.com/pagopa/io-app/issues/1859)) ([e551728](https://github.com/pagopa/io-app/commit/e551728c069041ac7275fdf8da092932f6b9225a))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] Add startBonusActivationProcedure ([#1885](https://github.com/pagopa/io-app/issues/1885)) ([218e5cb](https://github.com/pagopa/io-app/commit/218e5cbef791e15d028e16a27c2bc5f9dd7d087b))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] Align bonus data types with the last ones ([#1890](https://github.com/pagopa/io-app/issues/1890)) ([9075a92](https://github.com/pagopa/io-app/commit/9075a926101cf2902ac0fa318fa2a70d1eb340e8))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] Align bonus data types with the official ones ([#1882](https://github.com/pagopa/io-app/issues/1882)) ([92a0a0e](https://github.com/pagopa/io-app/commit/92a0a0eee93d4f64e36faf81e29b5ec41b141d1c))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] Handle blocking errors on check eligibility ([#1884](https://github.com/pagopa/io-app/issues/1884)) ([a45fd7c](https://github.com/pagopa/io-app/commit/a45fd7cbe52828fefdfeb6fcf529163e687aa2c3))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] Handling load all active bonus list and store refactor ([#1921](https://github.com/pagopa/io-app/issues/1921)) ([db004dd](https://github.com/pagopa/io-app/commit/db004dd94b0b90eefd457db89fe739f6848734b5))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] Improve eligibility check ([#1920](https://github.com/pagopa/io-app/issues/1920)) ([02314ea](https://github.com/pagopa/io-app/commit/02314ea9e347eb6b7961603d28e642bb041095d8))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] rename store section bonusVacanze -> bonusVacanzeActivation ([#1860](https://github.com/pagopa/io-app/issues/1860)) ([49e7e38](https://github.com/pagopa/io-app/commit/49e7e3898aebdd5a5b4d27bb210e230e37cde849))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] Sync bonus vacanze with last API specs ([#1903](https://github.com/pagopa/io-app/issues/1903)) ([437c85c](https://github.com/pagopa/io-app/commit/437c85c4a06ef42ef85b551b880bcdf7240d794b))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] sync with eligibility API POST/GET ([#1855](https://github.com/pagopa/io-app/issues/1855)) ([772e6cb](https://github.com/pagopa/io-app/commit/772e6cb9c43044cb8857a8435d367bdfa8c8d2a2))
* [[#172989345](https://www.pivotaltracker.com/story/show/172989345)] update status codes with last specs ([#1887](https://github.com/pagopa/io-app/issues/1887)) ([c324bf3](https://github.com/pagopa/io-app/commit/c324bf3dfbc058cf3e337fb529065136a8a44249))
* [[#172989379](https://www.pivotaltracker.com/story/show/172989379)] ISEE not eligible screen ([#1846](https://github.com/pagopa/io-app/issues/1846)) ([9cfc0ef](https://github.com/pagopa/io-app/commit/9cfc0ef832cd2911325d809f967c2477a3285ac2))
* [[#172989450](https://www.pivotaltracker.com/story/show/172989450)] Completes information in ActiveBonus component ([#1842](https://github.com/pagopa/io-app/issues/1842)) ([e0f5a39](https://github.com/pagopa/io-app/commit/e0f5a398e851b3cd4edb03b10fa3e00d55849191))
* [[#172989461](https://www.pivotaltracker.com/story/show/172989461)] Active bonus detail screen ([#1862](https://github.com/pagopa/io-app/issues/1862)) ([11b7f2f](https://github.com/pagopa/io-app/commit/11b7f2fa91b144162a2da0dd79a6e421141c25f1))
* [[#172992621](https://www.pivotaltracker.com/story/show/172992621)] Adds the available list screen and load the available bonuses ([#1848](https://github.com/pagopa/io-app/issues/1848)) ([2d085ba](https://github.com/pagopa/io-app/commit/2d085babd1b7353dba0b6f4925008ed9425e7757))
* [[#172992641](https://www.pivotaltracker.com/story/show/172992641)] Check bonus eligibility ([#1841](https://github.com/pagopa/io-app/issues/1841)) ([a4b4a5b](https://github.com/pagopa/io-app/commit/a4b4a5be9e6f3919e9ce6a1292fffafcaf920b10))
* [[#172992652](https://www.pivotaltracker.com/story/show/172992652)] Activate bonus screen ([#1853](https://github.com/pagopa/io-app/issues/1853)) ([c0de9e8](https://github.com/pagopa/io-app/commit/c0de9e81eb7e850e3b85f1cc9fad31f4ee8cc172))
* [[#172992680](https://www.pivotaltracker.com/story/show/172992680)] Adds Bonus Tos Screen ([#1856](https://github.com/pagopa/io-app/issues/1856)) ([df2dab7](https://github.com/pagopa/io-app/commit/df2dab7c6501ec5e91ca2e32f693b6fcc0cc0add))
* [[#173011036](https://www.pivotaltracker.com/story/show/173011036)] Dispatch bonusvacanze action to mixpanel ([#1947](https://github.com/pagopa/io-app/issues/1947)) ([7d87b31](https://github.com/pagopa/io-app/commit/7d87b31aa00c0b36e1a883489025ce7d0ae8e4d2))
* [[#173031294](https://www.pivotaltracker.com/story/show/173031294)] add euro symbol on total amount ([#1851](https://github.com/pagopa/io-app/issues/1851)) ([6d9a0aa](https://github.com/pagopa/io-app/commit/6d9a0aa489f0b86810974df5cda9f3f20ddd0407))
* [[#173054348](https://www.pivotaltracker.com/story/show/173054348)] Verify bonus eligibility workflow ([#1861](https://github.com/pagopa/io-app/issues/1861)) ([202eefc](https://github.com/pagopa/io-app/commit/202eefce6174b6dd3be569b12f7abf19eece0337))
* [[#173063353](https://www.pivotaltracker.com/story/show/173063353)] Share the Bonus QR Code - Secret code ([#1863](https://github.com/pagopa/io-app/issues/1863)) ([951fbdf](https://github.com/pagopa/io-app/commit/951fbdfe11cdf3a346224837e246ad89f912b540))
* [[#173077316](https://www.pivotaltracker.com/story/show/173077316)] Timeout eligibility screen ([#1864](https://github.com/pagopa/io-app/issues/1864)) ([77f8efa](https://github.com/pagopa/io-app/commit/77f8efa1375575283cd10707d1ef8f3995140eb8))
* [[#173083143](https://www.pivotaltracker.com/story/show/173083143)] improve app accessibility ([#1998](https://github.com/pagopa/io-app/issues/1998)) ([69a7d7c](https://github.com/pagopa/io-app/commit/69a7d7c41cceec5a11dcf6cfc54798f6b0768ef3))
* [[#173102211](https://www.pivotaltracker.com/story/show/173102211)] Adds the navigation flow through request bonus and checks if can be performed a new request ([#1867](https://github.com/pagopa/io-app/issues/1867)) ([d5c8008](https://github.com/pagopa/io-app/commit/d5c8008145cfaa55c297c6e9c2711a4800ad5e56))
* [[#173102267](https://www.pivotaltracker.com/story/show/173102267)] Add a selector to know if a bonus vacanze is requestable ([#1866](https://github.com/pagopa/io-app/issues/1866)) ([85eacb8](https://github.com/pagopa/io-app/commit/85eacb8ee010fa721ff7eb09c7048c488d4f8496))
* [[#173102302](https://www.pivotaltracker.com/story/show/173102302)] Load activate bonus ([#1865](https://github.com/pagopa/io-app/issues/1865)) ([06deaf5](https://github.com/pagopa/io-app/commit/06deaf5b085613c052e1ae0d34683448d6b04628))
* [[#173102366](https://www.pivotaltracker.com/story/show/173102366)] Timeout activation screen ([#1881](https://github.com/pagopa/io-app/issues/1881)) ([2021c4e](https://github.com/pagopa/io-app/commit/2021c4e638c33bf2cd5d22e01a95bd043fd42560))
* [[#173102430](https://www.pivotaltracker.com/story/show/173102430)] Bonus activation confirmation ([#1868](https://github.com/pagopa/io-app/issues/1868)) ([3b21038](https://github.com/pagopa/io-app/commit/3b21038b629e9f824e69c3bc287dd58af583fee0))
* [[#173103563](https://www.pivotaltracker.com/story/show/173103563)] Move all bonus routes under bonusVacanze directory and remove bottom bar from all bonus routes ([#1871](https://github.com/pagopa/io-app/issues/1871)) ([13ab58d](https://github.com/pagopa/io-app/commit/13ab58db8c9763bf488c90f1f6deb9827f463dda))
* [[#173146727](https://www.pivotaltracker.com/story/show/173146727),[#172555084](https://www.pivotaltracker.com/story/show/172555084)] Update contextual help for spid login ([#1889](https://github.com/pagopa/io-app/issues/1889)) ([1446973](https://github.com/pagopa/io-app/commit/1446973a89a39151791d04b4af2d13295f25338c))
* [#173146850] Adds the new subsidy method on list ([#1875](https://github.com/pagopa/io-app/issues/1875)) ([e22ae26](https://github.com/pagopa/io-app/commit/e22ae2626c434a28cc1e6344ceddb80e4bac8368))
* [[#173146876](https://www.pivotaltracker.com/story/show/173146876)] Bonus list UI alignment ([#1877](https://github.com/pagopa/io-app/issues/1877)) ([1107ba1](https://github.com/pagopa/io-app/commit/1107ba1b4d7efa5517539652ac6884d6b2de98bc))
* [[#173146890](https://www.pivotaltracker.com/story/show/173146890)] Align bonus available type with the remote data ([#1869](https://github.com/pagopa/io-app/issues/1869)) ([6d8f969](https://github.com/pagopa/io-app/commit/6d8f969f3b10baa67cea6ec6f19d30dea3f86875))
* [[#173147132](https://www.pivotaltracker.com/story/show/173147132)] Send chunked log to instabug ([#1870](https://github.com/pagopa/io-app/issues/1870)) ([be27ebb](https://github.com/pagopa/io-app/commit/be27ebbf8e1f0e5c34bd94d4f9e50984b665d3ec))
* [#173147555] UI refinement of bonus information screen ([#1883](https://github.com/pagopa/io-app/issues/1883)) ([161be46](https://github.com/pagopa/io-app/commit/161be46154f23e5c740e81c1c5ef59399d94737b))
* [[#173148005](https://www.pivotaltracker.com/story/show/173148005)] Timeout bonus eligibility Screen refinement ([#1872](https://github.com/pagopa/io-app/issues/1872)) ([5a938fa](https://github.com/pagopa/io-app/commit/5a938fa514da56fc3a0b7e33b694d1d12d7a0e29))
* [[#173148021](https://www.pivotaltracker.com/story/show/173148021)] ISEE not eligible refinement ([#1873](https://github.com/pagopa/io-app/issues/1873)) ([a44841c](https://github.com/pagopa/io-app/commit/a44841c72bbea3e48a230aa8325c5c44ae045c6e))
* [[#173148536](https://www.pivotaltracker.com/story/show/173148536)] Load IDPS info texts ([#1874](https://github.com/pagopa/io-app/issues/1874)) ([dc391ca](https://github.com/pagopa/io-app/commit/dc391ca142940eaffd639b55aa456ef0cc667be1))
* [[#173155338](https://www.pivotaltracker.com/story/show/173155338)] Handle Bonus Activation pending ([#1909](https://github.com/pagopa/io-app/issues/1909)) ([005293f](https://github.com/pagopa/io-app/commit/005293f78398e8e746918c03bde47b6ebdf69dbe))
* [[#173155362](https://www.pivotaltracker.com/story/show/173155362)] Handle 403 status on bonus eligibility start ([#1905](https://github.com/pagopa/io-app/issues/1905)) ([e5cbfb5](https://github.com/pagopa/io-app/commit/e5cbfb531c10c4f63bdd8d801f9b2d2e5b5ad168))
* [[#173156682](https://www.pivotaltracker.com/story/show/173156682)] Graphical refinement for LoadBonusEligibilityScreen, IseeNotAvailableScreen, LoadActivateBonusScreen and ActivateBonusCompletedScreen ([#1876](https://github.com/pagopa/io-app/issues/1876)) ([7595167](https://github.com/pagopa/io-app/commit/75951676265eedb3ff4ce38a15e8c1b7548cc296))
* [[#173157535](https://www.pivotaltracker.com/story/show/173157535)] Activate bonus request rework ([#1892](https://github.com/pagopa/io-app/issues/1892)) ([27158ad](https://github.com/pagopa/io-app/commit/27158add86887456d36af5996cebd206585cb1ab))
* [[#173168958](https://www.pivotaltracker.com/story/show/173168958)] UI refinement of bonus request component ([#1897](https://github.com/pagopa/io-app/issues/1897)) ([46e7225](https://github.com/pagopa/io-app/commit/46e72256839e4dbe4b3a810ef701a59edf11fe65))
* [[#173171577](https://www.pivotaltracker.com/story/show/173171577)] Extract front-matter CTA data from message content ([#1936](https://github.com/pagopa/io-app/issues/1936)) ([b9ba859](https://github.com/pagopa/io-app/commit/b9ba859200159464629aca905bf58f14d625e105))
* [[#173172424](https://www.pivotaltracker.com/story/show/173172424),[#173418452](https://www.pivotaltracker.com/story/show/173418452)] Add info banner assistance working hours ([#1925](https://github.com/pagopa/io-app/issues/1925)) ([ca58948](https://github.com/pagopa/io-app/commit/ca58948ff9411b572e9a3d5e78651e2d0f33c98b))
* [[#173176386](https://www.pivotaltracker.com/story/show/173176386)] Rework eligibility workflow ([#1888](https://github.com/pagopa/io-app/issues/1888)) ([9c4ea3b](https://github.com/pagopa/io-app/commit/9c4ea3b19551b4acfbade6981671535520a225db))
* [[#173176837](https://www.pivotaltracker.com/story/show/173176837)] Adds status badge on bonus detail screen ([#1880](https://github.com/pagopa/io-app/issues/1880)) ([b4f8ebf](https://github.com/pagopa/io-app/commit/b4f8ebfb93d3e497295a4dc55e3cabff04a85b87))
* [#173223774] Adds the service detail request on AvailableBonusItem and BonusInformationScreen ([#1886](https://github.com/pagopa/io-app/issues/1886)) ([bf93edd](https://github.com/pagopa/io-app/commit/bf93edd536ac0cacd7a73f50b920953c676e0a4f))
* [[#173225656](https://www.pivotaltracker.com/story/show/173225656)] Force bonus vacanze service activation ([#1949](https://github.com/pagopa/io-app/issues/1949)) ([922087b](https://github.com/pagopa/io-app/commit/922087b5a42a06d3787873bf166ba103346376f6))
* [[#173262868](https://www.pivotaltracker.com/story/show/173262868)] Bonus detail screen ui refinement ([#1894](https://github.com/pagopa/io-app/issues/1894)) ([31fbf95](https://github.com/pagopa/io-app/commit/31fbf95a8e2114c73dc9dce9f22fc234cc0b8217))
* [[#173269238](https://www.pivotaltracker.com/story/show/173269238)] Remove Bonus Available mocked type definition ([#1896](https://github.com/pagopa/io-app/issues/1896)) ([91edba7](https://github.com/pagopa/io-app/commit/91edba7abb2260a03fe145b3babac4047e67d7ad))
* [[#173269329](https://www.pivotaltracker.com/story/show/173269329)] Removes subsidy payment method from list ([#1895](https://github.com/pagopa/io-app/issues/1895)) ([26fb73d](https://github.com/pagopa/io-app/commit/26fb73d324d551958b3c71d48e31295949b81d0f))
* [[#173284197](https://www.pivotaltracker.com/story/show/173284197)] Minor refactoring and improvements on bonus information screen ([#1899](https://github.com/pagopa/io-app/issues/1899)) ([16c72bc](https://github.com/pagopa/io-app/commit/16c72bc803ed4c04b2d0b8f8535441df40ecff6d))
* [[#173286445](https://www.pivotaltracker.com/story/show/173286445)] Adds a polling on bonus detail screen ([#1906](https://github.com/pagopa/io-app/issues/1906)) ([12f5f19](https://github.com/pagopa/io-app/commit/12f5f195365509872c008ef273ab754b85bbd981))
* [[#173286639](https://www.pivotaltracker.com/story/show/173286639)] Replace identification with confirm alert before bonus activation ([#1915](https://github.com/pagopa/io-app/issues/1915)) ([07ec64a](https://github.com/pagopa/io-app/commit/07ec64a198c20f20a51c5c7405cbe1c074670d38))
* [[#173288541](https://www.pivotaltracker.com/story/show/173288541)] integrate dynamic contextual help ([#1898](https://github.com/pagopa/io-app/issues/1898)) ([353ed6e](https://github.com/pagopa/io-app/commit/353ed6e60bc305246aa78b28c774bcd7c03d1cb2))
* [[#173291953](https://www.pivotaltracker.com/story/show/173291953)] BonusCardComponent as preview for Wallet and full for detail screen ([#1913](https://github.com/pagopa/io-app/issues/1913)) ([a30b904](https://github.com/pagopa/io-app/commit/a30b9047e3a6834865352204b65bc96563bd08f4))
* [[#173292076](https://www.pivotaltracker.com/story/show/173292076)] Activate bonus workflow ([#1907](https://github.com/pagopa/io-app/issues/1907)) ([fbf2155](https://github.com/pagopa/io-app/commit/fbf21552b11f2d6bcee830d959c5562b6010fb2a))
* [[#173331568](https://www.pivotaltracker.com/story/show/173331568)] Animates the opacity of bonus modal ([#1918](https://github.com/pagopa/io-app/issues/1918)) ([3637c50](https://github.com/pagopa/io-app/commit/3637c50319b07654c3c195d83d6e545a198fb4e3))
* [[#173332572](https://www.pivotaltracker.com/story/show/173332572)] Add fallback data when available bonuses loading fails ([#1904](https://github.com/pagopa/io-app/issues/1904)) ([038f39f](https://github.com/pagopa/io-app/commit/038f39f8604e8170453651d53936dd45e74159a3))
* [[#173353035](https://www.pivotaltracker.com/story/show/173353035)] UI corrections to wallet header screen ([#1924](https://github.com/pagopa/io-app/issues/1924)) ([30885c7](https://github.com/pagopa/io-app/commit/30885c72416d92fcd0aeee84f11d25aa2165d43f))
* [[#173354898](https://www.pivotaltracker.com/story/show/173354898)] Graphical review ([#1910](https://github.com/pagopa/io-app/issues/1910)) ([358fb39](https://github.com/pagopa/io-app/commit/358fb3912fb2e50196e2c09fda8f3d6f2b6219ed))
* [[#173361687](https://www.pivotaltracker.com/story/show/173361687)] Update Bonus Available  ([#1911](https://github.com/pagopa/io-app/issues/1911)) ([9707a1d](https://github.com/pagopa/io-app/commit/9707a1d038f849118bad2ab9590b5762228f33c9))
* [[#173362906](https://www.pivotaltracker.com/story/show/173362906)] Add Iphone X Safearea for eligibility and activation screens ([#1912](https://github.com/pagopa/io-app/issues/1912)) ([6c7f7a8](https://github.com/pagopa/io-app/commit/6c7f7a8c16f9d980dbd6c0a7de39fb0d01239414))
* [[#173363018](https://www.pivotaltracker.com/story/show/173363018)] ActivateBonusRequestScreen graphical review ([#1922](https://github.com/pagopa/io-app/issues/1922)) ([f157673](https://github.com/pagopa/io-app/commit/f15767322c99603d54b2d25c419105a5e552d576))
* [[#173378012](https://www.pivotaltracker.com/story/show/173378012)] Corrects the error cases on bonus detail screen ([#1916](https://github.com/pagopa/io-app/issues/1916)) ([a2caa50](https://github.com/pagopa/io-app/commit/a2caa503c03fcd03885170ea2e9dbbbad25c1b97))
* [[#173414551](https://www.pivotaltracker.com/story/show/173414551)] Navigate to BonusDetails after activation success ([#1923](https://github.com/pagopa/io-app/issues/1923)) ([a66260c](https://github.com/pagopa/io-app/commit/a66260cb895be10304d63d433ce107a4e76f5093))
* [[#173417354](https://www.pivotaltracker.com/story/show/173417354)] Show all the active bonuses for the user ([#1926](https://github.com/pagopa/io-app/issues/1926)) ([00aba3a](https://github.com/pagopa/io-app/commit/00aba3a3c1f47efc3abab026082572459320edfa))
* [[#173419232](https://www.pivotaltracker.com/story/show/173419232)] Copy the spaced bonus code ([#1927](https://github.com/pagopa/io-app/issues/1927)) ([4100184](https://github.com/pagopa/io-app/commit/41001841b08448f0e294f08013bb6c5b6712af3e))
* [[#173419830](https://www.pivotaltracker.com/story/show/173419830)] Add the safe area on missing components ([#1928](https://github.com/pagopa/io-app/issues/1928)) ([00a9478](https://github.com/pagopa/io-app/commit/00a9478a0b02a98fc0aa3d3b40646dc696fb3bb7))
* [[#173435275](https://www.pivotaltracker.com/story/show/173435275)] Update available bonus type with new spec ([#1938](https://github.com/pagopa/io-app/issues/1938)) ([fcb2206](https://github.com/pagopa/io-app/commit/fcb2206e0c54dec0e005a091744f58b83eada5e0))
* [[#173443307](https://www.pivotaltracker.com/story/show/173443307)] Show different texts base on bonus status ([#1932](https://github.com/pagopa/io-app/issues/1932)) ([45a9613](https://github.com/pagopa/io-app/commit/45a9613664d4e292a621a40abc79a14bc686a922))
* [[#173465266](https://www.pivotaltracker.com/story/show/173465266)] Graphical update for Eligibility and Activation Screens ([#1940](https://github.com/pagopa/io-app/issues/1940)) ([c9ad0e2](https://github.com/pagopa/io-app/commit/c9ad0e22555a4b13145823a21c6fa6eeea5d2181))
* [[#173471484](https://www.pivotaltracker.com/story/show/173471484)] move confirm button on right (android) ([#1948](https://github.com/pagopa/io-app/issues/1948)) ([dfeccde](https://github.com/pagopa/io-app/commit/dfeccde6a3f4090a0bd697336bc3a7a0c2ea4ec6))
* [[#173485468](https://www.pivotaltracker.com/story/show/173485468)] Rooted device modal information ([#1954](https://github.com/pagopa/io-app/issues/1954)) ([a085c43](https://github.com/pagopa/io-app/commit/a085c439d9646bb129a2886213df820e46f0f2a1))
* [[#173487253](https://www.pivotaltracker.com/story/show/173487253)] update cta caption for bonusalreadyexists screen ([#1953](https://github.com/pagopa/io-app/issues/1953)) ([1d54484](https://github.com/pagopa/io-app/commit/1d54484ab86bb3ee89a48233bfce59015e5e0b7a))
* [[#173487409](https://www.pivotaltracker.com/story/show/173487409),[#173495303](https://www.pivotaltracker.com/story/show/173495303),[#173487589](https://www.pivotaltracker.com/story/show/173487589),[#173487449](https://www.pivotaltracker.com/story/show/173487449)] UI refinement on BonusCardComponent and ActiveBonusScreen ([#1955](https://github.com/pagopa/io-app/issues/1955)) ([6c37dbb](https://github.com/pagopa/io-app/commit/6c37dbb7d4814ffc7199b8310c669ad110173046))
* [[#173490102](https://www.pivotaltracker.com/story/show/173490102)] remove confirm activation and update warning text when isee have discrepancies ([#1952](https://github.com/pagopa/io-app/issues/1952)) ([eda62de](https://github.com/pagopa/io-app/commit/eda62de26cb9912799dd4a281d259967a080c20a))
* [[#173490486](https://www.pivotaltracker.com/story/show/173490486)] Add bonus vacanze routes  ([#1951](https://github.com/pagopa/io-app/issues/1951)) ([18e5e9e](https://github.com/pagopa/io-app/commit/18e5e9eb4163aecdf055f7c560eb3119582c9260))
* [[#173507446](https://www.pivotaltracker.com/story/show/173507446)] Adds FAQ and Contextual help on bonus flow and screens ([#1960](https://github.com/pagopa/io-app/issues/1960)) ([dedb9ea](https://github.com/pagopa/io-app/commit/dedb9eac704366597ac0ad4175115a3f2fc8268b))
* [[#173517663](https://www.pivotaltracker.com/story/show/173517663)] changes the bonusavacanze events dispatched to mixpanel for troubleshooting ([#1963](https://github.com/pagopa/io-app/issues/1963)) ([50d77c2](https://github.com/pagopa/io-app/commit/50d77c24838f3af015363a7875106cfda95149ae))
* [[#173521040](https://www.pivotaltracker.com/story/show/173521040)] Update elgibility expired screen & eligibility / activation navigation rework ([#1994](https://github.com/pagopa/io-app/issues/1994)) ([0a2b3aa](https://github.com/pagopa/io-app/commit/0a2b3aaabbe1909bae7cb9fe0505c768a8ee998f))
* [[#173521040](https://www.pivotaltracker.com/story/show/173521040)] Update eligibility expired screen ([#1964](https://github.com/pagopa/io-app/issues/1964)) ([27c004f](https://github.com/pagopa/io-app/commit/27c004fe88b10edce62fecf6f4d89a54e4f7d135))
* [[#173580598](https://www.pivotaltracker.com/story/show/173580598)] update ISEE not found screen ([#1973](https://github.com/pagopa/io-app/issues/1973)) ([7dcadfe](https://github.com/pagopa/io-app/commit/7dcadfe169f5e876f354e9b4636d60c3a9791a40))
* [[#173580912](https://www.pivotaltracker.com/story/show/173580912)] Fixes some texts for bonus information screen ([#1983](https://github.com/pagopa/io-app/issues/1983)) ([f6b3e20](https://github.com/pagopa/io-app/commit/f6b3e2002c0e3d0763c47f976740ac1b82237de4))
* [[#173580954](https://www.pivotaltracker.com/story/show/173580954)] Adds shadow on android phone for cards ([#1993](https://github.com/pagopa/io-app/issues/1993)) ([5de7819](https://github.com/pagopa/io-app/commit/5de781916a974873d33a3ce71e47641b892a7294))
* [[#173591297](https://www.pivotaltracker.com/story/show/173591297)] Enable accept tos CTA on content full scroll ([#2000](https://github.com/pagopa/io-app/issues/2000)) ([3b73cd0](https://github.com/pagopa/io-app/commit/3b73cd0a6296cdf664d94cc05218e6a6e5ed6c54))
* [[#173602010](https://www.pivotaltracker.com/story/show/173602010)] Reload bonus vacanze on payment section focus ([#1996](https://github.com/pagopa/io-app/issues/1996)) ([9519ff8](https://github.com/pagopa/io-app/commit/9519ff8d9eba92e12461752de530c854ae1afcb9))
* [[#173621908](https://www.pivotaltracker.com/story/show/173621908)] Screenshot available only for whitelisted screens ([#2003](https://github.com/pagopa/io-app/issues/2003)) ([39b9eb4](https://github.com/pagopa/io-app/commit/39b9eb4d066edd938ed482ca04ff8d86e0c1f993))
* [[#173640667](https://www.pivotaltracker.com/story/show/173640667)] remove tabled block from Android ([#2005](https://github.com/pagopa/io-app/issues/2005)) ([378349c](https://github.com/pagopa/io-app/commit/378349cd1620b012d9540b9abc14d9d091dcb801))
* [[#173651699](https://www.pivotaltracker.com/story/show/173651699)] add Wallet Home and Transaction Details to allowed snapshottable screens ([#2014](https://github.com/pagopa/io-app/issues/2014)) ([a3183bf](https://github.com/pagopa/io-app/commit/a3183bfb2246f76052d39c6a43c751194e47c866))
* [[#173690037](https://www.pivotaltracker.com/story/show/173690037)] Fix IDP name ([#2019](https://github.com/pagopa/io-app/issues/2019)) ([1cc3787](https://github.com/pagopa/io-app/commit/1cc378710b4be11bc2cf76d8a261cc408310d3a4))
* [[#173701927](https://www.pivotaltracker.com/story/show/173701927)] Improve accessibility for top bar ([#2020](https://github.com/pagopa/io-app/issues/2020)) ([a208dd5](https://github.com/pagopa/io-app/commit/a208dd5fa0cc234b430fd2127b39bcdf898794be))
* [[#173707010](https://www.pivotaltracker.com/story/show/173707010)] fix screen reader text for bottom bar navigation elements ([#2021](https://github.com/pagopa/io-app/issues/2021)) ([338a19b](https://github.com/pagopa/io-app/commit/338a19b4ad4fd953e85c38042491ca5af2a8a39a))
* [[#173712388](https://www.pivotaltracker.com/story/show/173712388)] Add Codice Avviso in place of IUV ([#2024](https://github.com/pagopa/io-app/issues/2024)) ([6f11534](https://github.com/pagopa/io-app/commit/6f11534e1a6090a1cee4167102fe3beb91235e1b))
* [[#173733388](https://www.pivotaltracker.com/story/show/173733388)] update copy about household composition ([#2028](https://github.com/pagopa/io-app/issues/2028)) ([2993d94](https://github.com/pagopa/io-app/commit/2993d9449db3570361079df594f20c5b574909dc))
* [[#173734154](https://www.pivotaltracker.com/story/show/173734154)] Dispatch accessibility attributes to mixpanel ([#2050](https://github.com/pagopa/io-app/issues/2050)) ([dbc1ebf](https://github.com/pagopa/io-app/commit/dbc1ebf0d5f9f2d6a9b6d8c6e1c661b542c21241))
* [[#173767813](https://www.pivotaltracker.com/story/show/173767813)] Center navigation header title ([#2081](https://github.com/pagopa/io-app/issues/2081)) ([85a62e6](https://github.com/pagopa/io-app/commit/85a62e698625374e616bde1a36bf449ee4db1f83))
* [[#173767853](https://www.pivotaltracker.com/story/show/173767853)] Add underage Infoscreen ([#2051](https://github.com/pagopa/io-app/issues/2051)) ([fa6dbea](https://github.com/pagopa/io-app/commit/fa6dbea3e75fb85fe5f08b8c73a8f21dbe938f65))
* [[#173773392](https://www.pivotaltracker.com/story/show/173773392)] Improve PIN creation and confirmation accessibility ([#2042](https://github.com/pagopa/io-app/issues/2042)) ([210a5d5](https://github.com/pagopa/io-app/commit/210a5d5c012f756d767d7db4795687eff718b1ee))
* [[#173778636](https://www.pivotaltracker.com/story/show/173778636)] Accessibility label review ([#2061](https://github.com/pagopa/io-app/issues/2061)) ([6cadb2d](https://github.com/pagopa/io-app/commit/6cadb2d05800ebfd47bfc637ba5fcc83fea66e1f))
* [[#173789814](https://www.pivotaltracker.com/story/show/173789814)] Improves accessibility for bonus card component ([#2048](https://github.com/pagopa/io-app/issues/2048)) ([7e6e08a](https://github.com/pagopa/io-app/commit/7e6e08a56b983505ab8926b0001dfce4d7ba71b5))
* [[#173827829](https://www.pivotaltracker.com/story/show/173827829)] Log login failure on instabug ([#2055](https://github.com/pagopa/io-app/issues/2055)) ([1e35b58](https://github.com/pagopa/io-app/commit/1e35b58f5ca419489c84dc06738feb1412f3640f))
* [[#173834010](https://www.pivotaltracker.com/story/show/173834010)] Show warning if there's another bonus already active ([#2079](https://github.com/pagopa/io-app/issues/2079)) ([ae95b8a](https://github.com/pagopa/io-app/commit/ae95b8a8404b379bc107af9ec7f73c5736aed7e2))
* [[#173834070](https://www.pivotaltracker.com/story/show/173834070)] Improve accessibility CIE authentication ([#2060](https://github.com/pagopa/io-app/issues/2060)) ([03420b2](https://github.com/pagopa/io-app/commit/03420b24812fb4c826ccb6663b33dcdcdbf9be94))
* [[#173848926](https://www.pivotaltracker.com/story/show/173848926)] update alert messages text ([#2063](https://github.com/pagopa/io-app/issues/2063)) ([7a25cc8](https://github.com/pagopa/io-app/commit/7a25cc863ef12b5d2df240e90ce243739dc5c836))
* [[#173898167](https://www.pivotaltracker.com/story/show/173898167)] disable mixpanel geo-ip localization ([#2074](https://github.com/pagopa/io-app/issues/2074)) ([f23840e](https://github.com/pagopa/io-app/commit/f23840e43e858cfb0346b59febff2590b7537e7c))
* [[#173898167](https://www.pivotaltracker.com/story/show/173898167)] Send to Mixpanel url changes  ([#2076](https://github.com/pagopa/io-app/issues/2076)) ([6b52879](https://github.com/pagopa/io-app/commit/6b52879f406da9da7e42e36f2a0eb2070234388a))
* [[#173900219](https://www.pivotaltracker.com/story/show/173900219)] Adds a new faq on bonus request information ([#2080](https://github.com/pagopa/io-app/issues/2080)) ([f16b7ee](https://github.com/pagopa/io-app/commit/f16b7eed00509946e1e64040fba0153e55071b53))
* [[#173916710](https://www.pivotaltracker.com/story/show/173916710)] Handle ABORTED status on UserDataProcessing ([#2077](https://github.com/pagopa/io-app/issues/2077)) ([ca2dc6a](https://github.com/pagopa/io-app/commit/ca2dc6a661e34142639b3f0208d0468614b2a25d))
* [[#173965657](https://www.pivotaltracker.com/story/show/173965657)] Adds the status redeemed for multiple bonus alert selector ([#2093](https://github.com/pagopa/io-app/issues/2093)) ([35adc07](https://github.com/pagopa/io-app/commit/35adc070e139d21a860a911d455d06874dc22c41))
* Copy updates ([#2001](https://github.com/pagopa/io-app/issues/2001)) ([ed3baba](https://github.com/pagopa/io-app/commit/ed3baba06a962192bc6de36db3d98398f54b57f1))
* Update cieNotSupported.md ([#2031](https://github.com/pagopa/io-app/issues/2031)) ([bfac952](https://github.com/pagopa/io-app/commit/bfac952abea2a92afbbc61eb1243fe7814a264ed))
* Update copy for faq58.md ([#2045](https://github.com/pagopa/io-app/issues/2045)) ([2f077e1](https://github.com/pagopa/io-app/commit/2f077e1b09b6e0e3037c7f285739a7c6fb4dcfcc))
* Update copy for faq64.md ([#2046](https://github.com/pagopa/io-app/issues/2046)) ([d81b9ba](https://github.com/pagopa/io-app/commit/d81b9ba5ed3db33ccba56cc26ed0e74c508522ba))
* Update faq59.md ([#2071](https://github.com/pagopa/io-app/issues/2071)) ([45dcb1c](https://github.com/pagopa/io-app/commit/45dcb1c21484abe05e263d935d775247dcf12239))
* Update faq59.md ([#2072](https://github.com/pagopa/io-app/issues/2072)) ([bcc7213](https://github.com/pagopa/io-app/commit/bcc7213f4fe05f251a922a1d7168b3b4db090827))
* Update index.yml ([#2069](https://github.com/pagopa/io-app/issues/2069)) ([c5be7da](https://github.com/pagopa/io-app/commit/c5be7da9f4dc32fe1bde14835fb3b4dc05a10378))
* Update index.yml ([#2070](https://github.com/pagopa/io-app/issues/2070)) ([5dd1be5](https://github.com/pagopa/io-app/commit/5dd1be53a5ab8e18a77f1a987bc1eff6df6b9628))


### Bug Fixes

*  Fix pagoPA nightly API check ([#1879](https://github.com/pagopa/io-app/issues/1879)) ([6f64d64](https://github.com/pagopa/io-app/commit/6f64d645ca62c571a6d46a4805882038fa19d972))
* [[#166572994](https://www.pivotaltracker.com/story/show/166572994)] Fix payment ID infinite polling ([#1945](https://github.com/pagopa/io-app/issues/1945)) ([2ff3ae1](https://github.com/pagopa/io-app/commit/2ff3ae12cc99442530f8556768e3f609060201b9))
* [[#172075979](https://www.pivotaltracker.com/story/show/172075979)] Fix services loading ([#1930](https://github.com/pagopa/io-app/issues/1930)) ([d1578a4](https://github.com/pagopa/io-app/commit/d1578a4e14b4a281ef8c68088f67eb5d172633f1))
* [[#172494935](https://www.pivotaltracker.com/story/show/172494935)] Handles session not valid on wallet screen ([#1742](https://github.com/pagopa/io-app/issues/1742)) ([ecc8f3d](https://github.com/pagopa/io-app/commit/ecc8f3d85c2e5d1ed8719e0ae020417b6815ea7d))
* [[#172762258](https://www.pivotaltracker.com/story/show/172762258)] Alert when deselecting a favourite payment method ([#1825](https://github.com/pagopa/io-app/issues/1825)) ([e71474f](https://github.com/pagopa/io-app/commit/e71474ff0d1983e5a348b71e358982ec08917660))
* [[#172806246](https://www.pivotaltracker.com/story/show/172806246)] Upgrade react-native-camera version ([#1818](https://github.com/pagopa/io-app/issues/1818)) ([9c9c097](https://github.com/pagopa/io-app/commit/9c9c09704670bd7cdb83ce4e56533c22abe038d5))
* [[#172838730](https://www.pivotaltracker.com/story/show/172838730)] Updates profileFirstLogin condition to dispatch and payload to mixpanel ([#1817](https://github.com/pagopa/io-app/issues/1817)) ([a1eabae](https://github.com/pagopa/io-app/commit/a1eabae8f70c9a6277a4c9fec1b6849ac0fe5df5))
* [[#173074615](https://www.pivotaltracker.com/story/show/173074615)] Fix display payment issues banner twice ([#1858](https://github.com/pagopa/io-app/issues/1858)) ([06a6e8a](https://github.com/pagopa/io-app/commit/06a6e8a9e858e2e52c96b85ae0a807d0cbfd75d6))
* [[#173242160](https://www.pivotaltracker.com/story/show/173242160)] fix euro representation ([#1893](https://github.com/pagopa/io-app/issues/1893)) ([e9cea2c](https://github.com/pagopa/io-app/commit/e9cea2c5c7d548e4e3b19aff9cb790b1c34d1fbc))
* [[#173289577](https://www.pivotaltracker.com/story/show/173289577)] Fix ContextualHelp title translation [#1891](https://github.com/pagopa/io-app/issues/1891) ([8f22a68](https://github.com/pagopa/io-app/commit/8f22a682dced28b7ca2c5da66084332414ec4059))
* [[#173322606](https://www.pivotaltracker.com/story/show/173322606)] Fix RootContainer re-renders ([#1902](https://github.com/pagopa/io-app/issues/1902)) ([a658d7c](https://github.com/pagopa/io-app/commit/a658d7cf8ce9b7c1098ee09a798e89b5e2c230a0))
* [[#173338441](https://www.pivotaltracker.com/story/show/173338441)] Refactoring ActiveBonusScreen with common components for family composition and bonus details ([#1958](https://github.com/pagopa/io-app/issues/1958)) ([437cbd6](https://github.com/pagopa/io-app/commit/437cbd64011bceb76bdf9ed738b60d105d2cb937))
* [[#173338737](https://www.pivotaltracker.com/story/show/173338737)] Fixes white statusbar content ([#1914](https://github.com/pagopa/io-app/issues/1914)) ([00f438f](https://github.com/pagopa/io-app/commit/00f438fba13cf6d0a7a151dd05478253b0343994))
* [[#173353526](https://www.pivotaltracker.com/story/show/173353526)] Fix transaction details crash ([#1908](https://github.com/pagopa/io-app/issues/1908)) ([3698229](https://github.com/pagopa/io-app/commit/3698229824d9f516a00ed3ead95a95c42799995f))
* [[#173385809](https://www.pivotaltracker.com/story/show/173385809)] Change fiscal code style for FamilyComposition component ([#1950](https://github.com/pagopa/io-app/issues/1950)) ([2513459](https://github.com/pagopa/io-app/commit/251345911a2846f6c35c7e264ffe23747c630534))
* [[#173398774](https://www.pivotaltracker.com/story/show/173398774)] show a proper message if credit card insertion is successful or not ([#2078](https://github.com/pagopa/io-app/issues/2078)) ([da1ab9c](https://github.com/pagopa/io-app/commit/da1ab9c99079247ea8a64fd5f457819549ce1a42))
* [[#173400880](https://www.pivotaltracker.com/story/show/173400880)] Reset navigation history when navigating through bonus list and information ([#1935](https://github.com/pagopa/io-app/issues/1935)) ([0322344](https://github.com/pagopa/io-app/commit/0322344914f542e3be95c5628730cc70b6b85799))
* [[#173420483](https://www.pivotaltracker.com/story/show/173420483)] Restore dynamic header on android platform [#2006](https://github.com/pagopa/io-app/issues/2006) ([5e05032](https://github.com/pagopa/io-app/commit/5e05032c23bf1f320b9a068a1211ca2b3053dbac))
* [[#173430903](https://www.pivotaltracker.com/story/show/173430903)] Center the content of the InfoScreenComponent ([#1934](https://github.com/pagopa/io-app/issues/1934)) ([eb8589e](https://github.com/pagopa/io-app/commit/eb8589e3f4180eb6a91d59f6e5faf8f121717b84))
* [[#173441272](https://www.pivotaltracker.com/story/show/173441272)] Downgrade okhttp lib on android ([#1966](https://github.com/pagopa/io-app/issues/1966)) ([2ab2b2d](https://github.com/pagopa/io-app/commit/2ab2b2dcbf70c7bc821e2a420756c611e57fa77e))
* [[#173443457](https://www.pivotaltracker.com/story/show/173443457)] Clean the store on loadAllBonusActivation ([#1933](https://github.com/pagopa/io-app/issues/1933)) ([876db87](https://github.com/pagopa/io-app/commit/876db872f5211885a7b2f547aab5ac33f80f6037))
* [[#173469785](https://www.pivotaltracker.com/story/show/173469785)] Add extra height to markdown computed height ([#1941](https://github.com/pagopa/io-app/issues/1941)) ([ee2e473](https://github.com/pagopa/io-app/commit/ee2e473bef325f32ffe807a0cfc4a8f89d2af196))
* [[#173475769](https://www.pivotaltracker.com/story/show/173475769)] fix ([#1944](https://github.com/pagopa/io-app/issues/1944)) ([79cc2e3](https://github.com/pagopa/io-app/commit/79cc2e3f8a06b53a9bdacd4644dc84cee1bf470f))
* [[#173510346](https://www.pivotaltracker.com/story/show/173510346)] Fixes test 2e2 ([#1959](https://github.com/pagopa/io-app/issues/1959)) ([816b9f3](https://github.com/pagopa/io-app/commit/816b9f34b80f7ce98ef9ae2b2905a7465a9408e1))
* [[#173515056](https://www.pivotaltracker.com/story/show/173515056)] Fixes crash on transactions list ([#1962](https://github.com/pagopa/io-app/issues/1962)) ([f222634](https://github.com/pagopa/io-app/commit/f2226346d26272e09df45416aa9f75d5a7329a15))
* [[#173530583](https://www.pivotaltracker.com/story/show/173530583)] fix ([#1967](https://github.com/pagopa/io-app/issues/1967)) ([f982d31](https://github.com/pagopa/io-app/commit/f982d31d879e4ff222c01dfcc6dfc44b92b23293))
* [[#173538229](https://www.pivotaltracker.com/story/show/173538229)] fix cta title localization ([#1971](https://github.com/pagopa/io-app/issues/1971)) ([21cbc4a](https://github.com/pagopa/io-app/commit/21cbc4a1f8963bdf4763ad7b1ed91ebf87d3350e))
* [[#173580888](https://www.pivotaltracker.com/story/show/173580888)] Update text for error screen ([#1974](https://github.com/pagopa/io-app/issues/1974)) ([18bb410](https://github.com/pagopa/io-app/commit/18bb4104b8f499ee5bc6ed94f1e802e492441fca))
* [[#173621813](https://www.pivotaltracker.com/story/show/173621813)] Adds flag prop to let user zoom on markdown texts ([#2009](https://github.com/pagopa/io-app/issues/2009)) ([63554db](https://github.com/pagopa/io-app/commit/63554dbbebdd19c00c3a88c2ea9d1c91f27084eb))
* [[#173640918](https://www.pivotaltracker.com/story/show/173640918)] Fixes Bonus card alignment on Tablet devices ([#2008](https://github.com/pagopa/io-app/issues/2008)) ([8fde1b5](https://github.com/pagopa/io-app/commit/8fde1b52bc8fadbcd1724ef881c05a77af83e555))
* [[#173651298](https://www.pivotaltracker.com/story/show/173651298),#173651447] Add hard-logout as default option to logout ([#2011](https://github.com/pagopa/io-app/issues/2011)) ([0ce1ba6](https://github.com/pagopa/io-app/commit/0ce1ba6041a8b832c609ad208d7c2337d272303a))
* [[#173686901](https://www.pivotaltracker.com/story/show/173686901)] Restore accessibility for app header ([#2018](https://github.com/pagopa/io-app/issues/2018)) ([e496b00](https://github.com/pagopa/io-app/commit/e496b00aaeb502b66037b7a5fc175e96fc19a071))
* [[#173702089](https://www.pivotaltracker.com/story/show/173702089)] Accessibility restored on modals ([#2023](https://github.com/pagopa/io-app/issues/2023)) ([99d5dae](https://github.com/pagopa/io-app/commit/99d5dae23c8718e8fff13a50093222140ca6549a))
* [[#173702628](https://www.pivotaltracker.com/story/show/173702628)] Reworks accordion component and improves accessibility ([#2033](https://github.com/pagopa/io-app/issues/2033)) ([632b035](https://github.com/pagopa/io-app/commit/632b03597b637f16464b2e965d9026add1332208))
* [[#173703056](https://www.pivotaltracker.com/story/show/173703056)] Fix accessibility on Fiscal code ([#2054](https://github.com/pagopa/io-app/issues/2054)) ([49d320e](https://github.com/pagopa/io-app/commit/49d320ec3448b05042039b73511b3faf33c97058))
* [[#173703926](https://www.pivotaltracker.com/story/show/173703926)] fixes ([#2022](https://github.com/pagopa/io-app/issues/2022)) ([4796cbd](https://github.com/pagopa/io-app/commit/4796cbd09be869f348b86ffe78c49ada442e0f1c))
* [[#173744863](https://www.pivotaltracker.com/story/show/173744863)] Fixes bad url to bonus guide ([#2034](https://github.com/pagopa/io-app/issues/2034)) ([39ef016](https://github.com/pagopa/io-app/commit/39ef0169dbfda06b37c7327e1f39f06cf2ddb539))
* [[#173752636](https://www.pivotaltracker.com/story/show/173752636)] Fix wallet transactions refresh ([#2036](https://github.com/pagopa/io-app/issues/2036)) ([68a570c](https://github.com/pagopa/io-app/commit/68a570ce003a8109f9f7db8fbb0ac6a900e8b968))
* [[#173768527](https://www.pivotaltracker.com/story/show/173768527)] Personal data link not recognized as link ([#2037](https://github.com/pagopa/io-app/issues/2037)) ([7a0688c](https://github.com/pagopa/io-app/commit/7a0688c22892340c6a46d6c7510911e2bd031757))
* [[#173769744](https://www.pivotaltracker.com/story/show/173769744)] Add accessibility focus for InfoScreenComponent ([#2039](https://github.com/pagopa/io-app/issues/2039)) ([f741a5d](https://github.com/pagopa/io-app/commit/f741a5d157cf6f4938b8419548e2c00a251f87dc))
* [[#173769898](https://www.pivotaltracker.com/story/show/173769898)] fix accessibility for loadingerrorcomponent ([#2043](https://github.com/pagopa/io-app/issues/2043)) ([1ad1dcf](https://github.com/pagopa/io-app/commit/1ad1dcfae220ce01ec7837fa1307559e7a2f4075))
* [[#173778636](https://www.pivotaltracker.com/story/show/173778636)] UI accessibility rework ([#2059](https://github.com/pagopa/io-app/issues/2059)) ([371efc8](https://github.com/pagopa/io-app/commit/371efc852a7f8403602b71a42fb1a8cdb05cae28))
* [[#173790471](https://www.pivotaltracker.com/story/show/173790471)] Fixes too long text on CTA to enter payment data manually ([#2053](https://github.com/pagopa/io-app/issues/2053)) ([788a507](https://github.com/pagopa/io-app/commit/788a50756284b94dc6d371d68389bff4125b3d96))
* [[#173794022](https://www.pivotaltracker.com/story/show/173794022)] Fixes LightModal half screen bug ([#2049](https://github.com/pagopa/io-app/issues/2049)) ([942e6c9](https://github.com/pagopa/io-app/commit/942e6c95e33cc9d2dab087eca86564629ffa2157))
* [[#173815288](https://www.pivotaltracker.com/story/show/173815288)] Fixes bonus header title color ([#2082](https://github.com/pagopa/io-app/issues/2082)) ([16cb950](https://github.com/pagopa/io-app/commit/16cb95069fa6ddcc0f7d5c3979f998d647ad4e8f))
* [[#173828514](https://www.pivotaltracker.com/story/show/173828514)] Fixes customGoBack not accessible ([#2058](https://github.com/pagopa/io-app/issues/2058)) ([9b3e1eb](https://github.com/pagopa/io-app/commit/9b3e1eb54a843bebe5e1bb239f4f51812c50c314))
* [[#173847503](https://www.pivotaltracker.com/story/show/173847503)] Implements accessibility for preferences options ([#2062](https://github.com/pagopa/io-app/issues/2062)) ([765ac34](https://github.com/pagopa/io-app/commit/765ac34008e2d1227f630572b587a693e8cf84d1))
* [[#173850410](https://www.pivotaltracker.com/story/show/173850410)] Fix isSuccessTransaction ([#2086](https://github.com/pagopa/io-app/issues/2086)) ([1e9e46b](https://github.com/pagopa/io-app/commit/1e9e46b4495363094e4c7568f5af62b866b531b2))
* [[#173877360](https://www.pivotaltracker.com/story/show/173877360)] fix undefined is not an object ([#2065](https://github.com/pagopa/io-app/issues/2065)) ([435afdb](https://github.com/pagopa/io-app/commit/435afdbea04f2277045763126c695b0fa6123d2f))
* [[#173899093](https://www.pivotaltracker.com/story/show/173899093)] fix wrong color for PaymentMethodList Item ([#2075](https://github.com/pagopa/io-app/issues/2075)) ([4c514e1](https://github.com/pagopa/io-app/commit/4c514e184e384fb84cf708c1833b922eb42581af))
* [[#173938203](https://www.pivotaltracker.com/story/show/173938203)] Remove the selected favourite calendar ([#2090](https://github.com/pagopa/io-app/issues/2090)) ([6b4834a](https://github.com/pagopa/io-app/commit/6b4834a5e9ed4bc01f03e9ba84b44532432e2589))
* [[#173977842](https://www.pivotaltracker.com/story/show/173977842)] fixes the title under bonus card ([#2092](https://github.com/pagopa/io-app/issues/2092)) ([ed1c26d](https://github.com/pagopa/io-app/commit/ed1c26dc6923351b987f55141b728f6ce30ee8e1))
* Gemfile & Gemfile.lock to reduce vulnerabilities ([#1345](https://github.com/pagopa/io-app/issues/1345)) ([dbaaa2e](https://github.com/pagopa/io-app/commit/dbaaa2ed426e53a65d51280ca492f47029909c97))
* Update faq42.md ([#2004](https://github.com/pagopa/io-app/issues/2004)) ([0520659](https://github.com/pagopa/io-app/commit/0520659cc215b00ce747a5314be9d93eba2e69e2))
* Use the correct text in Italian faq25. ([#2012](https://github.com/pagopa/io-app/issues/2012)) ([fe83337](https://github.com/pagopa/io-app/commit/fe8333728d3b1a1781908fe5bc70e733881e6c06))


### Chores

* [[#172889149](https://www.pivotaltracker.com/story/show/172889149)] Automatic changelog generation and versioning ([#2089](https://github.com/pagopa/io-app/issues/2089)) ([b01f1ee](https://github.com/pagopa/io-app/commit/b01f1ee97f66f7739dff353b90df7a89f57124d2))
* [[#173338803](https://www.pivotaltracker.com/story/show/173338803)] Integration test for activation phase ([#1931](https://github.com/pagopa/io-app/issues/1931)) ([ff18bc6](https://github.com/pagopa/io-app/commit/ff18bc6b4596d2adb6b3a466956e3734917ada95))
* [[#173464503](https://www.pivotaltracker.com/story/show/173464503)] Increase iOS deploy target to 13 ([#1937](https://github.com/pagopa/io-app/issues/1937)) ([14b35bc](https://github.com/pagopa/io-app/commit/14b35bc207d020e569f9c510ba91521fa47c499a))
* [[#173470420](https://www.pivotaltracker.com/story/show/173470420)] UI refinement on Bonus Information screen and Bonus detail screen ([#1942](https://github.com/pagopa/io-app/issues/1942)) ([eb29d43](https://github.com/pagopa/io-app/commit/eb29d43f49eda80174148c804b9a6ff21457542c))
* [[#173486320](https://www.pivotaltracker.com/story/show/173486320)] restore ios 9 ([#1946](https://github.com/pagopa/io-app/issues/1946)) ([03e659e](https://github.com/pagopa/io-app/commit/03e659eeb7f88c9ae0ea838df6ba95696caffa4b))
* [[#173581309](https://www.pivotaltracker.com/story/show/173581309)] Add tests on picking data based on language ([#1987](https://github.com/pagopa/io-app/issues/1987)) ([5dcba77](https://github.com/pagopa/io-app/commit/5dcba77c53429601a4cd3d54a7b4f1bd5312f3c0))
* [[#173707422](https://www.pivotaltracker.com/story/show/173707422)] Get static assets and data from IO CDN ([#2085](https://github.com/pagopa/io-app/issues/2085)) ([f8ab6d3](https://github.com/pagopa/io-app/commit/f8ab6d3fd971c1a04d15c623ac3cbbb7346d2c86))
* [[#173729510](https://www.pivotaltracker.com/story/show/173729510)] upgrade @types/react-native: 0.60.20 ([#2025](https://github.com/pagopa/io-app/issues/2025)) ([f3c52c3](https://github.com/pagopa/io-app/commit/f3c52c3c114f508d3c371b4885280f9b07fb3c02))
* [[#173829043](https://www.pivotaltracker.com/story/show/173829043)] Improve Reactotron usage ([#2056](https://github.com/pagopa/io-app/issues/2056)) ([9a22ccd](https://github.com/pagopa/io-app/commit/9a22ccd4ff71cfd54970cbcafb66b5ad9195fd46))
* [[#173887151](https://www.pivotaltracker.com/story/show/173887151)] add contextual help source ([#2067](https://github.com/pagopa/io-app/issues/2067)) ([5b273dd](https://github.com/pagopa/io-app/commit/5b273dd21c28091d9f848f5878a04482a70edb74))
* [[#173936506](https://www.pivotaltracker.com/story/show/173936506)] ignore some exceptions ([#2083](https://github.com/pagopa/io-app/issues/2083)) ([d62f1cc](https://github.com/pagopa/io-app/commit/d62f1cc8fc5171122846ec4e18cae8e2c79c4aad))
* [[#173936682](https://www.pivotaltracker.com/story/show/173936682)] remove links from code ([#2084](https://github.com/pagopa/io-app/issues/2084)) ([f09a447](https://github.com/pagopa/io-app/commit/f09a4479dee043335f5886aa2ebc821bc6333252))
* enable bonus vacanze feature flag ([#1900](https://github.com/pagopa/io-app/issues/1900)) ([aec4303](https://github.com/pagopa/io-app/commit/aec4303f9d5351c3ce0ac8d7f847d71389d1ac2d))
* **release:** 1.4.0-rc.0 ([2247e07](https://github.com/pagopa/io-app/commit/2247e073dde99af83035bdd7f78c2fb092016606))
* **release:** 1.4.0-rc.0 ([720ec00](https://github.com/pagopa/io-app/commit/720ec00cdac6847f76b239a19686354acdeda720))
* Upgrade lodash to v. 4.17.19 ([#2040](https://github.com/pagopa/io-app/issues/2040)) ([dbc5fec](https://github.com/pagopa/io-app/commit/dbc5fec8754c3aabd81001f7523872b50af3ef27))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
