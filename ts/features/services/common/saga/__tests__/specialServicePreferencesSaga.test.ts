import * as O from "fp-ts/lib/Option";
import { expectSaga } from "redux-saga-test-plan";
import { specialServicePreferencesSaga } from "../specialServicePreferencesSaga";
import { loadServicePreference } from "../../../details/store/actions/preference";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { ServicePreferenceResponse } from "../../../details/types/ServicePreferenceResponse";
import * as profileProperties from "../../../../../mixpanelConfig/profileProperties";

describe("specialServicePreferencesSaga", () => {
  const pnServiceId = "01G40DWQGKY5GRWSNM4303VNRP" as ServiceId;
  const successPayloadGenerator = (
    inbox: boolean
  ): ServicePreferenceResponse => ({
    id: "01G40DWQGKY5GRWSNM4303VNRP" as ServiceId,
    kind: "success",
    value: {
      inbox,
      can_access_message_read_status: false,
      email: false,
      push: false,
      settings_version: 0
    }
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("specialServicePreferencesSaga", () => {
    (
      [
        {
          id: pnServiceId,
          kind: "conflictingVersion"
        },
        {
          id: pnServiceId,
          kind: "notFound"
        },
        {
          id: pnServiceId,
          kind: "tooManyRequests"
        }
      ] as ReadonlyArray<ServicePreferenceResponse>
    ).forEach(notSuccessfulResponse => {
      it(`should do nothing if input response is of type '${notSuccessfulResponse.kind}'`, async () => {
        const spiedOnUpdateMixpanelProfileProperties = jest.spyOn(
          profileProperties,
          "updateMixpanelProfileProperties"
        );
        const action = loadServicePreference.success(notSuccessfulResponse);
        await expectSaga(specialServicePreferencesSaga, action).run();
        expect(spiedOnUpdateMixpanelProfileProperties.mock.calls.length).toBe(
          0
        );
      });
    });

    it(`should do nothing if remoteConfig is 'O.none'`, async () => {
      const spiedOnUpdateMixpanelProfileProperties = jest.spyOn(
        profileProperties,
        "updateMixpanelProfileProperties"
      );
      const action = loadServicePreference.success(
        successPayloadGenerator(true)
      );
      await expectSaga(specialServicePreferencesSaga, action)
        .withReducer(_state => ({
          remoteConfig: O.none
        }))
        .run();
      expect(spiedOnUpdateMixpanelProfileProperties.mock.calls.length).toBe(0);
    });
    it(`should do nothing if remoteConfig does not have 'notificationServiceId'`, async () => {
      const spiedOnUpdateMixpanelProfileProperties = jest.spyOn(
        profileProperties,
        "updateMixpanelProfileProperties"
      );
      const action = loadServicePreference.success(
        successPayloadGenerator(true)
      );
      await expectSaga(specialServicePreferencesSaga, action)
        .withReducer(_state => ({
          remoteConfig: O.some({
            pn: {}
          })
        }))
        .run();
      expect(spiedOnUpdateMixpanelProfileProperties.mock.calls.length).toBe(0);
    });
    it(`should do nothing if 'notificationServiceId' (in remote config) is different from the ID in the input action`, async () => {
      const spiedOnUpdateMixpanelProfileProperties = jest.spyOn(
        profileProperties,
        "updateMixpanelProfileProperties"
      );
      const action = loadServicePreference.success(
        successPayloadGenerator(true)
      );
      await expectSaga(specialServicePreferencesSaga, action)
        .withReducer(_state => ({
          remoteConfig: O.some({
            pn: {
              notificationServiceId: "01JXFY9HBNEFB9EZDQ4FD5HHMB" as ServiceId
            }
          })
        }))
        .run();
      expect(spiedOnUpdateMixpanelProfileProperties.mock.calls.length).toBe(0);
    });
    [false, true].forEach(inbox => {
      it(`should call 'updateMixpanelProfileProperties' for a success input action (inbox '${inbox}') with id matching 'notificationServiceId' (in remote config)`, async () => {
        const spiedOnUpdateMixpanelProfileProperties = jest.spyOn(
          profileProperties,
          "updateMixpanelProfileProperties"
        );
        const action = loadServicePreference.success(
          successPayloadGenerator(inbox)
        );
        const state = {
          remoteConfig: O.some({
            pn: {
              notificationServiceId: pnServiceId
            }
          })
        };
        await expectSaga(specialServicePreferencesSaga, action)
          .withReducer(_state => state)
          .run();
        expect(spiedOnUpdateMixpanelProfileProperties.mock.calls.length).toBe(
          1
        );
        expect(
          spiedOnUpdateMixpanelProfileProperties.mock.calls[0].length
        ).toBe(1);
        expect(spiedOnUpdateMixpanelProfileProperties.mock.calls[0][0]).toBe(
          state
        );
      });
    });
  });
});
