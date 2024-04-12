import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pnUserSelectedPaymentRptIdSelector } from "..";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { PNMessage } from "../../types/types";
import { GlobalState } from "../../../../../store/reducers/types";

describe("pnUserSelectedPaymentRptIdSelector", () => {
  const p3CreditorTaxId = "01234567890";
  const p3NoticeCode = "012345678912345630";
  const pnMessage = {
    recipients: [
      {
        payment: {
          noticeCode: "012345678912345610",
          creditorTaxId: "01234567890"
        }
      },
      {
        payment: {
          noticeCode: "012345678912345620",
          creditorTaxId: "01234567890"
        }
      },
      {
        payment: {
          noticeCode: p3NoticeCode,
          creditorTaxId: p3CreditorTaxId
        }
      }
    ]
  };
  const maybePNMessage = O.some(pnMessage) as O.Option<PNMessage>;
  const pnMessagePot = pot.some(maybePNMessage) as pot.Pot<
    O.Option<PNMessage>,
    Error
  >;
  it("should return undefined when the pot is none", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const internalPNMessagePot = pot.none;
    const pnUserSelectedPaymentRptId = pnUserSelectedPaymentRptIdSelector(
      appState,
      internalPNMessagePot
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when the pot is noneLoading", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const internalPNMessagePot = pot.noneLoading;
    const pnUserSelectedPaymentRptId = pnUserSelectedPaymentRptIdSelector(
      appState,
      internalPNMessagePot
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when the pot is noneUpdating", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const internalPNMessagePot = pot.noneUpdating(maybePNMessage);
    const pnUserSelectedPaymentRptId = pnUserSelectedPaymentRptIdSelector(
      appState,
      internalPNMessagePot
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when the pot is noneError", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const internalPNMessagePot = pot.noneError(new Error());
    const pnUserSelectedPaymentRptId = pnUserSelectedPaymentRptIdSelector(
      appState,
      internalPNMessagePot
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when the pot some with Option.None", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const internalPNMessagePot = pot.some(O.none);
    const pnUserSelectedPaymentRptId = pnUserSelectedPaymentRptIdSelector(
      appState,
      internalPNMessagePot
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when recipients are empty", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const internalPNMessagePot = pot.some(
      O.some({
        recipients: []
      })
    ) as pot.Pot<O.Option<PNMessage>, Error>;
    const pnUserSelectedPaymentRptId = pnUserSelectedPaymentRptIdSelector(
      appState,
      internalPNMessagePot
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when recipients do not have a payment", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const internalPNMessagePot = pot.some(
      O.some({
        recipients: [{}, {}, {}]
      })
    ) as pot.Pot<O.Option<PNMessage>, Error>;
    const pnUserSelectedPaymentRptId = pnUserSelectedPaymentRptIdSelector(
      appState,
      internalPNMessagePot
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when user selected payments do not match", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const pnUserSelectedPaymentRptId = pnUserSelectedPaymentRptIdSelector(
      appState,
      pnMessagePot
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when user selected payments do not match", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const rptId = `${p3CreditorTaxId}${p3NoticeCode}`;
    const userSelectedPayments =
      appState.entities.messages.payments.userSelectedPayments;
    userSelectedPayments.add(rptId);
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          payments: {
            ...appState.entities.messages.payments,
            userSelectedPayments
          }
        }
      }
    } as GlobalState;
    const pnUserSelectedPaymentRptId = pnUserSelectedPaymentRptIdSelector(
      finalState,
      pnMessagePot
    );
    expect(pnUserSelectedPaymentRptId).toBe(rptId);
  });
});
