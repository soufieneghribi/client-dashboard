import React from "react";
import { FaTimes, FaDownload, FaCopy, FaCoins, FaTag, FaBox } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";

const GiftDetailModal = ({
    selectedAcquisition,
    onClose,
    getStatusBadgeForModal,
    getQRCodeUrl,
    downloadQRCode,
    copyToClipboard,
    formatDate,
    isExpired
}) => {
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-t-3xl sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold">🎁 Détails du Cadeau</h2>
                        <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center transition-all">
                            <FaTimes className="text-2xl" />
                        </button>
                    </div>
                    <div className="flex justify-center">{getStatusBadgeForModal(selectedAcquisition)}</div>
                </div>

                <div className="p-6">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1 rounded-2xl shadow-xl">
                            <div className="bg-white p-4 rounded-xl">
                                <img src={getQRCodeUrl(selectedAcquisition.code_cadeau)} alt="QR Code" className="w-64 h-64 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mb-6">
                        <button
                            onClick={() => downloadQRCode(selectedAcquisition.code_cadeau, selectedAcquisition.cadeau?.titre || "cadeau")}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                        >
                            <FaDownload />
                            Télécharger le QR Code
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-600 mb-2">Code d'acquisition</p>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-2xl font-mono font-bold text-blue-600">{selectedAcquisition.code_cadeau}</p>
                            <button
                                onClick={() => copyToClipboard(selectedAcquisition.code_cadeau)}
                                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all"
                                title="Copier le code"
                            >
                                <FaCopy className="text-blue-600" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{selectedAcquisition.cadeau?.titre}</h3>
                        {selectedAcquisition.cadeau?.description && <p className="text-sm text-gray-700 mb-4">{selectedAcquisition.cadeau.description}</p>}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-blue-600">
                                <FaCoins className="text-lg" />
                                <span className="font-bold">{parseFloat(selectedAcquisition.cadeau?.prix_cagnotte || 0).toFixed(2)} DT</span>
                            </div>
                            {selectedAcquisition.cadeau?.partenaire && (
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <MdLocalOffer className="text-blue-500" />
                                    <span className="font-semibold">Partenaire:</span>
                                    <span>{selectedAcquisition.cadeau.partenaire}</span>
                                </div>
                            )}
                            {selectedAcquisition.cadeau?.categorie && (
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <FaTag className="text-blue-500" />
                                    <span className="font-semibold">Catégorie:</span>
                                    <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs font-bold">{selectedAcquisition.cadeau.categorie}</span>
                                </div>
                            )}
                            {selectedAcquisition.cadeau?.quantite_disponible !== undefined && (
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <FaBox className="text-blue-500" />
                                    <span className="font-semibold">Quantité:</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{selectedAcquisition.cadeau.quantite_disponible} unité(s)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border border-gray-200 space-y-3">
                        <DateInfo label="Date d'acquisition" date={formatDate(selectedAcquisition.created_at)} />
                        {selectedAcquisition.date_expiration && (
                            <DateInfo label={isExpired(selectedAcquisition.date_expiration) ? "Date d'expiration" : "Expire le"} date={formatDate(selectedAcquisition.date_expiration)} color={isExpired(selectedAcquisition.date_expiration) ? "orange" : "blue"} />
                        )}
                        {selectedAcquisition.date_utilisation && <DateInfo label="Date d'utilisation" date={formatDate(selectedAcquisition.date_utilisation)} color="green" />}
                    </div>

                    {selectedAcquisition.cadeau?.conditions && <InfoBox icon="📋" title="Conditions d'utilisation" content={selectedAcquisition.cadeau.conditions} color="blue" />}
                    {selectedAcquisition.statut === "active" && !isExpired(selectedAcquisition.date_expiration) && <InfoBox icon="ℹ️" title="Instructions d'utilisation" content="Présentez ce QR code ou le code d'acquisition au partenaire pour utiliser votre cadeau." color="green" />}
                    {isExpired(selectedAcquisition.date_expiration) && <InfoBox icon="⚠️" title="Cadeau expiré" content={`Ce cadeau a expiré le ${new Date(selectedAcquisition.date_expiration).toLocaleDateString("fr-FR")} et n'est plus utilisable.`} color="orange" />}
                    {selectedAcquisition.statut === "used" && <InfoBox icon="✅" title="Cadeau utilisé" content={`Ce cadeau a été utilisé le ${new Date(selectedAcquisition.date_utilisation).toLocaleDateString("fr-FR")}.`} color="gray" />}
                </div>
            </div>
        </div>
    );
};

const DateInfo = ({ label, date, color = "gray" }) => {
    const colorMap = {
        gray: "text-gray-800",
        blue: "text-blue-600",
        green: "text-green-600",
        orange: "text-orange-600"
    };
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">{label}</span>
            <span className={`font-semibold text-sm ${colorMap[color]}`}>{date}</span>
        </div>
    );
};

const InfoBox = ({ icon, title, content, color }) => {
    const colorMap = {
        blue: "from-blue-50 to-indigo-50 border-blue-200 text-blue-800 content-blue-700",
        green: "from-green-50 to-emerald-50 border-green-200 text-green-800 content-green-700",
        orange: "from-orange-50 to-red-50 border-orange-200 text-orange-800 content-orange-700",
        gray: "from-gray-50 to-slate-50 border-gray-200 text-gray-800 content-gray-700"
    };
    const cls = colorMap[color].split(" ");
    return (
        <div className={`bg-gradient-to-r ${cls[0]} ${cls[1]} border-2 ${cls[2]} rounded-xl p-4 mb-4`}>
            <div className="flex items-start gap-2">
                <span className="text-lg">{icon}</span>
                <div>
                    <p className={`text-sm font-semibold ${cls[3]} mb-1`}>{title}</p>
                    <p className={`text-sm ${cls[4]}`}>{content}</p>
                </div>
            </div>
        </div>
    );
};

export default GiftDetailModal;
