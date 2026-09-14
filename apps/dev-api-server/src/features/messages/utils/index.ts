import { fakerIT as faker } from "@faker-js/faker";
import { Either, left, right } from "fp-ts/lib/Either";

import { getProblemJson } from "../../../payloads/error";
import { unknownToString } from "../../../utils/error";
import { ExpressFailure } from "../../../utils/expressDTO";

// eslint-disable-next-line functional/no-let
let nextId = 0;
const nextDate = faker.date.recent({ days: 3 });

export const nextMessageIdAndCreationDate = () => {
  const id = `${nextId++}`.padStart(26, "0");
  nextDate.setHours(nextDate.getHours() + 1);
  return { id, created_at: new Date(nextDate) };
};

export const bodyToString = (
  body: unknown
): Either<ExpressFailure, string | undefined> => {
  if (body == null) {
    return right(undefined);
  }
  if (typeof body === "object") {
    try {
      return right(JSON.stringify(body));
    } catch (e) {
      return left({
        httpStatusCode: 400,
        reason: getProblemJson(
          400,
          "Bad body value",
          `Body data is in a bad format (${unknownToString(e)})`
        )
      });
    }
  }
  return right(String(body));
};
