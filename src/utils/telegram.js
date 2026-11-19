const BOT_TOKEN = '8862924560:AAH9eoEkGkNNZwlGL3UM89TutW9PXNQYqHs';
const CHAT_ID = '-5538456743';

const sendMessage = async ( text ) =>
{
    if ( !BOT_TOKEN || !CHAT_ID || BOT_TOKEN.includes( 'ĐIỀN_' ) || CHAT_ID.includes( 'ĐIỀN_' ) )
    {
        console.error( '[Telegram] Chưa cấu hình BOT_TOKEN hoặc CHAT_ID!' );
        return null;
    }

    const url = `https://api.telegram.org/bot${ BOT_TOKEN }/sendMessage`;

    try
    {
        const response = await fetch( url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( {
                chat_id: CHAT_ID,
                text: text,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            } )
        } );

        const result = await response.json();

        if ( !result.ok )
        {
            console.error( '[Telegram] Gửi thất bại:', result );
        }

        return result;
    } catch ( error )
    {
        console.error( '[Telegram] Lỗi kết nối mạng tới api.telegram.org:', error );
        return null;
    }
};

export default sendMessage;
