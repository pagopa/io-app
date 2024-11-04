import * as pot from "@pagopa/ts-commons/lib/pot";
import reducer, { INITIAL_STATE } from "..";
import { remoteLoading } from "../../../../../../common/model/RemoteValue";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { fimsHistoryGet } from "../../actions";
import { ConsentsResponseDTO } from "../../../../../../../definitions/fims/ConsentsResponseDTO";
import { Consent } from "../../../../../../../definitions/fims/Consent";

describe("INITIAL_STATE", () => {
  it("Should match snapshot", () => {
    expect(INITIAL_STATE).toMatchSnapshot();
  });
});

describe("fimsHistoryReducer", () => {
  it("Should match INITIAL_STATE upon first invocation with 'undefined' input state and unrelated action 'applicationChangeState'", () => {
    const historyState = reducer(undefined, applicationChangeState("active"));
    expect(historyState).toEqual(INITIAL_STATE);
  });
});

describe("fimsHistoryReducer, receiving fimsHistoryGet.request", () => {
  const consentsResponse = {} as ConsentsResponseDTO;
  [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(consentsResponse),
    pot.noneError("An error"),
    pot.some(consentsResponse),
    pot.someLoading(consentsResponse),
    pot.someUpdating(consentsResponse, consentsResponse),
    pot.someError(consentsResponse, "An error")
  ].forEach(consentsList =>
    [undefined, false, true].forEach(shouldReloadFromScratch =>
      [undefined, "01JBVEPWGWVD8NWXQ3PEQAPFX3"].forEach(continuationToken => {
        it(`Should set 'consentsList' to loading state ${
          shouldReloadFromScratch ? "(keeping the inner pot value)" : ""
        } and leave 'historyExportState unaffected, for 'fimsHistoryGet.request' action with 'shouldReloadFromScratch' set to ${shouldReloadFromScratch} and 'continuationToken' ${
          continuationToken ? "defined" : "undefined"
        }`, () => {
          const fimsHistoryGetRequest = fimsHistoryGet.request({
            continuationToken,
            shouldReloadFromScratch
          });
          const historyState = reducer(
            { consentsList, historyExportState: remoteLoading },
            fimsHistoryGetRequest
          );

          if (shouldReloadFromScratch) {
            expect(historyState.consentsList).toEqual(pot.noneLoading);
          } else {
            expect(historyState.consentsList).toEqual(
              pot.toLoading(consentsList)
            );
          }
          expect(historyState.historyExportState).toEqual(remoteLoading);
        });
      })
    )
  );
});

describe("fimsHistoryReducer, receiving fimsHistoryGet.success", () => {
  [
    [],
    [
      {
        id: "id1",
        service_id: "sid1",
        timestamp: new Date()
      },
      {
        id: "id2",
        service_id: "sid2",
        timestamp: new Date()
      },
      {
        id: "id3",
        service_id: "sid3",
        timestamp: new Date()
      }
    ] as ReadonlyArray<Consent>
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ].forEach(initialStateItems => {
    const consentsResponseDTO = {
      items: initialStateItems,
      continuationToken: "The initial continuation token"
    };
    [
      pot.none,
      pot.noneLoading,
      pot.noneUpdating(consentsResponseDTO),
      pot.noneError("An error"),
      pot.some(consentsResponseDTO),
      pot.someLoading(consentsResponseDTO),
      pot.someUpdating(consentsResponseDTO, consentsResponseDTO),
      pot.someError(consentsResponseDTO, "An error")
    ].forEach(initialConsentsList => {
      const initialState = {
        consentsList: initialConsentsList,
        historyExportState: remoteLoading
      };
      [undefined, "01JBVYCJJTMYJWA7Q7YDGJYA6Z"].forEach(
        responseContinuationToken =>
          [
            [],
            [
              {
                id: "id4",
                service_id: "sid4",
                timestamp: new Date()
              },
              {
                id: "id5",
                service_id: "sid5",
                timestamp: new Date()
              }
            ] as ReadonlyArray<Consent>
          ].forEach(responseItems => {
            const expectedOutputItems = [
              ...(pot.isSome(initialConsentsList)
                ? initialConsentsList.value.items
                : []),
              ...responseItems
            ];
            it(`Given 'consentsList' ${initialConsentsList.kind} (${
              pot.isSome(initialConsentsList)
                ? initialConsentsList.value.items.length
                : 0
            } items), after 'fimsHistoryGetSuccess.success' with 'continuationToken' ${
              responseContinuationToken ? "defined" : "undefined"
            } and ${
              responseItems.length
            } items, it should keep 'historyExportState', have same 'continuationToken' and (${
              expectedOutputItems.length
            } final items)`, () => {
              const fimsHistoryGetSuccess = fimsHistoryGet.success({
                items: responseItems,
                continuationToken: responseContinuationToken
              });

              const historyState = reducer(initialState, fimsHistoryGetSuccess);

              expect(historyState.historyExportState).toBe(remoteLoading);

              const outputConsentsList = historyState.consentsList;
              expect(pot.isSome(outputConsentsList)).toBeTruthy();

              if (!pot.isSome(outputConsentsList)) {
                throw Error(
                  "Test is failing: historeState.consentsList should be pot.some"
                );
              }

              expect(outputConsentsList.value.items).toEqual(
                expectedOutputItems
              );
              expect(outputConsentsList.value.continuationToken).toEqual(
                responseContinuationToken
              );
            });
          })
      );
    });
  });
});
