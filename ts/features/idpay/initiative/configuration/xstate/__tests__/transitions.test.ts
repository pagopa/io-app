import * as pot from "@pagopa/ts-commons/lib/pot";
import { ConfigurationMode, Context, INITIAL_CONTEXT } from "../context";
import { Events } from "../events";
import { createIDPayInitiativeConfigurationMachine } from "../machine";
import { Typegen0 } from "../machine.typegen";
import { T_IBAN } from "../__mocks__/services";

type TransitionTestType = {
  currentState: Typegen0["matchesStates"];
  expectedState: Typegen0["matchesStates"];
  event: Events;
  context?: Partial<Context>;
};

const transitions: ReadonlyArray<TransitionTestType> = [
  {
    currentState: "CONFIGURING_IBAN.DISPLAYING_IBAN_ONBOARDING",
    expectedState: "DISPLAYING_INTRO",
    event: {
      type: "BACK"
    }
  },
  {
    currentState: "CONFIGURING_IBAN.DISPLAYING_IBAN_ONBOARDING",
    expectedState: "CONFIGURATION_CLOSED",
    event: {
      type: "BACK"
    },
    context: {
      mode: ConfigurationMode.IBAN
    }
  },
  {
    currentState: "CONFIGURING_IBAN.DISPLAYING_IBAN_ONBOARDING_FORM",
    expectedState: "CONFIGURING_IBAN.DISPLAYING_IBAN_LIST",
    event: {
      type: "BACK"
    },
    context: {
      ibanList: pot.some([
        {
          channel: "IO",
          checkIbanStatus: "",
          description: "Test",
          iban: T_IBAN,
          bicCode: "",
          checkIbanResponseDate: new Date(),
          holderBank: "",
          queueDate: ""
        }
      ])
    }
  },
  {
    currentState: "CONFIGURING_IBAN.DISPLAYING_IBAN_ONBOARDING_FORM",
    expectedState: "CONFIGURING_IBAN.DISPLAYING_IBAN_ONBOARDING",
    event: {
      type: "BACK"
    }
  },
  {
    currentState: "CONFIGURING_IBAN.DISPLAYING_IBAN_LIST",
    expectedState: "CONFIGURATION_CLOSED",
    event: {
      type: "BACK"
    },
    context: {
      mode: ConfigurationMode.IBAN
    }
  },
  {
    currentState: "CONFIGURING_IBAN.DISPLAYING_IBAN_LIST",
    expectedState: "DISPLAYING_INTRO",
    event: {
      type: "BACK"
    }
  },
  {
    currentState: "CONFIGURING_INSTRUMENTS.DISPLAYING_INSTRUMENTS",
    expectedState: "CONFIGURATION_CLOSED",
    event: {
      type: "BACK"
    },
    context: {
      mode: ConfigurationMode.INSTRUMENTS
    }
  },
  {
    currentState: "CONFIGURING_INSTRUMENTS.DISPLAYING_INSTRUMENTS",
    expectedState: "CONFIGURING_IBAN",
    event: {
      type: "BACK"
    }
  }
];

describe("IDPay configuration machine transitions", () => {
  transitions.forEach(({ currentState, expectedState, event, context }) => {
    it(`should reach "${expectedState}" given "${currentState}" when "${event.type}" event occurs`, () => {
      const machine = createIDPayInitiativeConfigurationMachine().withContext({
        ...INITIAL_CONTEXT,
        ...context
      });

      const actualState = machine.transition(currentState, event as Events);

      expect(actualState.matches(expectedState)).toBeTruthy();
    });
  });
});
