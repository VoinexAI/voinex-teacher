"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CreditCard, Download, RotateCw, AlertCircle, Users, TrendingUp, Activity, Zap, CheckCircle, XCircle } from "lucide-react"

const API_BASE_URL = "https://www.voinex.in/api"

async function fetchTeacherCompleteData(teacherCode: string) {
  const url = `${API_BASE_URL}/teacher/${teacherCode}/complete/`
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) throw new Error(`API Error: ${response.status}`)
  return await response.json()
}

export function SubscriptionManagement() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teacherCode, setTeacherCode] = useState("")

  useEffect(() => {
    // Get teacher code from localStorage
    const storedTeacherCode = localStorage.getItem("teacherCode")
    const storedTeacherData = localStorage.getItem("teacherData")
    
    if (storedTeacherCode) {
      setTeacherCode(storedTeacherCode)
    } else if (storedTeacherData) {
      try {
        const parsed = JSON.parse(storedTeacherData)
        if (parsed.teacherCode) {
          setTeacherCode(parsed.teacherCode)
        }
      } catch (e) {
        console.error("Error parsing teacherData:", e)
      }
    }
  }, [])

  useEffect(() => {
    if (!teacherCode) return

    async function loadData() {
      try {
        setLoading(true)
        const apiResult = await fetchTeacherCompleteData(teacherCode)
        setData(apiResult)
        setError(null)
      } catch (err: any) {
        setError(err.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [teacherCode])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading subscription data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="bg-card border border-border p-8 rounded-xl max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground">{error || "Failed to load subscription data"}</p>
          </div>
        </Card>
      </div>
    )
  }

  const { subscription, pricing_plan, user_limits, daily_usage, api_usage, teacher, summary, billing_history }: any = data
  const schoolName = teacher.institution || "Not specified"

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Students</p>
              <p className="text-2xl font-bold text-foreground">{summary.total_students}</p>
              <p className="text-xs text-muted-foreground mt-1">{user_limits.available_slots} slots available</p>
            </div>
            <Users className="w-8 h-8 text-primary opacity-80" />
          </div>
        </Card>

        <Card className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">API Usage</p>
              <p className="text-2xl font-bold text-foreground">{api_usage.usage_percentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">{api_usage.used.toLocaleString()} / {api_usage.limit.toLocaleString()}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500 opacity-80" />
          </div>
        </Card>

        <Card className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Daily Hits</p>
              <p className="text-2xl font-bold text-foreground">{daily_usage.usage_percentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">{daily_usage.today_hits.toLocaleString()} / {daily_usage.daily_limit.toLocaleString()}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500 opacity-80" />
          </div>
        </Card>

        <Card className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Days Remaining</p>
              <p className="text-2xl font-bold text-foreground">{subscription.days_remaining}</p>
              <p className="text-xs text-muted-foreground mt-1">Until {new Date(subscription.end_date).toLocaleDateString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500 opacity-80" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <Card className="bg-card border border-border p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{pricing_plan.plan_name}</h2>
                <p className="text-sm text-muted-foreground">{teacher.name} • {teacher.email}</p>
                {schoolName !== "Not specified" && (
                  <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Institution:</span> {schoolName}</p>
                )}
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${subscription.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {subscription.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="text-4xl font-bold text-primary mb-6">${pricing_plan.price_usd.toFixed(2)}<span className="text-lg text-muted-foreground">/month</span></div>

            <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Started</p>
                <p className="text-base font-semibold text-foreground">{new Date(subscription.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Renews</p>
                <p className="text-base font-semibold text-foreground">{new Date(subscription.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Days Left</p>
                <p className="text-base font-semibold text-foreground">{subscription.days_remaining} days</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground mb-3">Plan Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Community Access", value: pricing_plan.features.has_community },
                  { label: "Live Data", value: pricing_plan.features.has_live_data },
                  { label: "Code Base", value: pricing_plan.features.has_code_base },
                  { label: "Multi Sensor", value: pricing_plan.features.has_multi_sensor },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {feature.value ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm text-foreground">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Daily Hit Limit</p>
                  <p className="font-semibold text-foreground">{pricing_plan.hits_per_day.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">User Slots</p>
                  <p className="font-semibold text-foreground">{user_limits.used_slots} / {user_limits.total_slots}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Teacher Code</p>
                  <p className="font-mono text-xs font-semibold text-foreground">{teacher.teacher_code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Invitation Code</p>
                  <p className="font-mono text-xs font-semibold text-foreground">{teacher.invitation_code}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* API Usage Breakdown */}
          <Card className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-lg font-bold text-foreground mb-4">AI Service Usage Breakdown</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Damini AI (Workspace Assistant)</span>
                  <span className="text-sm font-bold text-primary">{api_usage.damini_usage.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${api_usage.damini_usage.percentage}%`}}></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>Total: {api_usage.damini_usage.total_usage.toLocaleString()}</div>
                  <div>Teacher: {api_usage.damini_usage.teacher_usage.toLocaleString()}</div>
                  <div>Students: {api_usage.damini_usage.student_usage.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Project Builder</span>
                  <span className="text-sm font-bold text-primary">{api_usage.project_builder_usage.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${api_usage.project_builder_usage.percentage}%`}}></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>Total: {api_usage.project_builder_usage.total_usage.toLocaleString()}</div>
                  <div>Teacher: {api_usage.project_builder_usage.teacher_usage.toLocaleString()}</div>
                  <div>Students: {api_usage.project_builder_usage.student_usage.toLocaleString()}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monthly API Limit</p>
                    <p className="text-lg font-bold text-foreground">{api_usage.limit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                    <p className="text-lg font-bold text-green-500">{api_usage.remaining.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Resets on: {new Date(api_usage.reset_date).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>

          {/* Billing History */}
          <Card className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Billing History</h3>
            {billing_history && billing_history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-input border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Invoice</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billing_history.map((invoice: any) => (
                      <tr key={invoice.id} className="border-b border-border hover:bg-input/50">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{invoice.invoice_number}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">
                          {invoice.currency === 'USD' ? `$${invoice.amount_usd.toFixed(2)}` : `₹${invoice.amount_inr.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{invoice.payment_method}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">Paid</span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-primary hover:underline font-semibold flex items-center gap-1 text-sm">
                            <Download size={14} />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No billing history available</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <Card className="bg-card border border-border p-6 rounded-xl">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button onClick={() => window.location.href = 'https://www.voinex.in/dashboard/subscription'} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 flex items-center justify-center gap-2">
                <RotateCw size={16} />
                Upgrade Plan
              </button>
            </div>
          </Card>

          <Card className="bg-primary/10 border border-primary/30 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm mb-2">Daily Usage Status</p>
                <p className="text-xs text-muted-foreground mb-1">Today: {daily_usage.today_hits.toLocaleString()} / {daily_usage.daily_limit.toLocaleString()} hits</p>
                <p className="text-xs text-muted-foreground">Remaining: {daily_usage.remaining_hits.toLocaleString()} hits</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-primary h-1.5 rounded-full" style={{width: `${daily_usage.usage_percentage}%`}}></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-card border border-border p-4 rounded-xl">
            <h4 className="font-semibold text-foreground text-sm mb-3">Activity Summary</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Ideas</span>
                <span className="font-semibold text-foreground">{summary.total_ideas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Chats</span>
                <span className="font-semibold text-foreground">{summary.total_chats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Projects</span>
                <span className="font-semibold text-foreground">{summary.total_projects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total API Hits</span>
                <span className="font-semibold text-foreground">{summary.total_api_hits.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}