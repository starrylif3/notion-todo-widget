import { Client } from "@notionhq/client"

export type Todo = {
  id: string
  name: string
  date: string
  done: boolean
  important: boolean
  order: number
  createdTime?: string
}

let notionClient: Client | null = null

export function getNotionClient() {
  const token = process.env.NOTION_TOKEN

  if (!token) {
    throw new Error("Missing NOTION_TOKEN environment variable")
  }

  if (!notionClient) {
    notionClient = new Client({ auth: token })
  }

  return notionClient
}

export function getDatabaseId() {
  const databaseId = process.env.NOTION_DATABASE_ID

  if (!databaseId) {
    throw new Error("Missing NOTION_DATABASE_ID environment variable")
  }

  return databaseId
}

export function getTodayInKorea() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  if (!year || !month || !day) {
    return new Date().toISOString().split("T")[0]
  }

  return `${year}-${month}-${day}`
}

function getPlainTitle(property: any) {
  if (!property || property.type !== "title") return ""

  return property.title
    .map((item: any) => item.plain_text || "")
    .join("")
    .trim()
}

function getDateStart(property: any) {
  if (!property || property.type !== "date") return ""

  return property.date?.start || ""
}

function getCheckbox(property: any) {
  if (!property || property.type !== "checkbox") return false

  return Boolean(property.checkbox)
}

function getNumber(property: any) {
  if (!property || property.type !== "number") return 0

  return typeof property.number === "number" ? property.number : 0
}

export function mapNotionPageToTodo(page: any): Todo {
  const properties = page.properties || {}

  return {
    id: page.id,
    name: getPlainTitle(properties.Name),
    date: getDateStart(properties.Date),
    done: getCheckbox(properties.Done),
    important: getCheckbox(properties.Important),
    order: getNumber(properties.Order),
    createdTime: page.created_time
  }
}

export function sortTodos(todos: Todo[]) {
  return [...todos].sort((a, b) => {
    if (a.done !== b.done) return Number(a.done) - Number(b.done)
    if (a.important !== b.important) return Number(b.important) - Number(a.important)
    if (a.order !== b.order) return a.order - b.order

    return (a.createdTime || "").localeCompare(b.createdTime || "")
  })
}
