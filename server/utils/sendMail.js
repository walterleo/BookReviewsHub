import nodelmailer from "nodemailer";

async function sendMail(emailData) {
    try {
        let transporter = nodelmailer.createTransport({

            host: process.env.ENV_EMAIL_SMTP_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.ENV_EMAIL_SMTP_AUTH_USER,
                pass: process.env.ENV_EMAIL_SMTP_AUTH_PASS
            }
        });

        let info = await transporter.sendMail({
            from: `"Library Management System" <${process.env.ENV_EMAIL_SMTP_AUTH_USER}>`,
            subject: emailData.subject, // Subject line
            to: emailData.to,
            html: emailData.body
        });
        console.log(info.messageId);


    } catch (error) {
        console.log(error);
    }
}
export default sendMail;