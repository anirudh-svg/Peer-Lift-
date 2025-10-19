import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "counselors" | "analytics">("overview");
  
  const adminProfile = useQuery(api.admins.getAdminProfile);
  const counselors = useQuery(api.admins.getAllCounselors);
  const analytics = useQuery(api.admins.getAnalytics);
  const verifyCounselor = useMutation(api.admins.verifyCounselor);
  const rejectCounselor = useMutation(api.admins.rejectCounselor);

  const handleVerifyCounselor = async (counselorId: Id<"counselors">) => {
    try {
      await verifyCounselor({ counselorId });
      toast.success("Counselor verified successfully");
    } catch (error) {
      toast.error("Failed to verify counselor");
    }
  };

  const handleRejectCounselor = async (counselorId: Id<"counselors">) => {
    if (!confirm("Are you sure you want to reject this counselor? This action cannot be undone.")) {
      return;
    }
    
    try {
      await rejectCounselor({ counselorId });
      toast.success("Counselor rejected");
    } catch (error) {
      toast.error("Failed to reject counselor");
    }
  };

  if (!adminProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage PeerLift platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "counselors", label: "Counselors", icon: "👥" },
            { id: "analytics", label: "Analytics", icon: "📈" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Counselors"
                value={analytics.counselors.total}
                subtitle={`${analytics.counselors.verified} verified`}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Online Now"
                value={analytics.counselors.online}
                subtitle="Available counselors"
                icon="🟢"
                color="green"
              />
              <StatCard
                title="Active Sessions"
                value={analytics.sessions.active}
                subtitle={`${analytics.sessions.today} today`}
                icon="💬"
                color="purple"
              />
              <StatCard
                title="Pending Approval"
                value={analytics.counselors.pending}
                subtitle="Awaiting verification"
                icon="⏳"
                color="yellow"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300">Sessions this week</span>
                    <span className="text-white font-semibold">{analytics.sessions.thisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300">Messages this week</span>
                    <span className="text-white font-semibold">{analytics.messages.thisWeek}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
                    Export Analytics Report
                  </button>
                  <button className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors">
                    Send Platform Announcement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Counselors Tab */}
        {activeTab === "counselors" && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Counselor Management</h3>
                <p className="text-gray-400">Review and manage counselor applications</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Counselor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        NGO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Specializations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {counselors?.map((counselor) => (
                      <tr key={counselor._id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {counselor.user?.name || "No name"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {counselor.user?.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {counselor.ngoName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {counselor.specializations.map((spec) => (
                              <span
                                key={spec}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                counselor.isVerified
                                  ? "bg-green-900 text-green-200"
                                  : "bg-yellow-900 text-yellow-200"
                              }`}
                            >
                              {counselor.isVerified ? "Verified" : "Pending"}
                            </span>
                            {counselor.isOnline && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200">
                                Online
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!counselor.isVerified && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVerifyCounselor(counselor._id)}
                                className="text-green-400 hover:text-green-300 transition-colors"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleRejectCounselor(counselor._id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Platform Health</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Counselor Utilization</span>
                    <span className="text-white font-semibold">
                      {analytics.counselors.online > 0 
                        ? Math.round((analytics.sessions.active / analytics.counselors.online) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${analytics.counselors.online > 0 
                          ? Math.min((analytics.sessions.active / analytics.counselors.online) * 100, 100)
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Growth Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sessions Today</span>
                    <span className="text-green-400 font-semibold">+{analytics.sessions.today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sessions This Week</span>
                    <span className="text-blue-400 font-semibold">{analytics.sessions.thisWeek}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}: { 
  title: string; 
  value: number; 
  subtitle: string; 
  icon: string; 
  color: "blue" | "green" | "purple" | "yellow";
}) {
  const colorClasses = {
    blue: "from-blue-600 to-blue-700",
    green: "from-green-600 to-green-700",
    purple: "from-purple-600 to-purple-700",
    yellow: "from-yellow-600 to-yellow-700",
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm opacity-75">{subtitle}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}
