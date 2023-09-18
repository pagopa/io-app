import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import I18n from "../../../../i18n";
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

enum FailureEnum {
  GENERIC = "GENERIC"
}

const createServicesImplementation = (
  client: unknown,
  token: string,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const generatePin = async (context: Context) => {
    // required to avoid errors while implementation is so barebone
    // eslint-disable-next-line no-console
    console.log(mapFetchError("max-retries"));
    // eslint-disable-next-line no-console
    console.log(client, token, context);

    return new Promise((resolve, _reject) => resolve(true));
  };
  const authorizeUser =  new Promise((resolve, reject) =>
      dispatch(
        identificationRequest(
          false,
          true,
          undefined,
          {
            label: I18n.t("global.buttons.cancel"),
            onCancel: () => reject(FailureEnum.GENERIC)
          },
          {
            onSuccess: () => resolve(true)
          }
        )
      )
    );

  return { generatePin, authorizeUser };
};

export { createServicesImplementation };
