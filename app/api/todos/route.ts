import { NextResponse } from "next/server"
import {
  getDatabaseId,
  getNotionClient,
  getTodayInKorea,
  mapNotionPageToTodo,
  sortTodos
} from "@/lib/notion"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const notion = getNotionClient()
    const databaseId = getDatabaseId()
    const today = getTodayInKorea()

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Date",
        date: {
          equals: today
        }
      }
    })

    const todos = sortTodos(response.results.map(mapNotionPageToTodo))

    return NextResponse.json({ todos, today })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch todos"

    return NextResponse.json(
      {
        error: message,
        hint: "Check NOTION_TOKEN, NOTION_DATABASE_ID, database connection, and property names: Name, Date, Done, Important, Order."
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const notion = getNotionClient()
    const databaseId = getDatabaseId()
    const today = getTodayInKorea()
    const body = await request.json()
    const name = String(body.name || "").trim()

    if (!name) {
      return NextResponse.json({ error: "Todo name is required" }, { status: 400 })
    }

    const existing = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Date",
        date: {
          equals: today
        }
      }
    })

    const existingTodos = existing.results.map(mapNotionPageToTodo)
    const nextOrder = existingTodos.length
      ? Math.max(...existingTodos.map((todo) => todo.order || 0)) + 1
      : 1

    const page = await notion.pages.create({
      parent: {
        database_id: databaseId
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name
              }
            }
          ]
        },
        Date: {
          date: {
            start: today
          }
        },
        Done: {
          checkbox: false
        },
        Important: {
          checkbox: false
        },
        Order: {
          number: nextOrder
        }
      }
    })

    return NextResponse.json({ todo: mapNotionPageToTodo(page) }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create todo"

    return NextResponse.json(
      {
        error: message,
        hint: "If Notion says property not found, check the database property names exactly."
      },
      { status: 500 }
    )
  }
}
