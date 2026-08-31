export type ErrorDTO = {
  code: number;
  message?: string;
};

type ErrorCodes = 400 | 401 | 403 | 404;

export const getIdPayError = (code: ErrorCodes, message = ""): ErrorDTO => ({
  code,
  message
});
