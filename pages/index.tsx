import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();
    useEffect(() => {
        // This automatically sends users to the dashboard
        router.push('/notes');
    }, [router]);

    return <p className="p-10 text-center">Redirecting...</p>;
}