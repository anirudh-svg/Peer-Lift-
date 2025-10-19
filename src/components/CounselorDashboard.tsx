import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function CounselorDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Id<"chatSessions"> | null>(null);
  const [message, setMessage] = useState("");

  const counselorProfile = useQuery(api.counselors.getCounselorProfile);
  const updateOnlineStatus = useMutation(api.counselors.updateOnlineStatus);
  const waitingSessions = useQuery(api.chatSessions.getWaitingSessions);
  const activeSessions = useQuery(api.chatSessions.getCounselorSessions);
  const joinSession = useMutation(api.chatSessions.joinSession);
  const sendMessage = useMutation(api.messages.sendMessage);
  const endSession = useMutation(api.chatSessions.endSession);
  
  const messages = useQuery(api.messages.getSessionMessages, 
    selectedSession ? { sessionId: selectedSession } : "skip"
  );

  // Update online status
  const handleToggleOnline = async () => {
    try {
      await updateOnlineStatus({ isOnline: !isOnline });
      setIsOnline(!isOnline);
      toast.success(isOnline ? "You're now offline" : "You're now online");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Join a waiting session
  const handleJoinSession = async (sessionId: Id<"chatSessions">) => {
    try {
      await joinSession({ sessionId });
      setSelectedSession(sessionId);
      toast.success("Joined chat session");
    } catch (error) {
      toast.error("Failed to join session");
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedSession) return;

    try {
      await sendMessage({
        sessionId: selectedSession,
        content: message.trim(),
        senderType: "counselor",
      });
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  // End session
  const handleEndSession = async () => {
    if (!selectedSession) return;
    
    try {
      await endSession({ sessionId: selectedSession });
      setSelectedSession(null);
      toast.success("Session ended");
    } catch (error) {
      toast.error("Failed to end session");
    }
  };

  if (!counselorProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!counselorProfile.isVerified) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center border border-white/10">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Verification Pending</h2>
          <p className="text-blue-200 mb-6">
            Your counselor profile is being reviewed by our administrators. 
            You'll be able to start helping others once verified.
          </p>
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-blue-200">
              <strong className="text-white">NGO:</strong> {counselorProfile.ngoName}<br />
              <strong className="text-white">Specializations:</strong> {counselorProfile.specializations.join(", ")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)] max-w-7xl mx-auto p-4">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status Card */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/10 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Status</h3>
              <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}></div>
            </div>
            <button
              onClick={handleToggleOnline}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                isOnline 
                  ? "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700" 
                  : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
              }`}
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </button>
            <div className="mt-4 text-sm text-blue-200 space-y-1">
              <p><strong className="text-white">Active Sessions:</strong> {activeSessions?.length || 0}</p>
              <p><strong className="text-white">Max Concurrent:</strong> {counselorProfile.maxConcurrentSessions}</p>
            </div>
          </div>

          {/* Waiting Sessions */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/10 animate-slide-up animation-delay-200">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              Waiting for Help ({waitingSessions?.length || 0})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {waitingSessions?.map((session) => (
                <div key={session._id} className="p-3 bg-yellow-900/30 rounded-lg border border-yellow-500/30 hover:bg-yellow-900/50 transition-all duration-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Waiting {Math.floor((Date.now() - session.createdAt) / 60000)} min
                      </p>
                      {session.isCrisisDetected && (
                        <span className="inline-block px-2 py-1 bg-red-900/50 text-red-200 text-xs rounded-full mt-1 border border-red-500/30 animate-pulse">
                          🚨 Crisis Alert
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleJoinSession(session._id)}
                      disabled={!isOnline || (activeSessions?.length || 0) >= counselorProfile.maxConcurrentSessions}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
              {waitingSessions?.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No one waiting</p>
              )}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/10 animate-slide-up animation-delay-400">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Your Active Sessions ({activeSessions?.length || 0})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeSessions?.map((session: any) => (
                <div 
                  key={session._id} 
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                    selectedSession === session._id 
                      ? "bg-blue-900/50 border-blue-500/50 shadow-lg" 
                      : "bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50"
                  }`}
                  onClick={() => setSelectedSession(session._id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Active {Math.floor((Date.now() - session.createdAt) / 60000)} min
                      </p>
                      {session.isCrisisDetected && (
                        <span className="inline-block px-2 py-1 bg-red-900/50 text-red-200 text-xs rounded-full mt-1 border border-red-500/30">
                          🚨 Crisis
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {activeSessions?.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No active sessions</p>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="bg-black/40 backdrop-blur-md rounded-xl shadow-2xl h-full flex flex-col border border-white/10 animate-slide-up">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-green-600/20 to-emerald-600/20">
                <div>
                  <h3 className="font-semibold text-white">Chat Session</h3>
                  <p className="text-sm text-green-200">Anonymous user</p>
                </div>
                <button
                  onClick={handleEndSession}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:from-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                >
                  End Session
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map((msg: any, index: number) => (
                  <div key={msg._id} className="message-bubble" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div
                      className={`flex ${msg.senderType === "counselor" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-lg ${
                          msg.senderType === "counselor"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                            : "bg-black/60 text-white border border-white/20 backdrop-blur-sm"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderType === "counselor" ? "text-green-100" : "text-gray-300"
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* AI Analysis (only visible to counselors) */}
                    {msg.senderType === "anonymous" && (msg.sentiment || msg.emotions) && (
                      <div className="ml-4 mt-2 p-2 bg-blue-900/30 rounded text-xs border border-blue-500/30 backdrop-blur-sm">
                        {msg.sentiment && (
                          <div className="mb-1">
                            <strong className="text-blue-200">Sentiment:</strong> 
                            <span className={`ml-1 ${
                              msg.sentiment.label === 'positive' ? 'text-green-300' :
                              msg.sentiment.label === 'negative' ? 'text-red-300' : 'text-yellow-300'
                            }`}>
                              {msg.sentiment.label} ({msg.sentiment.score.toFixed(2)})
                            </span>
                          </div>
                        )}
                        {msg.emotions && msg.emotions.length > 0 && (
                          <div>
                            <strong className="text-blue-200">Emotions:</strong> 
                            <span className="ml-1 text-blue-100">
                              {msg.emotions
                                .filter((e: any) => e.confidence > 0.5)
                                .map((e: any) => `${e.emotion} (${(e.confidence * 100).toFixed(0)}%)`)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                        {msg.isCrisisFlag && (
                          <div className="text-red-300 font-semibold animate-pulse">🚨 Crisis indicators detected</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10 bg-black/20">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-md rounded-xl shadow-2xl h-full flex items-center justify-center border border-white/10 animate-slide-up">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Session Selected</h3>
                <p className="text-blue-200">
                  Select an active session from the sidebar or join a waiting session to start helping.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
