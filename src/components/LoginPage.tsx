import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Leaf } from 'lucide-react';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onLogin(); // For now, any input logs in
        }, 800);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 relative overflow-hidden p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large decorative blob - top right */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-green-200/25 to-blue-300/25 rounded-full blur-3xl"></div>

                {/* Medium blob - bottom left */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-emerald-200/20 to-green-300/20 rounded-full blur-3xl"></div>

                {/* Small accent blob - center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-bl from-blue-200/15 to-green-200/15 rounded-full blur-2xl"></div>
            </div>

            {/* Content overlay */}
            <div className="relative z-10 flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-sm p-6 shadow-xl border-green-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <Leaf className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">VayuVision</h1>
                    <p className="text-gray-500 mt-2">Urban Carbon Capture & Planning</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                        <div className="relative">
                            <Input
                                type="email"
                                placeholder="admin@vayuvision.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                        <div className="relative">
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <a href="#" className="text-xs text-green-600 hover:text-green-800 hover:underline">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-black mt-6 transition-all"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </Button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                        onClick={() => { }}
                    >
                        Create New Account
                    </Button>
                </form>
            </Card>
            </div>
        </div>
    );
};

export default LoginPage;
