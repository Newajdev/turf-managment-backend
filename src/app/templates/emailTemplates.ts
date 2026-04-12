export const emailTemplates: Record<string, string> = {
  "booking-confirmation": `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
        .container { width: 90%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 40px 20px; text-align: center; color: white; }
        .header-title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .content { padding: 40px; }
        .greeting { font-size: 20px; font-weight: 700; color: #064e3b; margin-bottom: 16px; }
        .message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 32px; }
        .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
        .detail-label { font-weight: bold; color: #64748b; }
        .footer { padding: 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="header-title">Booking Confirmation</div>
            </div>
            <div class="content">
                <div class="greeting">Your Turf is Ready!</div>
                <p class="message">Hello <%= playerName %>, great news! Your booking has been confirmed. Here are your session details:</p>
                <div class="card">
                    <div class="detail-row"><span class="detail-label">Turf:</span><span><%= turfName %></span></div>
                    <div class="detail-row"><span class="detail-label">Date:</span><span><%= date %></span></div>
                    <div class="detail-row"><span class="detail-label">Time:</span><span><%= startTime %> - <%= endTime %></span></div>
                    <div class="detail-row" style="border-bottom: none;"><span class="detail-label">Total Price:</span><span style="font-weight: 700; color: #064e3b;"><%= price %> BDT</span></div>
                </div>
                <p class="message" style="text-align: center;">Please arrive at least 10 minutes before your slot. Enjoy your game!</p>
            </div>
            <div class="footer">&copy; 2026 Turf Booking System. All rights reserved.</div>
        </div>
    </div>
</body>
</html>`,

  "emailVerificationOTP": `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
        .container { width: 90%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 40px 20px; text-align: center; color: white; }
        .header-title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .content { padding: 40px; }
        .greeting { font-size: 20px; font-weight: 700; color: #064e3b; margin-bottom: 16px; }
        .message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 32px; }
        .otp-container { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center; }
        .otp-code { font-size: 32px; font-weight: 800; color: #10b981; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; }
        .footer { padding: 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header"><div class="header-title">Verify Your Email</div></div>
            <div class="content">
                <div class="greeting">Welcome to Turf Management!</div>
                <p class="message">Hello <%= name %>, please use the following verification code to complete your registration. This code will expire in <strong><%= expiresIn %> minutes</strong>.</p>
                <div class="otp-container"><div class="otp-code"><%= otp %></div></div>
                <p class="message" style="text-align: center;">If you did not request this code, you can safely ignore this email.</p>
            </div>
            <div class="footer">&copy; 2026 Turf Booking System. All rights reserved.</div>
        </div>
    </div>
</body>
</html>`,

  "forgotPasswordOTP": `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
        .container { width: 90%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 40px 20px; text-align: center; color: white; }
        .header-title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .content { padding: 40px; }
        .greeting { font-size: 20px; font-weight: 700; color: #064e3b; margin-bottom: 16px; }
        .message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 32px; }
        .otp-container { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center; }
        .otp-code { font-size: 32px; font-weight: 800; color: #10b981; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; }
        .footer { padding: 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header"><div class="header-title">Reset Your Password</div></div>
            <div class="content">
                <div class="greeting">Password Reset Requested</div>
                <p class="message">Hello <%= name %>, you requested to reset your password. Use the following OTP code to proceed. This code will expire in <strong><%= expiresIn %> minutes</strong>.</p>
                <div class="otp-container"><div class="otp-code"><%= otp %></div></div>
                <p class="message" style="text-align: center; color: #ef4444;"><strong>Warning:</strong> If you did not request this, please secure your account immediately.</p>
            </div>
            <div class="footer">&copy; 2026 Turf Booking System. All rights reserved.</div>
        </div>
    </div>
</body>
</html>`,

  "google-redirect": `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; height: 100vh; }
        .container { width: 90%; max-width: 400px; background-color: #ffffff; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #10b981; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 24px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .title { font-size: 20px; font-weight: 700; color: #064e3b; margin-bottom: 8px; }
        .message { font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container"><div class="loader"></div><div class="title">Redirecting...</div><div class="message">Please wait while we connect you to Turf Management.</div></div>
</body>
</html>`,

  "maintenance-alert": `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
        .container { width: 90%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; color: white; }
        .header-title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .content { padding: 40px; }
        .greeting { font-size: 20px; font-weight: 700; color: #b45309; margin-bottom: 16px; }
        .message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 32px; }
        .alert-box { background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 24px; margin: 24px 0; color: #92400e; }
        .footer { padding: 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header"><div class="header-title">Maintenance Alert</div></div>
            <div class="content">
                <div class="greeting">Service Interruption</div>
                <p class="message">Hello <%= playerName %>, we are writing to inform you that your upcoming booking has been affected by unscheduled maintenance at <strong><%= turfName %></strong>.</p>
                <div class="alert-box">
                    <div style="font-weight: bold; margin-bottom: 8px;">Scheduled Slot:</div>
                    <%= date %>, <%= startTime %> - <%= endTime %><br>
                    <div style="margin-top: 10px; font-weight: bold; color: #b45309;">Status: Eligible for Refund</div>
                </div>
                <p class="message" style="text-align: center;">We apologize for the inconvenience. Our team will contact you shortly to reschedule or process a full refund.</p>
            </div>
            <div class="footer">&copy; 2026 Turf Booking System. All rights reserved.</div>
        </div>
    </div>
</body>
</html>`,

  "password-changed": `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
        .container { width: 90%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 40px 20px; text-align: center; color: white; }
        .header-title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .content { padding: 40px; }
        .greeting { font-size: 20px; font-weight: 700; color: #b91c1c; margin-bottom: 16px; }
        .message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 32px; }
        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 24px 0; color: #991b1b; }
        .footer { padding: 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header"><div class="header-title">Security Alert</div></div>
            <div class="content">
                <div class="greeting">Password Changed Successfully</div>
                <p class="message">Hello <%= name %>, this is a confirmation that the password for your account has been changed.</p>
                <div class="alert-box"><strong>Warning:</strong> If you did not perform this action, please contact our support team immediately or reset your password to secure your account.</div>
                <p class="message" style="text-align: center;">Log in to your account to review any recent activity.</p>
            </div>
            <div class="footer">&copy; 2026 Turf Booking System. All rights reserved.</div>
        </div>
    </div>
</body>
</html>`,

  "payment-success": `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
        .container { width: 90%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 40px 20px; text-align: center; color: white; }
        .header-title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .content { padding: 40px; }
        .greeting { font-size: 20px; font-weight: 700; color: #064e3b; margin-bottom: 16px; }
        .message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 32px; }
        .card { background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
        .receipt-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .receipt-label { font-weight: bold; color: #64748b; }
        .amount { font-size: 22px; font-weight: 800; color: #1e293b; margin-top: 10px; text-align: right; }
        .footer { padding: 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header"><div class="header-title">Payment Successful</div></div>
            <div class="content">
                <div class="greeting">Thank You for Your Payment!</div>
                <p class="message">Hello <%= playerName %>, your payment has been successfully processed. Here is your digital receipt for <strong><%= turfName %></strong>:</p>
                <div class="card">
                    <div class="receipt-row"><span class="receipt-label">Transaction ID:</span><span style="font-size: 11px; font-family: monospace;"><%= transactionId %></span></div>
                    <div class="receipt-row"><span class="receipt-label">Date:</span><span><%= date %></span></div>
                    <div class="receipt-row"><span class="receipt-label">Booking ID:</span><span><%= bookingId %></span></div>
                    <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px;"><span class="receipt-label">Amount Paid:</span><div class="amount"><%= amount %> BDT</div></div>
                </div>
                <p class="message" style="text-align: center;">You can find more details in your dashboard under the "My Bookings" section.</p>
            </div>
            <div class="footer">&copy; 2026 Turf Booking System. All rights reserved.</div>
        </div>
    </div>
</body>
</html>`,

  "turfOwnerCreated": `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
        .container { width: 90%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 40px 20px; text-align: center; color: white; }
        .header-title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .content { padding: 40px; }
        .greeting { font-size: 20px; font-weight: 700; color: #064e3b; margin-bottom: 16px; }
        .message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 32px; }
        .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
        .label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .value { font-size: 16px; font-weight: 600; color: #1e293b; font-family: 'Courier New', Courier, monospace; }
        .btn-container { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 700; color: #ffffff !important; background-color: #10b981; text-decoration: none; border-radius: 50px; }
        .notice { background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; color: #92400e; font-size: 14px; line-height: 1.5; }
        .footer { padding: 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header"><div class="header-title">Partner Portal</div></div>
            <div class="content">
                <div class="greeting">Hello <%= name %>,</div>
                <p class="message">Welcome to the Turf Management community! Your Turf Owner account has been successfully created. You can now start listing your turfs and managing bookings.</p>
                <div class="card">
                    <div style="margin-bottom: 16px;"><div class="label">Your Login Email</div><div class="value"><%= email %></div></div>
                    <div><div class="label">Temporary Password</div><div class="value"><%= password %></div></div>
                </div>
                <div class="btn-container"><a href="<%= loginUrl %>" class="btn">Login to Your Account</a></div>
                <div class="notice"><strong>⚠️ Action Required:</strong> For security reasons, you <strong>must change your password</strong> immediately after your first login.</div>
            </div>
            <div class="footer">&copy; 2026 Turf Booking Management System<br>Empowering sports facility owners worldwide.</div>
        </div>
    </div>
</body>
</html>`
};
