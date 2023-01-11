import { pathsToTree } from "./pathsToTree";

describe("pathToTree", () => {
  test("default", () => {
    const MOCK_PATHS: string[] = [
      "sendie/hello/test.js",
      "sendie/world/test2.js",
      "sendie/world/test3.js",
    ];
    const tree = pathsToTree(MOCK_PATHS);
    expect(tree).toEqual([
      {
        name: "sendie",
        children: [
          {
            name: "hello",
            children: [
              {
                path: "sendie/hello/test.js",
              },
            ],
          },
          {
            name: "world",
            children: [
              {
                path: "sendie/world/test2.js",
              },
              {
                path: "sendie/world/test3.js",
              },
            ],
          },
        ],
      },
    ]);
  });

  test("custom parser", () => {
    const MOCK_PATHS: string[] = [
      "sendie/hello/test.js",
      "sendie/world/test2.js",
      "sendie/world/test3.js",
    ];
    const tree = pathsToTree(MOCK_PATHS, {
      parseFile: (path) => [{ path, test: path }],
    });
    expect(tree).toEqual([
      {
        name: "sendie",
        children: [
          {
            name: "hello",
            children: [
              {
                path: "sendie/hello/test.js",
                test: "sendie/hello/test.js",
              },
            ],
          },
          {
            name: "world",
            children: [
              {
                path: "sendie/world/test2.js",
                test: "sendie/world/test2.js",
              },
              {
                path: "sendie/world/test3.js",
                test: "sendie/world/test3.js",
              },
            ],
          },
        ],
      },
    ]);
  });
});
