type E_EXIT = {
  type: "EXIT";
};

type E_START_AUTHORIZATION = {
  type: "START_AUTHORIZATION";
};

type E_AUTHORIZE = {
  type: "AUTHORIZE";
};

export type Events = E_EXIT | E_START_AUTHORIZATION | E_AUTHORIZE;
