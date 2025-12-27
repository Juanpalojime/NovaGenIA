/**
 * LoRA Browser Component
 * 
 * Grid view of available LoRAs with search, filtering,
 * and selection for mixing.
 */

import React, { useEffect } from 'react';
import { Search, Plus, Tag } from 'lucide-react';
import { useLoRAStore } from '../stores/useLoRAStore';

export const LoRABrowser: React.FC = () => {
    const {
        loras,
        loading,
        searchQuery,
        selectedTags,
        selectedLoras,
        fetchLoras,
        searchLoras,
        addLoRA,
        setSearchQuery,
        setSelectedTags,
    } = useLoRAStore();

    useEffect(() => {
        fetchLoras();
    }, [fetchLoras]);

    const handleSearch = () => {
        searchLoras(searchQuery, selectedTags);
    };

    const isSelected = (loraId: string) => {
        return selectedLoras.some((l) => l.id === loraId);
    };

    // Get all unique tags
    const allTags = Array.from(
        new Set(loras.flatMap((lora) => lora.tags))
    ).sort();

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search LoRAs..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => {
                                const newTags = selectedTags.includes(tag)
                                    ? selectedTags.filter((t) => t !== tag)
                                    : [...selectedTags, tag];
                                setSelectedTags(newTags);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedTags.includes(tag)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Tag className="inline w-3 h-3 mr-1" />
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* LoRA Grid */}
            {!loading && loras.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {loras.map((lora) => (
                        <div
                            key={lora.id}
                            className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all cursor-pointer ${isSelected(lora.id)
                                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            {/* Preview Image */}
                            <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-lg relative overflow-hidden">
                                {lora.preview_image ? (
                                    <img
                                        src={lora.preview_image}
                                        alt={lora.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                                        {lora.name.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {/* Add Button */}
                                <button
                                    onClick={() => addLoRA(lora.id)}
                                    disabled={isSelected(lora.id)}
                                    className={`absolute bottom-2 right-2 p-2 rounded-full transition-all ${isSelected(lora.id)
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white/90 hover:bg-white text-gray-900'
                                        }`}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                    {lora.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                    {lora.description}
                                </p>
                                {lora.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {lora.tags.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && loras.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                        No LoRAs found. Place LoRA files in <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">models/loras/</code>
                    </p>
                </div>
            )}
        </div>
    );
};
