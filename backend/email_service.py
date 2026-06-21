"""Mock email service (Resend). Logs emails until RESEND_API_KEY is configured."""
import os
import logging

logger = logging.getLogger("email")


async def send_email(to: str, subject: str, html: str, db=None):
    enabled = os.environ.get("EMAIL_ENABLED", "false").lower() == "true"
    api_key = os.environ.get("RESEND_API_KEY", "")
    record = {
        "to": to,
        "subject": subject,
        "provider": "resend",
        "status": "sent" if (enabled and api_key) else "mocked",
    }
    if enabled and api_key:
        try:
            import resend
            resend.api_key = api_key
            resend.Emails.send({
                "from": os.environ.get("EMAIL_FROM", "PartStation <orders@partstation.com>"),
                "to": [to],
                "subject": subject,
                "html": html,
            })
        except Exception as e:
            logger.error(f"Email send failed: {e}")
            record["status"] = "failed"
    else:
        logger.info(f"[MOCK EMAIL] to={to} subject={subject}")
    if db is not None:
        from datetime import datetime, timezone
        import uuid
        record["id"] = str(uuid.uuid4())
        record["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.email_logs.insert_one({**record})
    return record


def order_placed_html(order):
    rows = "".join(
        f"<tr><td>{i['name_en']}</td><td>{i['qty']}</td><td>Rs.{i['selling_price']}</td></tr>"
        for i in order["items"]
    )
    return f"""
    <div style='font-family:sans-serif'>
      <h2>Order Confirmed — {order['order_number']}</h2>
      <p>Thank you for shopping with PartStation. Your order is being processed.</p>
      <table border='1' cellpadding='6' cellspacing='0'>
        <tr><th>Item</th><th>Qty</th><th>Price</th></tr>{rows}
      </table>
      <p><strong>Total: Rs.{order['total']}</strong> (incl. GST)</p>
      <p>Payment: {order['payment_method'].upper()}</p>
    </div>
    """
