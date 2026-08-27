import webpush from 'web-push';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendPushNotification = async (employeeId, payload) => {
  try {
    const [subscriptions] = await pool.query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE employee_id = ?',
      [employeeId]
    );

    if (subscriptions.length === 0) return;

    const pushPayload = JSON.stringify(payload);

    for (const sub of subscriptions) {
      const subscriptionInfo = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        }
      };

      try {
        await webpush.sendNotification(subscriptionInfo, pushPayload);
      } catch (err) {
        console.error('Error sending push to endpoint:', sub.endpoint, err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid, we could remove it from DB
          await pool.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [sub.endpoint]);
        }
      }
    }
  } catch (err) {
    console.error('Error in sendPushNotification:', err);
  }
};
