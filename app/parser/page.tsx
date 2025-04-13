'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../flamesAnimation.css';

export default function ParserPage() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [sitemapUrl, setSitemapUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<any>(null);
    const [casinoUrls, setCasinoUrls] = useState<string[]>([]);
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
    const [parsingProgress, setParsingProgress] = useState<{
        total: number;
        current: number;
        success: number;
        failed: number;
    }>({
        total: 0,
        current: 0,
        success: 0,
        failed: 0,
    });
    const [parsingLogs, setParsingLogs] = useState<
        Array<{
            url: string;
            status: 'pending' | 'success' | 'error';
            message: string;
            timestamp: string;
        }>
    >([]);

    const [activeJobId, setActiveJobId] = useState<number | null>(null);
    const [jobStatus, setJobStatus] = useState<
        'queued' | 'processing' | 'completed' | 'failed' | null
    >(null);

    // Check for active jobs on page load
    useEffect(() => {
        const savedJobId = localStorage.getItem('activeParsingJobId');

        if (savedJobId) {
            const jobId = parseInt(savedJobId, 10);
            if (!isNaN(jobId)) {
                checkJobStatus(jobId)
                    .then((isActive) => {
                        if (isActive) {
                            setActiveJobId(jobId);
                        } else {
                            // If job is not active anymore, clear from storage
                            localStorage.removeItem('activeParsingJobId');
                        }
                    })
                    .catch((error) => {
                        console.error(
                            'Error checking job status on page load:',
                            error
                        );
                        // Clear possibly invalid job ID
                        localStorage.removeItem('activeParsingJobId');
                    });
            }
        }
    }, []);

    // Function to check if a job is still active (not completed or failed)
    async function checkJobStatus(jobId: number): Promise<boolean> {
        try {
            const response = await fetch(`/api/job-status?jobId=${jobId}`);
            if (!response.ok) return false;

            const data = await response.json();
            return ['queued', 'processing'].includes(data.job.status);
        } catch (error) {
            console.error('Error in checkJobStatus:', error);
            return false;
        }
    }

    // Poll for job status updates
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (activeJobId) {
            intervalId = setInterval(async () => {
                try {
                    const response = await fetch(
                        `/api/job-status?jobId=${activeJobId}`
                    );

                    if (!response.ok) {
                        console.error(
                            `Error fetching job status: ${response.status}`
                        );
                        return;
                    }

                    const data = await response.json();

                    setParsingProgress({
                        total: data.job.total_urls,
                        current: data.job.processed_urls,
                        success: data.job.successful_urls,
                        failed: data.job.failed_urls,
                    });

                    setJobStatus(data.job.status);

                    const formattedLogs = data.logs.map((log: any) => ({
                        url: log.url,
                        status: log.status,
                        message: log.message,
                        timestamp: new Date(
                            log.created_at
                        ).toLocaleTimeString(),
                    }));

                    setParsingLogs(formattedLogs);

                    if (
                        data.job.status === 'completed' ||
                        data.job.status === 'failed'
                    ) {
                        setSuccess(
                            `Parsing complete. Successfully parsed ${data.job.successful_urls} out of ${data.job.total_urls} URLs.`
                        );
                        setLoading(false);
                        localStorage.removeItem('activeParsingJobId');
                        clearInterval(intervalId);
                    }
                } catch (error) {
                    console.error('Error checking job status:', error);
                }
            }, 3000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [activeJobId]);

    const handleParseSingle = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url) {
            setError('Please enter at least one URL to parse');
            return;
        }

        const urls = url
            .split('\n')
            .map((url) => url.trim())
            .filter((url) => url.length > 0);

        if (urls.length === 0) {
            setError('Please enter at least one valid URL to parse');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        setParsedData(null);
        setParsingLogs([]);

        if (urls.length === 1) {
            try {
                console.log(`Sending parse request for URL: ${urls[0]}`);

                const response = await fetch('/api/parse', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: urls[0] }),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        `Parse request failed with status ${
                            response.status
                        }: ${JSON.stringify(data)}`
                    );
                    throw new Error(
                        data.error ||
                            `Failed to parse casino data (Status: ${response.status})`
                    );
                }

                setSuccess(data.message);
                setParsedData(data.parsedData);
                setParsingProgress({
                    total: 1,
                    current: 1,
                    success: 1,
                    failed: 0,
                });

                setParsingLogs([
                    {
                        url: urls[0],
                        status: 'success',
                        message: `Successfully parsed casino: ${
                            data.parsedData?.name || 'Unknown'
                        }`,
                        timestamp: new Date().toLocaleTimeString(),
                    },
                ]);
            } catch (error) {
                const errorMsg =
                    error instanceof Error
                        ? error.message
                        : 'An unknown error occurred';
                console.error(`Parser error for ${urls[0]}:`, errorMsg);
                setError(errorMsg);

                setParsingLogs([
                    {
                        url: urls[0],
                        status: 'error',
                        message: errorMsg,
                        timestamp: new Date().toLocaleTimeString(),
                    },
                ]);

                setParsingProgress({
                    total: 1,
                    current: 1,
                    success: 0,
                    failed: 1,
                });
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            console.log(`Starting batch parse for ${urls.length} URLs`);

            const response = await fetch('/api/parse-batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ urls, source: 'manual-input' }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    `Batch parse request failed: ${JSON.stringify(data)}`
                );
                throw new Error(data.error || 'Failed to start batch parsing');
            }

            setSuccess(
                `Started parsing job for ${urls.length} URLs. You can close this page and the parsing will continue.`
            );
            setActiveJobId(data.job_id);
            localStorage.setItem('activeParsingJobId', data.job_id.toString());
            setJobStatus('processing');

            setParsingProgress({
                total: urls.length,
                current: 0,
                success: 0,
                failed: 0,
            });

            setParsingLogs([
                {
                    url: 'Batch job',
                    status: 'pending',
                    message: `Starting batch parsing job for ${urls.length} URLs`,
                    timestamp: new Date().toLocaleTimeString(),
                },
            ]);
        } catch (error) {
            const errorMsg =
                error instanceof Error
                    ? error.message
                    : 'An unknown error occurred';
            console.error('Batch parser error:', errorMsg);
            setError(errorMsg);
            setLoading(false);
        }
    };

    const handleParseSitemap = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sitemapUrl) {
            setError('Please enter a sitemap URL to parse');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        setCasinoUrls([]);

        try {
            const response = await fetch('/api/parse-sitemap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: sitemapUrl }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to parse sitemap');
            }

            setSuccess(data.message);
            setCasinoUrls(data.urls || []);
            setSelectedUrls(data.urls || []);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'An unknown error occurred'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleParseSelected = async () => {
        if (selectedUrls.length === 0) {
            setError('Please select at least one URL to parse');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        setParsedData(null);
        setParsingLogs([]);

        try {
            console.log(
                `Starting batch parse for ${selectedUrls.length} selected URLs`
            );

            const response = await fetch('/api/parse-batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    urls: selectedUrls,
                    source: 'sitemap-selection',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    `Batch parse request failed: ${JSON.stringify(data)}`
                );
                throw new Error(data.error || 'Failed to start batch parsing');
            }

            setSuccess(
                `Started parsing job for ${selectedUrls.length} URLs. You can close this page and the parsing will continue.`
            );
            setActiveJobId(data.job_id);
            localStorage.setItem('activeParsingJobId', data.job_id.toString());
            setJobStatus('processing');

            setParsingProgress({
                total: selectedUrls.length,
                current: 0,
                success: 0,
                failed: 0,
            });

            setParsingLogs([
                {
                    url: 'Batch job',
                    status: 'pending',
                    message: `Starting batch parsing job for ${selectedUrls.length} URLs`,
                    timestamp: new Date().toLocaleTimeString(),
                },
            ]);
        } catch (error) {
            const errorMsg =
                error instanceof Error
                    ? error.message
                    : 'An unknown error occurred';
            console.error('Batch parser error:', errorMsg);
            setError(errorMsg);
            setLoading(false);
        }
    };

    const handleSelectAll = () => {
        setSelectedUrls([...casinoUrls]);
    };

    const handleDeselectAll = () => {
        setSelectedUrls([]);
    };

    const handleToggleUrl = (url: string) => {
        if (selectedUrls.includes(url)) {
            setSelectedUrls(selectedUrls.filter((u) => u !== url));
        } else {
            setSelectedUrls([...selectedUrls, url]);
        }
    };

    const handleClearJob = () => {
        localStorage.removeItem('activeParsingJobId');
        setActiveJobId(null);
        setJobStatus(null);
        setParsingProgress({
            total: 0,
            current: 0,
            success: 0,
            failed: 0,
        });
        setParsingLogs([]);
    };

    return (
        <div className='space-y-6'>
            <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
                <div className='px-4 py-5 sm:px-6'>
                    <h2 className='text-lg leading-6 font-medium text-gray-900'>
                        Casino Parser
                    </h2>
                    <p className='mt-1 max-w-2xl text-sm text-gray-500'>
                        Parse casino data from a single URL or a sitemap.
                    </p>
                </div>

                <div className='border-t border-gray-200 px-4 py-5 sm:px-6'>
                    <div className='space-y-6'>
                        {activeJobId && (
                            <div
                                className={`rounded-md ${
                                    jobStatus === 'completed'
                                        ? 'bg-green-50'
                                        : jobStatus === 'failed'
                                        ? 'bg-red-50'
                                        : 'bg-blue-50'
                                } p-4`}
                            >
                                <div className='flex justify-between'>
                                    <div className='flex'>
                                        <div className='flex-shrink-0'>
                                            <svg
                                                className={`h-5 w-5 ${
                                                    jobStatus === 'completed'
                                                        ? 'text-green-400'
                                                        : jobStatus === 'failed'
                                                        ? 'text-red-400'
                                                        : 'text-blue-400'
                                                }`}
                                                xmlns='http://www.w3.org/2000/svg'
                                                viewBox='0 0 20 20'
                                                fill='currentColor'
                                            >
                                                <path
                                                    fillRule='evenodd'
                                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                                                    clipRule='evenodd'
                                                />
                                            </svg>
                                        </div>
                                        <div className='ml-3'>
                                            <h3
                                                className={`text-sm font-medium ${
                                                    jobStatus === 'completed'
                                                        ? 'text-green-800'
                                                        : jobStatus === 'failed'
                                                        ? 'text-red-800'
                                                        : 'text-blue-800'
                                                }`}
                                            >
                                                {jobStatus === 'completed'
                                                    ? 'Parsing Complete'
                                                    : jobStatus === 'failed'
                                                    ? 'Parsing Failed'
                                                    : 'Active Parsing Job'}
                                            </h3>
                                            <div
                                                className={`mt-2 text-sm ${
                                                    jobStatus === 'completed'
                                                        ? 'text-green-700'
                                                        : jobStatus === 'failed'
                                                        ? 'text-red-700'
                                                        : 'text-blue-700'
                                                }`}
                                            >
                                                <p>
                                                    Job #{activeJobId} is{' '}
                                                    {jobStatus}.
                                                    {jobStatus !==
                                                        'completed' &&
                                                        jobStatus !==
                                                            'failed' &&
                                                        ' You can leave this page and the parsing will continue in the background.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClearJob}
                                        className='inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className='text-md font-medium text-gray-900'>
                                Parse Casino URLs
                            </h3>
                            <p className='text-sm text-gray-500 mb-2'>
                                Enter one URL per line to parse multiple casinos
                                sequentially
                            </p>
                            <form onSubmit={handleParseSingle} className='mt-3'>
                                <div className='flex flex-col'>
                                    <textarea
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder='Enter casino URLs (one per line)&#10;https://casino.guru/casino-name-review&#10;https://casino.guru/another-casino-review'
                                        className='shadow-sm p-4 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-white font-medium bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-400 placeholder-pink-200 neon-flames'
                                        rows={5}
                                        required
                                    />
                                    <button
                                        type='submit'
                                        disabled={loading}
                                        className='mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
                                    >
                                        {loading ? 'Parsing...' : 'Parse URLs'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div>
                            <h3 className='text-md font-medium text-gray-900'>
                                Parse Sitemap
                            </h3>
                            <form
                                onSubmit={handleParseSitemap}
                                className='mt-3'
                            >
                                <div className='flex'>
                                    <input
                                        type='url'
                                        value={sitemapUrl}
                                        onChange={(e) =>
                                            setSitemapUrl(e.target.value)
                                        }
                                        placeholder='Enter sitemap URL (e.g., https://casino.guru/sitemap.xml)'
                                        className='flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
                                        required
                                    />
                                    <button
                                        type='submit'
                                        disabled={loading}
                                        className='ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
                                    >
                                        {loading
                                            ? 'Parsing...'
                                            : 'Parse Sitemap'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {error && (
                            <div className='rounded-md bg-red-50 p-4'>
                                <div className='flex'>
                                    <div className='flex-shrink-0'>
                                        <svg
                                            className='h-5 w-5 text-red-400'
                                            xmlns='http://www.w3.org/2000/svg'
                                            viewBox='0 0 20 20'
                                            fill='currentColor'
                                            aria-hidden='true'
                                        >
                                            <path
                                                fillRule='evenodd'
                                                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11 9.586V6z'
                                                clipRule='evenodd'
                                            />
                                        </svg>
                                    </div>
                                    <div className='ml-3'>
                                        <h3 className='text-sm font-medium text-red-800'>
                                            Error
                                        </h3>
                                        <div className='mt-2 text-sm text-red-700'>
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className='rounded-md bg-green-50 p-4'>
                                <div className='flex'>
                                    <div className='flex-shrink-0'>
                                        <svg
                                            className='h-5 w-5 text-green-400'
                                            xmlns='http://www.w3.org/2000/svg'
                                            viewBox='0 0 20 20'
                                            fill='currentColor'
                                            aria-hidden='true'
                                        >
                                            <path
                                                fillRule='evenodd'
                                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                                clipRule='evenodd'
                                            />
                                        </svg>
                                    </div>
                                    <div className='ml-3'>
                                        <h3 className='text-sm font-medium text-green-800'>
                                            Success
                                        </h3>
                                        <div className='mt-2 text-sm text-green-700'>
                                            <p>{success}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {parsingProgress.total > 0 && (
                            <div className='mt-6 border-t border-gray-200 pt-6'>
                                <h3 className='text-lg font-medium text-gray-900'>
                                    Parsing Dashboard
                                </h3>

                                <div className='mt-4'>
                                    <div className='flex justify-between items-center mb-1'>
                                        <span className='text-sm font-medium text-gray-700'>
                                            Progress: {parsingProgress.current}{' '}
                                            of {parsingProgress.total}
                                        </span>
                                        <span className='text-sm font-medium text-gray-700'>
                                            {Math.round(
                                                (parsingProgress.current /
                                                    parsingProgress.total) *
                                                    100
                                            )}
                                            %
                                        </span>
                                    </div>
                                    <div className='overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200'>
                                        <div
                                            style={{
                                                width: `${
                                                    (parsingProgress.current /
                                                        parsingProgress.total) *
                                                    100
                                                }%`,
                                            }}
                                            className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500'
                                        ></div>
                                    </div>
                                </div>

                                <div className='grid grid-cols-3 gap-4 mb-4'>
                                    <div className='bg-blue-50 p-3 rounded-md'>
                                        <p className='text-sm font-medium text-blue-800'>
                                            Total URLs
                                        </p>
                                        <p className='text-xl font-bold text-blue-900'>
                                            {parsingProgress.total}
                                        </p>
                                    </div>
                                    <div className='bg-green-50 p-3 rounded-md'>
                                        <p className='text-sm font-medium text-green-800'>
                                            Successful
                                        </p>
                                        <p className='text-xl font-bold text-green-900'>
                                            {parsingProgress.success}
                                        </p>
                                    </div>
                                    <div className='bg-red-50 p-3 rounded-md'>
                                        <p className='text-sm font-medium text-red-800'>
                                            Failed
                                        </p>
                                        <p className='text-xl font-bold text-red-900'>
                                            {parsingProgress.failed}
                                        </p>
                                    </div>
                                </div>

                                <div className='mt-4'>
                                    <h4 className='text-md font-medium text-gray-800 mb-2'>
                                        Parsing Logs
                                    </h4>
                                    <div className='bg-gray-50 p-3 rounded-md max-h-80 overflow-y-auto'>
                                        {parsingLogs.length > 0 ? (
                                            <ul className='divide-y divide-gray-200'>
                                                {parsingLogs.map(
                                                    (log, index) => (
                                                        <li
                                                            key={index}
                                                            className='py-2'
                                                        >
                                                            <div className='flex items-start'>
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        log.status ===
                                                                        'success'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : log.status ===
                                                                              'error'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                    }`}
                                                                >
                                                                    {log.status}
                                                                </span>
                                                                <div className='ml-2 flex-1'>
                                                                    <p className='text-sm font-medium text-gray-900 truncate'>
                                                                        {
                                                                            log.url
                                                                        }
                                                                    </p>
                                                                    <p className='text-sm text-gray-500'>
                                                                        {
                                                                            log.message
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <span className='text-xs text-gray-400'>
                                                                    {
                                                                        log.timestamp
                                                                    }
                                                                </span>
                                                            </div>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <p className='text-sm text-gray-500'>
                                                No parsing logs yet.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {casinoUrls.length > 0 && (
                            <div>
                                <div className='flex justify-between items-center'>
                                    <h3 className='text-md font-medium text-gray-900'>
                                        Casino URLs ({casinoUrls.length})
                                    </h3>
                                    <div className='space-x-2'>
                                        <button
                                            type='button'
                                            onClick={handleSelectAll}
                                            className='inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type='button'
                                            onClick={handleDeselectAll}
                                            className='inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                        >
                                            Deselect All
                                        </button>
                                        <button
                                            type='button'
                                            onClick={handleParseSelected}
                                            disabled={
                                                loading ||
                                                selectedUrls.length === 0
                                            }
                                            className='inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
                                        >
                                            Parse Selected (
                                            {selectedUrls.length})
                                        </button>
                                    </div>
                                </div>

                                {loading && parsingProgress.total > 0 && (
                                    <div className='mt-4'>
                                        <div className='flex justify-between items-center mb-1'>
                                            <span className='text-sm font-medium text-gray-700'>
                                                Parsing{' '}
                                                {parsingProgress.current} of{' '}
                                                {parsingProgress.total}
                                            </span>
                                            <span className='text-sm font-medium text-gray-700'>
                                                {Math.round(
                                                    (parsingProgress.current /
                                                        parsingProgress.total) *
                                                        100
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className='overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200'>
                                            <div
                                                style={{
                                                    width: `${
                                                        (parsingProgress.current /
                                                            parsingProgress.total) *
                                                        100
                                                    }%`,
                                                }}
                                                className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500'
                                            ></div>
                                        </div>
                                        <div className='flex justify-between text-xs text-gray-500'>
                                            <span>
                                                Success:{' '}
                                                {parsingProgress.success}
                                            </span>
                                            <span>
                                                Failed: {parsingProgress.failed}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className='mt-3 max-h-96 overflow-y-auto border border-gray-200 rounded-md'>
                                    <ul className='divide-y divide-gray-200'>
                                        {casinoUrls.map((url, index) => (
                                            <li
                                                key={index}
                                                className='px-4 py-2 hover:bg-gray-50'
                                            >
                                                <div className='flex items-center'>
                                                    <input
                                                        type='checkbox'
                                                        checked={selectedUrls.includes(
                                                            url
                                                        )}
                                                        onChange={() =>
                                                            handleToggleUrl(url)
                                                        }
                                                        className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                                                    />
                                                    <span className='ml-3 block text-sm text-gray-700 truncate'>
                                                        {url}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
