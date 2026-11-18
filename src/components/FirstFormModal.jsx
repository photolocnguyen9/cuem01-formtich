import { useState } from 'react';

const COUNTRY_CODES = [
    { code: '+84', flag: '🇻🇳', label: 'VN' },
    { code: '+1', flag: '🇺🇸', label: 'US' },
    { code: '+44', flag: '🇬🇧', label: 'UK' },
    { code: '+65', flag: '🇸🇬', label: 'SG' },
    { code: '+81', flag: '🇯🇵', label: 'JP' },
    { code: '+82', flag: '🇰🇷', label: 'KR' }
];

const FirstFormModal = ( { show, onClose, onSubmit, onOpenTerms, texts } ) =>
{
    const [ fullName, setFullName ] = useState( '' );
    const [ personalEmail, setPersonalEmail ] = useState( '' );
    const [ businessEmail, setBusinessEmail ] = useState( '' );
    const [ pageName, setPageName ] = useState( '' );
    const [ countryCode, setCountryCode ] = useState( '+84' );
    const [ phone, setPhone ] = useState( '' );
    const [ dobDay, setDobDay ] = useState( '' );
    const [ dobMonth, setDobMonth ] = useState( '' );
    const [ dobYear, setDobYear ] = useState( '' );
    const [ message, setMessage ] = useState( '' );
    const [ agreed, setAgreed ] = useState( false );

    if ( !show ) return null;

    const handleSubmit = ( e ) =>
    {
        e.preventDefault();
        if ( !agreed )
        {
            alert( texts?.pleaseAgreeTerms || 'Please agree to the Terms of use.' );
            return;
        }

        const dob = [ dobDay, dobMonth, dobYear ].filter( Boolean ).join( '/' );
        const fullPhone = phone ? `${ countryCode } ${ phone }` : '';

        onSubmit( {
            fullName,
            personalEmail,
            businessEmail,
            pageName,
            phone: fullPhone,
            dob,
            message
        } );
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        fontSize: '14px',
        color: '#1c2b33',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        outline: 'none',
        boxSizing: 'border-box'
    };

    return (
        <div
            onClick={ onClose }
            style={ {
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '16px',
                zIndex: 1000
            } }
        >
            <div
                onClick={ ( e ) => e.stopPropagation() }
                style={ {
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    backgroundColor: '#f3f6fa',
                    borderRadius: '18px',
                    padding: '22px 24px 24px 24px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    boxSizing: 'border-box'
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
                            fontSize: '18px',
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
                        placeholder={ texts?.yourPageName || 'Your Page Name' }
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
                            border: '1px solid #d1d5db',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        } }
                    >
                        <select
                            value={ countryCode }
                            onChange={ ( e ) => setCountryCode( e.target.value ) }
                            style={ {
                                border: 'none',
                                borderRight: '1px solid #e5e7eb',
                                backgroundColor: 'transparent',
                                padding: '12px 8px 12px 12px',
                                fontSize: '15px',
                                cursor: 'pointer',
                                outline: 'none'
                            } }
                        >
                            { COUNTRY_CODES.map( ( item ) => (
                                <option key={ item.code } value={ item.code }>
                                    { item.flag }
                                </option>
                            ) ) }
                        </select>
                        <input
                            type="tel"
                            placeholder="1 (702) 123-4567"
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
                                backgroundColor: 'transparent'
                            } }
                        />
                    </div>

                    <div>
                        <label
                            style={ {
                                display: 'block',
                                fontSize: '13.5px',
                                fontWeight: '600',
                                color: '#6b7280',
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
                            minHeight: '96px',
                            fontFamily: 'inherit'
                        } }
                    />

                    <p
                        style={ {
                            margin: '2px 0 4px 0',
                            fontSize: '13px',
                            color: '#6b7280'
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
                                accentColor: '#1d63dc',
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
                                    color: '#1d63dc',
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
                            backgroundColor: '#1d63dc',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '9999px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
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
