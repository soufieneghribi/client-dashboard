import React from "react";
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../config/queryClient.jsx';
import axios from 'axios';
import { API_BASE_URL } from '../../../services/api';

const UniverseSelector = ({ selectedUniverse, setSelectedUniverse }) => {
    const queryClient = useQueryClient();

    const universes = [
        { id: null, label: "Épicerie", desc: "Alimentation & Maison", emoji: "🛒", colorClass: "emerald" },
        { id: 2, label: "Électronique", desc: "High-Tech & Électroménager", emoji: "📱", colorClass: "blue" },
    ];

    // 🚀 Prefetch: Précharger les données au hover pour un chargement instantané
    const handlePrefetch = (universeId) => {
        // Précharger les produits populaires de cet univers
        queryClient.prefetchQuery({
            queryKey: ['popular', universeId],
            queryFn: async () => {
                const response = await axios.get(
                    `${API_BASE_URL}/products/popular`,
                    { params: { universe_id: universeId } }
                );
                return response.data;
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
        });

        // Si c'est l'électronique, précharger aussi les catégories
        if (universeId === 2) {
            queryClient.prefetchQuery({
                queryKey: queryKeys.categoryProducts(144), // ID root électronique
                queryFn: async () => {
                    const response = await axios.get(
                        `${API_BASE_URL}/categories/144/products`
                    );
                    return response.data;
                },
                staleTime: 1000 * 60 * 5,
            });
        }
    };

    return (
        <section className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 px-4">
            {universes.map((uni) => (
                <button
                    key={uni.id}
                    onClick={() => setSelectedUniverse(uni.id)}
                    onMouseEnter={() => handlePrefetch(uni.id)} // 🚀 Prefetch au hover
                    onTouchStart={() => handlePrefetch(uni.id)} // 🚀 Prefetch au touch (mobile)
                    className={`flex-1 max-w-xs font-bold py-3 px-4 rounded-xl shadow-lg card-transition gpu-accelerated flex items-center justify-center gap-2 ${selectedUniverse === uni.id
                        ? `bg-gradient-to-r from-${uni.colorClass}-500 to-${uni.colorClass}-600 text-white`
                        : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                        }`}
                >
                    <span className="text-2xl">{uni.emoji}</span>
                    <div className="text-left">
                        <div className="text-base font-bold">{uni.label}</div>
                        <div className="text-[10px] opacity-90">{uni.desc}</div>
                    </div>
                </button>
            ))}
        </section>
    );
};

export default UniverseSelector;
