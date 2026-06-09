import { StatusEnum as AcivatedStatus } from "../../../../../../definitions/cgn/CardActivated";
import { CcdbNumber } from "../../../../../../definitions/cgn/CcdbNumber";
import { EycaCard } from "../../../../../../definitions/cgn/EycaCard";
import {
  remoteLoading,
  remoteReady
} from "../../../../../common/model/RemoteValue";
import { EycaDetailsState } from "../../store/reducers/eyca/details";
import { canEycaCardBeShown } from "../eyca";

describe("canEycaCardBeShown", () => {
  const eycaCardActive: EycaCard = {
    status: AcivatedStatus.ACTIVATED,
    card_number: "W413-K096-O814-Z223" as CcdbNumber,
    activation_date: new Date(Date.now()),
    expiration_date: new Date(Date.now() + 500000)
  };

  const data = [
    {
      status: "FOUND",
      card: eycaCardActive
    },
    {
      status: "NOT_FOUND"
    },
    {
      status: "ERROR"
    },
    {
      status: "INELIGIBLE"
    }
  ];

  it("should return true if the card is loading", () => {
    const card: EycaDetailsState = remoteLoading;
    expect(canEycaCardBeShown(card)).toBe(true);
  });

  data.forEach(({ status, card }) => {
    it(`should return ${status === "INELIGIBLE" ? "false" : "true"} if the card is ready and status is ${status}`, () => {
      const cardState = remoteReady({
        status,
        card
      }) as EycaDetailsState;
      expect(canEycaCardBeShown(cardState)).toBe(status !== "INELIGIBLE");
    });
  });

  it("should return false if the card is undefined", () => {
    const card: EycaDetailsState = { kind: "undefined" };
    expect(canEycaCardBeShown(card)).toBe(false);
  });
});
