/**
 * LoRA Mixer Component
 * 
 * Interface for combining multiple LoRAs with weight sliders
 * and preview generation.
 */

import React from 'react';
import { X, Sliders } from 'lucide-react';
import { useLoRAStore } from '../stores/useLoRAStore';

export const LoRAMixer: React.FC = () => {
    const { selectedLoras, loras, removeLoRA, updateWeight, clearSelection } =
        useLoRAStore();

    const getLoRAInfo = (loraId: string) => {
        return loras.find((l) => l.id === loraId);
    };

    if (selectedLoras.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
                <Sliders className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                    No LoRAs selected. Add LoRAs from the browser to start mixing.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    LoRA Mix ({selectedLoras.length})
                </h3>
                <button
                    onClick={clearSelection}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                    Clear All
                </button>
            </div>

            {/* LoRA List with Sliders */}
            <div className="space-y-3">
                {selectedLoras.map((selected) => {
                    const lora = getLoRAInfo(selected.id);
                    if (!lora) return null;

                    return (
                        <div
                            key={selected.id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {lora.name}
                                    </h4>
                                    {lora.trigger_words.length > 0 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Triggers: {lora.trigger_words.join(', ')}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeLoRA(selected.id)}
                                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Weight Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Weight</span>
                                    <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                                        {selected.weight.toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.05"
                                    value={selected.weight}
                                    onChange={(e) =>
                                        updateWeight(selected.id, parseFloat(e.target.value))
                                    }
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>0.0</span>
                                    <span>1.0</span>
                                    <span>2.0</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Mixing Tips
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Weight 1.0 = full strength</li>
                    <li>• Weight 0.5-0.8 = subtle influence</li>
                    <li>• Weight &gt;1.0 = exaggerated effect</li>
                    <li>• Combine 2-3 LoRAs for best results</li>
                </ul>
            </div>

            {/* Combined Weight Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total combined weight:{' '}
                    <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {selectedLoras.reduce((sum, l) => sum + l.weight, 0).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};
