import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DatasetPanel } from './components/DatasetPanel';
import { ParametersPanel } from './components/ParametersPanel';
import { MonitorPanel } from './components/MonitorPanel';
import { ChevronRight, Cpu, Coins } from 'lucide-react';
import { TrainingParams, TrainingState, LogEntry } from './types';
import { streamTrainingLogs } from './services/geminiService';

const App: React.FC = () => {
    const [params, setParams] = useState<TrainingParams>({
        projectName: 'Cyberpunk_V4',
        baseModel: 'NeoGen_XL_v1',
        triggerWord: 'cbr_pnk style',
        steps: 2000,
        loraRank: 128,
        learningRate: 40,
        gradientCheckpointing: false,
        mixedPrecision: true,
    });

    const [trainingState, setTrainingState] = useState<TrainingState>({
        status: 'idle',
        progress: 0,
        logs: [],
        currentLoss: 0,
        currentAccuracy: 0
    });

    const handleStartTraining = async () => {
        setTrainingState({
            status: 'training',
            progress: 0,
            logs: [{
                timestamp: new Date().toLocaleTimeString(),
                message: `$ neogen-cli init --model "${params.projectName}"`,
                type: 'success'
            }],
            currentLoss: 0.8,
            currentAccuracy: 0.2
        });

        try {
            const stream = streamTrainingLogs(params);
            let progressCounter = 0;
            
            for await (const logText of stream) {
                 // Simulate progress increments based on stream chunks
                 progressCounter += Math.random() * 8 + 2; 
                 if (progressCounter > 98) progressCounter = 98;

                 setTrainingState(prev => ({
                    ...prev,
                    progress: progressCounter,
                    logs: [...prev.logs, {
                        timestamp: new Date().toLocaleTimeString(),
                        message: `> ${logText}`,
                        type: 'info'
                    }],
                    // Simulate loss dropping and accuracy rising
                    currentLoss: Math.max(0.1, prev.currentLoss * 0.95),
                    currentAccuracy: Math.min(0.99, prev.currentAccuracy * 1.02)
                }));
            }
            
            setTrainingState(prev => ({
                ...prev,
                status: 'completed',
                progress: 100,
                logs: [...prev.logs, {
                    timestamp: new Date().toLocaleTimeString(),
                    message: "Training completed successfully.",
                    type: 'success'
                }]
            }));

        } catch (error) {
             setTrainingState(prev => ({
                ...prev,
                status: 'idle',
                logs: [...prev.logs, {
                    timestamp: new Date().toLocaleTimeString(),
                    message: "Error: Connection lost or API limit reached.",
                    type: 'error'
                }]
            }));
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-1 flex flex-col px-4 md:px-10 lg:px-20 py-8">
                <div className="mx-auto w-full max-w-[1400px]">
                    
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 pb-6 items-center">
                        <a className="text-slate-500 dark:text-[#ad92c9] hover:text-primary text-sm font-medium leading-normal" href="#">Home</a>
                        <ChevronRight size={16} className="text-slate-400 dark:text-[#ad92c9]" />
                        <span className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Centro de Entrenamiento</span>
                    </div>

                    {/* Page Heading */}
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-end mb-10">
                        <div className="flex flex-col gap-3 max-w-2xl">
                            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Training Center</h1>
                            <p className="text-slate-600 dark:text-[#ad92c9] text-base font-normal leading-normal">
                                Personalize creative models using evolved T-LoRA technology. Configure your dataset and fine-tune hyperparameters for professional results.
                            </p>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                            <div className="flex min-w-[158px] flex-1 flex-col gap-1 rounded-xl p-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm hover:border-primary/50 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <Cpu className="text-primary" size={20} />
                                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">GPU Status</p>
                                </div>
                                <p className="text-slate-900 dark:text-white tracking-tight text-lg font-bold leading-tight">
                                    NVIDIA A100 <span className="text-green-500 text-xs ml-2 font-normal">● Online</span>
                                </p>
                            </div>
                            <div className="flex min-w-[158px] flex-1 flex-col gap-1 rounded-xl p-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm hover:border-primary/50 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <Coins className="text-primary" size={20} />
                                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Credits</p>
                                </div>
                                <p className="text-slate-900 dark:text-white tracking-tight text-lg font-bold leading-tight">2,450</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                        <div className="lg:col-span-3 h-full">
                            <DatasetPanel />
                        </div>
                        <div className="lg:col-span-5 h-full">
                            <ParametersPanel params={params} setParams={setParams} />
                        </div>
                        <div className="lg:col-span-4 h-full">
                            <MonitorPanel trainingState={trainingState} onStartTraining={handleStartTraining} totalSteps={params.steps} />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default App;