import React, { useState, useEffect, useRef } from 'react';
import { HazzatLine, HazzatItem, HazzatSymbolType, HazzatTextItem, HazzatSymbolItem } from '../types';
import { HazzatSymbol, DecorativeOrnament } from './HazzatSymbol';
import { Plus, Trash2, MoveUp, MoveDown, Type as TypeIcon, Music, Download, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toJpeg } from 'html-to-image';

const SYMBOL_TYPES: { type: HazzatSymbolType; label: string; key: string }[] = [
  { type: 'note-o', label: 'Note (o)', key: 'o' },
  { type: 'note-i', label: 'Note (i)', key: 'i' },
  { type: 'long', label: 'Long', key: '-' },
  { type: 'pause', label: 'Pause', key: '/' },
  { type: 'trill', label: 'Trill', key: '~' },
  { type: 'short', label: 'Short', key: '.' },
  { type: 'slur', label: 'Slur', key: 'u' },
  { type: 'high', label: 'High', key: 'h' },
  { type: 'low', label: 'Low', key: 'l' },
];

export const HazzatEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [lines, setLines] = useState<HazzatLine[]>([
    {
      id: 'line-1',
      items: [
        { id: 'i1', type: 'text', value: '', offset: 0 },
      ],
    },
  ]);

  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const exportToJpg = async () => {
    if (editorRef.current === null) return;
    
    try {
      const filter = (node: HTMLElement) => {
        const exclusionClasses = ['no-print'];
        return !exclusionClasses.some(classname => node.classList?.contains(classname));
      };

      const dataUrl = await toJpeg(editorRef.current, { 
        quality: 0.95,
        backgroundColor: '#F5F4F0',
        filter: filter as any,
        style: {
          padding: '40px'
        }
      });
      const link = document.createElement('a');
      link.download = `${title || 'hazzat'}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const addLine = () => {
    const newLine: HazzatLine = {
      id: `line-${Date.now()}`,
      items: [{ id: `item-${Date.now()}`, type: 'text', value: '', offset: 0 }],
    };
    setLines([...lines, newLine]);
    setActiveItemId(newLine.items[0].id);
  };

  const updateTextItem = (lineId: string, itemId: string, value: string) => {
    setLines(lines.map(line => {
      if (line.id === lineId) {
        return {
          ...line,
          items: line.items.map(item => item.id === itemId && item.type === 'text' ? { ...item, value } : item)
        };
      }
      return line;
    }));
  };

  const insertItem = (lineId: string, afterItemId: string | null, newItem: HazzatItem) => {
    setLines(lines.map(line => {
      if (line.id === lineId) {
        const index = afterItemId ? line.items.findIndex(i => i.id === afterItemId) : -1;
        const newItems = [...line.items];
        newItems.splice(index + 1, 0, newItem);
        return { ...line, items: newItems };
      }
      return line;
    }));
    setActiveItemId(newItem.id);
  };

  const updateItemOffset = (lineId: string, itemId: string, delta: number) => {
    setLines(lines.map(line => {
      if (line.id === lineId) {
        const index = line.items.findIndex(i => i.id === itemId);
        if (index === -1) return line;

        const targetItem = line.items[index];
        const isBase = targetItem.type === 'text' || targetItem.symbolType === 'note-o' || targetItem.symbolType === 'note-i' || targetItem.symbolType === 'long';

        const newItems = [...line.items];
        
        // Update the target item
        newItems[index] = { ...targetItem, offset: Math.max(-4, Math.min(4, targetItem.offset + delta)) };

        // If it's a base item, update all subsequent modifiers
        if (isBase) {
          let nextIdx = index + 1;
          while (nextIdx < newItems.length) {
            const nextItem = newItems[nextIdx];
            if (nextItem.type === 'symbol' && ['slur', 'short', 'high', 'low'].includes(nextItem.symbolType)) {
              newItems[nextIdx] = { ...nextItem, offset: Math.max(-4, Math.min(4, nextItem.offset + delta)) };
              nextIdx++;
            } else {
              break;
            }
          }
        }

        // Also check if the PREVIOUS item is a slur, so it follows the second note too
        if (index > 0) {
          const prevItem = newItems[index - 1];
          if (prevItem.type === 'symbol' && prevItem.symbolType === 'slur') {
            newItems[index - 1] = { ...prevItem, offset: Math.max(-4, Math.min(4, prevItem.offset + delta)) };
          }
        }

        return { ...line, items: newItems };
      }
      return line;
    }));
  };

  const removeItem = (lineId: string, itemId: string) => {
    setLines(lines.map(line => {
      if (line.id === lineId) {
        const newItems = line.items.filter(i => i.id !== itemId);
        // If line becomes empty, add a text item
        if (newItems.length === 0) {
          newItems.push({ id: `item-${Date.now()}`, type: 'text', value: '', offset: 0 });
        }
        return { ...line, items: newItems };
      }
      return line;
    }));
    setActiveItemId(null);
  };

  const removeLine = (lineId: string) => {
    setLines(lines.filter(l => l.id !== lineId));
  };

  const moveItem = (lineId: string, itemId: string, direction: 'left' | 'right') => {
    setLines(lines.map(line => {
      if (line.id === lineId) {
        const index = line.items.findIndex(i => i.id === itemId);
        if (index === -1) return line;
        const newItems = [...line.items];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return line;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        return { ...line, items: newItems };
      }
      return line;
    }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is in an input (except our text items)
      if (document.activeElement?.tagName === 'INPUT' && !document.activeElement.classList.contains('hazzat-text-input')) {
        return;
      }

      if (activeItemId) {
        // Find the line containing the active item
        let activeLineId = '';
        let activeItem: HazzatItem | null = null;
        lines.forEach(l => {
          const item = l.items.find(i => i.id === activeItemId);
          if (item) {
            activeLineId = l.id;
            activeItem = item;
          }
        });

        if (!activeItem) return;

        const symbol = SYMBOL_TYPES.find(s => s.key === e.key.toLowerCase());
        if (symbol && e.ctrlKey === false && e.altKey === false) {
          // Insert symbol after active item
          const newItem: HazzatSymbolItem = {
            id: `sym-${Date.now()}`,
            type: 'symbol',
            symbolType: symbol.type,
            offset: activeItem.offset // Inherit offset from current item
          };
          insertItem(activeLineId, activeItemId, newItem);
          e.preventDefault();
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          updateItemOffset(activeLineId, activeItemId, 1);
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          updateItemOffset(activeLineId, activeItemId, -1);
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          moveItem(activeLineId, activeItemId, 'left');
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          moveItem(activeLineId, activeItemId, 'right');
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          removeItem(activeLineId, activeItemId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItemId, lines]);

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#1A1A1A] font-serif p-8">
      <div ref={editorRef} className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-[#D1CEC4]">
        {/* Header Section */}
        <header className="p-12 border-b border-[#E5E2D9] text-center relative">
          <div className="max-w-3xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4">
              <DecorativeOrnament side="left" />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 text-4xl font-bold bg-transparent border-none text-center focus:outline-none focus:ring-1 focus:ring-amber-200 rounded px-2"
                placeholder="Enter Hymn Title..."
              />
              <DecorativeOrnament side="right" />
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8" /> {/* Placeholder to match ornament width */}
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="flex-1 text-xl italic text-[#666] bg-transparent border-none text-center focus:outline-none focus:ring-1 focus:ring-amber-200 rounded px-2"
                placeholder="Enter Occasion or Subtitle..."
              />
              <div className="w-8 h-8" />
            </div>
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2 no-print">
            <button 
              onClick={exportToJpg}
              className="p-2 hover:bg-amber-50 rounded-full transition-colors text-amber-800"
              title="Export as JPG"
            >
              <ImageIcon size={20} />
            </button>
            <button 
              onClick={() => window.print()}
              className="p-2 hover:bg-amber-50 rounded-full transition-colors text-amber-800"
              title="Print / Save PDF"
            >
              <Download size={20} />
            </button>
          </div>
        </header>

        {/* Editor Canvas */}
        <main className="p-12 min-h-[600px]">
          <div className="space-y-6">
            {lines.map((line) => (
              <div key={line.id} className="relative group/line border-b border-transparent hover:border-amber-50 pb-4">
                <div className="flex flex-wrap items-center gap-y-2">
                  {line.items.map((item, idx) => {
                    let slurVariant: 'up' | 'down' | undefined = undefined;
                    if (item.type === 'symbol' && item.symbolType === 'slur') {
                      const leftItem = line.items[idx - 1];
                      const rightItem = line.items[idx + 1];
                      if (leftItem && rightItem) {
                        slurVariant = rightItem.offset > leftItem.offset ? 'up' : 'down';
                      }
                    }

                    return (
                      <div 
                        key={item.id} 
                        className={cn(
                          "relative flex items-center transition-all",
                          activeItemId === item.id && "ring-2 ring-amber-200 ring-offset-1 rounded"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveItemId(item.id);
                        }}
                        style={{ transform: `translateY(${-item.offset * 8}px)` }}
                      >
                        {item.type === 'text' ? (
                          <div className="flex items-center">
                            <input
                              value={item.value}
                              onChange={(e) => updateTextItem(line.id, item.id, e.target.value)}
                              onFocus={() => setActiveItemId(item.id)}
                              className="hazzat-text-input text-3xl font-medium bg-transparent border-none focus:outline-none min-w-[0.2ch] px-0 text-center"
                              style={{ width: `${Math.max(1, item.value.length)}ch` }}
                              placeholder=" "
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "relative cursor-pointer transition-all group/symbol",
                              "px-0 py-0.5",
                              item.symbolType === 'slur' && "-mx-4 z-0 opacity-80",
                              item.symbolType === 'short' && "-ml-7 z-10",
                              (item.symbolType === 'high' || item.symbolType === 'low') && "-ml-7 -mt-4 z-10",
                              activeItemId === item.id && "text-amber-600 scale-110"
                            )}
                          >
                            <HazzatSymbol type={item.symbolType} className="w-7 h-7" variant={slurVariant} />
                            
                            {activeItemId === item.id && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 no-print bg-white rounded-full shadow-lg p-1 border border-amber-200 z-10">
                                <button onClick={() => updateItemOffset(line.id, item.id, 1)} className="p-1 hover:bg-amber-50 rounded-full text-amber-700"><MoveUp size={14} /></button>
                                <button onClick={() => updateItemOffset(line.id, item.id, -1)} className="p-1 hover:bg-amber-50 rounded-full text-amber-700"><MoveDown size={14} /></button>
                                <button onClick={() => moveItem(line.id, item.id, 'left')} className="p-1 hover:bg-amber-50 rounded-full text-amber-700"><ChevronLeft size={14} /></button>
                                <button onClick={() => moveItem(line.id, item.id, 'right')} className="p-1 hover:bg-amber-50 rounded-full text-amber-700"><ChevronRight size={14} /></button>
                                <button onClick={() => removeItem(line.id, item.id)} className="p-1 hover:bg-red-50 rounded-full text-red-500"><Trash2 size={14} /></button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  <div className="flex gap-1 ml-2 no-print opacity-0 group-hover/line:opacity-100 transition-opacity">
                    <button 
                      onClick={() => insertItem(line.id, line.items[line.items.length-1].id, { id: `text-${Date.now()}`, type: 'text', value: '', offset: 0 })}
                      className="p-1 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                      title="Add Text"
                    >
                      <TypeIcon size={16} />
                    </button>
                    <button 
                      onClick={() => removeLine(line.id)}
                      className="p-1 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all no-print"
                      title="Remove Line"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addLine}
            className="mt-8 w-full py-3 border-2 border-dashed border-[#E5E2D9] rounded-xl text-[#A19E95] hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50/50 transition-all flex items-center justify-center gap-2 no-print"
          >
            <Plus size={18} /> Add New Line
          </button>
        </main>
      </div>

      {/* Toolbar / Palette */}
      <AnimatePresence>
        {activeItemId && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-2xl border border-[#D1CEC4] p-4 flex items-center gap-6 no-print z-50"
          >
            <div className="flex items-center gap-2 border-r pr-6 border-[#E5E2D9]">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <Music size={20} />
              </div>
              <div className="text-sm">
                <p className="font-bold">Symbol Palette</p>
                <p className="text-xs text-gray-500">Inserts after selected item</p>
              </div>
            </div>

            <div className="flex gap-2">
              {SYMBOL_TYPES.map((s) => (
                <button
                  key={s.type}
                  onClick={() => {
                    let activeLineId = '';
                    let activeItem: HazzatItem | null = null;
                    lines.forEach(l => {
                      const item = l.items.find(i => i.id === activeItemId);
                      if (item) {
                        activeLineId = l.id;
                        activeItem = item;
                      }
                    });
                    if (activeLineId && activeItem) {
                      insertItem(activeLineId, activeItemId, {
                        id: `sym-${Date.now()}`,
                        type: 'symbol',
                        symbolType: s.type,
                        offset: activeItem.offset
                      });
                    }
                  }}
                  className="group relative p-2 hover:bg-amber-50 rounded-xl transition-all border border-transparent hover:border-amber-200"
                  title={`${s.label} (${s.key})`}
                >
                  <HazzatSymbol type={s.type} className="w-8 h-8" />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {s.key.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setActiveItemId(null)}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <Plus className="rotate-45" size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Overlay */}
      <div className="fixed bottom-8 right-8 max-w-xs bg-white/80 backdrop-blur p-4 rounded-xl border border-[#D1CEC4] text-xs space-y-2 shadow-sm no-print">
        <p className="font-bold flex items-center gap-1"><TypeIcon size={14} /> Instructions</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Select an item to insert symbols after it.</li>
          <li>Use keyboard shortcuts (o, i, -, /, ~, ., u, h, l).</li>
          <li>Select any item (text or symbol) and use <b>↑/↓</b> to change height.</li>
          <li>Use <b>←/→</b> to reorder symbols/text.</li>
          <li>Print or Export to JPG to save your work.</li>
        </ul>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .max-w-5xl { max-width: 100% !important; border: none !important; box-shadow: none !important; }
          input { border: none !important; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
      `}</style>
    </div>
  );
};
