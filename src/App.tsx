import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { AnonymousChat } from "./components/AnonymousChat";
import { CounselorDashboard } from "./components/CounselorDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminSetup } from "./components/AdminSetup";
import { AboutPage } from "./components/AboutPage";
import { useState } from "react";

export default function App() {
  const [userType, setUserType] = useState<"anonymous" | "counselor" | "admin" | "about" | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <header className="sticky top-0 z-10 bg-black/20 backdrop-blur-md h-16 flex justify-between items-center border-b border-white/10 shadow-lg px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">PL</span>
          </div>
          <h2 className="text-xl font-bold text-white">PeerLift</h2>
          <span className="text-sm text-blue-200 hidden sm:inline">Anonymous Mental Health Support</span>
        </div>
        <div className="flex items-center gap-4">
          <Unauthenticated>
            {!userType && (
              <button
                onClick={() => setUserType("about")}
                className="px-3 py-1 text-sm text-blue-200 hover:text-white transition-colors duration-200"
              >
                About
              </button>
            )}
            {userType && userType !== "about" && (
              <button
                onClick={() => setUserType(null)}
                className="px-3 py-1 text-sm text-blue-200 hover:text-white transition-colors duration-200"
              >
                ← Back
              </button>
            )}
          </Unauthenticated>
          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          <Content userType={userType} setUserType={setUserType} />
        </div>
      </main>
      <Toaster theme="dark" />
    </div>
  );
}

function Content({ 
  userType, 
  setUserType 
}: { 
  userType: "anonymous" | "counselor" | "admin" | "about" | null;
  setUserType: (type: "anonymous" | "counselor" | "admin" | "about" | null) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const counselorProfile = useQuery(api.counselors.getCounselorProfile);
  const adminProfile = useQuery(api.admins.getAdminProfile);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // Show About page
  if (userType === "about") {
    return <AboutPage onBack={() => setUserType(null)} />;
  }

  // If user is authenticated and has admin profile, show admin dashboard
  if (loggedInUser && adminProfile) {
    return <AdminDashboard />;
  }

  // If user is authenticated and has counselor profile, show counselor dashboard
  if (loggedInUser && counselorProfile) {
    return <CounselorDashboard />;
  }

  // If user is authenticated but no profiles, show profile creation based on userType
  if (loggedInUser && !counselorProfile && !adminProfile) {
    if (userType === "admin") {
      return <AdminSetup />;
    }
    if (userType === "counselor" || counselorProfile === null) {
      return <CounselorProfileSetup />;
    }
  }

  // Anonymous user flow
  if (userType === "anonymous") {
    return <AnonymousChat />;
  }

  // Admin login flow
  if (userType === "admin") {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">🛡️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
            <p className="text-blue-200">Sign in to access the admin dashboard</p>
          </div>
          <SignInForm />
        </div>
      </div>
    );
  }

  // Counselor login flow
  if (userType === "counselor") {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">💚</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Counselor Login</h2>
            <p className="text-blue-200">Sign in to access the counselor dashboard</p>
          </div>
          <SignInForm />
        </div>
      </div>
    );
  }

  // Landing page
  return <LandingPage setUserType={setUserType} />;
}

function LandingPage({ setUserType }: { setUserType: (type: "anonymous" | "counselor" | "admin" | "about") => void }) {
  const onlineCounselors = useQuery(api.counselors.getOnlineCounselorsCount) ?? 0;

  return (
    <div className="text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-white mb-4 animate-slide-up">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">PeerLift</span>
        </h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto animate-slide-up animation-delay-200">
          Anonymous, safe, and confidential mental health support. Connect with trained counselors 
          when you need someone to talk to.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-blue-200 animate-slide-up animation-delay-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>{onlineCounselors} counselors online now</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-white/10 animate-slide-up animation-delay-600">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Need Support?</h3>
          <p className="text-blue-200 mb-6">
            Start an anonymous chat session. No registration required. Your privacy is protected.
          </p>
          <button
            onClick={() => setUserType("anonymous")}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Anonymous Chat
          </button>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-white/10 animate-slide-up animation-delay-800">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Want to Help?</h3>
          <p className="text-blue-200 mb-6">
            Join as a counselor to provide support to those in need. NGO volunteers welcome.
          </p>
          <button
            onClick={() => setUserType("counselor")}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Counselor Login
          </button>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-white/10 animate-slide-up animation-delay-1000">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Administrator</h3>
          <p className="text-blue-200 mb-6">
            Manage the platform, verify counselors, and monitor system health.
          </p>
          <button
            onClick={() => setUserType("admin")}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Admin Login
          </button>
        </div>
      </div>

      <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 max-w-3xl mx-auto border border-white/10 animate-slide-up animation-delay-1200">
        <h4 className="font-semibold text-white mb-3">Your Privacy Matters</h4>
        <div className="grid sm:grid-cols-3 gap-4 text-sm text-blue-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No registration required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Messages auto-delete</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>GDPR compliant</span>
          </div>
        </div>
      </div>

      <div className="animate-slide-up animation-delay-1400">
        <button
          onClick={() => setUserType("about")}
          className="text-blue-300 hover:text-blue-200 underline transition-colors duration-200"
        >
          Learn more about what makes PeerLift special →
        </button>
      </div>
    </div>
  );
}

function CounselorProfileSetup() {
  const [ngoName, setNgoName] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpecialization, setNewSpecialization] = useState("");
  const createProfile = useMutation(api.counselors.createCounselorProfile);

  const addSpecialization = () => {
    if (newSpecialization.trim() && !specializations.includes(newSpecialization.trim())) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (spec: string) => {
    setSpecializations(specializations.filter(s => s !== spec));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ngoName.trim() || specializations.length === 0) return;

    try {
      await createProfile({
        ngoName: ngoName.trim(),
        specializations,
      });
      toast.success("Profile created! Waiting for verification.");
    } catch (error) {
      toast.error("Failed to create profile");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">💚</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
          <p className="text-blue-200">Set up your counselor profile to start helping others</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              NGO/Organization Name
            </label>
            <input
              type="text"
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/20 text-white placeholder-blue-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all duration-200"
              placeholder="Enter your organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Specializations
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                className="flex-1 px-3 py-2 rounded bg-black/20 border border-white/20 text-white placeholder-blue-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all duration-200"
                placeholder="e.g., Depression, Anxiety"
              />
              <button
                type="button"
                onClick={addSpecialization}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/50 text-green-200 rounded-full text-sm border border-green-500/30"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(spec)}
                    className="text-green-300 hover:text-green-100 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!ngoName.trim() || specializations.length === 0}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            Create Profile
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
          <p className="text-sm text-yellow-200">
            <strong>Note:</strong> Your profile will need to be verified by an administrator before you can start counseling sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
