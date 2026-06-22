import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import GMAIL_USER, GMAIL_APP_PASSWORD

def send_order_confirmation(to_email: str, order_id: int, items: list, total: float, shipping_address: str):
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print("Email not configured, skipping.")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Order #{order_id} Confirmed - ShopMind"
        msg["From"] = f"ShopMind <{GMAIL_USER}>"
        msg["To"] = to_email

        items_rows = ""
        for item in items:
            variant = f"<br><small style='color:#888'>{item.get('variant_info','')}</small>" if item.get('variant_info') else ""
            items_rows += f"""
            <tr>
                <td style="padding:12px;border-bottom:1px solid #f0f0f0">{item['name']}{variant}</td>
                <td style="padding:12px;border-bottom:1px solid #f0f0f0;text-align:center">×{item['quantity']}</td>
                <td style="padding:12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:500">
                    ₹{item['price_at_purchase'] * item['quantity']:,.0f}
                </td>
            </tr>"""

        html = f"""
        <html><body style="font-family:-apple-system,sans-serif;background:#f9f9f9;margin:0;padding:20px">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
            <div style="background:#111;padding:32px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600">ShopMind</h1>
            </div>
            <div style="padding:32px;text-align:center;border-bottom:1px solid #f0f0f0">
                <div style="width:56px;height:56px;background:#d1fae5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
                    <span style="font-size:24px">✅</span>
                </div>
                <h2 style="margin:0 0 8px;color:#111;font-size:20px">Order confirmed!</h2>
                <p style="margin:0;color:#666;font-size:14px">Order #{order_id} has been placed successfully.</p>
            </div>
            <div style="padding:24px 32px">
                <h3 style="margin:0 0 16px;color:#111;font-size:15px">Order summary</h3>
                <table style="width:100%;border-collapse:collapse">
                    <thead>
                        <tr style="background:#f9f9f9">
                            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;font-weight:500">Product</th>
                            <th style="padding:10px 12px;text-align:center;font-size:12px;color:#888;font-weight:500">Qty</th>
                            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;font-weight:500">Price</th>
                        </tr>
                    </thead>
                    <tbody>{items_rows}</tbody>
                </table>
                <div style="margin-top:16px;padding-top:16px;border-top:2px solid #111;display:flex;justify-content:space-between">
                    <span style="font-size:15px;font-weight:600;color:#111">Total</span>
                    <span style="font-size:15px;font-weight:600;color:#111">₹{total:,.0f}</span>
                </div>
            </div>
            <div style="padding:0 32px 24px">
                <div style="background:#f9f9f9;border-radius:12px;padding:16px">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;font-weight:500">SHIPS TO</p>
                    <p style="margin:0;font-size:14px;color:#333">{shipping_address}</p>
                </div>
            </div>
            <div style="padding:0 32px 32px">
                <p style="margin:0 0 16px;font-size:13px;color:#888;text-align:center">Order status</p>
                <div style="display:flex;align-items:center;justify-content:space-between">
                    <div style="text-align:center">
                        <div style="width:32px;height:32px;background:#111;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:14px">✓</div>
                        <p style="margin:6px 0 0;font-size:11px;color:#111;font-weight:600">Placed</p>
                    </div>
                    <div style="flex:1;height:2px;background:#e5e5e5;margin:0 8px"></div>
                    <div style="text-align:center">
                        <div style="width:32px;height:32px;background:#e5e5e5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#888;font-size:14px">⚙</div>
                        <p style="margin:6px 0 0;font-size:11px;color:#888">Processing</p>
                    </div>
                    <div style="flex:1;height:2px;background:#e5e5e5;margin:0 8px"></div>
                    <div style="text-align:center">
                        <div style="width:32px;height:32px;background:#e5e5e5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#888;font-size:14px">📦</div>
                        <p style="margin:6px 0 0;font-size:11px;color:#888">Shipped</p>
                    </div>
                    <div style="flex:1;height:2px;background:#e5e5e5;margin:0 8px"></div>
                    <div style="text-align:center">
                        <div style="width:32px;height:32px;background:#e5e5e5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#888;font-size:14px">🏠</div>
                        <p style="margin:6px 0 0;font-size:11px;color:#888">Delivered</p>
                    </div>
                </div>
            </div>
            <div style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #f0f0f0">
                <p style="margin:0;font-size:12px;color:#888">Thank you for shopping with ShopMind</p>
            </div>
        </div>
        </body></html>"""

        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        print(f"✓ Confirmation email sent to {to_email}")
    except Exception as e:
        print(f"Email error: {e}")

def send_password_reset_email(to_email: str, name: str, reset_link: str):
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print("Email not configured, skipping.")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Reset your ShopMind password"
        msg["From"] = f"ShopMind <{GMAIL_USER}>"
        msg["To"] = to_email

        html = f"""
        <html><body style="font-family:-apple-system,sans-serif;background:#f9f9f9;margin:0;padding:20px">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
            <div style="background:#111;padding:32px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600">ShopMind</h1>
            </div>
            <div style="padding:32px">
                <h2 style="color:#111;margin:0 0 16px">Reset your password</h2>
                <p style="color:#666;font-size:14px;line-height:1.6">Hi {name},</p>
                <p style="color:#666;font-size:14px;line-height:1.6">
                    We received a request to reset your ShopMind password.
                    Click the button below to create a new password.
                </p>
                <div style="text-align:center;margin:32px 0">
                    <a href="{reset_link}"
                       style="background:#111;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:600">
                        Reset Password
                    </a>
                </div>
                <p style="color:#999;font-size:12px;line-height:1.6">
                    This link expires in 1 hour. If you didn't request a password reset,
                    you can safely ignore this email.
                </p>
            </div>
            <div style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #f0f0f0">
                <p style="margin:0;font-size:12px;color:#888">ShopMind · AI-powered shopping</p>
            </div>
        </div>
        </body></html>"""

        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        print(f"✓ Password reset email sent to {to_email}")
    except Exception as e:
        print(f"Email error: {e}")