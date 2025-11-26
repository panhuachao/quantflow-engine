
import React from 'react';
import { NodeData } from '../../types';
import { getNodeDefinition } from './nodeDefinitions';
import { X, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from '../../contexts/LanguageContext';

interface PropertiesPanelProps {
  node: NodeData;
  onClose: () => void;
  onUpdate: (key: string, value: any) => void;
  onDelete: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onClose, onUpdate, onDelete }) => {
  const definition = getNodeDefinition(node.type);
  const { ConfigComponent, icon: Icon, iconColor, label } = definition;
  const { t } = useTranslation();

  // Wrapper for onUpdate to handle deep config keys properly if needed
  const handleConfigUpdate = (key: string, value: any) => {
    // If key starts with "config.", it's already handled by parent, otherwise prepending
    // But mostly components inside will likely just pass the key name relative to config
    // We assume parent onUpdate handles "config.KEY" string format or we wrap it here.
    // The previous implementation used "config.key". Let's standardise on passing "key" and prepending here.
    onUpdate(`config.${key}`, value);
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto z-20 shadow-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-xl font-bold text-white">{t('workflow.editor.properties')}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-2">{t('workflow.editor.node_label')}</label>
          <input 
            type="text" 
            value={node.label}
            onChange={(e) => onUpdate('label', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
          />
        </div>

        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Icon size={20} className={iconColor} />
              <div>
                 <div className="text-sm font-bold text-slate-200">{label}</div>
                 <div className="text-[10px] text-slate-500 uppercase">{node.type}</div>
              </div>
           </div>
        </div>

        <div className="border-t border-slate-800 pt-4">
           {/* Render Dynamic Config Form */}
           <ConfigComponent config={node.config} onUpdate={handleConfigUpdate} />
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6 mt-4 shrink-0">
        <Button variant="danger" size="sm" className="w-full" onClick={onDelete} icon={<Trash2 size={16}/>}>
          {t('workflow.editor.delete_node')}
        </Button>
      </div>
    </div>
  );
};