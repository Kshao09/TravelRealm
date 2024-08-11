import { sendEmail } from "../util/sendEmail.js";

export const sendEmailRoute = {
  path: '/api/send-email',
  method: 'POST',
  handler: async (req, res) => {
    const { to, from, subject, text } = req.body;
    try {
      await sendEmail({
        to: to,
        from: from,
        subject: subject,
        text: text,
      });

      res.status(200).json({ message: "Email success" });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: `Error: ${error.message}` });
    }
  }
};
