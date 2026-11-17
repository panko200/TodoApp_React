import type { Todo } from "./types";
import TodoItem from "./TodoItem";

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  updateTodo: (
    id: string,
    name: string,
    priority: number,
    deadline: Date | null,
  ) => void;
  remove: (id: string) => void;
  onStartTask: (todo: Todo) => void;
  activeTodoId: string | null;
};

const TodoList = (props: Props) => {
  const todos = props.todos;

  if (todos.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        条件に一致するタスクはありません。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          updateIsDone={props.updateIsDone}
          updateTodo={props.updateTodo}
          remove={props.remove}
          onStartTask={props.onStartTask}
          isWorking={todo.id === props.activeTodoId}
        />
      ))}
    </div>
  );
};

export default TodoList;