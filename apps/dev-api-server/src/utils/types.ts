import { addHandler } from "../payloads/response";

export type RouteHandler = Parameters<typeof addHandler>[3];
