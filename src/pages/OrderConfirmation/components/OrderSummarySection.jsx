import React from 'react';
import { FaShoppingCart, FaTruck, FaWallet, FaCheckCircle, FaBox } from 'react-icons/fa';
import { motion } from 'framer-motion';

const OrderSummarySection = ({
    orderDetails,
    subtotal,
    deliveryFee,
    cagnotteDeduction,
    totalAmount,
    isCalculatingFee,
    handleSubmit,
    isSubmitting
}) => {
    return (
        <div className="lg:sticky lg:top-8 space-y-4">
            {/* Main Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <FaShoppingCart size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Récapitulatif de commande</h3>
                            <p className="text-sm text-gray-300">{orderDetails.length} article{orderDetails.length > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="p-6 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <FaBox className="text-gray-500" size={14} />
                        Articles dans votre panier
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {orderDetails.map((item, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
                                    <span className="text-sm font-black text-white">×{item.quantity}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">
                                        {item.name}
                                    </h5>
                                    {item.isPromotion && (
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                            PROMO
                                        </span>
                                    )}
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <div className="text-sm font-bold text-gray-900">
                                        {(item.price * item.quantity).toFixed(2)} DT
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-6 space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-600">Sous-total</span>
                        <span className="font-bold text-gray-900">{subtotal.toFixed(2)} DT</span>
                    </div>

                    {/* Delivery Fee */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                            <FaTruck className="text-gray-500" size={14} />
                            <span className="text-sm font-medium text-gray-600">Frais de livraison</span>
                        </div>
                        {isCalculatingFee ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                                <span className="text-xs text-blue-600 font-semibold">Calcul...</span>
                            </div>
                        ) : deliveryFee === 0 ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-lg">
                                GRATUIT
                            </span>
                        ) : (
                            <span className="font-bold text-gray-900">{deliveryFee.toFixed(2)} DT</span>
                        )}
                    </div>

                    {/* Cagnotte Deduction */}
                    {cagnotteDeduction > 0 && (
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-2">
                                <FaWallet className="text-blue-600" size={14} />
                                <span className="text-sm font-medium text-blue-900">Cagnotte utilisée</span>
                            </div>
                            <span className="font-bold text-blue-600">-{cagnotteDeduction.toFixed(2)} DT</span>
                        </div>
                    )}

                    {/* Total */}
                    <div className="pt-4 border-t-2 border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Total à payer</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl">
                            <span className="text-lg font-bold text-white">TOTAL</span>
                            <div className="text-right">
                                <div className="text-3xl font-black text-white tabular-nums">
                                    {totalAmount.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-300">DT TTC</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-xl border border-green-200">
                <FaCheckCircle className="text-green-600" size={16} />
                <span className="text-sm font-semibold text-green-800">Paiement 100% sécurisé</span>
            </div>
        </div>
    );
};

export default OrderSummarySection;
