const { Expo } = require('expo-server-sdk');

const expo = new Expo();

/**
 * Send push notifications to multiple tokens
 * @param {string[]} tokens - Array of Expo push tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data to send with the notification
 */
const sendPushNotifications = async (tokens, title, body, data = {}) => {
  const messages = [];
  for (const pushToken of tokens) {
    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
      if (pushToken) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
      }
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
    });
  }

  if (messages.length === 0) return [];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }

  return tickets;
};

module.exports = { sendPushNotifications };
