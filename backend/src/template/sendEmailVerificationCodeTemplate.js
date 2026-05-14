
const escapeHtml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

export const Verification_Email_Template = (verificationCode = "") => {
    const safeVerificationCode = escapeHtml(String(verificationCode).trim());

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Desk Email Verification</title>

    <style>
        body{
            margin:0;
            padding:0;
            background-color:#f4f7fb;
            font-family:Arial, sans-serif;
        }

        .container{
            max-width:600px;
            margin:40px auto;
            background:#ffffff;
            border-radius:10px;
            overflow:hidden;
            box-shadow:0 4px 12px rgba(0,0,0,0.1);
            border:1px solid #e5e7eb;
        }

        .header{
            background:#2563eb;
            color:#ffffff;
            text-align:center;
            padding:25px;
        }

        .header h1{
            margin:0;
            font-size:28px;
        }

        .content{
            padding:30px;
            color:#374151;
            line-height:1.8;
        }

        .content p{
            margin-bottom:16px;
        }

        .verification-code{
            background:#eff6ff;
            border:2px dashed #2563eb;
            color:#2563eb;
            font-size:28px;
            font-weight:bold;
            text-align:center;
            padding:15px;
            border-radius:8px;
            letter-spacing:4px;
            margin:25px 0;
        }

        .info-box{
            background:#f9fafb;
            border-left:4px solid #2563eb;
            padding:15px;
            border-radius:5px;
            margin-top:20px;
            font-size:14px;
            color:#6b7280;
        }

        .footer{
            background:#f9fafb;
            padding:18px;
            text-align:center;
            font-size:12px;
            color:#9ca3af;
            border-top:1px solid #e5e7eb;
        }

        .highlight{
            font-weight:bold;
            color:#111827;
        }
    </style>
</head>

<body>

    <div class="container">

        <div class="header">
            <h1>Support Desk</h1>
        </div>

        <div class="content">

            <p>Hello,</p>

            <p>
                Welcome to <span class="highlight">Support Desk</span>.
                To continue using our ticket management and complaint support system,
                please verify your email address using the verification code below.
            </p>

            <div class="verification-code">
                ${safeVerificationCode}
            </div>

            <p>
                This code will expire shortly for security reasons.
            </p>

            <div class="info-box">
                If you did not create an account or request this verification,
                please ignore this email.
            </div>

            <p style="margin-top:25px;">
                Thank you,<br/>
                <strong>Support Desk Team</strong>
            </p>

        </div>

        <div class="footer">
            &copy; ${new Date().getFullYear()} Support Desk. All rights reserved.
        </div>

    </div>

</body>
</html>
`;
};

export const sendEmailVerificationCodeTemplate = () => Verification_Email_Template;

