import { fakerIT as faker } from "@faker-js/faker";
import { InitializedProfile } from "@io-app/api-types/generated/definitions/identity/InitializedProfile";
import { Profile } from "@io-app/api-types/generated/definitions/identity/Profile";
import { UpdateProfile412ErrorTypesEnum } from "@io-app/api-types/generated/definitions/identity/UpdateProfile412ErrorTypes";
import { Request } from "express";
import * as E from "fp-ts/lib/Either";
import * as R from "fp-ts/lib/Record";

import { getProblemJson } from "../../payloads/error";
import { getProfileInitialData } from "../../payloads/profile";
import { getRandomValue } from "../../utils/random";
import { CustomResponse, ResponseProblem } from "../../utils/responseTypes";
import { getAuthenticationProvider } from "../sessionInfo";

// eslint-disable-next-line functional/no-let
let currentProfile: InitializedProfile = {} as InitializedProfile;

export const getProfile = (): ProfileOperationsType["get"] => {
  if (R.isEmpty(currentProfile)) {
    initProfile();
  }
  return {
    status: profileSuccessOperations.get.status,
    payload: currentProfile
  };
};

export const updateProfile = (req: Request): ProfileOperationsType["post"] => {
  const maybeProfileToUpdate = Profile.decode(req.body);
  if (E.isLeft(maybeProfileToUpdate)) {
    return { status: profileProblemsList.bodyMalformed.status };
  }
  const emailAlreadyTakenTestCheck = handleAlreadyTakenTestEmail(
    maybeProfileToUpdate.right.email
  );
  if (emailAlreadyTakenTestCheck) {
    return emailAlreadyTakenTestCheck;
  }
  const profileVersionCheck = checkProfileVersion(maybeProfileToUpdate);
  if (profileVersionCheck) {
    return profileVersionCheck;
  }
  const clientProfileIncreased: Profile = {
    ...maybeProfileToUpdate.right,
    version: parseInt(req.body.version, 10) + 1
  };
  currentProfile = {
    ...currentProfile,
    ...clientProfileIncreased,
    is_email_validated:
      maybeProfileToUpdate.right.email === currentProfile.email &&
      currentProfile.is_email_validated,
    is_inbox_enabled: (clientProfileIncreased.accepted_tos_version ?? 0) > 0
  };

  return {
    status: profileSuccessOperations.post.status,
    payload: currentProfile
  };
};

export const resetUserProfile = () =>
  (currentProfile = { ...getProfileInitialData(getAuthenticationProvider()) });

const initProfile = () => {
  const gender = faker.person.sexType();

  const profileFromAuthenticationProvider = getProfileInitialData(
    getAuthenticationProvider()
  );
  currentProfile = {
    ...profileFromAuthenticationProvider,
    ...getRandomValue(
      {
        name: profileFromAuthenticationProvider.name,
        family_name: profileFromAuthenticationProvider.family_name
      },
      {
        name: faker.person.firstName(gender),
        family_name: faker.person.lastName(gender)
      },
      "profile"
    )
  };
};

export const setProfileEmailValidated = (value: boolean) => {
  if (R.isEmpty(currentProfile)) {
    return;
  }
  currentProfile = {
    ...currentProfile,
    version: currentProfile.version + 1,
    is_email_validated: value
  };
};

export const setProfileEmailAlreadyTaken = (value: boolean) => {
  if (R.isEmpty(currentProfile)) {
    return;
  }
  currentProfile = {
    ...currentProfile,
    version: currentProfile.version + 1,
    is_email_already_taken: value
  };
};

const checkProfileVersion = (profile: ReturnType<typeof Profile.decode>) => {
  if (E.isRight(profile) && profile.right.version !== currentProfile.version) {
    return {
      status: profileProblemsList.conflict.status,
      payload: getProblemJson(
        profileProblemsList.conflict.status,
        profileProblemsList.conflict.detail,
        profileProblemsList.conflict.detail
      )
    };
  }
};

const handleAlreadyTakenTestEmail = (
  email?: string
): CustomResponse | undefined => {
  if (email === "mario.error@prova.com") {
    return {
      status: profileProblemsList.emailAlreadyTaken.status,
      payload: getProblemJson(
        profileProblemsList.emailAlreadyTaken.status,
        profileProblemsList.emailAlreadyTaken.detail,
        profileProblemsList.emailAlreadyTaken.detail,
        UpdateProfile412ErrorTypesEnum[
          "https://ioapp.it/problems/email-already-taken"
        ]
      )
    };
  }
};

// MARK: Problems
type ProfileProblemDetail =
  | "BodyMalformed"
  | "Conflict"
  | "Precondition Failed";

type ProfileProblems = {
  bodyMalformed: ResponseProblem<ProfileProblemDetail>;
  conflict: ResponseProblem<ProfileProblemDetail>;
  emailAlreadyTaken: ResponseProblem<ProfileProblemDetail>;
};

const profileProblemsList: ProfileProblems = {
  emailAlreadyTaken: {
    status: 412,
    detail: "Precondition Failed"
  },
  bodyMalformed: {
    status: 400,
    detail: "BodyMalformed"
  },
  conflict: {
    status: 409,
    detail: "Conflict"
  }
};

// MARK: Response
type ProfileOperationsType = {
  get: CustomResponse;
  post: CustomResponse;
};

const profileSuccessOperations: ProfileOperationsType = {
  get: {
    status: 200,
    payload: InitializedProfile
  },
  post: {
    status: 200,
    payload: InitializedProfile
  }
};
