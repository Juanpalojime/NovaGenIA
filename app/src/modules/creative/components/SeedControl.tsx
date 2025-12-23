import React from 'react'
import { Lock, Unlock, Dices } from 'lucide-react'
import { motion } from 'framer-motion'

interface SeedControlProps {
    seed: number
    locked: boolean
    onSeedChange: (seed: number) => void
    onLockToggle: () => void
    onRandomize: () => void
}

export const SeedControl: React.FC<SeedControlProps> = ({
    seed,
    locked,
    onSeedChange,
    onLockToggle,
    onRandomize
}) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Seed
                </label>
                <motion.button
                    onClick={onLockToggle}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`
            p-1 rounded transition-colors
            ${locked ? 'text-neon-cyan' : 'text-gray-500 hover:text-gray-300'}
          `}
                    title={locked ? 'Unlock seed' : 'Lock seed'}
                >
                    {locked ? <Lock size={14} /> : <Unlock size={14} />}
                </motion.button>
            </div>

            <div className="flex gap-2">
                <input
                    type="number"
                    value={seed === -1 ? '' : seed}
                    onChange={(e) => onSeedChange(parseInt(e.target.value) || -1)}
                    placeholder="Random"
                    className="
            flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2
            text-sm text-white font-mono
            focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan
            transition-all
          "
                />
                <motion.button
                    onClick={onRandomize}
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="
            p-2 bg-black/40 border border-white/10 rounded-lg
            text-gray-400 hover:text-white hover:border-white/30
            transition-colors
          "
                    title="Randomize seed"
                >
                    <Dices size={18} />
                </motion.button>
            </div>

            {locked && seed !== -1 && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-neon-cyan flex items-center gap-1"
                >
                    <Lock size={12} />
                    <span>Seed locked for reproducible results</span>
                </motion.p>
            )}
        </div>
    )
}
