import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
    const [form, setForm] = useState({ name: '', password: '' });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(form),
            headers: { 'Content-Type': 'application/json' },
        });
        router.push('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form onSubmit={handleSubmit} className="p-8 border rounded-lg shadow-md space-y-4">
                <h1 className="text-2xl font-bold">Register</h1>
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Username"
                    onChange={e => setForm({...form, name: e.target.value})}
                />
                <input
                    className="w-full p-2 border rounded"
                    type="password"
                    placeholder="Password"
                    onChange={e => setForm({...form, password: e.target.value})}
                />
                <button className="w-full bg-black text-white p-2 rounded">Create Account</button>
            </form>
        </div>
    );
}