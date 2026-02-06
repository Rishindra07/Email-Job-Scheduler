import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Send } from 'lucide-react';

export const Compose = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user || !user.id) {
            // If user not present, redirect to login
            navigate('/login');
        }
    }, [user, navigate]);

    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [recipient, setRecipient] = useState(''); // Single recipient for simplicity for now, or CSV
    const [scheduledAt, setScheduledAt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user || !user.id) {
                toast.error('You must be logged in to schedule an email');
                setLoading(false);
                navigate('/login');
                return;
            }

            if (!scheduledAt) {
                toast.error('Please choose a schedule time');
                setLoading(false);
                return;
            }

            const payload = {
                senderId: user.id,
                recipient,
                subject,
                body,
                scheduledAt: new Date(scheduledAt).toISOString(),
                delay: 0,
            };

             await api.post('/schedule-email', payload);

            toast.success('Email scheduled successfully!');
            navigate('/scheduled');
        } catch (err: any) {
            console.error('Schedule error:', err?.response?.data || err);
            const msg = err?.response?.data?.error || 'Failed to schedule email';
            const missing = err?.response?.data?.missing;
            if (missing && Array.isArray(missing)) {
                toast.error(`Missing fields: ${missing.join(', ')}`);
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="compose-container">
            <h2>Compose New Email</h2>

            <form onSubmit={handleSubmit} className="form-group">
                <div className="form-section">
                    <div className="form-field">
                        <label className="form-label">To (Recipient Email)</label>
                        <input
                            type="email"
                            required
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="form-input"
                            placeholder="recipient@example.com"
                        />
                    </div>

                    <div className="form-field">
                        <label className="form-label">Subject</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="form-input"
                            placeholder="Enter email subject"
                        />
                    </div>

                    <div className="form-field">
                        <label className="form-label">Body</label>
                        <textarea
                            required
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={6}
                            className="form-textarea"
                            placeholder="Enter email content..."
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">
                        <Calendar size={20} /> Scheduling Options
                    </h3>

                    <div className="form-field">
                        <label className="form-label">Schedule Time</label>
                        <input
                            type="datetime-local"
                            required
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="button-container">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Scheduling...' : <><span>Schedule Email</span> <Send size={18} /></>}
                    </button>
                </div>
            </form>
        </div>
    );
};
