type E_EXIT = {
  type: "EXIT";
};

type E_START_AUTHORIZATION = {
  type: "START_AUTHORIZATION";
  trxCode: string;
};

type E_CONFIRM_AUTHORIZATION = {
  type: "CONFIRM_AUTHORIZATION";
};

export type Events = E_EXIT | E_START_AUTHORIZATION | E_CONFIRM_AUTHORIZATION;
