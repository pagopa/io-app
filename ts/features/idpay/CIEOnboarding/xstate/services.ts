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
    // eslint-disable-next-line no-console
    console.log("generatePin");
    return new Promise((resolve, _reject) => resolve(true));
  };
  return { generatePin };
};

export { createServicesImplementation };
