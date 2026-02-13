
import React from 'react';
import Layout from '../components/Layout';
import { Mail, Send, Users, BarChart } from 'lucide-react';

const EmailMarketing = () => {
    return (
        <Layout>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
                        <p className="text-gray-500">Create, manage and track your email campaigns.</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Mail className="h-4 w-4" />
                        Create Campaign
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Send className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Emails Sent</p>
                                <p className="text-2xl font-bold text-gray-900">12,450</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Subscribers</p>
                                <p className="text-2xl font-bold text-gray-900">4,820</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <BarChart className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Avg. Open Rate</p>
                                <p className="text-2xl font-bold text-gray-900">24.8%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Campaigns Placeholder */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Campaigns</h2>
                    <div className="text-center py-12 text-gray-500">
                        <Mail className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900">No campaigns yet</p>
                        <p className="mb-4">Get started by creating your first email campaign.</p>
                        <button className="text-blue-600 font-medium hover:text-blue-700">
                            Create a campaign &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EmailMarketing;
