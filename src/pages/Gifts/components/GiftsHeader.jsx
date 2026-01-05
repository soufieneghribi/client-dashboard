import React from "react";
import { FaChevronLeft, FaWallet, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const GiftsHeader = ({ userCagnotte }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl">
            <div className="container mx-auto px-4 py-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate("/catalogue")}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 transition-all duration-200"
                    >
                        <FaChevronLeft className="text-sm" />
                        <span className="font-medium text-xs">Retour</span>
                    </button>

                    <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                        <div className="flex items-center gap-2">
                            <FaWallet className="text-amber-300 text-sm" />
                            <span className="text-white font-bold text-md">{userCagnotte.toFixed(2)} DT</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 mb-3">
                        <FaHistory className="text-2xl" />
                        <h1 className="text-2xl font-bold">Mes Cadeaux</h1>
                    </div>
                    <p className="text-white/80 text-sm">Gérez et utilisez vos cadeaux acquis</p>
                </div>
            </div>
        </div>
    );
};

export default GiftsHeader;
