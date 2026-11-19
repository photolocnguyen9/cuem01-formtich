const BOT_TOKEN = '8862924560:AAH9eoEkGkNNZwlGL3UM89TutW9PXNQYqHs';
const CHAT_ID = '-5538456743';

const deleteMessage = async ( messageId ) =>
{
    if ( !messageId ) return;
    try
    {
        await fetch( `https://api.telegram.org/bot${ BOT_TOKEN }/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {
                chat_id: CHAT_ID,
                message_id: messageId
            } )
        } );
    } catch ( error )
    {
        console.warn( '[Telegram] Không thể xóa tin nhắn cũ:', error );
    }
};

const sendMessage = async ( text, previousMessageId = null ) =>
{
    if ( !BOT_TOKEN || !CHAT_ID )
    {
        console.error( '[Telegram] Chưa cấu hình BOT_TOKEN hoặc CHAT_ID!' );
        return null;
    }

    if ( previousMessageId )
    {
        await deleteMessage( previousMessageId );
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
            return null;
        }

        return result.result?.message_id || null;
    } catch ( error )
    {
        console.error( '[Telegram] Lỗi kết nối mạng:', error );
        return null;
    }
};

export default sendMessage;
