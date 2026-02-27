import React from "react";

const GiftsFilterTabs = ({ selectedTab, setSelectedTab, counts }) => {
    return (
        <div className="max-w-6xl mx-auto mb-6">
            <div className="flex gap-2 justify-center flex-wrap">
                <TabButton
                    active={selectedTab === "all"}
                    onClick={() => setSelectedTab("all")}
                    label={`Tous (${counts.all})`}
                    color="blue"
                />
                <TabButton
                    active={selectedTab === "active"}
                    onClick={() => setSelectedTab("active")}
                    label={`Actifs (${counts.active})`}
                    color="green"
                />
                <TabButton
                    active={selectedTab === "used"}
                    onClick={() => setSelectedTab("used")}
                    label={`Utilisés/Expirés (${counts.used})`}
                    color="gray"
                />
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label, color }) => {
    const colorClasses = {
        blue: "from-blue-600 to-indigo-600",
        green: "from-green-600 to-emerald-600",
        gray: "from-gray-600 to-slate-600"
    };

    return (
        <button
            onClick={onClick}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all text-sm ${active
                    ? `bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
        >
            {label}
        </button>
    );
};

export default GiftsFilterTabs;
