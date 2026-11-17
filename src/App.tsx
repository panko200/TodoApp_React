import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Todo } from "./types";
import { PRIORITY_OPTIONS } from "./types";
import { initTodos } from "./initTodos";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";
import { v4 as uuid } from "uuid";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const localStorageKey = "TodoApp";
const userNameStorageKey = "TodoApp_UserName";
const PRESET_MINUTES = [5, 15, 25, 60];

type FilterStatus = "all" | "active" | "done";
type SortBy = "default" | "deadline" | "priority";

type StoredTodo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: string | null;
};

const loadTodos = (): Todo[] => {
  const todoJsonStr = localStorage.getItem(localStorageKey);
  if (todoJsonStr === null) {
    return initTodos;
  }

  const storedTodos: StoredTodo[] = JSON.parse(todoJsonStr);
  return storedTodos.map((todo) => ({
    ...todo,
    deadline: todo.deadline === null ? null : new Date(todo.deadline),
  }));
};

const loadUserName = (): string => {
  return localStorage.getItem(userNameStorageKey) ?? "";
};

const formatTimer = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
};

const App = () => {
  // 初回アクセス判定用のユーザー名
  const [userName, setUserName] = useState<string>(loadUserName);
  const [nameInput, setNameInput] = useState("");

  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(3);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [isNameTouched, setIsNameTouched] = useState(false);

  // 絞り込み・並び替え・検索用の状態
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [searchText, setSearchText] = useState("");

  // 制限時間カウントダウンタイマー用の状態
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const timerId = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [isTimerRunning]);

  // 初回ユーザー名登録の処理
  const handleRegisterName = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed === "") return;
    localStorage.setItem(userNameStorageKey, trimmed);
    setUserName(trimmed);
    setNameInput("");
  };

  // 名前変更（登録画面へ戻る）
  const handleResetName = () => {
    localStorage.removeItem(userNameStorageKey);
    setUserName("");
  };

  // もし、名前が未登録なら、メイン画面にもっていかずに最初の登録画面だけを表示する
  if (userName === "") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <form
          onSubmit={handleRegisterName}
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-md"
        >
          <h1 className="text-2xl font-bold text-slate-800">
            TodoAppへようこそ
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            あなたの名前を教えてください。
            <br />
            名前変更は後からでもできます。
          </p>

          <div className="mt-4">
            <label
              htmlFor="userNameInput"
              className="mb-1 block text-sm font-bold text-slate-700"
            >
              お名前
            </label>
            <input
              id="userNameInput"
              type="text"
              required
              maxLength={20}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="例 タロウ"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={nameInput.trim() === ""}
            className="mt-4 w-full cursor-pointer rounded-md bg-indigo-500 py-2 font-bold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            はじめる
          </button>
        </form>
      </div>
    );
  }

  const uncompletedCount = todos.filter((todo) => !todo.isDone).length;
  const completedCount = todos.length - uncompletedCount;

  const getTodoNameError = (name: string): string => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 32) {
      return "前後の空白を除いて、2文字以上、32文字以内で入力してください";
    }
    return "";
  };

  const newTodoNameError = getTodoNameError(newTodoName);
  const isNewTodoNameInvalid = newTodoNameError !== "";
  const showNewTodoNameError = isNameTouched && isNewTodoNameInvalid;

  const updateNewTodoName = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodoName(e.target.value);
    setIsNameTouched(true);
  };

  const updateNewTodoPriority = (e: ChangeEvent<HTMLSelectElement>) => {
    setNewTodoPriority(Number(e.target.value));
  };

  const updateDeadline = (e: ChangeEvent<HTMLInputElement>) => {
    const dt = e.target.value;
    setNewTodoDeadline(dt === "" ? null : new Date(dt));
  };

  const removeCompletedTodos = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.isDone));
  };

  const remove = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    if (activeTodoId === id) {
      setActiveTodoId(null);
      setIsTimerRunning(false);
    }
  };

  const addNewTodo = () => {
    if (isNewTodoNameInvalid) {
      setIsNameTouched(true);
      return;
    }

    const newTodo: Todo = {
      id: uuid(),
      name: newTodoName.trim(),
      isDone: false,
      priority: newTodoPriority,
      deadline: newTodoDeadline,
    };
    setTodos((currentTodos) => [...currentTodos, newTodo]);
    setNewTodoName("");
    setNewTodoPriority(3);
    setNewTodoDeadline(null);
    setIsNameTouched(false);
  };

  const updateIsDone = (id: string, value: boolean) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, isDone: value } : todo,
      ),
    );
    if (value && activeTodoId === id) {
      setIsTimerRunning(false);
    }
  };

  const updateTodo = (
    id: string,
    name: string,
    priority: number,
    deadline: Date | null,
  ) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, name, priority, deadline } : todo,
      ),
    );
  };

  const handleStartTask = (todo: Todo) => {
    setActiveTodoId(todo.id);
    setSecondsLeft(targetMinutes * 60);
    setIsTimerRunning(true);
  };

  const handleChangeTargetMinutes = (minutes: number) => {
    const safeMinutes = Math.min(180, Math.max(1, minutes));
    setTargetMinutes(safeMinutes);
    setSecondsLeft(safeMinutes * 60);
    setIsTimerRunning(false);
  };

  const activeTodo = todos.find((todo) => todo.id === activeTodoId);
  const isTimerFinished = activeTodo !== undefined && secondsLeft === 0;

  const displayedTodos = [...todos]
    .filter((todo) => {
      if (filterStatus === "active") return !todo.isDone;
      if (filterStatus === "done") return todo.isDone;
      return true;
    })
    .filter((todo) =>
      todo.name.toLowerCase().includes(searchText.trim().toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "priority") {
        return a.priority - b.priority;
      }
      if (sortBy === "deadline") {
        if (a.deadline === null && b.deadline === null) return 0;
        if (a.deadline === null) return 1;
        if (b.deadline === null) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-bold text-slate-800">TodoApp</h1>

        <div className="mb-4">
          <WelcomeMessage
            name={userName}
            uncompletedCount={uncompletedCount}
            totalCount={todos.length}
            onResetName={handleResetName}
          />
        </div>

        {/* 作業の制限時間タイマー表示カード */}
        {activeTodo && (
          <div
            className={twMerge(
              "mb-4 rounded-lg p-4 text-white shadow-md transition-colors",
              isTimerFinished ? "bg-emerald-600" : "bg-indigo-600",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white/80">
                  {isTimerFinished
                    ? `${targetMinutes}分間経過しました。お疲れ様です。`
                    : "今取り組んでいるタスク（残り時間）"}
                </div>
                <div className="text-lg font-bold">{activeTodo.name}</div>
              </div>
              <div className="font-mono text-3xl font-bold">
                {formatTimer(secondsLeft)}
              </div>
            </div>

            {/* 制限時間のプリセット＆任意入力 */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="mr-1 text-white/80">時間設定:</span>
              {PRESET_MINUTES.map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => handleChangeTargetMinutes(min)}
                  className={twMerge(
                    "cursor-pointer rounded px-2 py-0.5 font-bold",
                    targetMinutes === min
                      ? "bg-white text-indigo-700"
                      : "bg-white/20 text-white hover:bg-white/30",
                  )}
                >
                  {min}分
                </button>
              ))}
              <label className="ml-1 flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={targetMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!Number.isNaN(val) && val > 0) {
                      handleChangeTargetMinutes(val);
                    }
                  }}
                  className="w-14 rounded bg-white px-1.5 py-0.5 text-center font-bold text-slate-800"
                />
                <span>分</span>
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {!isTimerFinished && (
                <button
                  type="button"
                  onClick={() => setIsTimerRunning((prev) => !prev)}
                  className="cursor-pointer rounded bg-white px-3 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
                >
                  {isTimerRunning ? "一時停止" : "スタート"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSecondsLeft(targetMinutes * 60);
                  setIsTimerRunning(false);
                }}
                className="cursor-pointer rounded bg-white/20 px-3 py-1 text-xs font-bold text-white hover:bg-white/30"
              >
                リセット
              </button>
              <button
                type="button"
                onClick={() => {
                  setSecondsLeft((prev) => prev + 5 * 60);
                  setIsTimerRunning(true);
                }}
                className="cursor-pointer rounded bg-white/20 px-3 py-1 text-xs font-bold text-white hover:bg-white/30"
              >
                +5分延長
              </button>
              <button
                type="button"
                onClick={() => {
                  updateIsDone(activeTodo.id, true);
                  setActiveTodoId(null);
                  setIsTimerRunning(false);
                }}
                className="cursor-pointer rounded bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-900 hover:bg-emerald-300"
              >
                完了にする
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTodoId(null);
                  setIsTimerRunning(false);
                }}
                className="ml-auto cursor-pointer rounded px-2 py-1 text-xs text-white/80 hover:text-white"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* 絞り込み・並び替え・検索バー */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white p-2.5 shadow-sm">
          <div className="flex gap-1">
            {(
              [
                ["all", "すべて"],
                ["active", "未完了"],
                ["done", "完了済み"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilterStatus(key)}
                className={twMerge(
                  "cursor-pointer rounded px-2.5 py-1 text-xs font-bold",
                  filterStatus === key
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="タスクを検索..."
              className="w-36 rounded border border-slate-300 px-2 py-1 text-xs"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              aria-label="並び替え"
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
            >
              <option value="default">追加順</option>
              <option value="deadline">期限が近い順</option>
              <option value="priority">優先度が高い順</option>
            </select>
          </div>
        </div>

        <TodoList
          todos={displayedTodos}
          updateIsDone={updateIsDone}
          updateTodo={updateTodo}
          remove={remove}
          onStartTask={handleStartTask}
          activeTodoId={activeTodoId}
        />

        <button
          type="button"
          onClick={removeCompletedTodos}
          disabled={completedCount === 0}
          className={twMerge(
            "mt-4 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium",
            "bg-rose-500 text-white hover:bg-rose-600",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-rose-500",
          )}
        >
          完了済みのタスクを削除
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addNewTodo();
          }}
          aria-labelledby="newTodoHeading"
          className="mt-4 space-y-3 rounded-md border border-slate-300 bg-white p-4 shadow-sm"
        >
          <h2 id="newTodoHeading" className="text-lg font-bold text-slate-800">
            新しいタスクの追加
          </h2>
          <div>
            <div className="flex items-center space-x-2">
              <label className="font-bold text-slate-700" htmlFor="newTodoName">
                名前
              </label>
              <input
                id="newTodoName"
                name="todoName"
                type="text"
                required
                value={newTodoName}
                onChange={updateNewTodoName}
                aria-invalid={showNewTodoNameError}
                aria-describedby={
                  showNewTodoNameError ? "newTodoNameError" : undefined
                }
                className={twMerge(
                  "min-w-0 grow rounded-md border border-gray-300 p-2",
                  showNewTodoNameError && "border-red-500 outline-red-500",
                )}
                placeholder="2文字以上、32文字以内で入力してください"
              />
            </div>
            {showNewTodoNameError && (
              <div
                id="newTodoNameError"
                aria-live="polite"
                className="ml-10 flex items-center space-x-1 text-sm font-medium text-red-500"
              >
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mr-0.5"
                />
                <div>{newTodoNameError}</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label
              className="font-bold text-slate-700"
              htmlFor="newTodoPriority"
            >
              優先度
            </label>
            <select
              id="newTodoPriority"
              value={newTodoPriority}
              onChange={updateNewTodoPriority}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.stars} {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="font-bold text-slate-700" htmlFor="deadline">
              期限
            </label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={
                newTodoDeadline
                  ? dayjs(newTodoDeadline).format("YYYY-MM-DDTHH:mm:ss")
                  : ""
              }
              onChange={updateDeadline}
              className="max-w-full min-w-0 rounded-md border border-gray-300 px-2 py-0.5"
            />
          </div>

          <button
            type="submit"
            disabled={isNewTodoNameInvalid}
            className={twMerge(
              "cursor-pointer rounded-md px-4 py-1.5",
              "bg-indigo-500 font-bold text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-500",
            )}
          >
            追加
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;