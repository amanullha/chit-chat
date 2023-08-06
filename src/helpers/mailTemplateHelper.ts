export class MailTemplate {
    private static instance: MailTemplate | null = null;

    private constructor() {
    }

    public static getInstance(): MailTemplate {
        if (!MailTemplate.instance) {
            MailTemplate.instance = new MailTemplate();
        }
        return MailTemplate.instance;
    }
    createVerificationHtmlTemplate(userName: string, verificationLink: string) {
        return `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Chit-Chat App - Verify Your Account</title>
  <style>
    /* Add your custom styling here */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #e3e3e3;
      border-radius: 20px;
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo img {
      max-width: 150px;
    }
    .message {
      color:white;
      padding: 10px;
      padding-left:20px;
      background-color: #1d1934;
      border-radius: 20px;
    }
      .bodyBg {
      background-color: #05001e;
    }
    .verification-link {
      color: #007bff;
      text-decoration: none;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container bodyBg">
    <div class="logo ">
     <img src="https://i.ibb.co/fnWH48x/chit-chat-1-removebg-preview.png" alt="chit-chat-1-removebg-preview" border="0">
    </div>
    <div class="message" style="color: #fff">
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Welcome to Chit-Chat App! We're excited to have you on board.</p>
      <p>To complete your account verification, please click on the link below:</p>
      <p><a class="verification-link" href="${verificationLink}" target="_blank" rel="noopener">Verify Your Account</a></p>
      <p>If you didn't sign up for Chit-Chat App, you can safely ignore this email.</p>
      <p>Thank you,<br> The <strong>Chit-Chat</strong> App Team</p>
    </div>
  </div>
</body>
</html>


    `
    }

}