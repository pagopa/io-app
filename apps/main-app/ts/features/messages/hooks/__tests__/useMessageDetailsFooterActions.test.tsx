import { OrganizationFiscalCode } from "@io-app/api-types/generated/definitions/communication/OrganizationFiscalCode";
import { PaymentAmount } from "@io-app/api-types/generated/definitions/communication/PaymentAmount";
import { PaymentNoticeNumber } from "@io-app/api-types/generated/definitions/communication/PaymentNoticeNumber";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { FooterActions } from "@io-app/design-system";
import { ComponentProps } from "react";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { CTA, CTAS } from "../../../../types/LocalizedCTAs";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as detailsById from "../../store/reducers/detailsById";
import * as payments from "../../store/reducers/payments";
import { PaymentData } from "../../types";
import {
  useMessageDetailsFooterActions,
  UseMessageDetailsFooterActionsProps
} from "../useMessageDetailsFooterActions";

const cta1: CTA = {
  text: "CTA 1",
  action: ""
};
const cta2: CTA = {
  text: "CTA 2",
  action: ""
};
const bothCTAs: CTAS = {
  cta_1: cta1,
  cta_2: cta2
};
const onlyCTA1: CTAS = {
  cta_1: cta1
};
const paymentData: PaymentData = {
  amount: 199 as PaymentAmount,
  noticeNumber: "012345678912345610" as PaymentNoticeNumber,
  payee: {
    fiscalCode: "01234567890" as OrganizationFiscalCode
  }
};

type ActionScenario = {
  ctas?: CTAS;
  expectedActions: object;
  name: string;
  paymentButtonStatus: "enabled" | "loading";
};

const actionScenarios: ReadonlyArray<ActionScenario> = [
  {
    name: "payment and two CTAs",
    ctas: bothCTAs,
    paymentButtonStatus: "enabled",
    expectedActions: {
      type: "ThreeButtons",
      primary: { disabled: false, loading: false },
      secondary: { label: cta1.text },
      tertiary: { label: cta2.text }
    }
  },
  {
    name: "payment and one CTA",
    ctas: onlyCTA1,
    paymentButtonStatus: "enabled",
    expectedActions: {
      type: "TwoButtons",
      primary: { disabled: false, loading: false },
      secondary: { label: cta1.text }
    }
  },
  {
    name: "payment only",
    paymentButtonStatus: "enabled",
    expectedActions: {
      type: "SingleButton",
      primary: { disabled: false, loading: false }
    }
  },
  {
    name: "loading payment",
    paymentButtonStatus: "loading",
    expectedActions: {
      type: "SingleButton",
      primary: { disabled: false, loading: true }
    }
  }
];

describe("useMessageDetailsFooterActions", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest
      .spyOn(payments, "canNavigateToPaymentFromMessageSelector")
      .mockReturnValue(true);
  });

  test.each(actionScenarios)(
    "returns actions for $name",
    ({ ctas, expectedActions, paymentButtonStatus }) => {
      jest
        .spyOn(detailsById, "messagePaymentDataSelector")
        .mockReturnValue(paymentData);
      jest
        .spyOn(payments, "paymentsButtonStateSelector")
        .mockReturnValue(paymentButtonStatus);

      expect(renderActions({ ctas })).toMatchObject(expectedActions);
    }
  );

  it("returns two CTA actions without a payment", () => {
    mockHiddenPayment();

    expect(renderActions({ ctas: bothCTAs })).toMatchObject({
      type: "TwoButtons",
      primary: { label: cta1.text },
      secondary: { label: cta2.text }
    });
  });

  it("returns one CTA action without a payment", () => {
    mockHiddenPayment();

    expect(renderActions({ ctas: onlyCTA1 })).toMatchObject({
      type: "SingleButton",
      primary: { label: cta1.text }
    });
  });

  it("returns no actions when payment and CTAs are hidden", () => {
    mockHiddenPayment();

    expect(renderActions()).toBeUndefined();
  });

  it("disables the payment action when payment navigation is unavailable", () => {
    jest
      .spyOn(detailsById, "messagePaymentDataSelector")
      .mockReturnValue(paymentData);
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockReturnValue("enabled");
    jest
      .spyOn(payments, "canNavigateToPaymentFromMessageSelector")
      .mockReturnValue(false);

    expect(renderActions()?.primary).toMatchObject({ disabled: true });
  });
});

const defaultProps: UseMessageDetailsFooterActionsProps = {
  firstCTAIsPNOptInMessage: false,
  messageId: "01HRW6GJBD594Z0K9B4D6KAERC",
  secondCTAIsPNOptInMessage: false,
  serviceId: "01J5XCQMBNF0484AJV2TST03FE" as ServiceId
};

const mockHiddenPayment = () => {
  jest
    .spyOn(detailsById, "messagePaymentDataSelector")
    .mockReturnValue(undefined);
  jest.spyOn(payments, "paymentsButtonStateSelector").mockReturnValue("hidden");
};

const renderActions = (
  props: Partial<UseMessageDetailsFooterActionsProps> = {}
) => {
  const actionSpy = jest.fn<
    void,
    [ComponentProps<typeof FooterActions>["actions"]]
  >();
  const Component = () => {
    actionSpy(useMessageDetailsFooterActions({ ...defaultProps, ...props }));
    return null;
  };
  const initialState = appReducer(undefined, applicationChangeState("active"));

  renderScreenWithNavigationStoreContext(
    Component,
    "DUMMY",
    {},
    createStore(appReducer, initialState as any)
  );

  return actionSpy.mock.calls[actionSpy.mock.calls.length - 1]?.[0];
};
