import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function AnonymousChat() {
  const [sessionId, setSessionId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createOrUpdateSession = useMutation(api.anonymousUsers.createOrUpdateSession);
  const createChatSession = useMutation(api.chatSessions.createSession);
  const sendMessage = useMutation(api.messages.sendMessage);
  const canSendMessage = useQuery(api.anonymousUsers.canSendMessage, 
    sessionId ? { sessionId } : "skip"
  );
  
  const userSession = useQuery(api.chatSessions.getUserSession, 
    sessionId ? { sessionId } : "skip"
  );
  const messages = useQuery(api.messages.getSessionMessages, 
    userSession ? { sessionId: userSession._id } : "skip"
  );

  // Initialize session on component mount
  useEffect(() => {
    const initSession = async () => {
      let storedSessionId = localStorage.getItem("peerlift_session_id");
      
      if (!storedSessionId) {
        storedSessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("peerlift_session_id", storedSessionId);
      }
      
      setSessionId(storedSessionId);
      
      try {
        await createOrUpdateSession({ sessionId: storedSessionId });
      } catch (error) {
        console.error("Failed to initialize session:", error);
        toast.error("Failed to initialize session");
      }
    };

    initSession();
  }, [createOrUpdateSession]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartChat = async () => {
    if (!sessionId) return;
    
    setIsConnecting(true);
    try {
      await createChatSession({ sessionId });
      toast.success("Connected! Waiting for a counselor...");
    } catch (error) {
      console.error("Failed to start chat:", error);
      toast.error("Failed to start chat session");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userSession || canSendMessage === false) return;

    try {
      await sendMessage({
        sessionId: userSession._id,
        content: message.trim(),
        senderType: "anonymous",
        anonymousSessionId: sessionId,
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const getStatusMessage = () => {
    if (!userSession) return "Click 'Start Chat' to begin";
    if (userSession.status === "waiting") return "Waiting for a counselor to join...";
    if (userSession.status === "active") return "Connected with a counselor";
    return "Session ended";
  };

  const getStatusColor = () => {
    if (!userSession) return "text-blue-300";
    if (userSession.status === "waiting") return "text-yellow-400";
    if (userSession.status === "active") return "text-green-400";
    return "text-gray-400";
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Anonymous Support Chat</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              userSession?.status === "active" ? "bg-green-400 animate-pulse" : 
              userSession?.status === "waiting" ? "bg-yellow-400 animate-pulse" : "bg-gray-400"
            }`}></div>
            <span className={`text-blue-100 ${getStatusColor()}`}>{getStatusMessage()}</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
          {!userSession ? (
            <div className="text-center py-12 animate-slide-up">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse-glow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Start?</h3>
              <p className="text-blue-200 mb-6">
                You're about to connect with a trained counselor. This conversation is anonymous and confidential.
              </p>
              <button
                onClick={handleStartChat}
                disabled={isConnecting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg btn-enhanced"
              >
                {isConnecting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connecting...
                  </span>
                ) : (
                  "Start Chat"
                )}
              </button>
            </div>
          ) : messages?.length === 0 ? (
            <div className="text-center py-8 animate-slide-up">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-blue-200">
                {userSession.status === "waiting" 
                  ? "Waiting for a counselor to join. Please be patient..."
                  : "Your conversation will appear here"
                }
              </p>
            </div>
          ) : (
            messages?.map((msg, index) => (
              <div
                key={msg._id}
                className={`flex message-bubble ${msg.senderType === "anonymous" ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-lg ${
                    msg.senderType === "anonymous"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "bg-black/60 text-white border border-white/20 backdrop-blur-sm"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.senderType === "anonymous" ? "text-blue-100" : "text-gray-300"
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {userSession && userSession.status !== "ended" && (
          <div className="p-4 border-t border-white/10 bg-black/20">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  userSession.status === "waiting" 
                    ? "Waiting for counselor..." 
                    : "Type your message..."
                }
                disabled={userSession.status === "waiting" || canSendMessage === false}
                className="flex-1 px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-800 disabled:text-gray-400 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!message.trim() || userSession.status === "waiting" || canSendMessage === false}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Send
              </button>
            </form>
            {canSendMessage === false && (
              <p className="text-sm text-red-400 mt-2 animate-slide-up">
                Daily message limit reached. Please try again tomorrow.
              </p>
            )}
          </div>
        )}

        {/* Privacy Notice */}
        <div className="p-4 bg-black/30 border-t border-white/10 text-center">
          <p className="text-xs text-blue-200">
            🔒 This conversation is anonymous and will be automatically deleted after 24 hours.
            If you're in immediate danger, please contact emergency services.
          </p>
        </div>
      </div>
    </div>
  );
}
