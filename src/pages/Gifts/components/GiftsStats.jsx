import React from "react";
import { FaGift, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const GiftsStats = ({ total, active, used, expired }) => {
    return (
        <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Votre collection</h2>
                        <p className="text-gray-600 text-xs">Résumé de vos cadeaux acquis</p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <FaGift className="text-sm text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatItem icon={<FaGift />} color="blue" label="Total" value={total} />
                    <StatItem icon={<FaCheckCircle />} color="green" label="Actifs" value={active} />
                    <StatItem icon={<FaTimesCircle />} color="gray" label="Utilisés" value={used} />
                    <StatItem icon={<FaClock />} color="orange" label="Expirés" value={expired} />
                </div>
            </div>
        </div>
    );
};

const StatItem = ({ icon, color, label, value }) => {
    const colorClasses = {
        blue: "from-blue-100 to-blue-200 text-blue-600",
        green: "from-green-100 to-green-200 text-green-600",
        gray: "from-gray-100 to-gray-200 text-gray-600",
        orange: "from-orange-100 to-orange-200 text-orange-600"
    };

    return (
        <div className={`bg-gradient-to-br from-white to-${color}-50 rounded-lg p-3 border border-${color}-100 group hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-8 h-8 bg-gradient-to-br ${colorClasses[color]} rounded-md flex items-center justify-center`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-600">{label}</p>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default GiftsStats;
