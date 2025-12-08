import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Leaf } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      {/* BIGGER CARD – width controlled by inline style so Tailwind limitations don’t matter */}
      <Card
        className="shadow-xl border border-green-100 rounded-2xl bg-white"
        style={{
          width: "min(90vw, 720px)",
          padding: "40px 40px 48px",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="rounded-full flex items-center justify-center mb-5"
            style={{
              width: 72,
              height: 72,
              backgroundColor: "rgba(34,197,94,0.12)", // light green
            }}
          >
            <Leaf style={{ width: 36, height: 36, color: "#16a34a" }} />
          </div>

          <h1 className="text-3xl font-medium text-foreground">VayuVision</h1>
          <p className="text-lg text-gray-600 mt-2 text-center">
            Urban Carbon Capture &amp; Planning Dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Email
            </label>
            <Input
              type="email"
              placeholder="admin@vayuvision.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10"
            />
            <div className="flex justify-end">
              <a
                href="#"
                className="text-xs text-green-600 hover:text-green-800 hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {/* Sign in */}
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500">Or</span>
            </div>
          </div>

          {/* Create account */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {}}
          >
            Create New Account
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
