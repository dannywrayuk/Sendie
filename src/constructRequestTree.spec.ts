import { constructRequestTree } from "./constructRequestTree";

test("test", () => {
  const x = constructRequestTree("example");
  console.log(JSON.stringify(x, null, 2));
});
