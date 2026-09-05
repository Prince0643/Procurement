import { Expo } from 'expo-server-sdk';
import pool from '../config/database.js';

const expo = new Expo();

export const sendPushNotification = async (employeeId, payload) => {
  try {
    const [rows] = await pool.query(
      'SELECT fcm_token FROM employees WHERE id = ?',
      [employeeId]
    );

    if (rows.length === 0 || !rows[0].fcm_token) return;

    const pushToken = rows[0].fcm_token;

    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const messages = [{
      to: pushToken,
      sound: 'default',
      title: payload.title || 'Procurement System',
      body: payload.message || 'You have a new notification',
      data: payload,
    }];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push chunk', error);
      }
    }
  } catch (err) {
    console.error('Error in sendPushNotification:', err);
  }
};
