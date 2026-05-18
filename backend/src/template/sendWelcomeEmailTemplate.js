const escapeHtml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

export const Welcome_Email_Template = (userName = "User") => {
    const safeUserName = escapeHtml(String(userName).trim());

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Support Desk</title>

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
            background:#16a34a;
            color:#ffffff;
            text-align:center;
            padding:25px;
        }

        .header h1{
            margin:0;
            font-size:30px;
        }

        .content{
            padding:30px;
            color:#374151;
            line-height:1.8;
        }

        .welcome-box{
            background:#ecfdf5;
            border:2px solid #16a34a;
            color:#166534;
            text-align:center;
            padding:18px;
            border-radius:8px;
            margin:25px 0;
            font-size:22px;
            font-weight:bold;
        }

        .feature-box{
            background:#f9fafb;
            border-left:4px solid #16a34a;
            padding:15px;
            border-radius:5px;
            margin-top:20px;
            color:#6b7280;
            font-size:14px;
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
            <h1>Welcome 🎉</h1>
        </div>

        <div class="content">

            <p>Hello <span class="highlight">${safeUserName}</span>,</p>

            <p>
                Welcome to <span class="highlight">Support Desk</span>.
                Your account has been successfully created and verified.
            </p>

            <div class="welcome-box">
                Your Support System is Ready
            </div>

            <p>
                You can now:
            </p>

            <ul>
                <li>Create and manage support tickets</li>
                <li>Track complaint status in real time</li>
                <li>Communicate with the support team</li>
                <li>Receive important ticket updates</li>
            </ul>

            <div class="feature-box">
                For security reasons, never share your account credentials with anyone.
            </div>

            <p style="margin-top:25px;">
                Thank you for joining us,<br/>
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

export const sendWelcomeEmailTemplate = (userName = "User") => Welcome_Email_Template(userName);