"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Assignment } from "@/lib/types"
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns"

function formatDueDate(dateString: string) {
  const date = new Date(dateString)
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  if (isPast(date)) return `${formatDistanceToNow(date)} ago`
  return format(date, "MMM d")
}

export function AssignmentList({
  assignments,
  showClass = false,
}: {
  assignments: Assignment[]
  showClass?: boolean
}) {
  const router = useRouter()

  const toggleComplete = async (assignment: Assignment) => {
    const supabase = createClient()
    await supabase
      .from("assignments")
      .update({ completed: !assignment.completed })
      .eq("id", assignment.id)
    router.refresh()
  }

  if (assignments.length === 0) {
    return <p className="text-sm text-muted-foreground">No assignments</p>
  }

  return (
    <div className="space-y-2">
      {assignments.map((assignment) => {
        const isOverdue = isPast(new Date(assignment.due_date)) && !assignment.completed
        return (
          <div
            key={assignment.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-colors",
              assignment.completed ? "bg-muted/50" : "bg-card hover:bg-muted/30",
              isOverdue && !assignment.completed && "border-destructive/50"
            )}
          >
            <Checkbox
              checked={assignment.completed}
              onCheckedChange={() => toggleComplete(assignment)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p
                  className={cn(
                    "font-medium text-sm",
                    assignment.completed && "line-through text-muted-foreground"
                  )}
                >
                  {assignment.title}
                </p>
                <span
                  className={cn(
                    "text-xs whitespace-nowrap",
                    isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                  )}
                >
                  {formatDueDate(assignment.due_date)}
                </span>
              </div>
              {showClass && assignment.classes && (
                <Badge
                  variant="secondary"
                  className="mt-1 text-xs"
                  style={{
                    backgroundColor: `${assignment.classes.color}20`,
                    color: assignment.classes.color,
                  }}
                >
                  {assignment.classes.name}
                </Badge>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
