import type { Data } from "@puckeditor/core";

export function emptyPuckPage(title = "Untitled page"): Data {
  return {
    root: {
      props: {
        title,
        description: "",
      },
    },
    content: [],
  } as Data;
}
