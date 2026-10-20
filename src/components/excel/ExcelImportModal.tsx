'use client';

import React, { useState, useRef } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { parseExcelWorkbook } from '@/lib/excel/parser';
import { Post } from '@/types/post';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExcelImportModal({ isOpen, onClose }: ExcelImportModalProps) {
  const { activeWorkspace, importPosts } = usePostPilot();
  const [isDragging, setIsDragging] = useState(false);
  const [parsedPosts, setParsedPosts] = useState<Post[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMsg('Veuillez sélectionner un fichier Excel (.xlsx ou .xls).');
      return;
    }

    setFileName(file.name);
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelWorkbook(buffer, 'Octobre 2026', activeWorkspace.id);

      if (result.errors && result.errors.length > 0 && result.importedPosts.length === 0) {
        setErrorMsg(result.errors.join(' '));
      } else {
        setParsedPosts(result.importedPosts);
      }
    } catch {
      setErrorMsg('Erreur lors de la lecture du fichier Excel.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedPosts.length > 0) {
      importPosts(parsedPosts);
      onClose();
      setParsedPosts([]);
      setFileName(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs tracking-tight uppercase text-zinc-900 dark:text-zinc-100">
                Importer le Calendrier Excel
              </h3>
              <p className="text-[11px] text-zinc-500">
                Extraction des 12 colonnes de production pour {activeWorkspace.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-900'
                : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept=".xlsx,.xls"
              className="hidden"
            />
            
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Analyse de la feuille en cours...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 mb-1">
                  <Upload className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  {fileName ? (
                    <span className="font-semibold text-zinc-950 dark:text-white font-mono">{fileName}</span>
                  ) : (
                    <>
                      Glissez votre fichier <span className="font-mono">.xlsx</span> ici ou cliquez pour parcourir
                    </>
                  )}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Colonnes : Semaine, Date, Plateforme, Format, Contenu, Boisson, Statut...
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 flex items-center gap-2 text-xs text-zinc-800 dark:text-zinc-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-zinc-600 dark:text-zinc-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Summary Preview */}
          {parsedPosts.length > 0 && (
            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                  <CheckCircle2 className="w-4 h-4" />
                  {parsedPosts.length} publications prêtes à être importées
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Feuille : Octobre 2026
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {parsedPosts.slice(0, 5).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] p-2 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <span className="font-mono text-zinc-500">{p.scheduledDate}</span>
                    <span className="truncate max-w-[200px] font-medium text-zinc-900 dark:text-zinc-100">{p.theme}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 font-mono">{p.format}</span>
                  </div>
                ))}
                {parsedPosts.length > 5 && (
                  <p className="text-[10px] text-zinc-500 text-center pt-1 font-mono">
                    + {parsedPosts.length - 5} autres publications...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedPosts.length === 0}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              parsedPosts.length > 0
                ? 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black shadow-xs'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <span>Confirmer l&apos;importation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
