import {useCallback, useEffect, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {signOut, useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import {Geist, Geist_Mono} from "next/font/google";

// 1. Add this interface near your imports
interface Note {
    id?: number;
    title: string;
    content?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Keep your existing fonts for a professional look
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

    const fetchNotes = useCallback(async () => {
        const res = await fetch('/api/notes');
        const data = await res.json();
        setNotes(data);
    }, []);

    // 1. Protect the route: If not logged in, go to /login
    useEffect(() => {
        if (status === 'unauthenticated') {
            void router.push('/login');
        }

        if (status === 'authenticated') {
            // This trick tells the linter: "I'll do this in a split second, not right now"
            const timer = setTimeout(() => {
                void fetchNotes();
            }, 0);

            return () => clearTimeout(timer); // Cleanup
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

            // 1. We start the request
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activeNote),
            });

            // 2. We IMMEDIATELY check if the request was successful
            // This is where that 'errorData' block goes!
            if (!response.ok) {
                const errorData = (await response.json()) as { message?: string };
                throw new Error(errorData.message || "Failed to save");
            }

            // 3. If successful, we refresh and close
            await fetchNotes();
            setActiveNote(null);
        } catch (err: unknown) {
            // 4. If any of the above fails, it jumps here
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
            alert("Error saving note: " + errorMessage);
        } finally {
            // 5. This runs no matter what to stop the loading spinner
            setLoading(false);
        }
    };

    // 3. Export JSON (Requirement Task 5)
    const handleExport = (id?: number) => {
        window.location.href = id ? `/api/notes/export?id=${id}` : '/api/notes/export';
    };

    // 4. Import JSON (Requirement Task 6)
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

            {/* Sidebar */}
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

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-8 overflow-y-auto">
                {activeNote ? (
                    <div className="max-w-3xl mx-auto w-full">
                        <input
                            className="text-4xl font-bold w-full mb-6 border-none outline-none placeholder-zinc-300"
                            placeholder="Note Title"
                            value={activeNote.title}
                            onChange={(e) => setActiveNote({...activeNote, title: e.target.value})}
                        />

                        <div className="min-h-[400px] border border-zinc-100 rounded-lg p-4 bg-zinc-50/50">
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