import React, { useRef } from 'react'
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react'
import { useTrainingStore } from '../stores/useTrainingStore'
import { clsx } from 'clsx'

const DatasetUploader: React.FC = () => {
    const { dataset, addDatasetImages, removeDatasetImage } = useTrainingStore()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map((file, i) => ({
                id: `img-${Date.now()}-${i}`,
                url: URL.createObjectURL(file),
                caption: file.name.split('.')[0] // Auto-caption from filename
            }))
            addDatasetImages(newImages)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-bold bg-gradient-to-r from-neon-cyan to-blue-500 bg-clip-text text-transparent">DATASET</span>
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-500">{dataset.length} images</span>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-cyan/20 text-neon-cyan text-xs font-bold rounded hover:bg-neon-cyan/30 transition-colors"
                >
                    <Plus size={14} /> Add Images
                </button>
                <input type="file" ref={fileInputRef} hidden multiple onChange={handleFileChange} accept="image/*" />
            </div>

            {dataset.length === 0 ? (
                <div
                    className="flex-1 flex flex-col items-center justify-center border-dashed border-2 border-white/10 m-4 rounded-xl text-gray-500 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="p-4 rounded-full bg-white/5 group-hover:bg-neon-cyan/20 group-hover:text-neon-cyan transition-colors mb-3">
                        <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium">Drop training images here</p>
                    <p className="text-xs text-gray-600 mt-1">or click to browse</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                    {/* Dataset Grid */}
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {dataset.map(img => (
                            <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-neon-cyan/50 transition-colors bg-black/40">
                                <img src={img.url} alt="Dataset" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                <button
                                    onClick={() => removeDatasetImage(img.id)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                                >
                                    <X size={12} />
                                </button>
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[10px] text-gray-300 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                    {img.caption}
                                </div>
                            </div>
                        ))}

                        {/* Add Placeholder */}
                        <div
                            className="aspect-square rounded-lg border border-dashed border-white/10 flex items-center justify-center text-gray-600 hover:text-neon-cyan hover:border-neon-cyan/50 cursor-pointer transition-all bg-white/5"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Plus size={20} />
                        </div>
                    </div>

                    {/* Dataset Insights */}
                    <div className="mt-2 text-[10px] text-gray-500 flex gap-4 border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                            <span className="uppercase tracking-wider font-bold text-gray-600">Total Images</span>
                            <span className="text-neon-cyan font-mono text-xs">{dataset.length}</span>
                        </div>
                        <div className="w-px h-6 bg-white/5" />
                        <div className="flex flex-col">
                            <span className="uppercase tracking-wider font-bold text-gray-600">Est. Steps</span>
                            <span className="text-white font-mono text-xs">{dataset.length * 100}</span>
                        </div>
                        <div className="w-px h-6 bg-white/5" />
                        <div className="flex flex-col">
                            <span className="uppercase tracking-wider font-bold text-gray-600">Resolution</span>
                            <span className="text-white font-mono text-xs">Mixed (512+)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DatasetUploader
