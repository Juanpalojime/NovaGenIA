import React, { useState, useRef } from 'react'
import { User, Award, Activity, Database, Clock, Edit2, Shield, Save, X } from 'lucide-react'
import { useGlobalStore } from '../../../store/useGlobalStore'

const ProfileSection: React.FC = () => {
    const { user, updateUser, addNotification } = useGlobalStore()
    const [isEditingName, setIsEditingName] = useState(false)
    const [tempUsername, setTempUsername] = useState(user.username)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                addNotification({
                    type: 'error',
                    message: 'Please select an image file'
                })
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                addNotification({
                    type: 'error',
                    message: 'Image size must be less than 5MB'
                })
                return
            }

            // Create object URL for preview
            const reader = new FileReader()
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string
                updateUser({ avatar: imageUrl })
                addNotification({
                    type: 'success',
                    message: 'Avatar updated successfully!'
                })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSaveUsername = () => {
        if (tempUsername.trim().length < 3) {
            addNotification({
                type: 'error',
                message: 'Username must be at least 3 characters'
            })
            return
        }

        updateUser({ username: tempUsername.trim() })
        setIsEditingName(false)
        addNotification({
            type: 'success',
            message: 'Username updated successfully!'
        })
    }

    const handleCancelEdit = () => {
        setTempUsername(user.username)
        setIsEditingName(false)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header / Avatar */}
            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-neon-cyan/5 to-transparent border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <Shield size={120} className="text-white/5 rotate-12" />
                </div>

                {/* Avatar with Upload */}
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <div className="w-24 h-24 rounded-full border-2 border-neon-cyan p-1 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                        <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={24} className="text-white" />
                    </div>
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-black" title="Online" />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                </div>

                <div className="flex-1 relative z-10">
                    {/* Username Edit */}
                    {isEditingName ? (
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                value={tempUsername}
                                onChange={(e) => setTempUsername(e.target.value)}
                                className="text-2xl font-bold text-white bg-white/10 border border-neon-cyan rounded px-3 py-1 focus:outline-none focus:border-neon-cyan"
                                placeholder="Enter username"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveUsername()
                                    if (e.key === 'Escape') handleCancelEdit()
                                }}
                            />
                            <button
                                onClick={handleSaveUsername}
                                className="p-2 bg-neon-cyan text-black rounded-lg hover:bg-neon-cyan/80 transition-colors"
                                title="Save"
                            >
                                <Save size={18} />
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                title="Cancel"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <h3 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                            {user.username}
                            <button
                                onClick={() => setIsEditingName(true)}
                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Edit username"
                            >
                                <Edit2 size={16} className="text-gray-400" />
                            </button>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/30 uppercase tracking-wide font-bold">
                                {user.role}
                            </span>
                        </h3>
                    )}
                    <p className="text-gray-400 text-sm">Frontend Architect & AI Enthusiast</p>

                    <div className="flex gap-2 mt-4">
                        {user.badges.map((badge, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs text-gray-300">
                                <Award size={12} className="text-yellow-500" /> {badge}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/20 border border-white/10 rounded-xl p-5 flex items-center gap-4 hover:border-neon-cyan/30 transition-colors">
                    <div className="p-3 bg-neon-cyan/10 rounded-lg text-neon-cyan">
                        <User size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{user.stats.imagesGenerated}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Images Generated</div>
                    </div>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-xl p-5 flex items-center gap-4 hover:border-neon-cyan/30 transition-colors">
                    <div className="p-3 bg-neon-magenta/10 rounded-lg text-neon-magenta">
                        <Database size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{user.stats.modelsTrained}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Models Trained</div>
                    </div>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-xl p-5 flex items-center gap-4 hover:border-neon-cyan/30 transition-colors">
                    <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{user.stats.hoursActive}h</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Active Time</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Mockup */}
            <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h4 className="font-bold text-gray-200">Recent Activity</h4>
                    <button className="text-xs text-neon-cyan hover:underline">View All</button>
                </div>
                <div className="divide-y divide-white/5">
                    {[
                        { action: 'Trained model', target: 'CyberPunk_V2', time: '2 hours ago', icon: Database },
                        { action: 'Generated', target: '124 images', time: '5 hours ago', icon: Activity },
                        { action: 'Updated profile', target: 'Avatar', time: '1 day ago', icon: User },
                    ].map((item, i) => (
                        <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                            <div className="p-2 bg-white/5 rounded-full text-gray-400">
                                <item.icon size={16} />
                            </div>
                            <div className="flex-1">
                                <span className="text-gray-300 text-sm">{item.action} <span className="text-white font-medium">{item.target}</span></span>
                            </div>
                            <span className="text-xs text-gray-600">{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ProfileSection
