import React from "react";
import { FaChevronLeft, FaWallet, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const GiftsHeader = ({ userCagnotte }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 transition-all duration-200"
                    >
                        <FaChevronLeft className="text-xs" />
                        <span className="font-medium text-[10px]">Retour</span>
                    </button>

                    <div className="bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                            <FaWallet className="text-amber-300 text-xs" />
                            <span className="text-white font-bold text-sm tracking-tight">{userCagnotte.toFixed(2)} DT</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-1">
                    <div className="inline-flex items-center gap-2 mb-1">
                        <FaHistory className="text-xl opacity-80" />
                        <h1 className="text-xl font-black tracking-tight">Cadeaux & Récompenses</h1>
                    </div>
                    <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Profitez de vos avantages exclusifs</p>
                </div>
            </div>
        </div>
    );
};

export default GiftsHeader;
