// return an error starting from an unknown input value
export const getError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  } else if (error instanceof String) {
    return Error(error as string);
  }
  return Error("unknown");
};
