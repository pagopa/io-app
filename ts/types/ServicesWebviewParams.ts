/**
 * this type models an object that represents the params needed by the ServicesWebviewScreen to work
 * see https://www.pivotaltracker.com/story/show/174801117
 */
import * as t from "io-ts";
import { ServiceId } from "../../definitions/backend/ServiceId";

export const ServicesWebviewParams = t.interface({
  serviceId: ServiceId,
  url: t.string
});

export type ServicesWebviewParams = t.TypeOf<typeof ServicesWebviewParams>;
