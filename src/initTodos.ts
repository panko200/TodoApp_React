import type { Todo } from "./types";
import { v4 as uuid } from "uuid"; // v4 を uuid という名前でインポート

// これは初回起動時のサンプルとしてのタスク。今までの解析とかなんやらのは、利用者にとって初起動時に現れたら割と怖いものだと思われるため。
export const initTodos: Todo[] = [
  {
    id: uuid(), // UUID v4 を生成してIDにセット
    name: "サンプルタスク",
    isDone: false,
    priority: 2,
    deadline: new Date(2026, 11, 31, 17, 30),
  },
];