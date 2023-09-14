import { Context } from "./context";

export type Services = {
  generatePin: {
    data: unknown;
  };
};

const mapFetchError = (error: unknown) => {
  if (error === "max-retries") {
    return null;
  }
  return undefined;
};

const createServicesImplementation = (client: unknown, token: string) => {
  const generatePin = async (context: Context) => {
    // required to avoid errors while implementation is so barebone
    // eslint-disable-next-line no-console
    console.log(mapFetchError("max-retries"));
    // eslint-disable-next-line no-console
    console.log(client, token, context);

    return new Promise((resolve, _reject) => resolve(true));
  };
  return { generatePin };
};

export { createServicesImplementation };
