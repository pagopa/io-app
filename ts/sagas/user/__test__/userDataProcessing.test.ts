import { right } from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { UserDataProcessing } from "../../../../definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../../definitions/backend/UserDataProcessingStatus";
import {
  loadUserDataProcessing,
  upsertUserDataProcessing
} from "../../../store/actions/userDataProcessing";
import {
  manageUserDataProcessingSaga,
  upsertUserDataProcessingSaga
} from "../userDataProcessing";

describe("manageUserDataProcessingSaga", () => {
  const getUserDataProcessing = jest.fn();
  const createOrUpdateUserDataProcessing = jest.fn();
  const choice = UserDataProcessingChoiceEnum.DOWNLOAD;

  it("while managing the first request of data export, check if previous request are WIP and, otherwise, submit a new request", () => {
    const nextData: UserDataProcessing = {
      choice,
      status: UserDataProcessingStatusEnum.PENDING,
      version: 1
    };
    const get404Response = right({ status: 404 });

    testSaga(
      manageUserDataProcessingSaga,
      getUserDataProcessing,
      createOrUpdateUserDataProcessing,
      choice
    )
      .next()
      .put(loadUserDataProcessing.request(choice))
      .next()
      .call(getUserDataProcessing, { userDataProcessingChoiceParam: choice })
      .next(get404Response)
      .put(loadUserDataProcessing.success({ choice, value: undefined }))
      .next()
      .call(
        upsertUserDataProcessingSaga,
        createOrUpdateUserDataProcessing,
        nextData
      )
      .next();
  });

  it("while managing a new request of data export, if the previous request elaboration has been completed submit a new request", () => {
    const currentData: UserDataProcessing = {
      choice,
      status: UserDataProcessingStatusEnum.CLOSED,
      version: 1
    };
    const get200Response = right({ status: 200, value: currentData });

    const nextData: UserDataProcessing = {
      choice,
      status: UserDataProcessingStatusEnum.PENDING,
      version: 2
    };

    testSaga(
      manageUserDataProcessingSaga,
      getUserDataProcessing,
      createOrUpdateUserDataProcessing,
      choice
    )
      .next()
      .put(loadUserDataProcessing.request(choice))
      .next()
      .call(getUserDataProcessing, { userDataProcessingChoiceParam: choice })
      .next(get200Response)
      .put(loadUserDataProcessing.success({ choice, value: currentData }))
      .next()
      .call(
        upsertUserDataProcessingSaga,
        createOrUpdateUserDataProcessing,
        nextData
      )
      .next();
  });

  it("while managing a new request of data export, if the previous request elaboration has not been completed does nothing", () => {
    const currentData: UserDataProcessing = {
      choice: UserDataProcessingChoiceEnum.DOWNLOAD,
      status: UserDataProcessingStatusEnum.PENDING,
      version: 2
    };
    const get200Response = right({ status: 200, value: currentData });

    testSaga(
      manageUserDataProcessingSaga,
      getUserDataProcessing,
      createOrUpdateUserDataProcessing,
      choice
    )
      .next()
      .put(loadUserDataProcessing.request(choice))
      .next()
      .call(getUserDataProcessing, { userDataProcessingChoiceParam: choice })
      .next(get200Response)
      .put(loadUserDataProcessing.success({ choice, value: currentData }))
      .next();
  });

});

describe("upsertUserDataProcessingSaga", () => {
  const postUserDataProcessing = jest.fn();
  it("dispatch a success action if the submission of a new request succeded", () => {
    const request: UserDataProcessing = {
      choice: UserDataProcessingChoiceEnum.DOWNLOAD,
      status: UserDataProcessingStatusEnum.PENDING,
      version: 1
    };
    const response200 = right({ status: 200, value: request });

    testSaga(upsertUserDataProcessingSaga, postUserDataProcessing, request)
      .next()
      .put(upsertUserDataProcessing.request(request))
      .next()
      .call(postUserDataProcessing, {
        userDataProcessingChoiceRequest: { choice: request.choice }
      })
      .next(response200)
      .put(upsertUserDataProcessing.success(request));
  });

});
