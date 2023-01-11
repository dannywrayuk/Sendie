import { constructTree } from "./constructTree";

test("test", () => {
  const x = constructTree({
    fileInfo: { root: "", globString: "**/*.sendie.{js,json}" },
    itemBuilders: {
      match: (item) => item.type,
      request: (itemInfo, data) => ({
        ...itemInfo,
        label: data.name,
        icon: "mail",
      }),
      collection: (itemInfo, data, callback) => ({
        ...itemInfo,
        label: data.name,
        icon: "collection",
        children: callback(data.children),
      }),
    },
  });
  console.log(JSON.stringify(x, null, 2));
});
