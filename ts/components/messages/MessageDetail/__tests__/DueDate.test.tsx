import { render } from "@testing-library/react-native";
import React from "react";

import MockDate from "mockdate";
import { ReactTestInstance } from "react-test-renderer";
import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { Locales } from "../../../../../locales/locales";
import I18n, { setLocale } from "../../../../i18n";
import { toUIMessageDetails } from "../../../../store/reducers/entities/messages/transformers";
import { getExpireStatus } from "../../../../utils/dates";
import { MessagePaymentExpirationInfo } from "../../../../utils/messages";
import { paymentValidInvalidAfterDueDate } from "../../../../__mocks__/message";

import DueDateBar from "../DueDateBar";

jest.useFakeTimers();

const uiMessageDetails = toUIMessageDetails(paymentValidInvalidAfterDueDate);

const expirationInfo: MessagePaymentExpirationInfo = {
  kind: "EXPIRABLE",
  expireStatus: "VALID",
  dueDate: uiMessageDetails.dueDate!
};

const defaultProps: React.ComponentProps<typeof DueDateBar> = {
  dueDate: uiMessageDetails.dueDate!,
  expirationInfo,
  isPaid: false
};

type LocaleInfo = { locale: string; timezone: string };
const locales: Record<Locales, LocaleInfo> = {
  it: { locale: "it-IT", timezone: "Europe/Rome" },
  en: { locale: "en-GB", timezone: "Europe/London" },
  de: { locale: "de-DE", timezone: "Europe/Berlin" }
};

describe("the `DueDateBar` component", () => {
  describe("when `isPaid` is true ", () => {
    it("should match the snapshot", () => {
      const component = renderComponent({
        ...defaultProps,
        isPaid: true
      });
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when `isPaid` is false ", () => {
    describe("and `expirationInfo` is EXPIRED ", () => {
      it("should match the snapshot", () => {
        const component = renderComponent({
          ...defaultProps,
          expirationInfo: { ...expirationInfo, expireStatus: "EXPIRED" }
        });
        expect(component.toJSON()).toMatchSnapshot();
      });
    });

    describe("and `expirationInfo` is EXPIRING ", () => {
      it("should match the snapshot", () => {
        const component = renderComponent({
          ...defaultProps,
          expirationInfo: { ...expirationInfo, expireStatus: "EXPIRING" }
        });
        expect(component.toJSON()).toMatchSnapshot();
      });
    });

    describe("and `expirationInfo` is VALID ", () => {
      it("should match the snapshot", () => {
        const component = renderComponent({
          ...defaultProps,
          expirationInfo: { ...expirationInfo, expireStatus: "VALID" }
        });
        expect(component.toJSON()).toMatchSnapshot();
      });
    });
  });
});

describe("Render the DueDateBar accordingly with the due date", () => {
  const message = paymentValidInvalidAfterDueDate;

  const data: ReadonlyArray<
    [
      string, // UTC iso8601 date string component
      string, // UTC iso8601 time string component
      number, // IT time (hour) offset between local timezone ad UTC
      number // EN time (hour) offset between local timezone ad UTC
    ]
  > = [
    ["2022-01-31", "22:59", 1, 0],
    ["2022-02-28", "22:59", 1, 0],
    ["2023-02-28", "22:59", 1, 0],
    ["2024-02-29", "22:59", 1, 0],
    ["2022-03-31", "21:59", 2, 1],
    ["2022-04-30", "21:59", 2, 1],
    ["2022-05-31", "21:59", 2, 1],
    ["2022-06-30", "21:59", 2, 1],
    ["2022-07-31", "21:59", 2, 1],
    ["2022-08-31", "21:59", 2, 1],
    ["2022-09-30", "21:59", 2, 1],
    ["2022-10-31", "22:59", 1, 0],
    ["2022-11-31", "22:59", 1, 0],
    ["2022-12-31", "22:59", 1, 0]
  ];
  data.forEach(elem => {
    const [day, time, timeOffsetIT, timeOffsetEN] = elem;
    it("IT locale", async () => {
      await runDueDateBarComponentLocalizationTest(
        "it" as Locales,
        day,
        time,
        timeOffsetIT,
        message
      );
    });
    it("EN locale", async () => {
      await runDueDateBarComponentLocalizationTest(
        "en" as Locales,
        day,
        time,
        timeOffsetEN,
        message
      );
    });
  });
});

async function runDueDateBarComponentLocalizationTest(
  locale: Locales,
  day: string,
  time: string,
  timeOffset: number,
  message: CreatedMessageWithContentAndAttachments
) {
  // Set the current date at a specific moment according to our mock due dates
  // and snapshots
  MockDate.set("2022-11-04");

  setLocale(locale);
  // In `jestGlobalSetup.js` it has been set `process.env.TZ = "UTC";`
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  expect(timezone).toBe("UTC");
  // Format the ISO 8601 UTC.
  const iso8601 = `${day}T${time}:00.000Z`;
  const iso8601DueDate = new Date(iso8601);
  // Because the current locale is "UTC", shift the message due date to the right "time zone".
  const iso8601DueDateInsideMessage = new Date(iso8601);
  iso8601DueDateInsideMessage.setHours(
    iso8601DueDateInsideMessage.getHours() + timeOffset
  );
  const msg: CreatedMessageWithContentAndAttachments = {
    ...message,
    content: {
      ...message.content,
      due_date: iso8601DueDateInsideMessage
    }
  };
  // Look if the message is expired or not, according to its due date.
  const expiredStatus = getExpireStatus(msg.content.due_date!);
  const isEpired = expiredStatus === "EXPIRED";
  const expirationInfo: MessagePaymentExpirationInfo = {
    kind: "EXPIRABLE",
    expireStatus: expiredStatus,
    dueDate: msg.content.due_date!
  };
  const component = renderComponent({
    ...defaultProps,
    dueDate: msg.content.due_date!,
    expirationInfo,
    isPaid: false
  });
  expect(component).not.toBeNull();
  // Check snapshot match to see if the UI or the date/time local string have changed.
  expect(component.toJSON()).toMatchSnapshot();
  const dueDateBar = await component.findByTestId("DueDateBar_TextContent");
  expect(dueDateBar).not.toBeNull();
  // Check texts.
  const block1 = isEpired
    ? I18n.t("messages.cta.payment.expiredAlert.block1")
    : I18n.t("messages.cta.payment.expiringOrValidAlert.block1");
  const block2 = isEpired
    ? I18n.t("messages.cta.payment.expiredAlert.block2")
    : I18n.t("messages.cta.payment.expiringOrValidAlert.block2");
  const checkTime = iso8601DueDate.toLocaleTimeString(locales[locale].locale, {
    timeZone: locales[locale].timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  });
  const checkDay = iso8601DueDate.toLocaleDateString(locales[locale].locale, {
    timeZone: locales[locale].timezone,
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
  const expectedDay = ` ${checkDay} `;
  const expectedTime = ` ${checkTime}`;
  const dayText = await component.findByText(expectedDay);
  expect(dayText).not.toBeNull();
  const dayTime = await component.findByText(expectedTime);
  expect(dayTime).not.toBeNull();
  const dueDateBarFragment = dueDateBar.children[0];
  const dueDateBarFragmentAsTestInstance =
    dueDateBarFragment as ReactTestInstance;
  if (dueDateBarFragmentAsTestInstance.children) {
    const block1Text = dueDateBarFragmentAsTestInstance.children[0];
    expect(block1Text).toBe(block1);
    const block2Text = dueDateBarFragmentAsTestInstance.children[2];
    expect(block2Text).toBe(block2);
  } else {
    expect(dueDateBarFragment as ReactTestInstance).toBe(true);
  }
}

const renderComponent = (props: React.ComponentProps<typeof DueDateBar>) =>
  render(<DueDateBar {...props} />);
