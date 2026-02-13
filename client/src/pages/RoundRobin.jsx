import React from 'react';
import Layout from '../components/Layout';

const RoundRobin = () => {
    return (
        <Layout>
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                <div className="sm:flex sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Round Robin</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage lead distribution settings here...
                        </p>
                    </div>
                </div>

                {/* Placeholder content */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                    <p className="text-gray-500">
                        Round Robin configuration will go here.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default RoundRobin;
