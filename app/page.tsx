"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"

type Todo = {
  id: string
  name: string
  date: string
  done: boolean
  important: boolean
  order: number
  createdTime?: string
}

function sortTodos(todos: Todo[]) {
  return [...todos].sort((a, b) => {
    if (a.done !== b.done) return Number(a.done) - Number(b.done)
    if (a.important !== b.important) return Number(b.important) - Number(a.important)
    if (a.order !== b.order) return a.order - b.order
    return (a.createdTime || "").localeCompare(b.createdTime || "")
  })
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")
  const [today, setToday] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const remainingCount = useMemo(() => todos.filter((todo) => !todo.done).length, [todos])
  const doneCount = useMemo(() => todos.filter((todo) => todo.done).length, [todos])

  async function loadTodos() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/todos", {
        cache: "no-store"
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "투두를 불러오지 못했어요.")
      }

      setTodos(sortTodos(data.todos || []))
      setToday(data.today || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "투두를 불러오지 못했어요.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  async function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = input.trim()
    if (!name || saving) return

    try {
      setSaving(true)
      setError("")

      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "할 일을 추가하지 못했어요.")
      }

      setTodos((current) => sortTodos([...current, data.todo]))
      setInput("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "할 일을 추가하지 못했어요.")
    } finally {
      setSaving(false)
    }
  }

  async function updateTodo(id: string, updates: Partial<Pick<Todo, "name" | "done" | "important" | "order">>) {
    const previous = todos
    const optimistic = todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
    setTodos(sortTodos(optimistic))

    try {
      setError("")

      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "수정하지 못했어요.")
      }

      setTodos((current) =>
        sortTodos(current.map((todo) => (todo.id === id ? { ...todo, ...data.todo } : todo)))
      )
    } catch (err) {
      setTodos(previous)
      setError(err instanceof Error ? err.message : "수정하지 못했어요.")
    }
  }

  async function deleteTodo(id: string) {
    const previous = todos
    setTodos((current) => current.filter((todo) => todo.id !== id))

    try {
      setError("")

      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE"
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "삭제하지 못했어요.")
      }
    } catch (err) {
      setTodos(previous)
      setError(err instanceof Error ? err.message : "삭제하지 못했어요.")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fff8f1] via-[#fff5f7] to-[#f7fbff] p-3 text-[#49383b] sm:p-4">
      <section className="mx-auto w-full max-w-[520px] rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-soft backdrop-blur sm:p-5">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d68e99]">notion todo</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#49383b]">오늘의 할 일</h1>
            <p className="mt-1 text-xs text-[#9b7d80]">{today || "Asia/Seoul"}</p>
          </div>

          <button
            type="button"
            onClick={loadTodos}
            className="rounded-full border border-[#f4c7cf] bg-white/80 px-3 py-2 text-xs font-bold text-[#b45f70] transition hover:-translate-y-0.5 hover:bg-[#fff2f5] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            aria-label="새로고침"
          >
            ↻
          </button>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-[#fff2d9] px-3 py-2">
            <p className="text-[11px] font-bold text-[#9d7460]">남은 할 일</p>
            <p className="text-xl font-black text-[#6d4a3e]">{remainingCount}</p>
          </div>
          <div className="rounded-2xl bg-[#eef7ed] px-3 py-2">
            <p className="text-[11px] font-bold text-[#6f8a72]">완료</p>
            <p className="text-xl font-black text-[#45664b]">{doneCount}</p>
          </div>
        </div>

        <form onSubmit={addTodo} className="mb-4 flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="할 일을 적어줘"
            className="min-w-0 flex-1 rounded-2xl border border-[#f5ccd1] bg-white px-4 py-3 text-sm font-medium outline-none transition placeholder:text-[#c8abad] focus:border-[#d98b98] focus:ring-4 focus:ring-[#f8dce1]"
          />
          <button
            type="submit"
            disabled={!input.trim() || saving}
            className="rounded-2xl bg-[#e78ea0] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#e78ea0]/25 transition hover:-translate-y-0.5 hover:bg-[#da7f92] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saving ? "..." : "+"}
          </button>
        </form>

        {error ? (
          <div className="mb-3 rounded-2xl border border-[#ffd1d1] bg-[#fff1f1] px-3 py-2 text-xs font-semibold text-[#bb4b4b]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
        ) : todos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#ecc1c8] bg-white/55 px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f3] text-xl">✓</div>
            <p className="text-sm font-bold text-[#8b7074]">아직 할 일이 없어요</p>
            <p className="mt-1 text-xs text-[#b09397]">위 입력창에 오늘 할 일을 추가해봐.</p>
          </div>
        ) : (
          <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`group flex items-center gap-2 rounded-2xl border px-3 py-3 transition ${
                  todo.done
                    ? "border-[#e9e2df] bg-white/45 opacity-70"
                    : todo.important
                      ? "border-[#f2b0bc] bg-[#fff0f3]"
                      : "border-white bg-white/75"
                }`}
              >
                <button
                  type="button"
                  onClick={() => updateTodo(todo.id, { done: !todo.done })}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-black transition ${
                    todo.done
                      ? "border-[#9bb78d] bg-[#dff0d9] text-[#4b7943]"
                      : "border-[#efbac4] bg-white text-transparent hover:text-[#d98b98]"
                  }`}
                  aria-label={todo.done ? "완료 취소" : "완료"}
                >
                  ✓
                </button>

                <span
                  className={`min-w-0 flex-1 break-words text-sm font-semibold ${
                    todo.done ? "text-[#9b8c8c] line-through" : "text-[#49383b]"
                  }`}
                >
                  {todo.name}
                </span>

                <button
                  type="button"
                  onClick={() => updateTodo(todo.id, { important: !todo.important })}
                  className={`rounded-full px-2 py-1 text-sm transition hover:-translate-y-0.5 ${
                    todo.important ? "bg-[#ffdce3] text-[#c34b67]" : "bg-transparent text-[#c7a2a8]"
                  }`}
                  aria-label={todo.important ? "중요 해제" : "중요 표시"}
                >
                  ♥
                </button>

                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="rounded-full px-2 py-1 text-sm font-bold text-[#c9a5a8] transition hover:bg-[#fff1f1] hover:text-[#bb4b4b]"
                  aria-label="삭제"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
