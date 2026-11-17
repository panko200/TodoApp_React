import { useState } from "react";
import type { Todo } from "./types";
import { PRIORITY_OPTIONS } from "./types";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faPersonDigging } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type Props = {
  todo: Todo;
  updateIsDone: (id: string, value: boolean) => void;
  updateTodo: (
    id: string,
    name: string,
    priority: number,
    deadline: Date | null,
  ) => void;
  remove: (id: string) => void;
  onStartTask: (todo: Todo) => void;
  isWorking: boolean;
};

const formattedDate = (date: Date) => {
  if (date.getHours() === 0 && date.getMinutes() === 0) {
    return dayjs(date).format("YYYY/MM/DD");
  }
  return dayjs(date).format("YYYY/MM/DD HH:mm");
};

const getDeadlineBadge = (deadline: Date) => {
  const diffMinutes = dayjs(deadline).diff(dayjs(), "minute");
  if (diffMinutes < 0) {
    return {
      label: "期限切れ",
      className: "border-red-300 bg-red-100 text-red-700",
    };
  }
  if (diffMinutes < 60) {
    return {
      label: `あと${diffMinutes}分`,
      className: "border-amber-300 bg-amber-100 text-amber-800",
    };
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return {
      label: `あと${diffHours}時間`,
      className: "border-amber-300 bg-amber-100 text-amber-800",
    };
  }
  const diffDays = Math.ceil(diffHours / 24);
  return {
    label: `あと${diffDays}日`,
    className: "border-sky-200 bg-sky-50 text-sky-700",
  };
};

const TodoItem = (props: Props) => {
  const todo = props.todo;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(todo.name);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editDeadline, setEditDeadline] = useState<Date | null>(todo.deadline);

  const handleOpenEdit = () => {
    setEditName(todo.name);
    setEditPriority(todo.priority);
    setEditDeadline(todo.deadline);
    setIsEditing(true);
  };

  const trimmedEditName = editName.trim();
  const isEditInvalid =
    trimmedEditName.length < 2 || trimmedEditName.length > 32;

  const handleSaveEdit = () => {
    if (isEditInvalid) return;
    props.updateTodo(todo.id, trimmedEditName, editPriority, editDeadline);
    setIsEditing(false);
  };

  // 編集モードの画面
  if (isEditing) {
    return (
      <div className="space-y-2 rounded-md border-2 border-indigo-400 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="2文字以上、32文字以内で入力してください"
            className="min-w-0 grow rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(Number(e.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.stars} {option.label}
              </option>
            ))}
          </select>
        </div>

        {isEditInvalid && (
          <div className="text-xs font-medium text-red-500">
            前後の空白を除いて、2文字以上、32文字以内で入力してください
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">期限</span>
            <input
              type="datetime-local"
              value={
                editDeadline
                  ? dayjs(editDeadline).format("YYYY-MM-DDTHH:mm:ss")
                  : ""
              }
              onChange={(e) =>
                setEditDeadline(
                  e.target.value === "" ? null : new Date(e.target.value),
                )
              }
              className="rounded-md border border-slate-300 px-2 py-0.5 text-xs"
            />
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="cursor-pointer rounded-md bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isEditInvalid}
              className="cursor-pointer rounded-md bg-indigo-500 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 通常
  const priorityInfo =
    PRIORITY_OPTIONS.find((p) => p.value === todo.priority) ??
    PRIORITY_OPTIONS[2];
  const badge =
    todo.deadline && !todo.isDone ? getDeadlineBadge(todo.deadline) : null;

  return (
    <div
      className={twMerge(
        "flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-4 py-2.5 drop-shadow-sm transition sm:flex-nowrap",
        props.isWorking && "border-indigo-500 ring-2 ring-indigo-300",
      )}
    >
      <div
        className={twMerge(
          "flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1",
          todo.isDone && "opacity-50",
        )}
      >
        <label className="flex min-w-0 cursor-pointer items-center">
          <input
            type="checkbox"
            checked={todo.isDone}
            onChange={(e) => props.updateIsDone(todo.id, e.target.checked)}
            className="mr-3 shrink-0 cursor-pointer"
          />
          <FontAwesomeIcon
            icon={faPersonDigging}
            className="mr-2 shrink-0 text-slate-500"
          />
          <span
            className={twMerge(
              "min-w-0 text-lg font-medium wrap-anywhere text-slate-700",
              todo.isDone && "line-through",
            )}
          >
            {todo.name}
          </span>
        </label>

        <span
          className={twMerge(
            "rounded border px-1.5 py-0.5 text-xs font-bold",
            priorityInfo.badgeClass,
          )}
        >
          {priorityInfo.stars} {priorityInfo.label}
        </span>

        {todo.deadline && (
          <span className="flex items-center text-sm text-slate-500">
            <FontAwesomeIcon icon={faClock} className="mr-1" />
            {formattedDate(todo.deadline)}
          </span>
        )}

        {badge && (
          <span
            className={twMerge(
              "rounded-md border px-2 py-0.5 text-xs font-bold",
              badge.className,
            )}
          >
            {badge.label}
          </span>
        )}

        {todo.isDone && (
          <span className="rounded-md bg-slate-800 px-3 py-0.5 text-xs font-medium text-white">
            完了済み
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {!todo.isDone && (
          <button
            type="button"
            onClick={() => props.onStartTask(todo)}
            className={twMerge(
              "cursor-pointer rounded-md px-2.5 py-1 text-xs font-bold text-white",
              props.isWorking
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-indigo-500 hover:bg-indigo-600",
            )}
          >
            {props.isWorking ? "作業中" : "作業する"}
          </button>
        )}
        <button
          type="button"
          onClick={handleOpenEdit}
          className="cursor-pointer rounded-md bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300"
        >
          編集
        </button>
        <button
          type="button"
          onClick={() => props.remove(todo.id)}
          aria-label={`${todo.name}を削除`}
          className="cursor-pointer rounded-md bg-rose-400 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-500"
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default TodoItem;