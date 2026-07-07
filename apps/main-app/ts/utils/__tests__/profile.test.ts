import { none, some } from "@pagopa/ts-commons/lib/pot";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { BlockedInboxOrChannels } from "../../../definitions/identity/BlockedInboxOrChannels";
import { InitializedProfile } from "../../../definitions/identity/InitializedProfile";
import { ServiceId } from "../../../definitions/services/ServiceId";
import { ProfileState } from "../../features/settings/common/store/reducers";
import { formatFiscalCodeBirthdayAsShortFormat } from "../dates";
import {
  extractFiscalCodeData,
  getBlockedChannels,
  getProfileChannelsforServicesList
} from "../profile";
import { mockedMunicipality } from "../__mocks__/municipality";

describe("extracting data from fiscal code", () => {
  // mario rossi / roma / rm / 1-1-1980
  const goodCf = "RSSMRA80A01H501U" as FiscalCode;

  const potGood = some(mockedMunicipality);
  const data = extractFiscalCodeData(goodCf, potGood);
  it("should return the extracted data", () => {
    expect(data.birthDate).toBeDefined();
    expect(formatFiscalCodeBirthdayAsShortFormat(data.birthDate!)).toEqual(
      "01/01/1980"
    );
    expect(data.gender).toEqual("M");
    expect(data.denominazione).toEqual("Roma");
    expect(data.siglaProvincia).toEqual("RM");
  });

  const wrongCf = "RSSMRA80A0RH501U" as FiscalCode;
  const dataWrong1 = extractFiscalCodeData(wrongCf, potGood);
  it("should return the extracted data without birth information", () => {
    expect(dataWrong1.birthDate).not.toBeDefined();
    expect(dataWrong1.gender).not.toBeDefined();
    expect(dataWrong1.denominazione).toEqual("Roma");
    expect(dataWrong1.siglaProvincia).toEqual("RM");
  });

  // giulia rossi / roma / rm / 12-07-1956
  const goodCfF = "GLIRSS56L52H501P" as FiscalCode;
  const dataF = extractFiscalCodeData(goodCfF, potGood);
  it("should recognize the female sex", () => {
    expect(dataF.birthDate).toBeDefined();
    expect(formatFiscalCodeBirthdayAsShortFormat(dataF.birthDate!)).toEqual(
      "12/07/1956"
    );
    expect(dataF.gender).toEqual("F");
    expect(dataF.denominazione).toEqual("Roma");
    expect(dataF.siglaProvincia).toEqual("RM");
  });

  // giulia rossi / roma / rm / 12-07-2003
  const goodCfF2 = "GLIRSS03L52H501A" as FiscalCode;
  const dataF2 = extractFiscalCodeData(goodCfF2, potGood);
  it("should recognize the 2003 as year of birth", () => {
    expect(dataF2.birthDate).toBeDefined();
    expect(formatFiscalCodeBirthdayAsShortFormat(dataF2.birthDate!)).toEqual(
      "12/07/2003"
    );
    expect(dataF2.gender).toEqual("F");
    expect(dataF2.denominazione).toEqual("Roma");
    expect(dataF2.siglaProvincia).toEqual("RM");
  });

  // giulia rossi / roma / rm / 12-07-2003
  const dataNoM = extractFiscalCodeData(goodCfF2, none);
  it("should return birth place empty", () => {
    expect(dataNoM.birthDate).toBeDefined();
    expect(formatFiscalCodeBirthdayAsShortFormat(dataNoM.birthDate!)).toEqual(
      "12/07/2003"
    );
    expect(dataNoM.gender).toEqual("F");
    expect(dataNoM.denominazione).toEqual("");
    expect(dataNoM.siglaProvincia).toEqual("");
  });
});

const INBOX_CHANNEL = "INBOX";
const EMAIL_CHANNEL = "EMAIL";
const PUSH_CHANNEL = "WEBHOOK";
const SEND_READ_MESSAGE_STATUS_CHANNEL = "SEND_READ_MESSAGE_STATUS_CHANNEL";

const serviceA = "service-a" as ServiceId;
const serviceB = "service-b" as ServiceId;

const profileWithBlockedChannels = (
  blockedInboxOrChannels: BlockedInboxOrChannels | undefined
): ProfileState =>
  some({
    blocked_inbox_or_channels: blockedInboxOrChannels
  } as InitializedProfile);

describe("getProfileChannelsforServicesList", () => {
  test.each`
    name                                                                    | blocked                                           | servicesId              | enableListedServices | expected
    ${"block the inbox of every listed service"}                            | ${{}}                                             | ${[serviceA, serviceB]} | ${false}             | ${{ [serviceA]: [INBOX_CHANNEL], [serviceB]: [INBOX_CHANNEL] }}
    ${"drop the service entry when unblocking its only blocked channel"}    | ${{ [serviceA]: [INBOX_CHANNEL] }}                | ${[serviceA]}           | ${true}              | ${{}}
    ${"keep the other blocked channels when unblocking the inbox"}          | ${{ [serviceA]: [INBOX_CHANNEL, EMAIL_CHANNEL] }} | ${[serviceA]}           | ${true}              | ${{ [serviceA]: [EMAIL_CHANNEL] }}
    ${"append the inbox to the already blocked channels"}                   | ${{ [serviceA]: [EMAIL_CHANNEL] }}                | ${[serviceA]}           | ${false}             | ${{ [serviceA]: [EMAIL_CHANNEL, INBOX_CHANNEL] }}
    ${"leave untouched the services that are not listed"}                   | ${{ [serviceB]: [EMAIL_CHANNEL] }}                | ${[serviceA]}           | ${false}             | ${{ [serviceA]: [INBOX_CHANNEL], [serviceB]: [EMAIL_CHANNEL] }}
    ${"not add an entry when enabling a service that is not blocked"}       | ${{}}                                             | ${[serviceA]}           | ${true}              | ${{}}
    ${"not duplicate the channel when blocking an already blocked service"} | ${{ [serviceA]: [INBOX_CHANNEL] }}                | ${[serviceA]}           | ${false}             | ${{ [serviceA]: [INBOX_CHANNEL] }}
  `(
    "should $name",
    ({ blocked, servicesId, enableListedServices, expected }) => {
      expect(
        getProfileChannelsforServicesList(
          servicesId,
          profileWithBlockedChannels(blocked),
          enableListedServices
        )
      ).toEqual(expected);
    }
  );

  it("should start from no blocked channels when the profile is not available", () => {
    expect(getProfileChannelsforServicesList([serviceA], none, false)).toEqual({
      [serviceA]: [INBOX_CHANNEL]
    });
  });

  it("should handle a custom channel of interest", () => {
    expect(
      getProfileChannelsforServicesList(
        [serviceA],
        profileWithBlockedChannels({ [serviceA]: [EMAIL_CHANNEL] }),
        true,
        EMAIL_CHANNEL
      )
    ).toEqual({});
  });

  it("should not mutate the profile blocked channels", () => {
    const blocked: BlockedInboxOrChannels = { [serviceA]: [INBOX_CHANNEL] };
    getProfileChannelsforServicesList(
      [serviceA],
      profileWithBlockedChannels(blocked),
      true
    );
    expect(blocked).toEqual({ [serviceA]: [INBOX_CHANNEL] });
  });
});

describe("getBlockedChannels", () => {
  const allEnabled = {
    inbox: true,
    email: true,
    push: true,
    can_access_message_read_status: true
  };
  const allDisabled = {
    inbox: false,
    email: false,
    push: false,
    can_access_message_read_status: false
  };

  test.each`
    name                                                        | blocked                            | enabled                            | expected
    ${"drop the service entry when every channel is enabled"}   | ${{ [serviceA]: [INBOX_CHANNEL] }} | ${allEnabled}                      | ${{}}
    ${"block every channel when every channel is disabled"}     | ${{}}                              | ${allDisabled}                     | ${{ [serviceA]: [INBOX_CHANNEL, PUSH_CHANNEL, EMAIL_CHANNEL, SEND_READ_MESSAGE_STATUS_CHANNEL] }}
    ${"block only the disabled channel"}                        | ${{}}                              | ${{ ...allEnabled, inbox: false }} | ${{ [serviceA]: [INBOX_CHANNEL] }}
    ${"replace the previously blocked channels of the service"} | ${{ [serviceA]: [EMAIL_CHANNEL] }} | ${{ ...allEnabled, push: false }}  | ${{ [serviceA]: [PUSH_CHANNEL] }}
    ${"leave untouched the other services"}                     | ${{ [serviceB]: [EMAIL_CHANNEL] }} | ${{ ...allEnabled, inbox: false }} | ${{ [serviceA]: [INBOX_CHANNEL], [serviceB]: [EMAIL_CHANNEL] }}
  `("should $name", ({ blocked, enabled, expected }) => {
    expect(
      getBlockedChannels(profileWithBlockedChannels(blocked), serviceA)(enabled)
    ).toEqual(expected);
  });

  it("should not mutate the profile blocked channels", () => {
    const blocked: BlockedInboxOrChannels = { [serviceA]: [INBOX_CHANNEL] };
    getBlockedChannels(
      profileWithBlockedChannels(blocked),
      serviceA
    )(allEnabled);
    expect(blocked).toEqual({ [serviceA]: [INBOX_CHANNEL] });
  });
});
