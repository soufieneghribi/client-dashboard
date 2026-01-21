import React from "react";

const UniverseSelector = ({ selectedUniverse, setSelectedUniverse }) => {
    const universes = [
        { id: null, label: "Épicerie", desc: "Alimentation & Maison", emoji: "🛒", colorClass: "emerald" },
        { id: 2, label: "Électronique", desc: "High-Tech & Électroménager", emoji: "📱", colorClass: "blue" },
    ];

    return (
        <section className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 px-4">
            {universes.map((uni) => (
                <button
                    key={uni.id}
                    onClick={() => setSelectedUniverse(uni.id)}
                    className={`flex-1 max-w-xs font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${selectedUniverse === uni.id
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
