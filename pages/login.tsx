import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
    const [form, setForm] = useState({ name: '', password: '' });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn('credentials', {
            ...form,
            redirect: false,
        });
        if (res?.ok) router.push('/notes');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form onSubmit={handleSubmit} className="p-8 border rounded-lg shadow-md space-y-4">
                <h1 className="text-2xl font-bold">Login</h1>
                <input className="w-full p-2 border rounded" placeholder="Username" onChange={e => setForm({...form, name: e.target.value})} />
                <input className="w-full p-2 border rounded" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
                <button className="w-full bg-black text-white p-2 rounded">Login</button>
                <p className="text-sm">Don&#39;t have an account? <a href="/register" className="underline">Register</a></p>
            </form>
        </div>
    );
}