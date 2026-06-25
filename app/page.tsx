"use client";

import { useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  name: string;
  done: boolean;
  important: boolean;
  order: number;
};

const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const todayLabel = dayLabels[new Date().getDay()];

  async function fetchTodos() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/todos", { cache: "no-store" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "할 일을 불러오지 못했어요.");
      }

      const data = await res.json();
      setTodos(data.todos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  async function addTodo() {
    if (!input.trim()) return;

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: input.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "할 일 추가에 실패했어요.");
      }

      setInput("");
      await fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleDone(todo: Todo) {
    try {
      setError("");

      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          done: !todo.done,
        }),
      });

      if (!res.ok) {
        throw new Error("완료 상태 변경에 실패했어요.");
      }

      await fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
    }
  }

  async function toggleImportant(todo: Todo) {
    try {
      setError("");

      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          important: !todo.important,
        }),
      });

      if (!res.ok) {
        throw new Error("중요 표시 변경에 실패했어요.");
      }

      await fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
    }
  }

  async function deleteTodo(id: string) {
    try {
      setError("");

      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("삭제에 실패했어요.");
      }

      await fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
    }
  }

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.done !== b.done) return Number(a.done) - Number(b.done);
      if (a.important !== b.important) return Number(b.important) - Number(a.important);
      return a.order - b.order;
    });
  }, [todos]);

  return (
    <main className="min-h-screen bg-[#fff8fb] p-3 font-sans text-[#8a8a8a]">
      <section className="relative mx-auto min-h-[360px] w-full max-w-[280px] rounded-[18px] bg-[#fff1f7] px-5 pb-8 pt-6 shadow-[0_10px_30px_rgba(244,177,205,0.25)]">
        {/* menu */}
        <button
          type="button"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-lg leading-none text-[#b8b8b8] shadow-sm"
          title="menu"
        >
          ⋯
        </button>

        {/* day */}
        <div className="mb-4 text-[11px] font-bold tracking-wide text-[#777]">
          {todayLabel}
        </div>

        {/* input */}
        <div className="mb-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
            }}
            placeholder="to do list 입력"
            className="h-8 flex-1 rounded-full border border-[#f3d8e3] bg-white/75 px-3 text-[12px] font-semibold text-[#de6f95] outline-none placeholder:text-[#e7a7bd] focus:border-[#eaa7c0]"
          />
          <button
            onClick={addTodo}
            disabled={submitting}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2a9c2] text-sm font-bold text-white shadow-sm disabled:opacity-50"
            title="추가"
          >
            +
          </button>
        </div>

        {/* error */}
        {error ? (
          <div className="mb-3 rounded-xl bg-white/80 px-3 py-2 text-[10px] font-medium leading-relaxed text-[#d66d8e]">
            {error}
          </div>
        ) : null}

        {/* list */}
        <div className="mt-2">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-8 animate-pulse border-b border-dotted border-[#ead9df]"
                />
              ))}
            </div>
          ) : sortedTodos.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-center text-[12px] font-medium text-[#c7aab5]">
              아직 할 일이 없어요
              <br />
              위에 입력해보세요.
            </div>
          ) : (
            <ul>
              {sortedTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex min-h-[34px] items-center gap-3 border-b border-dotted border-[#ead9df] py-1.5"
                >
                  <button
                    onClick={() => toggleDone(todo)}
                    className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition ${
                      todo.done
                        ? "border-[#9ed6f2] bg-[#9ed6f2] text-white"
                        : "border-[#d9d9d9] bg-transparent text-transparent hover:border-[#9ed6f2]"
                    }`}
                    title="완료"
                  >
                    ✓
                  </button>

                  <button
                    onClick={() => toggleImportant(todo)}
                    className={`min-w-0 flex-1 truncate text-left text-[12px] font-semibold transition ${
                      todo.done
                        ? "text-[#bebebe] line-through"
                        : todo.important
                        ? "text-[#e45f91]"
                        : "text-[#777]"
                    }`}
                    title="중요 표시"
                  >
                    {todo.name}
                  </button>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 text-[13px] font-bold text-[#d8a5b7] transition hover:text-[#e45f91] group-hover:opacity-100"
                    title="삭제"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* bottom plus */}
        <button
          onClick={addTodo}
          disabled={submitting}
          className="mx-auto mt-5 flex h-7 w-7 items-center justify-center rounded-full text-lg font-bold text-[#9ed6f2] transition hover:bg-white/60 disabled:opacity-40"
          title="추가"
        >
          +
        </button>

        {/* footer */}
        <div className="absolute bottom-3 left-0 right-0 text-center text-[7px] font-bold tracking-[0.35em] text-[#e3d4da]">
          TODO WIDGET
        </div>

        {/* refresh */}
        <button
          onClick={fetchTodos}
          className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-sm text-[#b8ddf2] transition hover:bg-white/60"
          title="새로고침"
        >
          ↻
        </button>
      </section>
    </main>
  );
}
