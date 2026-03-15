'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  type Note, type NoteFolder,
  getNotes, getNoteFolders,
  createNote, updateNote, deleteNote,
  createNoteFolder, updateNoteFolder, deleteNoteFolder,
} from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────
interface Props {
  startupId: string;
  initialNoteId?: string;
}

// ── Formatting Toolbar ─────────────────────────────────────────
interface ToolbarProps {
  onInsert: (before: string, after?: string, placeholder?: string) => void;
  onLinePrefix: (prefix: string) => void;
}

const TOOLBAR_GROUPS = [
  [
    { label: 'H1', title: 'Überschrift 1', type: 'line' as const, prefix: '# ' },
    { label: 'H2', title: 'Überschrift 2', type: 'line' as const, prefix: '## ' },
    { label: 'H3', title: 'Überschrift 3', type: 'line' as const, prefix: '### ' },
  ],
  [
    { label: 'B',  title: 'Fett',           type: 'wrap' as const, before: '**', after: '**', placeholder: 'Fetter Text' },
    { label: 'I',  title: 'Kursiv',         type: 'wrap' as const, before: '*',  after: '*',  placeholder: 'Kursiver Text' },
    { label: 'S',  title: 'Durchgestrichen', type: 'wrap' as const, before: '~~', after: '~~', placeholder: 'Text' },
  ],
  [
    { label: '•',  title: 'Aufzählung',     type: 'line' as const, prefix: '- ' },
    { label: '1.', title: 'Nummerierte Liste', type: 'line' as const, prefix: '1. ' },
    { label: '☐',  title: 'Checkbox',       type: 'line' as const, prefix: '- [ ] ' },
  ],
  [
    { label: '❝',  title: 'Zitat',          type: 'line' as const, prefix: '> ' },
    { label: '`',  title: 'Inline Code',    type: 'wrap' as const, before: '`', after: '`', placeholder: 'code' },
    { label: '```',title: 'Code Block',     type: 'wrap' as const, before: '```\n', after: '\n```', placeholder: 'code' },
  ],
  [
    { label: '🔗', title: 'Link',           type: 'wrap' as const, before: '[', after: '](url)', placeholder: 'Linktext' },
  ],
];

function FormatToolbar({ onInsert, onLinePrefix }: ToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-gray-100 bg-gray-50/60 flex-wrap">
      {TOOLBAR_GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center">
          {gi > 0 && <div className="w-px h-4 bg-gray-200 mx-1.5" />}
          {group.map((btn) => (
            <button
              key={btn.label}
              title={btn.title}
              onMouseDown={(e) => {
                e.preventDefault(); // keep textarea focus
                if (btn.type === 'line') {
                  onLinePrefix(btn.prefix);
                } else {
                  onInsert(btn.before, btn.after, btn.placeholder);
                }
              }}
              className={`px-2 py-1 rounded text-xs font-medium text-gray-500
                          hover:bg-gray-200 hover:text-gray-800 transition-colors
                          ${btn.label === 'B' ? 'font-bold' : ''}
                          ${btn.label === 'I' ? 'italic' : ''}
                          ${btn.label === 'S' ? 'line-through' : ''}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Folder Tree (recursive) ────────────────────────────────────
interface TreeProps {
  folderId: string | null;
  depth: number;
  notes: Note[];
  folders: NoteFolder[];
  selectedId: string | null;
  expandedFolders: Set<string>;
  dragOverFolder: string | null;
  onSelectNote: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onDropOnFolder: (folderId: string | null) => void;
  onDragNote: (noteId: string) => void;
  onRenameFolder: (folder: NoteFolder) => void;
  onDeleteFolder: (id: string) => void;
}

function FolderTree({
  folderId, depth, notes, folders, selectedId, expandedFolders,
  dragOverFolder, onSelectNote, onToggleFolder, onDropOnFolder,
  onDragNote, onRenameFolder, onDeleteFolder,
}: TreeProps) {
  const indent = depth * 14;
  const subFolders = folders.filter((f) => f.parent_id === folderId);
  const folderNotes = notes.filter((n) => n.folder_id === folderId);

  return (
    <>
      {subFolders.map((folder) => {
        const isExpanded = expandedFolders.has(folder.id);
        const isOver = dragOverFolder === folder.id;
        return (
          <div key={folder.id}>
            <div
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer group
                          transition-colors select-none
                          ${isOver ? 'bg-brand-50 ring-1 ring-brand-300' : 'hover:bg-gray-100'}`}
              style={{ paddingLeft: indent + 8 }}
              onClick={() => onToggleFolder(folder.id)}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDropOnFolder(folder.id); }}
            >
              <span className="text-gray-400 text-xs w-4 shrink-0">{isExpanded ? '▾' : '▸'}</span>
              <span className="text-gray-400 text-sm shrink-0">📁</span>
              <span className="flex-1 text-sm text-gray-700 truncate font-medium">{folder.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onRenameFolder(folder); }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 text-xs px-1 transition-opacity"
                title="Umbenennen"
              >✏️</button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs px-1 transition-opacity"
                title="Löschen"
              >×</button>
            </div>
            {isExpanded && (
              <FolderTree
                folderId={folder.id} depth={depth + 1} notes={notes} folders={folders}
                selectedId={selectedId} expandedFolders={expandedFolders}
                dragOverFolder={dragOverFolder} onSelectNote={onSelectNote}
                onToggleFolder={onToggleFolder} onDropOnFolder={onDropOnFolder}
                onDragNote={onDragNote} onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
              />
            )}
          </div>
        );
      })}

      {folderNotes.map((note) => (
        <div
          key={note.id}
          draggable
          onDragStart={() => onDragNote(note.id)}
          onClick={() => onSelectNote(note.id)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group
                      transition-colors select-none
                      ${selectedId === note.id
                        ? 'bg-brand-50 text-brand-700'
                        : 'hover:bg-gray-100 text-gray-700'}`}
          style={{ paddingLeft: indent + 8 }}
          title={note.title}
        >
          <span className="text-gray-400 text-xs w-4 shrink-0" />
          <span className="text-gray-400 text-sm shrink-0">📄</span>
          <span className={`flex-1 text-sm truncate ${selectedId === note.id ? 'font-medium' : ''}`}>
            {note.title || 'Neue Notiz'}
          </span>
        </div>
      ))}
    </>
  );
}

// ── Inline Create Input ────────────────────────────────────────
function InlineInput({
  icon, placeholder, onConfirm, onCancel,
}: {
  icon: string;
  placeholder: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 mx-1 rounded-lg bg-white border border-brand-300 shadow-sm">
      <span className="text-sm shrink-0">{icon}</span>
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onConfirm(value.trim());
          if (e.key === 'Escape') onCancel();
        }}
        className="flex-1 text-sm focus:outline-none bg-transparent min-w-0"
      />
      <button onClick={() => onConfirm(value.trim())} className="text-brand-500 hover:text-brand-700 text-xs font-bold shrink-0">✓</button>
      <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xs shrink-0">✕</button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function NotesView({ startupId, initialNoteId }: Props) {
  const router = useRouter();

  const [notes, setNotes]     = useState<Note[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId]   = useState<string | null>(initialNoteId ?? null);
  const [editMode, setEditMode]       = useState<'edit' | 'preview'>('edit');
  const [draft, setDraft]             = useState({ title: '', content: '' });
  const [isDirty, setIsDirty]         = useState(false);
  const [saveStatus, setSaveStatus]   = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [search, setSearch]           = useState('');
  const [expandedFolders, setExpanded] = useState<Set<string>>(new Set());
  const [dragNoteId, setDragNoteId]   = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<NoteFolder | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Inline create states
  const [showNewNote, setShowNewNote]     = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load data ──
  useEffect(() => {
    Promise.all([getNotes(startupId), getNoteFolders(startupId)]).then(([n, f]) => {
      setNotes(n);
      setFolders(f);
      setLoading(false);
      if (initialNoteId) {
        const note = n.find((x) => x.id === initialNoteId);
        if (note) setDraft({ title: note.title, content: note.content });
      } else if (n.length > 0) {
        const first = n[0];
        setSelectedId(first.id);
        setDraft({ title: first.title, content: first.content });
        router.replace(`/startups/${startupId}/notes/${first.id}`);
      }
    });
  }, [startupId, initialNoteId, router]);

  // ── Select note ──
  const selectNote = (id: string, noteList = notes) => {
    const note = noteList.find((n) => n.id === id);
    if (!note) return;
    setSelectedId(id);
    setDraft({ title: note.title, content: note.content });
    setIsDirty(false);
    setSaveStatus('saved');
    router.replace(`/startups/${startupId}/notes/${id}`);
  };

  // ── Auto-save ──
  const save = useCallback(async () => {
    if (!selectedId) return;
    setSaveStatus('saving');
    const updated = await updateNote(selectedId, draft);
    setNotes((prev) => prev.map((n) => (n.id === selectedId ? updated : n)));
    setIsDirty(false);
    setSaveStatus('saved');
  }, [selectedId, draft]);

  useEffect(() => {
    if (!isDirty) return;
    setSaveStatus('unsaved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [isDirty, draft, save]);

  const handleContentChange = (field: 'title' | 'content', value: string) => {
    setDraft((d) => ({ ...d, [field]: value }));
    setIsDirty(true);
  };

  // ── Keyboard shortcuts ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newContent = draft.content.substring(0, start) + '  ' + draft.content.substring(end);
      handleContentChange('content', newContent);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      save();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**', 'Fetter Text');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*', 'Kursiver Text');
    }
  };

  // ── Formatting helpers ──
  const insertMarkdown = (before: string, after = '', placeholder = 'text') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const selected = draft.content.substring(start, end);
    const text = selected || placeholder;
    const newContent = draft.content.substring(0, start) + before + text + after + draft.content.substring(end);
    handleContentChange('content', newContent);
    requestAnimationFrame(() => {
      ta.focus();
      if (selected) {
        ta.selectionStart = start + before.length;
        ta.selectionEnd   = start + before.length + text.length;
      } else {
        ta.selectionStart = start + before.length;
        ta.selectionEnd   = start + before.length + placeholder.length;
      }
    });
  };

  const insertLinePrefix = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start     = ta.selectionStart;
    const lineStart = draft.content.lastIndexOf('\n', start - 1) + 1;
    const newContent = draft.content.substring(0, lineStart) + prefix + draft.content.substring(lineStart);
    handleContentChange('content', newContent);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + prefix.length;
    });
  };

  // ── Create note (opens immediately) ──
  const handleCreateNote = async (name: string, folderId?: string | null) => {
    const title = name || 'Neue Notiz';
    const note  = await createNote({ startup_id: startupId, folder_id: folderId ?? null, title });
    const updated = [...notes, note];
    setNotes(updated);
    setShowNewNote(false);
    // Open immediately without waiting for selectNote to find it in old state
    setSelectedId(note.id);
    setDraft({ title: note.title, content: note.content });
    setIsDirty(false);
    setSaveStatus('saved');
    setEditMode('edit');
    router.replace(`/startups/${startupId}/notes/${note.id}`);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // ── Create folder ──
  const handleCreateFolder = async (name: string) => {
    if (!name) { setShowNewFolder(false); return; }
    const folder = await createNoteFolder({ startup_id: startupId, name });
    setFolders((prev) => [...prev, folder]);
    setExpanded((s) => new Set([...s, folder.id]));
    setShowNewFolder(false);
  };

  // ── Delete note ──
  const handleDeleteNote = async () => {
    if (!selectedId) return;
    if (!confirm('Notiz wirklich löschen?')) return;
    await deleteNote(selectedId);
    const remaining = notes.filter((n) => n.id !== selectedId);
    setNotes(remaining);
    if (remaining.length > 0) selectNote(remaining[0].id, remaining);
    else { setSelectedId(null); setDraft({ title: '', content: '' }); }
  };

  // ── Folder actions ──
  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Ordner und alle Notizen darin löschen?')) return;
    await deleteNoteFolder(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setNotes((prev) => prev.filter((n) => n.folder_id !== id));
    if (selectedId && notes.find((n) => n.folder_id === id && n.id === selectedId)) {
      setSelectedId(null);
    }
  };

  const handleRenameFolder = (folder: NoteFolder) => {
    setRenamingFolder(folder);
    setRenameValue(folder.name);
  };

  const commitRename = async () => {
    if (!renamingFolder || !renameValue.trim()) { setRenamingFolder(null); return; }
    const updated = await updateNoteFolder(renamingFolder.id, { name: renameValue.trim() });
    setFolders((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setRenamingFolder(null);
  };

  // ── Drag & drop ──
  const handleDrop = async (targetFolderId: string | null) => {
    if (!dragNoteId) return;
    const updated = await updateNote(dragNoteId, { folder_id: targetFolderId });
    setNotes((prev) => prev.map((n) => (n.id === dragNoteId ? updated : n)));
    setDragNoteId(null);
    setDragOverFolder(null);
  };

  // ── Derived ──
  const backlinks   = selectedId ? notes.filter((n) => n.id !== selectedId && n.content.includes(selectedId)) : [];
  const filteredNotes = search
    ? notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    : null;
  const selectedNote = notes.find((n) => n.id === selectedId);

  if (loading) return <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Lädt …</div>;

  return (
    <div className="-mx-4 -my-10 flex" style={{ height: 'calc(100vh - 49px)' }}>

      {/* ── SIDEBAR ── */}
      <div
        className="flex flex-col border-r border-gray-200 bg-gray-50 shrink-0 overflow-hidden"
        style={{ width: 260 }}
        onDragOver={(e) => { e.preventDefault(); setDragOverFolder('__root__'); }}
        onDragLeave={() => setDragOverFolder(null)}
        onDrop={(e) => { e.preventDefault(); handleDrop(null); setDragOverFolder(null); }}
      >
        {/* Header */}
        <div className="px-3 pt-4 pb-2 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notizen</span>
            <div className="flex items-center gap-0.5">
              {/* New folder */}
              <button
                onClick={() => { setShowNewFolder(true); setShowNewNote(false); }}
                className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                title="Neuer Ordner"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </button>
              {/* New note */}
              <button
                onClick={() => { setShowNewNote(true); setShowNewFolder(false); }}
                className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                title="Neue Notiz"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen …"
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">×</button>
            )}
          </div>
        </div>

        {/* Inline: new folder input */}
        {showNewFolder && (
          <div className="px-2 py-2 border-b border-gray-200">
            <InlineInput
              icon="📁"
              placeholder="Ordner-Name …"
              onConfirm={handleCreateFolder}
              onCancel={() => setShowNewFolder(false)}
            />
          </div>
        )}

        {/* Inline: new note input */}
        {showNewNote && (
          <div className="px-2 py-2 border-b border-gray-200">
            <InlineInput
              icon="📄"
              placeholder="Notiz-Titel …"
              onConfirm={(name) => handleCreateNote(name)}
              onCancel={() => setShowNewNote(false)}
            />
          </div>
        )}

        {/* Folder rename */}
        {renamingFolder && (
          <div className="px-3 py-2 border-b border-gray-200 bg-white">
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingFolder(null); }}
              className="w-full rounded border border-brand-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <div className="flex gap-1 mt-1">
              <button onClick={commitRename} className="text-xs text-brand-600 font-medium">OK</button>
              <button onClick={() => setRenamingFolder(null)} className="text-xs text-gray-400">Abbrechen</button>
            </div>
          </div>
        )}

        {/* File tree */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {filteredNotes ? (
            filteredNotes.length === 0 ? (
              <p className="text-xs text-gray-400 px-2 py-3">Keine Ergebnisse</p>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors
                              ${selectedId === note.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <span className="text-gray-400 text-sm shrink-0">📄</span>
                  <span className="text-sm truncate">{note.title || 'Neue Notiz'}</span>
                </div>
              ))
            )
          ) : (
            <FolderTree
              folderId={null} depth={0} notes={notes} folders={folders}
              selectedId={selectedId} expandedFolders={expandedFolders}
              dragOverFolder={dragOverFolder}
              onSelectNote={selectNote}
              onToggleFolder={(id) => setExpanded((s) => {
                const n = new Set(s);
                n.has(id) ? n.delete(id) : n.add(id);
                return n;
              })}
              onDropOnFolder={handleDrop}
              onDragNote={setDragNoteId}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
            />
          )}

          {notes.length === 0 && !search && !showNewNote && (
            <div className="text-center py-8 px-3">
              <p className="text-xs text-gray-400 mb-3">Noch keine Notizen</p>
              <button
                onClick={() => setShowNewNote(true)}
                className="text-xs text-brand-500 hover:text-brand-600 font-medium"
              >
                + Erste Notiz erstellen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── EDITOR AREA ── */}
      {selectedNote ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">

          {/* Top bar: title + controls */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
            <input
              value={draft.title}
              onChange={(e) => handleContentChange('title', e.target.value)}
              placeholder="Titel"
              className="flex-1 text-xl font-bold focus:outline-none bg-transparent mr-4 truncate"
            />
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs transition-colors ${
                saveStatus === 'saved'  ? 'text-green-500' :
                saveStatus === 'saving' ? 'text-gray-400'  : 'text-yellow-500'
              }`}>
                {saveStatus === 'saved' ? '✓ Gespeichert' : saveStatus === 'saving' ? 'Speichert …' : '● Ungespeichert'}
              </span>

              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {(['edit', 'preview'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setEditMode(m)}
                    className={`px-3 py-1 text-xs font-medium transition-colors
                      ${editMode === m ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {m === 'edit' ? '✏️ Bearbeiten' : '👁 Vorschau'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleDeleteNote}
                className="text-gray-300 hover:text-red-400 transition-colors"
                title="Notiz löschen"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>

          {/* Permalink */}
          <div className="px-6 py-1 border-b border-gray-50 bg-gray-50/40 shrink-0">
            <span className="text-xs text-gray-400 font-mono select-all">
              /startups/{startupId}/notes/{selectedNote.id}
            </span>
          </div>

          {/* Formatting toolbar (edit mode only) */}
          {editMode === 'edit' && (
            <FormatToolbar onInsert={insertMarkdown} onLinePrefix={insertLinePrefix} />
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {editMode === 'edit' ? (
              <textarea
                ref={textareaRef}
                value={draft.content}
                onChange={(e) => handleContentChange('content', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={'# Überschrift\n\nSchreibe hier in Markdown …\n\n- [ ] Aufgabe\n- **Fett**, *Kursiv*\n- `Inline Code`\n\n```\nCode Block\n```'}
                className="flex-1 w-full px-8 py-5 text-sm font-mono leading-relaxed
                           focus:outline-none resize-none bg-white text-gray-800"
              />
            ) : (
              <div className="flex-1 overflow-y-auto px-8 py-6">
                {draft.content ? (
                  <div className="prose prose-sm max-w-none
                                  prose-headings:font-bold prose-headings:text-gray-900
                                  prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline
                                  prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                                  prose-pre:bg-gray-900 prose-pre:text-gray-100
                                  prose-blockquote:border-brand-300 prose-blockquote:text-gray-600
                                  prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">Keine Inhalte vorhanden.</p>
                )}
              </div>
            )}
          </div>

          {/* Backlinks */}
          {backlinks.length > 0 && (
            <div className="border-t border-gray-100 px-8 py-3 bg-gray-50/50 shrink-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                🔗 Backlinks ({backlinks.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {backlinks.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => selectNote(note.id)}
                    className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-600
                               hover:bg-brand-100 transition-colors font-medium"
                  >
                    📄 {note.title || 'Notiz'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center bg-white">
          <div className="text-5xl">📝</div>
          <div>
            <h3 className="text-lg font-bold">Keine Notiz ausgewählt</h3>
            <p className="text-sm text-gray-500 mt-1">Wähle eine Notiz aus oder erstelle eine neue.</p>
          </div>
          <button
            onClick={() => setShowNewNote(true)}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm text-white font-semibold
                       hover:bg-brand-600 transition-colors"
          >
            + Neue Notiz erstellen
          </button>
        </div>
      )}
    </div>
  );
}
