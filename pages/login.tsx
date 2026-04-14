import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
    const [form, setForm] = useState({ name: '', password: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await signIn('credentials', {
            name: form.name,
            password: form.password,
            redirect: false,
        });

        if (res?.error) {
            setError(res.error === "CredentialsSignin" ? "Invalid username or password" : res.error);
        } else if (res?.ok) {
            router.push('/notes');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <form onSubmit={handleSubmit} className="p-8 border rounded-lg shadow-md space-y-4 w-full max-w-sm">
                <h1 className="text-2xl font-bold">Login</h1>

                {error && (
                    <p className="text-red-500 text-sm py-1">
                        {error}
                    </p>
                )}

                <div className="space-y-4">
                    <input
                        className="w-full p-2 border rounded outline-none focus:ring-1 focus:ring-black"
                        placeholder="Username"
                        required
                        onChange={e => setForm({...form, name: e.target.value})}
                    />
                    <input
                        className="w-full p-2 border rounded outline-none focus:ring-1 focus:ring-black"
                        type="password"
                        placeholder="Password"
                        required
                        onChange={e => setForm({...form, password: e.target.value})}
                    />
                </div>

                <button className="w-full bg-black text-white p-2 rounded hover:opacity-90 transition">
                    Login
                </button>

                <p className="text-sm text-center text-zinc-600 pt-2">
                    Don&#39;t have an account? <Link href="/register" className="underline text-black font-medium">Register</Link>
                </p>
            </form>
        </div>
    );
}