import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GraduationCap, ClipboardList, Clock, CheckCircle2, Plus } from "lucide-react"
import Link from "next/link"
import type { Assignment, Class } from "@/lib/types"
import { AssignmentList } from "@/components/assignment-list"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("user_id", user?.id)
    .order("name")

  const { data: assignments } = await supabase
    .from("assignments")
    .select("*, classes(*)")
    .eq("user_id", user?.id)
    .order("due_date", { ascending: true })

  const upcomingAssignments = (assignments as Assignment[] | null)?.filter(
    (a) => !a.completed && new Date(a.due_date) >= new Date()
  ) ?? []

  const overdueAssignments = (assignments as Assignment[] | null)?.filter(
    (a) => !a.completed && new Date(a.due_date) < new Date()
  ) ?? []

  const completedCount = (assignments as Assignment[] | null)?.filter((a) => a.completed).length ?? 0
  const totalAssignments = assignments?.length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your academic overview.</p>
        </div>
        <Button asChild>
          <Link href="/classes">
            <Plus className="mr-2 h-4 w-4" />
            Add Assignment
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Assignments due</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalAssignments > 0
                ? `${Math.round((completedCount / totalAssignments) * 100)}% completion rate`
                : "No assignments yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overdue Assignments</CardTitle>
            <CardDescription>
              {overdueAssignments.length === 0
                ? "Great job! No overdue assignments."
                : `${overdueAssignments.length} assignment${overdueAssignments.length > 1 ? "s" : ""} past due date`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overdueAssignments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                <p>All caught up!</p>
              </div>
            ) : (
              <AssignmentList assignments={overdueAssignments.slice(0, 5)} showClass />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>
              {upcomingAssignments.length === 0
                ? "No upcoming assignments."
                : `Next ${Math.min(upcomingAssignments.length, 5)} assignments`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No upcoming assignments</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/classes">Add your first assignment</Link>
                </Button>
              </div>
            ) : (
              <AssignmentList assignments={upcomingAssignments.slice(0, 5)} showClass />
            )}
          </CardContent>
        </Card>
      </div>

      {classes && classes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Classes</CardTitle>
                <CardDescription>Quick overview of your enrolled courses</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/classes">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(classes as Class[]).map((cls) => (
                <Badge
                  key={cls.id}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm"
                  style={{
                    backgroundColor: `${cls.color}20`,
                    color: cls.color,
                    borderColor: cls.color,
                  }}
                >
                  {cls.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!classes || classes.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Get started with StudyHub</h3>
            <p className="text-muted-foreground mb-4">
              Add your first class to start tracking assignments and deadlines.
            </p>
            <Button asChild>
              <Link href="/classes">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Class
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
