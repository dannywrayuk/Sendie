import * as x from "crypto";

export default {
  name: "root_request_js",
  method: "POST",
  address: "http://jsonplaceholder.typicode.com/posts",
  headers: { "Content-type": "application/json; charset=UTF-8" },
  body: {
    title: "${hello}",
    body: "sendie",
    testId: x.randomUUID(),
    userId: 1,
    yes: { world: "yes" },
  },
};
