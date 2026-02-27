import React from "react";
import { FaCopy, FaCoins, FaCalendarAlt, FaClock, FaCheckCircle, FaQrcode, FaEye, FaTimesCircle } from "react-icons/fa";
import { MdCardGiftcard, MdQrCode } from "react-icons/md";

const GiftCard = ({ acquisition, isExpired, getStatusBadge, copyToClipboard, openDetailModal }) => {
    const estExpire = isExpired(acquisition.date_expiration);
    const estActif = acquisition.statut === "active" && !estExpire;

    return (
        <div className={`group bg-white rounded-2xl shadow-lg border-2 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${estActif ? "border-green-200 hover:border-green-300" :
                estExpire ? "border-orange-200 hover:border-orange-300" :
                    "border-gray-200 hover:border-gray-300"
            }`}>
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                {acquisition.cadeau?.image ? (
                    <img
                        src={acquisition.cadeau.image}
                        alt={acquisition.cadeau?.titre || "Cadeau"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=Cadeau"; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <MdCardGiftcard className="text-6xl text-blue-400" />
                    </div>
                )}
                <div className="absolute top-3 right-3">{getStatusBadge(acquisition)}</div>
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <FaQrcode className="text-2xl text-blue-600" />
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {acquisition.cadeau?.titre || "Cadeau"}
                </h3>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        <MdQrCode className="text-blue-600 text-xl flex-shrink-0" />
                        <span className="font-mono font-bold text-gray-800 text-sm truncate">{acquisition.code_cadeau}</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(acquisition.code_cadeau); }}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-all ml-2 flex-shrink-0"
                        title="Copier le code"
                    >
                        <FaCopy className="text-blue-600" />
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-3 text-blue-600">
                    <FaCoins className="text-lg" />
                    <span className="font-bold">{parseFloat(acquisition.cadeau?.prix_cagnotte || 0).toFixed(2)} DT</span>
                </div>

                <div className="space-y-2 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>Acquis le {new Date(acquisition.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {acquisition.date_expiration && (
                        <div className={`flex items-center gap-2 ${estExpire ? "text-orange-600 font-semibold" : ""}`}>
                            <FaClock className={estExpire ? "text-orange-600" : "text-blue-400"} />
                            <span>{estExpire ? "Expiré le" : "Expire le"} {new Date(acquisition.date_expiration).toLocaleDateString("fr-FR")}</span>
                        </div>
                    )}
                    {acquisition.date_utilisation && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <FaCheckCircle />
                            <span>Utilisé le {new Date(acquisition.date_utilisation).toLocaleDateString("fr-FR")}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => openDetailModal(acquisition)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                    <FaEye className="text-sm" />
                    Voir détails
                </button>
            </div>
        </div>
    );
};

export default GiftCard;
