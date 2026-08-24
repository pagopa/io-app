export type CustomResponse = {
  payload?: object;
  status: number;
};

export type ResponseProblem<T extends string> = {
  detail: T;
  status: number;
};
