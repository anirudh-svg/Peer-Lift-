import { useState } from "react";

export function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-glow">
            <span className="text-white font-bold text-2xl">PL</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">PeerLift</span>
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Breaking barriers to mental health support through anonymous, accessible, and compassionate care.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-12 animate-slide-up animation-delay-200">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Our Mission</h2>
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl p-6 border border-blue-500/20">
            <p className="text-blue-100 text-lg leading-relaxed text-center">
              To provide immediate, anonymous mental health support to anyone who needs it, 
              connecting people in crisis with trained counselors from verified NGOs, 
              while maintaining complete privacy and dignity.
            </p>
          </div>
        </div>

        {/* What Makes Us Special */}
        <div className="mb-12 animate-slide-up animation-delay-400">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">What Makes PeerLift Special</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon="🔒"
              title="Complete Anonymity"
              description="No registration, no personal data stored. Your identity remains completely private throughout the entire conversation."
              gradient="from-green-600 to-emerald-600"
            />
            <FeatureCard
              icon="⚡"
              title="Instant Access"
              description="No waiting lists, no appointments. Get connected with a counselor immediately when you need support most."
              gradient="from-blue-600 to-indigo-600"
            />
            <FeatureCard
              icon="🤖"
              title="AI-Powered Insights"
              description="Advanced sentiment analysis helps counselors understand emotional context and detect crisis situations for better support."
              gradient="from-purple-600 to-pink-600"
            />
            <FeatureCard
              icon="🛡️"
              title="Verified Counselors"
              description="All counselors are verified professionals from registered NGOs, ensuring you receive quality mental health support."
              gradient="from-orange-600 to-red-600"
            />
            <FeatureCard
              icon="🌍"
              title="Global Accessibility"
              description="Available 24/7 from anywhere in the world. Mental health support shouldn't be limited by geography or time zones."
              gradient="from-teal-600 to-cyan-600"
            />
            <FeatureCard
              icon="🗑️"
              title="Auto-Delete Messages"
              description="All conversations are automatically deleted after 24 hours, ensuring your privacy is protected even from us."
              gradient="from-yellow-600 to-amber-600"
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12 animate-slide-up animation-delay-600">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <StepCard
              step="1"
              title="Start Anonymous Chat"
              description="Click 'Start Anonymous Chat' - no registration or personal information required."
              color="blue"
            />
            <StepCard
              step="2"
              title="Get Connected"
              description="Our system matches you with an available verified counselor from our partner NGOs."
              color="green"
            />
            <StepCard
              step="3"
              title="Receive Support"
              description="Have a confidential conversation with a trained professional who cares about your wellbeing."
              color="purple"
            />
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="mb-12 animate-slide-up animation-delay-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Privacy & Security</h2>
          <div className="bg-black/30 rounded-xl p-6 border border-white/10">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-green-400">✓</span> What We Don't Store
                </h3>
                <ul className="text-blue-200 space-y-2">
                  <li>• Your real name or identity</li>
                  <li>• Email addresses or phone numbers</li>
                  <li>• IP addresses (beyond session management)</li>
                  <li>• Conversation history beyond 24 hours</li>
                  <li>• Any personally identifiable information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-blue-400">🔒</span> How We Protect You
                </h3>
                <ul className="text-blue-200 space-y-2">
                  <li>• End-to-end encrypted conversations</li>
                  <li>• GDPR compliant data handling</li>
                  <li>• Automatic message deletion</li>
                  <li>• No tracking or analytics cookies</li>
                  <li>• Verified counselor background checks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Crisis Support */}
        <div className="mb-12 animate-slide-up animation-delay-1000">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Crisis Detection & Support</h2>
          <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 rounded-xl p-6 border border-red-500/20">
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">🚨</span>
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Crisis Detection</h3>
            </div>
            <p className="text-red-100 text-center mb-4">
              Our AI system can detect signs of crisis or self-harm in conversations and immediately 
              alerts counselors to provide appropriate emergency support and resources.
            </p>
            <div className="bg-red-900/50 rounded-lg p-4 border border-red-500/30">
              <p className="text-red-200 text-sm text-center">
                <strong>Important:</strong> If you're in immediate danger, please contact your local emergency services. 
                PeerLift is a support service and not a replacement for emergency medical care.
              </p>
            </div>
          </div>
        </div>

        {/* For Organizations */}
        <div className="mb-12 animate-slide-up animation-delay-1200">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">For Mental Health Organizations</h2>
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/20">
            <p className="text-green-100 text-center mb-6">
              PeerLift partners with verified NGOs and mental health organizations to expand their reach 
              and help them provide support to more people in need.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-900/50 rounded-lg p-4 border border-green-500/30">
                <h4 className="font-semibold text-white mb-2">Benefits for NGOs</h4>
                <ul className="text-green-200 text-sm space-y-1">
                  <li>• Expand your reach globally</li>
                  <li>• Connect with people who need help most</li>
                  <li>• AI insights to improve support quality</li>
                  <li>• Flexible volunteer scheduling</li>
                </ul>
              </div>
              <div className="bg-green-900/50 rounded-lg p-4 border border-green-500/30">
                <h4 className="font-semibold text-white mb-2">Verification Process</h4>
                <ul className="text-green-200 text-sm space-y-1">
                  <li>• NGO registration verification</li>
                  <li>• Counselor credential checks</li>
                  <li>• Background screening</li>
                  <li>• Ongoing quality monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center animate-slide-up animation-delay-1400">
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg btn-enhanced"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  gradient: string;
}) {
  return (
    <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <p className="text-blue-200 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ 
  step, 
  title, 
  description, 
  color 
}: { 
  step: string; 
  title: string; 
  description: string; 
  color: "blue" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "from-blue-600 to-indigo-600",
    green: "from-green-600 to-emerald-600",
    purple: "from-purple-600 to-pink-600",
  };

  return (
    <div className="text-center">
      <div className={`w-16 h-16 bg-gradient-to-r ${colorClasses[color]} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
        <span className="text-white font-bold text-xl">{step}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <p className="text-blue-200 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
