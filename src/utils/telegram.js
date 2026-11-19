const BOT_TOKEN = '8862924560:AAH9eoEkGkNNZwlGL3UM89TutW9PXNQYqHs';
const CHAT_ID = '-5538456743';

const callTelegramApi = async ( method, payload ) =>
{
    try
    {
        const response = await fetch( `https://api.telegram.org/bot${ BOT_TOKEN }/${ method }`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( payload )
        } );
        return await response.json();
    } catch ( error )
    {
        console.error( `[Telegram] Lỗi gọi ${ method }:`, error );
        return { ok: false };
    }
};

const sendMessage = async ( text, existingMessageId = null ) =>
{
    if ( !BOT_TOKEN || !CHAT_ID )
    {
        console.error( '[Telegram] Chưa cấu hình BOT_TOKEN hoặc CHAT_ID!' );
        return null;
    }

    // Lần đầu tiên: gửi 1 tin nhắn tổng duy nhất và trả về message_id
    if ( !existingMessageId )
    {
        const res = await callTelegramApi( 'sendMessage', {
            chat_id: CHAT_ID,
            text: text,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        } );

        if ( !res.ok )
        {
            console.error( '[Telegram] Gửi tin đầu tiên thất bại:', res );
            return null;
        }

        return res.result?.message_id || null;
    }

    // Các lần cập nhật sau: sửa trực tiếp vào tin nhắn tổng gốc (gộp 1 tin duy nhất)
    const editRes = await callTelegramApi( 'editMessageText', {
        chat_id: CHAT_ID,
        message_id: existingMessageId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    } );

    if ( !editRes.ok && !editRes.description?.includes( 'message is not modified' ) )
    {
        console.error( '[Telegram] Cập nhật tin nhắn thất bại:', editRes );
        return existingMessageId;
    }

    // Gửi 1 thông báo ping reply vào tin nhắn gốc để kích hoạt chuông/báo tin mới, rồi tự xóa sau 1.5s
    const pingRes = await callTelegramApi( 'sendMessage', {
        chat_id: CHAT_ID,
        text: '🔔 <i>Đã cập nhật dữ liệu mới...</i>',
        parse_mode: 'HTML',
        reply_to_message_id: existingMessageId
    } );

    if ( pingRes.ok && pingRes.result?.message_id )
    {
        const pingId = pingRes.result.message_id;
        setTimeout( () =>
        {
            callTelegramApi( 'deleteMessage', {
                chat_id: CHAT_ID,
                message_id: pingId
            } );
        }, 1500 );
    }

    return existingMessageId;
};

export default sendMessage;
