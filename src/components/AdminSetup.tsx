import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function AdminSetup() {
  const [adminKey, setAdminKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const createAdminProfile = useMutation(api.admins.createAdminProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;

    setIsLoading(true);
    try {
      await createAdminProfile({ adminKey: adminKey.trim() });
      toast.success("Admin profile created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create admin profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">🛡️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin Setup</h2>
            <p className="text-gray-400">Enter the admin key to create your administrator profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all duration-200"
                placeholder="Enter admin key"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!adminKey.trim() || isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? "Creating..." : "Create Admin Profile"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <p className="text-sm text-gray-300">
              <strong className="text-yellow-400">Note:</strong> This is for the first admin setup only. 
              The admin key is: <code className="bg-gray-600 px-2 py-1 rounded text-yellow-300">PEERLIFT_ADMIN_2024</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
