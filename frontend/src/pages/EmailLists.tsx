import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Table } from '../components/Table';
import { format } from 'date-fns';

export const ScheduledEmails = () => {
    const [emails, setEmails] = useState([]);

    useEffect(() => {
        api.get('/scheduled-emails').then(res => setEmails(res.data));
    }, []);

    const columns = [
        { header: 'Recipient', accessor: 'recipient' },
        { header: 'Subject', accessor: 'subject' },
        {
            header: 'Scheduled For',
            render: (row: any) => format(new Date(row.scheduledAt), 'PPp')
        },
        {
            header: 'Status',
            render: (row: any) => (
                <span className="status-badge status-scheduled">
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Scheduled Emails</h2>
            <Table columns={columns} data={emails} emptyMessage="No scheduled emails found." />
        </div>
    );
};

export const SentEmails = () => {
    const [emails, setEmails] = useState([]);

    useEffect(() => {
        api.get('/sent-emails').then(res => setEmails(res.data));
    }, []);

    const columns = [
        { header: 'Recipient', accessor: 'recipient' },
        { header: 'Subject', accessor: 'subject' },
        {
            header: 'Sent At',
            render: (row: any) => row.sentAt ? format(new Date(row.sentAt), 'PPp') : '-'
        },
        {
            header: 'Status',
            render: (row: any) => (
                <span className={`status-badge ${row.status === 'SENT'
                        ? 'status-sent'
                        : 'status-error'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Sent Emails History</h2>
            <Table columns={columns} data={emails} emptyMessage="No sent emails found." />
        </div>
    );
};
