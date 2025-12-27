import { useEffect, useState } from 'react';
import { HardDrive, Save } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function StorageSection() {
    const [config, setConfig] = useState({ auto_save_drive: false });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await apiFetch('/system/config');
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
            }
        } catch (error) {
            console.error('Failed to load system config', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDrive = async () => {
        const newValue = !config.auto_save_drive;
        setConfig({ ...config, auto_save_drive: newValue });
        setSaving(true);
        try {
            await apiFetch('/system/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auto_save_drive: newValue })
            });
        } catch (error) {
            console.error('Failed to save config', error);
            setConfig({ ...config, auto_save_drive: !newValue }); // Revert on error
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="space-y-6 animate-fade-in">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-neon-cyan/10 rounded-lg">
                        <HardDrive className="text-neon-cyan" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Storage & Cloud</h3>
                        <p className="text-sm text-gray-400">Manage how your generations are saved.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-full">
                                <Save size={18} className="text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">Google Drive Auto-save</h4>
                                <p className="text-xs text-gray-400">
                                    Automatically copy generated images to your Google Drive
                                    <span className="block text-neon-cyan/70 mt-0.5 text-[10px]">
                                        (Requires Drive to be mounted in Colab)
                                    </span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={toggleDrive}
                            disabled={loading || saving}
                            className={`
                                relative w-12 h-6 rounded-full transition-colors duration-200
                                ${config.auto_save_drive ? 'bg-neon-cyan' : 'bg-gray-700'}
                                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <span
                                className={`
                                    absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
                                    ${config.auto_save_drive ? 'translate-x-6' : 'translate-x-0'}
                                `}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
