import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { toPNMessage } from "../../../../store/types/transformers";
import { thirdPartyFromIdSelector } from "../../../../../messages/store/reducers/thirdPartyById";
import { thirdPartySenderDenominationSelector } from "..";

// Mocks
const mockState = {} as any;
const mockIoMessageId = "test-id";

// Mock dependencies
jest.mock("../../../../../messages/store/reducers/thirdPartyById", () => ({
  thirdPartyFromIdSelector: jest.fn()
}));
jest.mock("../../../../store/types/transformers", () => ({
  toPNMessage: jest.fn()
}));

describe("thirdPartySenderDenominationSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return senderDenomination when all data is present", () => {
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(pot.some({}));
    (toPNMessage as jest.Mock).mockReturnValue(
      O.some({ senderDenomination: "Denomination" })
    );

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBe("Denomination");
  });

  it("should return undefined if thirdPartyFromIdSelector returns none", () => {
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(pot.none);

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBeUndefined();
  });

  it("should return undefined if toPNMessage returns none", () => {
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(pot.some({}));
    (toPNMessage as jest.Mock).mockReturnValue(O.none);

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBeUndefined();
  });

  it("should return undefined if senderDenomination is missing", () => {
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(pot.some({}));
    (toPNMessage as jest.Mock).mockReturnValue(O.some({}));

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBeUndefined();
  });
});
