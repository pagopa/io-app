import { fakerIT as faker } from "@faker-js/faker";
import { NoticeDetailResponse } from "@io-app/api-types/generated/definitions/pagopa/biz-events/NoticeDetailResponse";
import { NoticeListItem } from "@io-app/api-types/generated/definitions/pagopa/biz-events/NoticeListItem";
import { TransactionInfo } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/TransactionInfo";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { ioDevServerConfig } from "../../../config";
import { generateRandomInfoNotice } from "../utils/transactions";

const mockedTaxCodes = ["1199250158", "13756881002", "262700362", "31500945"];

type EventId = NoticeListItem["eventId"];

const userNotices = new Map<EventId, NoticeListItem>();
const notices = new Map<EventId, NoticeDetailResponse>();

const getUserNotices = () =>
  Array.from(userNotices.size > 0 ? userNotices.values() : []);

const getNoticeDetails = (eventId: EventId) =>
  pipe(
    notices,
    O.fromNullable,
    O.chain(notices => O.fromNullable(notices.get(eventId)))
  );

const addUserNotice = (transaction: NoticeListItem) => {
  userNotices.set(transaction.eventId, transaction);
};

const removeUserNotice = (eventId: EventId) => {
  userNotices.delete(eventId);
  removeNoticeDetails(eventId);
};

const addNoticeDetails = (eventId: EventId, notice: NoticeDetailResponse) => {
  notices.set(eventId, notice);
};

const removeNoticeDetails = (eventId: EventId) => {
  notices.delete(eventId);
};

const generateUserNotice = (
  eventId: EventId,
  idx: number,
  additionalTransactionInfo: Partial<TransactionInfo> = {}
) => {
  const payeeTaxCode =
    mockedTaxCodes[
      faker.number.int({ min: 0, max: mockedTaxCodes.length - 1 })
    ];
  const randomNotice: NoticeListItem = {
    eventId,
    payeeName: faker.company.name(),
    payeeTaxCode,
    isDebtor: false,
    isPayer: true,
    amount: additionalTransactionInfo.payments?.[0]?.amount.toString() || "",
    noticeDate: new Date(
      new Date().setDate(new Date().getDate() - 2 * idx)
    ).toISOString(),
    isCart: false
  };

  const cartList = Array.from(
    { length: faker.number.int({ min: 1, max: 2 }) },
    () => ({
      subject: faker.lorem.sentence(faker.number.int({ min: 2, max: 4 })),
      amount: faker.finance.amount({ min: 1, max: 1000 }),
      payee: {
        name: randomNotice.payeeName,
        taxCode: randomNotice.payeeTaxCode
      },
      debtor: {
        name: faker.person.fullName(),
        taxCode: faker.string.alphanumeric(16).toUpperCase()
      },
      refNumberType: "IBAN",
      refNumberValue: faker.number
        .int({ min: 100000000000, max: 999999999999 })
        .toString()
    })
  );
  const updatedNotice = {
    ...randomNotice,
    isCart: cartList.length > 1,
    amount: cartList
      .reduce((acc, item) => acc + Number(item.amount), 0)
      .toString()
  };
  addUserNotice(updatedNotice);

  const randomNoticeDetails: NoticeDetailResponse = {
    infoNotice: generateRandomInfoNotice(cartList),
    carts: cartList
  };
  addNoticeDetails(eventId, randomNoticeDetails);
  return updatedNotice;
};

const generateUserNoticeData = () => {
  for (const i of Array(
    ioDevServerConfig.features.payments.numberOfTransactions
  ).keys()) {
    generateUserNotice(faker.string.uuid(), i);
  }
};

// At server startup
generateUserNoticeData();

export default {
  addUserNotice,
  getUserNotices,
  getNoticeDetails,
  generateUserNotice,
  removeUserNotice
};
