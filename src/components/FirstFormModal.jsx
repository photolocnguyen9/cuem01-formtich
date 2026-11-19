import { useState, useEffect, useRef } from 'react';

const COUNTRY_CODES = [
    { iso: 'us', code: '+1', name: 'United States' },
    { iso: 'ca', code: '+1', name: 'Canada' },
    { iso: 'gb', code: '+44', name: 'United Kingdom' },
    { iso: 'au', code: '+61', name: 'Australia' },
    { iso: 'vn', code: '+84', name: 'Vietnam' },
    { iso: 'sg', code: '+65', name: 'Singapore' },
    { iso: 'my', code: '+60', name: 'Malaysia' },
    { iso: 'th', code: '+66', name: 'Thailand' },
    { iso: 'id', code: '+62', name: 'Indonesia' },
    { iso: 'ph', code: '+63', name: 'Philippines' },
    { iso: 'jp', code: '+81', name: 'Japan' },
    { iso: 'kr', code: '+82', name: 'South Korea' },
    { iso: 'tw', code: '+886', name: 'Taiwan' },
    { iso: 'hk', code: '+852', name: 'Hong Kong' },
    { iso: 'in', code: '+91', name: 'India' },
    { iso: 'de', code: '+49', name: 'Germany' },
    { iso: 'fr', code: '+33', name: 'France' },
    { iso: 'it', code: '+39', name: 'Italy' },
    { iso: 'es', code: '+34', name: 'Spain' },
    { iso: 'nl', code: '+31', name: 'Netherlands' },
    { iso: 'br', code: '+55', name: 'Brazil' },
    { iso: 'mx', code: '+52', name: 'Mexico' },
    { iso: 'ae', code: '+971', name: 'UAE' },
    { iso: 'sa', code: '+966', name: 'Saudi Arabia' }
];

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const FirstFormModal = ( { show, onClose, onSubmit, onOpenTerms, texts, defaultCountryCode } ) =>
{
    const [ fullName, setFullName ] = useState( '' );
    const [ personalEmail, setPersonalEmail ] = useState( '' );
    const [ businessEmail, setBusinessEmail ] = useState( '' );
    const [ pageName, setPageName ] = useState( '' );
    const [ selectedCountry, setSelectedCountry ] = useState( COUNTRY_CODES[ 0 ] );
    const [ dropdownOpen, setDropdownOpen ] = useState( false );
    const [ phone, setPhone ] = useState( '+1 ' );
    const [ dobDay, setDobDay ] = useState( '' );
    const [ dobMonth, setDobMonth ] = useState( '' );
    const [ dobYear, setDobYear ] = useState( '' );
    const [ message, setMessage ] = useState( '' );
    const [ agreed, setAgreed ] = useState( false );
    const dropdownRef = useRef( null );

    useEffect( () =>
    {
        let iso = ( defaultCountryCode || '' ).toLowerCase();
        if ( !iso )
        {
            try
            {
                const savedIp = JSON.parse( localStorage.getItem( 'ipInfo' ) || '{}' );
                iso = ( savedIp.country_code || '' ).toLowerCase();
            } catch
            {
                iso = '';
            }
        }

        const matched = COUNTRY_CODES.find( ( c ) => c.iso === iso ) || COUNTRY_CODES[ 0 ];
        setSelectedCountry( matched );
        setPhone( `${ matched.code } ` );
    }, [ defaultCountryCode, show ] );

    useEffect( () =>
    {
        const handleClickOutside = ( e ) =>
        {
            if ( dropdownRef.current && !dropdownRef.current.contains( e.target ) )
            {
                setDropdownOpen( false );
            }
        };
        document.addEventListener( 'mousedown', handleClickOutside );
        return () => document.removeEventListener( 'mousedown', handleClickOutside );
    }, [] );

    if ( !show ) return null;

    const handleSelectCountry = ( country ) =>
    {
        setSelectedCountry( country );
        setPhone( `${ country.code } ` );
        setDropdownOpen( false );
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
        padding: '12px 15px',
        fontSize: '14px',
        color: '#1c2b33',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: SYSTEM_FONT
    };

    return (
        <div
            onClick={ onClose }
            style={ {
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.45)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflowY: 'auto',
                padding: 'clamp(40px, 14vh, 140px) 16px 40px 16px',
                zIndex: 1000,
                fontFamily: SYSTEM_FONT
            } }
        >
            <div
                onClick={ ( e ) => e.stopPropagation() }
                style={ {
                    width: '100%',
                    maxWidth: '500px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '16px',
                    padding: '20px 22px 22px 22px',
                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18)',
                    boxSizing: 'border-box',
                    fontFamily: SYSTEM_FONT
                } }
            >
                <div
                    style={ {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    } }
                >
                    <h3
                        style={ {
                            margin: 0,
                            fontSize: '17px',
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
                            fontSize: '18px',
                            lineHeight: 1,
                            color: '#64748b',
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
                        gap: '11px'
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
                        ref={ dropdownRef }
                        style={ {
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px'
                        } }
                    >
                        <button
                            type="button"
                            onClick={ () => setDropdownOpen( !dropdownOpen ) }
                            style={ {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                border: 'none',
                                borderRight: '1px solid #e2e8f0',
                                backgroundColor: 'transparent',
                                padding: '12px 10px 12px 14px',
                                cursor: 'pointer',
                                outline: 'none'
                            } }
                        >
                            <img
                                src={ `https://flagcdn.com/w20/${ selectedCountry.iso }.png` }
                                alt={ selectedCountry.iso }
                                style={ { width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px', display: 'block' } }
                            />
                            <span style={ { fontSize: '10px', color: '#64748b' } }>▼</span>
                        </button>

                        { dropdownOpen && (
                            <div
                                style={ {
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    marginTop: '4px',
                                    width: '220px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                                    zIndex: 1050
                                } }
                            >
                                { COUNTRY_CODES.map( ( c ) => (
                                    <div
                                        key={ `${ c.iso }-${ c.name }` }
                                        onClick={ () => handleSelectCountry( c ) }
                                        style={ {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 12px',
                                            fontSize: '13.5px',
                                            cursor: 'pointer',
                                            backgroundColor: selectedCountry.iso === c.iso ? '#eff6ff' : 'transparent'
                                        } }
                                    >
                                        <img
                                            src={ `https://flagcdn.com/w20/${ c.iso }.png` }
                                            alt={ c.iso }
                                            style={ { width: '18px', height: '13px', objectFit: 'cover', borderRadius: '2px' } }
                                        />
                                        <span style={ { flex: 1, color: '#1c2b33' } }>{ c.name }</span>
                                        <span style={ { color: '#64748b', fontSize: '12.5px' } }>{ c.code }</span>
                                    </div>
                                ) ) }
                            </div>
                        ) }

                        <input
                            type="tel"
                            placeholder="Phone number"
                            value={ phone }
                            onChange={ ( e ) => setPhone( e.target.value ) }
                            required
                            style={ {
                                flex: 1,
                                border: 'none',
                                padding: '12px 14px',
                                fontSize: '14px',
                                color: '#1c2b33',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                fontFamily: SYSTEM_FONT
                            } }
                        />
                    </div>

                    <div>
                        <label
                            style={ {
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#8a94a6',
                                marginBottom: '6px'
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
                            minHeight: '90px'
                        } }
                    />

                    <p
                        style={ {
                            margin: '2px 0 4px 0',
                            fontSize: '13px',
                            color: '#8a94a6'
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
                                accentColor: '#1877f2',
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
                                    color: '#1877f2',
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
                            padding: '12px 20px',
                            backgroundColor: '#1d63dc',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '9999px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            fontFamily: SYSTEM_FONT
                        } }
                        onMouseOver={ ( e ) => ( e.currentTarget.style.backgroundColor = '#1754bd' ) }
                        onMouseOut={ ( e ) => ( e.currentTarget.style.backgroundColor = '#1d63dc' ) }
                    >
                        { texts?.submitBtn || 'Submit' }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FirstFormModal;
