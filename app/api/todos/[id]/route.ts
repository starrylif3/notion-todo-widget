import { NextResponse } from "next/server"
import { getNotionClient, mapNotionPageToTodo } from "@/lib/notion"

type RouteContext = {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const notion = getNotionClient()
    const id = context.params.id
    const body = await request.json()
    const properties: Record<string, any> = {}

    if (typeof body.name === "string") {
      properties.Name = {
        title: [
          {
            text: {
              content: body.name.trim()
            }
          }
        ]
      }
    }

    if (typeof body.done === "boolean") {
      properties.Done = {
        checkbox: body.done
      }
    }

    if (typeof body.important === "boolean") {
      properties.Important = {
        checkbox: body.important
      }
    }

    if (typeof body.order === "number") {
      properties.Order = {
        number: body.order
      }
    }

    if (Object.keys(properties).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const page = await notion.pages.update({
      page_id: id,
      properties
    })

    return NextResponse.json({ todo: mapNotionPageToTodo(page) })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update todo"

    return NextResponse.json(
      {
        error: message,
        hint: "Check that the todo page still exists and the integration has access."
      },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const notion = getNotionClient()
    const id = context.params.id

    await notion.pages.update({
      page_id: id,
      archived: true
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete todo"

    return NextResponse.json(
      {
        error: message,
        hint: "Delete archives the Notion page instead of permanently deleting it."
      },
      { status: 500 }
    )
  }
}
