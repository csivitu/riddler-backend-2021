const error_codes = {
  E0: "undefined error occured",
  E1: "unexpected values recieved",
  E2: "token validation failed",
  E3: "values not found in database",
  E4: "data not processable",
  E5: "too many or too less parameters recieved",
};

const logical_errors = {
  L1: "user already exists",
  L2: "not enough points",
  L3: "requested node is not locked",
  L4: "not enough penalty points",
  L5: "another question already locked",
  L6: "requested question is not unlocked",
  L7: "requested question is already solved",
  L8: "incorrect answer for requested question",
};

const success_codes = {
  S1: "validated correctly",
  S2: "answer correct",
  S3: "penalty points reduced",
  S4: "hint given for requested question",
};

module.exports = { error_codes, logical_errors, success_codes };
