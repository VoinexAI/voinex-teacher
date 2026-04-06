"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TeacherInfoCard } from "@/components/teacher-info-card"
import { SubscriptionCard } from "@/components/subscription-card"
import { APIUsageCard } from "@/components/api-usage-card"
import { StudentsList } from "@/components/students-list"
import { fetchTeacherCompleteData, type TeacherCompleteData } from "@/lib/api-client"
import { AlertCircle, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
// import { APIUsagePieChart } from "@/components/Chart/lineChart"

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<TeacherCompleteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const teacherData = localStorage.getItem("teacherData")
        const teacherCode = localStorage.getItem("teacherCode")

        console.log("[Dashboard] Auth Token:", !!token)
        console.log("[Dashboard] Teacher Data:", teacherData)
        console.log("[Dashboard] Teacher Code in LS:", teacherCode)

        let finalTeacherCode = teacherCode

        if (teacherData && !finalTeacherCode) {
          try {
            const parsed = JSON.parse(teacherData)
            finalTeacherCode = parsed.teacherCode || parsed.teacher_code
            console.log("[Dashboard] Extracted teacher code:", finalTeacherCode)
          } catch (e) {
            console.error("[Dashboard] Error parsing teacherData:", e)
          }
        }

        if (!token) {
          console.error("[Dashboard] No auth token")
          router.push("/login")
          return
        }

        if (!finalTeacherCode) {
          console.error("[Dashboard] Teacher code missing")
          setError("Teacher code not found. Please login again.")
          setTimeout(() => router.push("/login"), 1500)
          return
        }

        console.log("[Dashboard] Using teacher code:", finalTeacherCode)
        const data = await fetchTeacherCompleteData(finalTeacherCode)
        console.log("[Dashboard] Data loaded:", data)
        setDashboardData(data)
      } catch (err: any) {
        console.error("[Dashboard] Error:", err)
        setError(err.message || "Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="bg-destructive/10 border border-destructive/30 p-4 sm:p-6 rounded-xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Error</h3>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        </Card>
      </DashboardLayout>
    )
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <Card className="bg-card border border-border p-8 rounded-xl text-center">
          <p className="text-muted-foreground">No data available</p>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            {dashboardData.teacher.name}'s Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Manage your school and monitor student activities
          </p>
        </div>

        {/* Teacher Info + Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TeacherInfoCard teacher={dashboardData.teacher} />
          <SubscriptionCard subscription={dashboardData.subscription}/>
        </div>

        {/* API Usage
        <APIUsageCard usage={dashboardData.api_usage} /> */}

        {/* Summary Stats */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <Card className="bg-card border p-4 sm:p-6 rounded-xl text-center">
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total Students</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {dashboardData.summary.total_students}
              </p>
            </Card>

            <Card className="bg-card border p-4 sm:p-6 rounded-xl text-center">
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total Ideas</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {dashboardData.summary.total_ideas}
              </p>
            </Card>

            <Card className="bg-card border p-4 sm:p-6 rounded-xl text-center">
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total Chats</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {dashboardData.summary.total_chats}
              </p>
            </Card>

            {/* <Card className="bg-card border p-4 sm:p-6 rounded-xl text-center">
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">API Hits</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {dashboardData.summary.total_api_hits}
              </p>
            </Card> */}

            <Card className="bg-card border p-4 sm:p-6 rounded-xl text-center">
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">Projects</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {dashboardData.summary.total_projects}
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 p-4 sm:p-6 rounded-xl text-center">
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total API Usage</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {dashboardData.summary.total_api_usage || 0}
              </p>
            </Card>
          </div>

          {/* Detailed API Breakdown */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4">
            <Card className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Damini AI Usage</p>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData.summary.total_damini_usage || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ({dashboardData.api_usage.damini_usage?.percentage || 0}% of total)
              </p>
            </Card>

            <Card className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Project Builder Usage</p>
              <p className="text-2xl font-bold text-purple-600">
                {dashboardData.summary.total_project_builder_usage || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ({dashboardData.api_usage.project_builder_usage?.percentage || 0}% of total)
              </p>
            </Card>
          </div> */}
          {/* <APIUsagePieChart dashboardData={dashboardData}/> */}
        </div>

        {/* Students List */}
        <StudentsList students={dashboardData.students} />
      </div>
    </DashboardLayout>
  )
}