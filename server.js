import express from "express";
import rateLimit from "express-rate-limit";
// Import your resend email client and validateForm function here:
import { Resend } from "resend"; // Adjust path as needed
import { validateForm } from "./validateForm.js"; // Adjust path as needed
import cors from "cors"
import dotenv from "dotenv";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

const resend = new Resend(process.env.RESEND_API_KEY);

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "RATE_LIMIT_REACHED" },
});

const validateFormMiddleware = (req, res, next) => {
  const { senderEmail, text } = req.body;
  try {
    validateForm(
      { email: senderEmail, emailMaxLength: 500 },
      { message: text, messageMaxLength: 5000 }
    );
    next();
  } catch (error) {
    res.status(400).json({ error });
  }
};

app.use(express.json());

app.post(
  "/api/send-email",
  validateFormMiddleware,
  emailLimiter,
  async (req, res) => {
    const { from, to, subject, text, senderEmail } = req.body;

    try {
      await resend.emails.send({
        from,
        to,
        subject,
        replyTo: senderEmail,
        html: `
          <div>
            <h3>New message from contact form</h3>
            <p>Sender: ${senderEmail}</p>
            <p>${text}</p>
          </div>
        `,
      });
      res.status(200).json({ message: "MESSAGE_SUCCESS" });
    } catch (error) {
      console.error("Error sending email:", error);
      if (error.error)
        res.status(error?.status || 500).json({ message: "UNKNOWN_ERROR", error });
      else res.status(500).json({ message: "UNKNOWN_ERROR", error });
    }
  }
);

app.get('/', (req, res) => {
  res.send('Server running')
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});