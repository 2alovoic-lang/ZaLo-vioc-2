import React, { useState, useRef } from 'react';
import {
  Cloud,
  FileText,
  Link2,
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Check,
} from 'lucide-react';
import { CloudItem, Language } from '../types';
import { translations } from '../utils/translations';

interface CloudViewProps {
  items: CloudItem[];
  onAddItem: (item: Omit<CloudItem, 'id' | 'timestamp'>) => void;
  onDeleteItem: (id: string) => void;
  lang: Language;
}

export const CloudView: React.FC<CloudViewProps> = ({ items, onAddItem, onDeleteItem, lang }) => {
  const t = translations[lang];
  const [filterType, setFilterType] = useState<'all' | 'note' | 'file' | 'link'>('all');
  const [search, setSearch] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    onAddItem({
      type: 'note',
      title: noteTitle.trim() || 'Ghi chú không tiêu đề',
      content: noteContent.trim(),
    });

    setNoteTitle('');
    setNoteContent('');
    setIsAddingNote(false);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith('image/');
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

      onAddItem({
        type: isImg ? 'image' : 'file',
        title: file.name,
        content: `Đã tải lên vào Cloud lúc ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        size: `${sizeMB} MB`,
      });
    }
    if (e.target) e.target.value = '';
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredItems = items
    .filter((item) => (filterType === 'all' ? true : item.type === filterType))
    .filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-6 flex flex-col items-center select-none">
      <div className="w-full max-w-4xl space-y-6">
        {/* Banner */}
        <div className="bg-radial from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-md flex items-center justify-between">
          <div className="space-y-1.5 max-w-md">
            <div className="flex items-center gap-2">
              <Cloud className="w-6 h-6 text-sky-200" />
              <h2 className="text-xl font-bold">{t.navCloud}</h2>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">{t.myCloudDesc}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tải file lên</span>
            </button>
            <button
              onClick={() => setIsAddingNote(true)}
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{t.newNote}</span>
            </button>
          </div>
        </div>

        {/* Modal for adding note */}
        {isAddingNote && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-in fade-in">
            <form onSubmit={handleSaveNote} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-slate-800">{t.newNote}</h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder={t.noteTitle}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />

              <textarea
                rows={3}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={t.noteContent}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  {t.saveNote}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'note', label: 'Ghi chú' },
              { id: 'file', label: 'Tập tin' },
              { id: 'link', label: 'Liên kết' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as 'all' | 'note' | 'file' | 'link')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  filterType === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm trong Cloud..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Cloud Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      {item.type === 'note' && <FileText className="w-4 h-4" />}
                      {item.type === 'file' && <FileText className="w-4 h-4" />}
                      {item.type === 'image' && <ImageIcon className="w-4 h-4" />}
                      {item.type === 'link' && <Link2 className="w-4 h-4" />}
                    </div>
                    <span className="font-semibold text-sm text-slate-900 truncate max-w-[200px]">
                      {item.title}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">{item.timestamp}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap break-words line-clamp-3 mb-3">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                {item.size ? (
                  <span className="font-mono text-slate-400">{item.size}</span>
                ) : item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Mở liên kết</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item.id, `${item.title}\n${item.content}`)}
                    className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Sao chép"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Xóa khỏi Cloud"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Cloud className="w-12 h-12 text-slate-300 mb-2" />
            <div className="text-sm font-semibold text-slate-700">Chưa có dữ liệu phù hợp</div>
            <p className="text-xs text-slate-400 mt-1">
              Hãy tạo ghi chú mới hoặc tải file lên Cloud để lưu trữ tiện lợi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
