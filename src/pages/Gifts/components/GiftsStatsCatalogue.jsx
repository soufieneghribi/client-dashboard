import React from "react";
import { FaGift, FaWallet, FaCheckCircle, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const GiftsStatsCatalogue = ({ total, userCagnotte, availableCount }) => {
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Votre sélection</h2>
                        <p className="text-gray-600 text-xs">Cadeaux disponibles pour échange</p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <FaGift className="text-sm text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatItem icon={<FaGift />} color="purple" label="Total" value={total} />
                    <StatItem icon={<FaWallet />} color="blue" label="Votre cagnotte" value={`${userCagnotte.toFixed(2)} DT`} />
                    <StatItem icon={<FaCheckCircle />} color="green" label="Disponibles" value={availableCount} />

                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg p-3 border border-purple-100 group hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-md flex items-center justify-center">
                                <FaHistory className="text-sm text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-600">Mes cadeaux</p>
                                <button
                                    onClick={() => navigate('/mes-cadeaux')}
                                    className="mt-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow"
                                >
                                    Voir mes cadeaux
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatItem = ({ icon, color, label, value }) => {
    const colorClasses = {
        purple: "from-purple-100 to-purple-200 text-purple-600",
        blue: "from-blue-100 to-blue-200 text-blue-600",
        green: "from-green-100 to-green-200 text-green-600"
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

export default GiftsStatsCatalogue;
