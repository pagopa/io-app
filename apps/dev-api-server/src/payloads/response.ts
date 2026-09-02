import chalk from "chalk";
import { Request, Response, Router } from "express";

export const basePath = "/api/v1";
export type IOResponse<T> = {
  isJson?: boolean;
  payload: T;
  status?: number;
};

export type SupportedMethod = "delete" | "get" | "patch" | "post" | "put";

type Route = { description?: string; method: SupportedMethod; path: string };

// eslint-disable-next-line functional/no-let
export let routes: ReadonlyArray<Route> = [];
const addNewRoute = (
  method: SupportedMethod,
  path: string,
  description?: string
) => {
  routes = [...routes, { path, method, description }];
};

type HandlerOptions = {
  description?: string;
};

export const addHandler = (
  router: Router,
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void,
  delay: () => number = () => 0,
  options?: HandlerOptions
) => {
  addNewRoute(method, path, options?.description);
  router[method](path, (req, res) => {
    const delayMilliseconds = delay();
    setTimeout(() => {
      if (delayMilliseconds > 0) {
        // eslint-disable-next-line no-console
        console.log(
          chalk.red(
            `${path} response has a delayed of ${delayMilliseconds} milliseconds`
          )
        );
      }
      handleRequest(req, res);
    }, delayMilliseconds);
  });
};
