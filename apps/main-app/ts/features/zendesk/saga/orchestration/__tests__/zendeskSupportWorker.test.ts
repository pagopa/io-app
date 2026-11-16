import { expectSaga } from "redux-saga-test-plan";
import { call } from "typed-redux-saga/macro";

import NavigationService from "../../../../../navigation/NavigationService";
import ZENDESK_ROUTES from "../../../navigation/routes";
import {
  getZendeskToken,
  zendeskSupportBack,
  zendeskSupportCancel,
  zendeskSupportCompleted,
  zendeskSupportFailure,
  zendeskSupportStart
} from "../../../store/actions";
import { zendeskSupportWorker } from "../zendeskSupportWorker";

const zendeskStart = zendeskSupportStart({
  assistanceType: {},
  startingRoute: "test"
});

describe("zendeskSupportWorker", () => {
  it.each([
    {
      name: "completed",
      action: zendeskSupportCompleted(),
      result: "completed"
    },
    { name: "cancelled", action: zendeskSupportCancel(), result: "cancel" },
    { name: "backed out", action: zendeskSupportBack(), result: "back" },
    {
      name: "failed",
      action: zendeskSupportFailure("failure"),
      result: "failure"
    }
  ])(
    "returns $result when the support flow is $name",
    async ({ action, result }) => {
      const { returnValue } = await expectSaga(
        zendeskSupportWorker,
        zendeskStart
      )
        .withState({ authentication: { kind: "LoggedOutWithoutIdp" } })
        .provide([
          [
            call(NavigationService.getCurrentRouteName),
            ZENDESK_ROUTES.HELP_CENTER
          ]
        ])
        .dispatch(action)
        .run();

      expect(returnValue).toBe(result);
    }
  );

  it("requests a Zendesk token and opens the permissions screen for an authenticated assistance request", async () => {
    const assistanceStart = zendeskSupportStart({
      assistanceType: { payment: true },
      startingRoute: "test"
    });

    await expectSaga(zendeskSupportWorker, assistanceStart)
      .withState({ authentication: { kind: "LoggedInWithoutSessionInfo" } })
      .provide([[call(NavigationService.getCurrentRouteName), "HOME"]])
      .dispatch(zendeskSupportCompleted())
      .put(getZendeskToken.request())
      .call(NavigationService.navigate, ZENDESK_ROUTES.MAIN, {
        screen: ZENDESK_ROUTES.ASK_PERMISSIONS,
        params: assistanceStart.payload
      })
      .run();
  });

  it("opens the help center without requesting a token for unauthenticated users", async () => {
    await expectSaga(zendeskSupportWorker, zendeskStart)
      .withState({ authentication: { kind: "LoggedOutWithoutIdp" } })
      .provide([[call(NavigationService.getCurrentRouteName), "HOME"]])
      .dispatch(zendeskSupportCompleted())
      .call(NavigationService.navigate, ZENDESK_ROUTES.MAIN, {
        screen: ZENDESK_ROUTES.HELP_CENTER,
        params: zendeskStart.payload
      })
      .not.put(getZendeskToken.request())
      .run();
  });

  it.each([
    {
      name: "the help center is already open",
      route: ZENDESK_ROUTES.HELP_CENTER
    },
    { name: "there is no current route", route: undefined }
  ])("does not navigate when $name", async ({ route }) => {
    await expectSaga(zendeskSupportWorker, zendeskStart)
      .withState({ authentication: { kind: "LoggedOutWithoutIdp" } })
      .provide([[call(NavigationService.getCurrentRouteName), route]])
      .dispatch(zendeskSupportCompleted())
      .not.call.fn(NavigationService.navigate)
      .run();
  });
});
