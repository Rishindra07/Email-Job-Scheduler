import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Lock } from 'lucide-react';

export const Login = () => {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const endpoint = isSignup ? '/auth/signup' : '/auth/login';
            const payload: any = { email, password };
            if (isSignup) payload.name = name;

            const res = await api.post(endpoint, payload);
            const { user, token } = res.data;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            navigate('/');
        } catch (err: any) {
            console.error('Auth error', err?.response?.data || err);
            alert(err?.response?.data?.error || 'Auth failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-icon">
                    <div className="login-icon-bg">
                        <Lock />
                    </div>
                </div>
                <h2>{isSignup ? 'Create an account' : 'Welcome Back'}</h2>
                <p>{isSignup ? 'Sign up to start scheduling emails' : 'Sign in to access your email scheduler'}</p>

                <form onSubmit={submit} style={{ marginTop: 16 }}>
                    {isSignup && (
                        <div style={{ marginBottom: 8 }}>
                            <label>Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} className="form-input" />
                        </div>
                    )}

                    <div style={{ marginBottom: 8 }}>
                        <label>Email</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} className="form-input" />
                    </div>

                    <div style={{ marginBottom: 8 }}>
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" />
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button type="submit" className="btn btn-primary">{isSignup ? 'Sign up' : 'Sign in'}</button>
                        <button type="button" className="btn" onClick={() => setIsSignup(v => !v)}>{isSignup ? 'Have an account? Sign in' : 'Create account'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
