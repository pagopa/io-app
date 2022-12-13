import * as pot from "@pagopa/ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { customEmailChannelSetEnabled } from "../../../store/actions/persistedPreferences";
import { visibleServicesSelector } from "../../../store/reducers/entities/services/visibleServices";
import { isCustomEmailChannelEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { profileSelector } from "../../../store/reducers/profile";
import {
  checkEmailNotificationPreferencesSaga,
  emailNotificationPreferencesSaga,
  watchEmailNotificationPreferencesSaga
} from "../checkEmailNotificationPreferencesSaga";

describe("watchEmailNotificationPreferencesSaga", () => {
  it("if the store has information about user preferences the saga should end", () => {
    testSaga(watchEmailNotificationPreferencesSaga)
      .next()
      .select(isCustomEmailChannelEnabledSelector)
      .next(pot.some("")) // have some information about user preferences
      .isDone();
  });

  it("if the store has not information about user preferences the saga checkEmailNotificationPreferencesSaga should be forked", () => {
    testSaga(watchEmailNotificationPreferencesSaga)
      .next()
      .select(isCustomEmailChannelEnabledSelector)
      .next(pot.none) // have no information about user preferences
      .fork(checkEmailNotificationPreferencesSaga)
      .next();
  });
});

describe("emailNotificationPreferencesSaga", () => {
  it("if profile has is_email_enabled to false, isCustomEmailChannelEnabled should be false", () => {
    testSaga(emailNotificationPreferencesSaga)
      .next()
      .select(profileSelector)
      .next(pot.some({ is_email_enabled: false })) // profile
      .select(visibleServicesSelector)
      .next(pot.some([])) // visible services
      .put(customEmailChannelSetEnabled(false))
      .next()
      .isDone();
  });

  it("if profile has is_email_enabled to true but not blocked email, isCustomEmailChannelEnabled should be false", () => {
    testSaga(emailNotificationPreferencesSaga)
      .next()
      .select(profileSelector)
      .next(pot.some({ is_email_enabled: true, blocked_inbox_or_channels: {} })) // profile
      .select(visibleServicesSelector)
      .next(pot.some([])) // visible services
      .put(customEmailChannelSetEnabled(false))
      .next()
      .isDone();
  });

  it("if profile has is_email_enabled to true and blocked emails, isCustomEmailChannelEnabled should be true", () => {
    testSaga(emailNotificationPreferencesSaga)
      .next()
      .select(profileSelector)
      .next(
        pot.some({
          is_email_enabled: true,
          blocked_inbox_or_channels: {
            service1: ["EMAIL"],
            service2: ["EMAIL"]
          }
        })
      ) // profile
      .select(visibleServicesSelector)
      .next(pot.some([{ service_id: "service1" }])) // visible services
      .put(customEmailChannelSetEnabled(true))
      .next()
      .isDone();
  });
});
