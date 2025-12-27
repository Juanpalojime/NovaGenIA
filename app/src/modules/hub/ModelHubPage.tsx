/**
 * Model Hub Page
 * 
 * Main page for discovering, downloading, and managing
 * community models from Hugging Face Hub.
 */

import React, { useEffect, useState } from 'react';
import { Search, Download, Trash2, HardDrive } from 'lucide-react';
import { useModelHubStore } from './stores/useModelHubStore';

export const ModelHubPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'search' | 'installed'>('search');

    const {
        searchResults,
        searchQuery,
        modelType,
        searching,
        installedModels,
        loadingInstalled,
        activeDownloads,
        searchModels,
        downloadModel,
        fetchInstalled,
        deleteModel,
        setSearchQuery,
        setModelType,
    } = useModelHubStore();

    useEffect(() => {
        fetchInstalled();
    }, [fetchInstalled]);

    const handleSearch = () => {
        searchModels(searchQuery, modelType);
    };

    const modelTypes = [
        { value: 'all', label: 'All Models' },
        { value: 'checkpoint', label: 'Checkpoints' },
        { value: 'lora', label: 'LoRAs' },
        { value: 'vae', label: 'VAEs' },
        { value: 'controlnet', label: 'ControlNets' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Model Hub
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Discover and download community models from Hugging Face
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'search'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        <Search className="inline w-4 h-4 mr-2" />
                        Search Models
                    </button>
                    <button
                        onClick={() => setActiveTab('installed')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'installed'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        <HardDrive className="inline w-4 h-4 mr-2" />
                        Installed ({installedModels.length})
                    </button>
                </div>

                {/* Search Tab */}
                {activeTab === 'search' && (
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="flex gap-2">
                            <select
                                value={modelType}
                                onChange={(e) => setModelType(e.target.value)}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                            >
                                {modelTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>

                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search models..."
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={handleSearch}
                                disabled={searching}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                            >
                                {searching ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {/* Results */}
                        {searching && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!searching && searchResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResults.map((model) => {
                                    const downloadStatus = activeDownloads.get(model.id);
                                    const isDownloading = downloadStatus?.status === 'downloading';
                                    const isComplete = downloadStatus?.status === 'complete';

                                    return (
                                        <div
                                            key={model.id}
                                            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                                        >
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                {model.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                by {model.author}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                <span>⬇️ {model.downloads.toLocaleString()}</span>
                                                <span>❤️ {model.likes}</span>
                                            </div>

                                            {model.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {model.tags.slice(0, 3).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => downloadModel(model.id, modelType)}
                                                disabled={isDownloading || isComplete}
                                                className={`w-full px-4 py-2 rounded-lg transition-colors ${isComplete
                                                    ? 'bg-green-600 text-white cursor-not-allowed'
                                                    : isDownloading
                                                        ? 'bg-blue-400 text-white cursor-wait'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    }`}
                                            >
                                                <Download className="inline w-4 h-4 mr-2" />
                                                {isComplete ? 'Downloaded' : isDownloading ? 'Downloading...' : 'Download'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!searching && searchResults.length === 0 && searchQuery && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No models found. Try a different search query.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Installed Tab */}
                {activeTab === 'installed' && (
                    <div>
                        {loadingInstalled && (
                            <div className="text-center py-12">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                            </div>
                        )}

                        {!loadingInstalled && installedModels.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {installedModels.map((model) => (
                                    <div
                                        key={model.path}
                                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {model.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {model.type}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteModel(model.path)}
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Size: {model.size_mb.toFixed(1)} MB
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loadingInstalled && installedModels.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No models installed yet. Search and download models to get started.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelHubPage;
