import { useState } from 'react';
import { BarChart3, Settings } from 'lucide-react';
import Layout from '../components/Layout';
import WhatsAppConnect from '../components/WhatsAppConnect';

const Dashboard = () => {
    // We can keep 'user' logic for the greeting
    const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'User' };

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Welcome Section */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Good morning, {user.full_name}
                            <span className="ml-3 text-sm font-normal text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">Free account</span>
                        </h2>
                        <p className="text-gray-500">Here's what's happening with your projects today.</p>
                    </div>
                    {/* Decorative circle */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-50"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Today's Sale - Gradient Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                            <BarChart3 size={48} />
                        </div>
                        <h3 className="text-blue-100 text-sm font-medium mb-1">TODAY'S SALE</h3>
                        <p className="text-3xl font-bold mb-4">$12,426</p>
                        <div className="flex items-center gap-2 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                            <span>+35% from yesterday</span>
                        </div>
                    </div>

                    {/* Total Sales */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">TOTAL SALES</h3>
                        <p className="text-2xl font-bold text-gray-900 mb-2">$2,38,485</p>
                        <div className="h-10 w-full">
                            {/* Mini chart placeholder */}
                            <svg viewBox="0 0 100 20" className="w-full h-full stroke-red-400 fill-none stroke-2">
                                <path d="M0 15 Q 20 5, 40 10 T 80 5 T 100 15" />
                            </svg>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">TOTAL ORDERS</h3>
                        <p className="text-2xl font-bold text-gray-900 mb-2">84,382</p>
                        <div className="h-10 w-full">
                            {/* Mini chart placeholder */}
                            <svg viewBox="0 0 100 20" className="w-full h-full stroke-green-500 fill-none stroke-2">
                                <path d="M0 10 Q 25 18, 50 10 T 100 5" />
                            </svg>
                        </div>
                    </div>

                    {/* Total Customers */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">TOTAL CUSTOMERS</h3>
                        <p className="text-2xl font-bold text-gray-900 mb-2">33,493</p>
                        <div className="h-10 w-full">
                            {/* Mini chart placeholder */}
                            <svg viewBox="0 0 100 20" className="w-full h-full stroke-green-500 fill-none stroke-2">
                                <path d="M0 15 L 20 10 L 40 18 L 60 5 L 80 12 L 100 2" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Total customers</h3>
                            <button className="text-gray-400 hover:text-gray-600"><Settings size={16} /></button>
                        </div>
                        <div className="h-64 flex items-end gap-4 justify-between px-4 pb-4 border-b border-gray-100 relative">
                            {/* Fake bars */}
                            {[40, 60, 45, 70, 50, 60, 75, 50, 60, 80, 55, 65].map((h, i) => (
                                <div key={i} className="w-full bg-gray-100 rounded-t-lg relative group h-full flex flex-col justify-end">
                                    <div
                                        style={{ height: `${h}%` }}
                                        className="w-full bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg group-hover:from-blue-200 group-hover:to-blue-100 transition-colors"
                                    ></div>
                                </div>
                            ))}
                            {/* Highlighted section */}
                            <div className="absolute bottom-10 left-1/4 bg-white shadow-lg p-3 rounded-xl border border-gray-100 z-10 animate-bounce">
                                <p className="text-xs text-gray-500">Total customers</p>
                                <p className="text-xl font-bold text-gray-900">+ 22%</p>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6">Pipeline Deals</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Closed Won</p>
                                    <p className="text-xl font-bold text-gray-900">12</p>
                                </div>
                                <div className="text-green-500 bg-green-50 px-2 py-1 rounded text-xs">+12%</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Proposal</p>
                                    <p className="text-xl font-bold text-gray-900">8</p>
                                </div>
                                <div className="text-blue-500 bg-blue-50 px-2 py-1 rounded text-xs">Active</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Negotiation</p>
                                    <p className="text-xl font-bold text-gray-900">5</p>
                                </div>
                                <div className="text-yellow-500 bg-yellow-50 px-2 py-1 rounded text-xs">Pending</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
