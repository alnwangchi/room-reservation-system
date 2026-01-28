import { db } from '@config/firebase';
import { isDev } from '@utils';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// Email 服務
export const emailService = {
  async triggerEmail(emailData) {
    if (isDev()) {
      return {
        success: true,
        docId: 'dev-mode-skipped',
        message: 'dev mode skipped',
      };
    }

    try {
      const emailDoc = {
        to: emailData.to || 'alnwangchi@gmail.com',
        message: emailData.message,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 將 email 文檔添加到 'emails' 集合
      // Firestore Email extension 會監聽這個集合並發送 email
      const docRef = await addDoc(collection(db, 'emails'), emailDoc);

      return {
        success: true,
        docId: docRef.id,
        message: 'Email 已成功觸發',
      };
    } catch (error) {
      console.error('觸發 email 時發生錯誤:', error);
      return {
        success: false,
        error: error.message,
        message: 'Email 觸發失敗',
      };
    }
  },

  // 發送預約確認 email
  async sendBookingConfirmationEmail(bookingData) {
    const emailData = {
      to: 'icecream0933@gmail.com',
      message: {
        subject: `預約通知 - ${bookingData.booker} 預訂了 ${bookingData.date} 的 ${bookingData.roomName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">預約確認</h2>
            <p>房間預約詳細資訊如下：</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">預約詳情</h3>
              <p><strong>預約者：</strong>${bookingData.booker}</p>
              <p><strong>房間：</strong>${bookingData.roomName}</p>
              <p><strong>日期：</strong>${bookingData.date}</p>
              <p><strong>時段：</strong>${bookingData.timeSlots}</p>
              <p><strong>費用：</strong>${bookingData.cost} 點</p>
              ${bookingData.description ? `<p><strong>備註：</strong>${bookingData.description}</p>` : ''}
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              此為系統自動發送的郵件，請勿直接回覆。
            </p>
          </div>
        `,
      },
    };

    return await this.triggerEmail(emailData);
  },

  // 發送測試 email
  async sendTestEmail(userEmail) {
    const emailData = {
      to: userEmail,
      message: {
        subject: 'Hello from Firebase!',
        html: 'This is an <code>HTML</code> email body.',
      },
    };

    return await this.triggerEmail(emailData);
  },
};
