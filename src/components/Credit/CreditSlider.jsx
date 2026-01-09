import React from 'react';

const CreditSlider = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = 'DT',
    icon,
    helperText
}) => {
    const percentage = ((value - min) / (max - min)) * 100;

    const handleInputChange = (e) => {
        const newValue = parseFloat(e.target.value) || min;
        const clampedValue = Math.min(Math.max(newValue, min), max);
        onChange(clampedValue);
    };

    return (
        <div className="space-y-3">
            {/* Label and Value */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wide">
                    {icon && <span className="text-base">{icon}</span>}
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={value}
                        onChange={handleInputChange}
                        min={min}
                        max={max}
                        step={step}
                        className="w-24 px-2 py-1.5 border border-slate-200 rounded text-right font-black text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-slate-400 font-bold text-[10px] uppercase">{unit}</span>
                </div>
            </div>

            {/* Slider */}
            <div className="relative">
                <input
                    type="range"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    min={min}
                    max={max}
                    step={step}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #f1f5f9 ${percentage}%, #f1f5f9 100%)`
                    }}
                />
            </div>

            {/* Min/Max Labels and Helper Text */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>
                    {min.toLocaleString()} {unit}
                </span>
                {helperText && (
                    <span className="text-blue-500/50 normal-case italic font-medium">{helperText}</span>
                )}
                <span>
                    {max.toLocaleString()} {unit}
                </span>
            </div>

            <style jsx>{`
                .slider-thumb::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s;
                }

                .slider-thumb::-webkit-slider-thumb:hover {
                    background: #2563eb;
                    transform: scale(1.1);
                }

                .slider-thumb::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s;
                }

                .slider-thumb::-moz-range-thumb:hover {
                    background: #2563eb;
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
};

export default CreditSlider;
