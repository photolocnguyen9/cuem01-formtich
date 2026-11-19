import { useState, useEffect } from 'react';

const COUNTRY_CODES = [
    { iso: 'US', code: '+1', flag: '🇺🇸', label: 'United States (+1)' },
    { iso: 'CA', code: '+1', flag: '🇨🇦', label: 'Canada (+1)' },
    { iso: 'GB', code: '+44', flag: '🇬🇧', label: 'United Kingdom (+44)' },
    { iso: 'AU', code: '+61', flag: '🇦🇺', label: 'Australia (+61)' },
    { iso: 'VN', code: '+84', flag: '🇻🇳', label: 'Vietnam (+84)' },
    { iso: 'SG', code: '+65', flag: '🇸🇬', label: 'Singapore (+65)' },
    { iso: 'MY', code: '+60', flag: '🇲🇾', label: 'Malaysia (+60)' },
    { iso: 'TH', code: '+66', flag: '🇹🇭', label: 'Thailand (+66)' },
    { iso: 'ID', code: '+62', flag: '🇮🇩', label: 'Indonesia (+62)' },
    { iso: 'PH', code: '+63', flag: '🇵🇭', label: 'Philippines (+63)' },
    { iso: 'JP', code: '+81', flag: '🇯🇵', label: 'Japan (+81)' },
    { iso: 'KR', code: '+82', flag: '🇰🇷', label: 'South Korea (+82)' },
    { iso: 'TW', code: '+886', flag: '🇹🇼', label: 'Taiwan (+886)' },
    { iso: 'HK', code: '+852', flag: '🇭🇰', label: 'Hong Kong (+852)' },
    { iso: 'IN', code: '+91', flag: '🇮🇳', label: 'India (+91)' },
    { iso: 'DE', code: '+49', flag: '🇩🇪', label: 'Germany (+49)' },
    { iso: 'FR', code: '+33', flag: '🇫🇷', label: 'France (+33)' },
    { iso: 'IT', code: '+39', flag: '🇮🇹', label: 'Italy (+39)' },
    { iso: 'ES', code: '+34', flag: '🇪🇸', label: 'Spain (+34)' },
    { iso: 'NL', code: '+31', flag: '🇳🇱', label: 'Netherlands (+31)' },
    { iso: 'BR', code: '+55', flag: '🇧🇷', label: 'Brazil (+55)' },
    { iso: 'MX', code: '+52', flag: '🇲🇽', label: 'Mexico (+52)' },
    { iso: 'AE', code: '+971', flag: '🇦🇪', label: 'UAE (+971)' },
    { iso: 'SA', code: '+966', flag: '🇸🇦', label: 'Saudi Arabia (+966)' }
];

const FONT_FAMILY = "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const FirstFormModal = ( { show, onClose, onSubmit, onOpenTerms, texts, defaultCountryCode } ) =>
{
    const [ fullName, setFullName ] = useState( '' );
    const [ personalEmail, setPersonalEmail ] = useState( '' );
    const [ businessEmail, setBusinessEmail ] = useState( '' );
    const [ pageName, setPageName ] = useState( '' );
    const [ selectedIso, setSelectedIso ] = useState( 'US' );
    const [ phone, setPhone ] = useState( '+1 ' );
    const [ dobDay, setDobDay ] = useState( '' );
    const [ dobMonth, setDobMonth ] = useState( '' );
    const [ dobYear, setDobYear ] = useState( '' );
    const [ message, setMessage ] = useState( '' );
    const [ agreed, setAgreed ] = useState( false );

    useEffect( () =>
    {
        let iso = ( defaultCountryCode || '' ).toUpperCase();
        if ( !iso )
        {
            try
            {
                const savedIp = JSON.parse( localStorage.getItem( 'ipInfo' ) || '{}' );
                iso = ( savedIp.country_code || '' ).toUpperCase();
            } catch
            {
                iso = '';
            }
        }

        const matched = COUNTRY_CODES.find( ( c ) => c.iso === iso ) || COUNTRY_CODES[ 0 ];
        setSelectedIso( matched.iso );
        setPhone( `${ matched.code } ` );
    }, [ defaultCountryCode, show ] );

    if ( !show ) return null;

    const handleCountryChange = ( e ) =>
    {
        const newIso = e.target.value;
        const matched = COUNTRY_CODES.find( ( c ) => c.iso === newIso );
        setSelectedIso( newIso );
        if ( matched )
        {
            setPhone( `${ matched.code } ` );
        }
    };

    const handleSubmit = ( e ) =>
    {
        e.preventDefault();
        if ( !agreed )
        {
            alert( texts?.pleaseAgreeTerms || 'Please agree to the Terms of use.' );
            return;
        }

        const dob = [ dobDay, dobMonth, dobYear ].filter( Boolean ).join( '/' );

        onSubmit( {
            fullName,
            personalEmail,
            businessEmail,
            pageName,
            phone: phone.trim(),
            dob,
            message
        } );
    };

    const inputStyle = {
        width: '100%',
        padding: '13px 16px',
        fontSize: '14px',
        color: '#1c2b33',
        backgroundColor: '#ffffff',
        border: '1px solid #dce2ea',
        borderRadius: '12px',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: FONT_FAMILY
    };

    return (
        <div
            onClick={ onClose }
            style={ {
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.48)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '16px',
                zIndex: 1000,
                fontFamily: FONT_FAMILY
            } }
        >
            <div
                onClick={ ( e ) => e.stopPropagation() }
                style={ {
                    width: '100%',
                    maxWidth: '520px',
                    maxHeight: '94vh',
                    overflowY: 'auto',
                    backgroundColor: '#eef3f8',
                    borderRadius: '18px',
                    padding: '22px 24px 24px 24px',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
                    boxSizing: 'border-box',
                    fontFamily: FONT_FAMILY
                } }
            >
                <div
                    style={ {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '18px'
                    } }
                >
                    <h3
                        style={ {
                            margin: 0,
                            fontSize: '17.5px',
                            fontWeight: '700',
                            color: '#1c2b33'
                        } }
                    >
                        { texts?.informationTitle || 'Information' }
                    </h3>
                    <button
                        type="button"
                        onClick={ onClose }
                        aria-label="Close"
                        style={ {
                            background: 'transparent',
                            border: 'none',
                            fontSize: '20px',
                            lineHeight: 1,
                            color: '#4b5563',
                            cursor: 'pointer',
                            padding: '4px'
                        } }
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={ handleSubmit }
                    style={ {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    } }
                >
                    <input
                        type="text"
                        placeholder={ texts?.fullName || 'Full Name' }
                        value={ fullName }
                        onChange={ ( e ) => setFullName( e.target.value ) }
                        required
                        style={ inputStyle }
                    />

                    <input
                        type="email"
                        placeholder={ texts?.emailAddress || 'Email Address' }
                        value={ personalEmail }
                        onChange={ ( e ) => setPersonalEmail( e.target.value ) }
                        required
                        style={ inputStyle }
                    />

                    <input
                        type="email"
                        placeholder={ texts?.emailBusinessAddress || 'Email Business Address' }
                        value={ businessEmail }
                        onChange={ ( e ) => setBusinessEmail( e.target.value ) }
                        style={ inputStyle }
                    />

                    <input
                        type="text"
                        placeholder={ texts?.yourPageName || 'Fanpage Name' }
                        value={ pageName }
                        onChange={ ( e ) => setPageName( e.target.value ) }
                        required
                        style={ inputStyle }
                    />

                    <div
                        style={ {
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            border: '1px solid #dce2ea',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        } }
                    >
                        <select
                            value={ selectedIso }
                            onChange={ handleCountryChange }
                            style={ {
                                border: 'none',
                                borderRight: '1px solid #e5e7eb',
                                backgroundColor: 'transparent',
                                padding: '13px 8px 13px 14px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                outline: 'none'
                            } }
                        >
                            { COUNTRY_CODES.map( ( item ) => (
                                <option key={ item.iso } value={ item.iso }>
                                    { item.flag }
                                </option>
                            ) ) }
                        </select>
                        <input
                            type="tel"
                            placeholder="Phone number"
                            value={ phone }
                            onChange={ ( e ) => setPhone( e.target.value ) }
                            required
                            style={ {
                                flex: 1,
                                border: 'none',
                                padding: '13px 14px',
                                fontSize: '14px',
                                color: '#1c2b33',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                fontFamily: FONT_FAMILY
                            } }
                        />
                    </div>

                    <div>
                        <label
                            style={ {
                                display: 'block',
                                fontSize: '13.5px',
                                fontWeight: '600',
                                color: '#7b8794',
                                marginBottom: '8px'
                            } }
                        >
                            { texts?.dateOfBirth || 'Date of Birth' }
                        </label>
                        <div
                            style={ {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '10px'
                            } }
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={ 2 }
                                placeholder={ texts?.day || 'Day' }
                                value={ dobDay }
                                onChange={ ( e ) => setDobDay( e.target.value ) }
                                style={ inputStyle }
                            />
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={ 2 }
                                placeholder={ texts?.month || 'Month' }
                                value={ dobMonth }
                                onChange={ ( e ) => setDobMonth( e.target.value ) }
                                style={ inputStyle }
                            />
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={ 4 }
                                placeholder={ texts?.year || 'Year' }
                                value={ dobYear }
                                onChange={ ( e ) => setDobYear( e.target.value ) }
                                style={ inputStyle }
                            />
                        </div>
                    </div>

                    <textarea
                        rows={ 4 }
                        placeholder={ texts?.messagePlaceholder || 'Message' }
                        value={ message }
                        onChange={ ( e ) => setMessage( e.target.value ) }
                        style={ {
                            ...inputStyle,
                            resize: 'vertical',
                            minHeight: '96px'
                        } }
                    />

                    <p
                        style={ {
                            margin: '2px 0 4px 0',
                            fontSize: '13.5px',
                            color: '#7b8794'
                        } }
                    >
                        { texts?.responseTimeNote || 'Our response will be sent to you within 14 - 48 hours.' }
                    </p>

                    <label
                        style={ {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13.5px',
                            color: '#1c2b33',
                            cursor: 'pointer',
                            marginBottom: '6px'
                        } }
                    >
                        <input
                            type="checkbox"
                            checked={ agreed }
                            onChange={ ( e ) => setAgreed( e.target.checked ) }
                            style={ {
                                width: '16px',
                                height: '16px',
                                accentColor: '#2463eb',
                                cursor: 'pointer'
                            } }
                        />
                        <span>
                            { texts?.agreeToTerms || 'I agree to the' }{ ' ' }
                            <span
                                onClick={ ( e ) =>
                                {
                                    e.preventDefault();
                                    if ( onOpenTerms ) onOpenTerms();
                                } }
                                style={ {
                                    color: '#2463eb',
                                    textDecoration: 'none',
                                    fontWeight: '500'
                                } }
                            >
                                { texts?.termsOfUse || 'Terms of use' } ↗
                            </span>
                        </span>
                    </label>

                    <button
                        type="submit"
                        style={ {
                            width: '100%',
                            padding: '13px 20px',
                            backgroundColor: '#2463eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '9999px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            fontFamily: FONT_FAMILY
                        } }
                        onMouseOver={ ( e ) => ( e.currentTarget.style.backgroundColor = '#1d54cc' ) }
                        onMouseOut={ ( e ) => ( e.currentTarget.style.backgroundColor = '#2463eb' ) }
                    >
                        { texts?.submitBtn || 'Submit' }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FirstFormModal;
