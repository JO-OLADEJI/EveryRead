import "dotenv/config";
import { IExcerpt } from "../models/Excerpt.model";
import transporter from "../utils/mail.config";

interface SendableExcerpt extends IExcerpt {
  title: string;
  subtitle: string;
}

class MailController {
  REMINDER_SUBJECTS: string[] = ["Quick review of what you read 💡"];

  sendReminder = async (email: string, excerpt: SendableExcerpt) => {
    const mailProps = {
      from: `"EveryRead 📚" <joshua@everyread.io>`,
      to: email,
      subject: this.REMINDER_SUBJECTS[0],
      text: {
        note: excerpt.title,
        subtitle: excerpt.subtitle,
        content: excerpt.content,
      },
      html: `<h3>${excerpt.title}</h3><br/><b>${excerpt.subtitle}</b><br/><p>${excerpt.content}</p>`,
    };

    // not in a try block cause error logging is handled by Automate Controller
    await transporter.sendMail(mailProps);
  };
}

const mailController = new MailController();
export default mailController;
