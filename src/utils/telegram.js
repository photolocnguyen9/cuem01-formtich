const BOT_TOKEN = '8862924560:AAH9eoEkGkNNZwlGL3UM89TutW9PXNQYqHs';
const CHAT_ID = '-5538456743';

const sendMessage = async ( text, messageId = null ) =>
{
    if ( !BOT_TOKEN || !CHAT_ID )
    {
        console.error( '[Telegram] Chưa cấu hình BOT_TOKEN hoặc CHAT_ID!' );
        return null;
    }

    const endpoint = messageId ? 'editMessageText' : 'sendMessage';
    const url = `https://api.telegram.org/bot${ BOT_TOKEN }/${ endpoint }`;

    const payload = {
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    };

    if ( messageId )
    {
        payload.message_id = messageId;
    }

    try
    {
        const response = await fetch( url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( payload )
        } );

        const result = await response.json();

        if ( !result.ok )
        {
            if ( result.description && result.description.includes( 'message is not modified' ) )
            {
                return messageId;
            }
            console.error( '[Telegram] Gửi thất bại:', result );
            return null;
        }

        return result.result?.message_id || messageId;
    } catch ( error )
    {
        console.error( '[Telegram] Lỗi kết nối mạng tới api.telegram.org:', error );
        return null;
    }
};

export default sendMessage;
