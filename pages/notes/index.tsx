import {useCallback, useEffect, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {signOut, useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import {Geist, Geist_Mono} from "next/font/google";

// 1. Interface for Note objects
interface Note {
    id?: number;
    title: string;
    content?: string;
    createdAt?: string;
    updatedAt?: string;
}

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Load Editor dynamically to avoid "window is not defined" errors
const Editor = dynamic(() => import('../../components/Editor'), { ssr: false });

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch notes from the API
    const fetchNotes = useCallback(async () => {
        const res = await fetch('/api/notes');
        const data = await res.json();
        setNotes(data);
    }, []);

    // Session protection and initial fetch
    useEffect(() => {
        if (status === 'unauthenticated') {
            void router.push('/login');
        }

        if (status === 'authenticated') {
            const timer = setTimeout(() => {
                void fetchNotes();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [status, router, fetchNotes]);

    // 2. Save Note (Handles both Create and Update)
    const handleSave = async () => {
        if (!activeNote || !activeNote.title) {
            return alert("Title is required!");
        }

        setLoading(true);
        try {
            const method = activeNote.id ? 'PUT' : 'POST';
            const url = activeNote.id ? `/api/notes/${activeNote.id}` : '/api/notes';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activeNote),
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to save");
                } else {
                    throw new Error(`Server Error: ${response.status}`);
                }
            }

            await fetchNotes();
            setActiveNote(null); // Close editor on success
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
            alert("Error saving note: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // 3. NEW: Handle Delete functionality
    const handleDelete = async () => {
        if (!activeNote || !activeNote.id) return;

        if (!confirm(`Are you sure you want to delete "${activeNote.title}"?`)) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/notes/${activeNote.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            await fetchNotes();
            setActiveNote(null); // Close editor
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
            alert("Error deleting note: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (id?: number) => {
        window.location.href = id ? `/api/notes/export?id=${id}` : '/api/notes/export';
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const json = JSON.parse(event.target?.result as string);
            await fetch('/api/notes/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json),
            });
            fetchNotes();
        };
        reader.readAsText(file);
    };

    if (status === 'loading') return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className={`${geistSans.variable} ${geistMono.variable} flex h-screen bg-white font-sans text-zinc-900`}>
            {/* Sidebar  */}
            <aside className="w-64 border-r border-zinc-200 bg-zinc-50 flex flex-col p-4">
                <h2 className="text-xl font-bold mb-4">My Notes</h2>

                <button
                    onClick={() => setActiveNote({ title: '', content: '' })}
                    className="w-full bg-black text-white rounded-md py-2 mb-4 hover:bg-zinc-800 transition"
                >
                    + New Note
                </button>

                <div className="flex-1 overflow-y-auto">
                    {notes.map((n: Note) => (
                        <div
                            key={n.id}
                            onClick={() => setActiveNote(n)}
                            className={`p-2 cursor-pointer rounded-md mb-1 hover:bg-zinc-200 ${activeNote?.id === n.id ? 'bg-zinc-200 font-semibold' : ''}`}
                        >
                            {n.title || 'Untitled Note'}
                        </div>
                    ))}
                </div>

                <div className="mt-4 border-t pt-4 space-y-2">
                    <button onClick={() => handleExport()} className="w-full text-left text-sm text-zinc-600 hover:text-black italic">
                        ↓ Export All (JSON)
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-left text-sm text-zinc-600 hover:text-black italic">
                        ↑ Import (JSON)
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                    <button onClick={() => signOut()} className="w-full text-left text-sm text-red-600 font-medium pt-2">
                        Logout ({session?.user?.name})
                    </button>
                </div>
            </aside>

            {/* Main Content Area  */}
            <main className="flex-1 flex flex-col p-8 overflow-y-auto">
                {activeNote ? (
                    <div className="max-w-3xl mx-auto w-full">
                        <input
                            className="text-4xl font-bold w-full mb-6 border-none outline-none placeholder-zinc-300"
                            placeholder="Note Title"
                            value={activeNote.title}
                            onChange={(e) => setActiveNote({...activeNote, title: e.target.value})}
                        />

                        {/* BUG FIX: Added 'key' to force Editor refresh when switching notes */}
                        <div key={activeNote.id ?? 'new-note'} className="min-h-[400px] border border-zinc-100 rounded-lg p-4 bg-zinc-50/50">
                            <Editor
                                initialContent={activeNote.content}
                                onChange={(json) => setActiveNote({...activeNote, content: json})}
                            />
                        </div>

                        <div className="mt-6 flex gap-4">
                            <button
                                disabled={loading}
                                onClick={handleSave}
                                className="bg-black text-white px-6 py-2 rounded-full font-medium disabled:bg-zinc-400"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>

                            {/* ADDED: Delete button, only shown for existing notes */}
                            {activeNote.id && (
                                <button
                                    disabled={loading}
                                    onClick={handleDelete}
                                    className="px-6 py-2 rounded-full font-medium border border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-50"
                                >
                                    Delete Note
                                </button>
                            )}

                            {activeNote.id && (
                                <button
                                    onClick={() => handleExport(activeNote.id)}
                                    className="border border-zinc-300 px-6 py-2 rounded-full font-medium"
                                >
                                    Download JSON
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                        <p className="text-lg">Select a note to start editing or create a new one.</p>
                    </div>
                )}
            </main>
        </div>
    );
}