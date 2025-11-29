"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Monitor, CloudUpload, Terminal, Users, ServerCog } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardView() {
  return (
    <div className="p-6 space-y-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-600 to-gray-950 bg-clip-text text-transparent">
          Welcome to Your Dashboard
        </h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          A quick overview of what you can do. Choose a section from the sidebar to get started.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Access Computers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="flex flex-col h-full bg-gradient-to-br from-neutral-900/80 to-neutral-800/70 border border-neutral-700 rounded-2xl shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Monitor className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-semibold text-green-300">Access Computers</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Securely connect via SSH, set up tunnels, and manage remote lab machines with ease.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* File Server */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Card className="flex flex-col h-full bg-gradient-to-br from-neutral-900/80 to-neutral-800/70 border border-neutral-700 rounded-2xl shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <CloudUpload className="w-6 h-6 text-purple-300" />
                <h2 className="text-xl font-semibold text-purple-200">File Server</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Upload, download, and browse your files securely all in one place.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="flex flex-col h-full bg-gradient-to-br from-neutral-900/80 to-neutral-800/70 border border-neutral-700 rounded-2xl shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-cyan-300" />
                <h2 className="text-xl font-semibold text-cyan-200">Profile & Security</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Update your credentials and keep your account secure.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin: Access Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Card className="flex flex-col h-full bg-gradient-to-br from-neutral-900/80 to-neutral-800/70 border border-neutral-700 rounded-2xl shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-yellow-300" />
                <h2 className="text-xl font-semibold text-yellow-200">Access Management</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Manage users, permissions, and registered lab devices. (Admin Only)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin: System Administration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="flex flex-col h-full bg-gradient-to-br from-neutral-900/80 to-neutral-800/70 border border-neutral-700 rounded-2xl shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <ServerCog className="w-6 h-6 text-red-300" />
                <h2 className="text-xl font-semibold text-red-200">System Administration</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Perform software updates, maintenance, and automate routine tasks. (Admin Only)
              </p>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
