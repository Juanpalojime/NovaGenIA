import React from 'react';
import { CloudUpload, Edit, Plus } from 'lucide-react';

const IMAGES = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB3nGLZv0wn9foFUMu7IqWYhbGJsJN_SqgSGO2VBsDOCERKpR5yA83wDKNk0cFlUEZuxFoeXbN3gcKllHF26AejDb4OWiuSy0NE-qK6bhM8ToT56h8Bgd8DS00mqLT62G6xfti4AMhsVbi3H9W9eoKPlgoRl22xTWmjR7WMTUOiymqXK1Vvr1b911yxDsH3UpTxTaN-sBrb5qyYwgqgU5TRIugulrDpgtctyG6n8dYa84O5xnGCbPBu8b_14gGFN_Ofh_i_mBNVZ4A',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAd-ewNzHIaqFBdL_XbcaatrtzrVaNef1tVfiDOjVvKNbLWNc21IHf28JqIz3KLQhB1O59Wj-TCAqOG8B47rbcCjZoYJhvsBr963BCi8ToQTg_kQRURd2LDgtkX3g9lhHGAKFF_oQQzFZjXkACO0aoIibjvi1BHKi-1TpRjFdyN3X2Pbmeq8VHka0UYIaR0bydJiL1p5PJQriAYjX1_ZP-99dE2vcx6wXKUszEtd0IO_IArZpKWi5-WWFWYM0yVr_wXcCaVegARYw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCnwZ-2SOkC8gCSZNgpdYRYg88L1QhqzuM48pIIiOR8u03cOJdi5g4Gs-U3neCVgjaCnp5LDQm87OEohkJEiHUG28urZAX1ZkSWy5p5KiGsBz3detrdpho8mUKfGA0k1qoJwokEA92NyWb0dTKdE1-CpyqqGmfFXkCdp2TUvtSt57c_iANHKEz7C2ORh1JQYtcmULQpEjlCXwd9Rq1itwPScpjGrMsKatfMcPh2TQUwsSKqRVYEBRqBHGSYE8VsPDf-G5pCWLWihAc',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAd2Y-2pI-9CHdsFAS2JEDPzqc9WpadFcZF0NDQCbMVhUwu1Z7PrJCDov8Fd6iGWxIQJqODzv0HE4Szg7JjPVtcpS-Rb02C0Hu7m4VtjjlG3g-ZkQlguz2CZxlQW6IFislr0xqHgBiGVX1GQQS62EZkx5ETQMG50fe1kiUIAJCrjN1BpiYMimfEJj09X8VvZ4O0jUraEnjjVsptQrFAJ1JDuw6qg9vMqzaTuXHYXpDC2jw8bEh4woZlTQ4Lnaqneoz0Fl8T4zzzD9U',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBGEmzypUOXzcTWXiVdmX8j3-duAGPf8tgieaRp8q61rh3BltZ5K7U-VmOJEyYVqLMYonFdzLuuIZKzn14LdQ91rdpu2SwFp1B70EN_v3w3I-r9Ik_9B8gBvBT5TaYUOfdZi0bke3kh516wLvJDjxM7ess16NcCF58WDWRMa5pPNTxHf0-vCasyO4xu_6vK76JbC5Qr-6_cNa64RUTBdYMXFdnSrjiWsgsR1VK0vpCrcu1XfXPCxfvc_M8AmbFTB308iZBfs5jGcAc',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDEI5SguCZWkDLtYSvg_uUBKH9P9qN2EeYoZGYir8u87ghEWyaMfNinXotqd9952cIwmV4c7clROCy6aCBm4Ua-Quuv0NSUqFsLW-frHTOTVEfsFQd_KaUwPDxAe5-olLDMPBZ9hOMqaLVVXFqUlZKPQxAe5-olLDMPBZ9hOMqaLVVXFqUlZKPQxCfMsXpXJ48g1VEO8gFzxY10o7jI9aHkaiVgeS5RYsYx-ERlMbjMVULewBXd7S7Uwxe4huP9cLEA-I9BooXqDztj0yAUIhxCn9o6SpwgLRPbxSBzilRNn0'
];

export const DatasetPanel: React.FC = () => {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden flex flex-col h-full shadow-sm">
      <h3 className="bg-slate-50 dark:bg-[#2a1d36] border-b border-border-light dark:border-border-dark text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider px-5 py-4 flex items-center justify-between">
        Dataset Ingestion
        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-mono">12/20</span>
      </h3>
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Drag Drop Zone */}
        <div className="border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
          <CloudUpload className="text-primary mb-2 group-hover:scale-110 transition-transform" size={40} />
          <p className="text-slate-700 dark:text-white font-medium text-sm">Drop images here</p>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">or click to browse</p>
        </div>

        {/* Quality Indicator */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-500 dark:text-gray-400">Dataset Consistency</span>
            <span className="text-green-500">High</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-3/4 rounded-full"></div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-3 gap-2 mt-2 overflow-y-auto max-h-[400px] pr-1 scrollbar-thin">
          {IMAGES.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg bg-slate-200 dark:bg-slate-800 bg-cover bg-center border border-transparent hover:border-primary cursor-pointer relative group transition-colors" style={{backgroundImage: `url('${url}')`}}>
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                <Edit className="text-white" size={16} />
              </div>
            </div>
          ))}
          
          <div className="aspect-square rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary cursor-pointer transition-colors hover:bg-white/5">
            <Plus size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};