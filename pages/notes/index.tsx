import {useCallback, useEffect, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {signOut, useSession} from 'next-auth/react';
import {useRouter} from 'next/router';

interface Note {
    id?: number;
    title: string;
    content?: string;
    createdAt?: string;
}

const Editor = dynamic(() => import('../../components/Editor'), { ssr: false });

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchNotes = useCallback(async () => {
        const res = await fetch('/api/notes');
        const data = await res.json();
        setNotes(data);
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        if (status === 'authenticated') fetchNotes();
    }, [status, router, fetchNotes]);

    const handleSave = async () => {
        if (!activeNote || !activeNote.title) return alert("Title is required!");
        setLoading(true);
        try {
            const method = activeNote.id ? 'PUT' : 'POST';
            const url = activeNote.id ? `/api/notes/${activeNote.id}` : '/api/notes';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activeNote),
            });
            if (!res.ok) throw new Error("Failed to save");
            await fetchNotes();
            setActiveNote(null);
        } catch (err: unknown) {
            // We check if it's an actual Error before accessing .message
            const message = err instanceof Error ? err.message : "An unexpected error occurred";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!activeNote?.id || !confirm("Delete this note?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/notes/${activeNote.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
            await fetchNotes();
            setActiveNote(null);
        } catch (err: unknown) {
            // We check if it's an actual Error before accessing .message
            const message = err instanceof Error ? err.message : "An unexpected error occurred";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-white font-sans">
            {/* Sidebar */}
            <aside className="w-72 border-r p-6 flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">My Notes</h2>
                    <button onClick={() => signOut()} className="text-xs text-red-500 hover:underline">
                        Logout
                    </button>
                </div>

                <button
                    onClick={() => setActiveNote({ title: '', content: '' })}
                    className="w-full bg-black text-white rounded p-2 hover:opacity-90 transition"
                >
                    + New Note
                </button>

                <div className="flex-1 overflow-y-auto space-y-2">
                    {notes.map((n: Note) => (
                        <div
                            key={n.id}
                            onClick={() => setActiveNote(n)}
                            className={`p-3 cursor-pointer rounded border transition ${activeNote?.id === n.id ? 'border-black shadow-sm font-medium' : 'border-transparent hover:bg-zinc-50'}`}
                        >
                            {n.title || 'Untitled Note'}
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t space-y-2">
                    <button onClick={() => window.location.href='/api/notes/export'} className="w-full text-left text-xs text-zinc-500 hover:text-black">
                        Download All JSON
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-left text-xs text-zinc-500 hover:text-black">
                        Import JSON File
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = async (ev) => {
                                const json = JSON.parse(ev.target?.result as string);
                                await fetch('/api/notes/import', { method: 'POST', body: JSON.stringify(json), headers: {'Content-Type': 'application/json'}});
                                fetchNotes();
                            };
                            reader.readAsText(file);
                        }
                    }} />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-10 overflow-y-auto">
                {activeNote ? (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <input
                            className="text-4xl font-bold w-full outline-none border-b pb-2 focus:border-black transition"
                            placeholder="Note Title"
                            value={activeNote.title}
                            onChange={(e) => setActiveNote({...activeNote, title: e.target.value})}
                        />

                        <div key={activeNote.id ?? 'new'} className="min-h-[500px] border rounded-lg p-4 shadow-sm">
                            <Editor
                                initialContent={activeNote.content}
                                onChange={(json) => setActiveNote({...activeNote, content: json})}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="bg-black text-white px-8 py-2 rounded shadow hover:opacity-90 transition">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            {activeNote.id && (
                                <button onClick={handleDelete} className="border border-red-500 text-red-500 px-8 py-2 rounded hover:bg-red-50 transition">
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-400 border-2 border-dashed rounded-xl m-4">
                        <p>Open a note to start editing.</p>
                    </div>
                )}
            </main>
        </div>
    );
}