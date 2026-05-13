
export const TICKET_STATUS_TEMPLATE = `
<div style="
  font-family: Arial, Helvetica, sans-serif;
  max-width: 600px;
  margin: auto;
  background-color: #f4f6fb;
  padding: 30px;
  border-radius: 12px;
">

  <!-- Header -->
  <div style="
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    padding: 25px;
    border-radius: 10px;
    text-align: center;
    color: #ffffff;
  ">
    <h1 style="margin: 0; font-size: 26px;">
      🎫 Support Ticket Update
    </h1>

    <p style="margin-top: 8px; font-size: 14px;">
      {actionText}
    </p>
  </div>

  <!-- Content -->
  <div style="
    background-color: #ffffff;
    padding: 25px;
    margin-top: 20px;
    border-radius: 10px;
    color: #333;
    line-height: 1.6;
  ">

    <p style="font-size: 16px;">
      Hi <strong>{name}</strong>,
    </p>

    <p style="font-size: 15px; color: #555;">
      Your support ticket status has been updated.
    </p>

    <!-- Ticket Details -->
    <div style="
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 18px;
      margin-top: 20px;
    ">

      <h3 style="margin-top: 0; color: #111827;">
        📌 Ticket Details
      </h3>

      <p style="margin: 8px 0; font-size: 14px;">
        <strong>Subject:</strong> {subject}
      </p>

      <p style="margin: 8px 0; font-size: 14px;">
        <strong>Status:</strong>

        <span style="
          background-color: {statusColor};
          color: #111827;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        ">
          {status}
        </span>
      </p>

      <p style="
        margin-top: 15px;
        font-size: 14px;
        color: #555;
      ">
        <strong>Message:</strong><br/>
        {message}
      </p>

    </div>

    <!-- Additional Info -->
    <div style="
      margin-top: 25px;
      background-color: #eff6ff;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    ">
      <p style="
        margin: 0;
        font-size: 14px;
        color: #1e3a8a;
      ">
        {extraMessage}
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-top: 30px;">
      <a href="#"
        style="
          display: inline-block;
          background-color: #2563eb;
          color: #ffffff;
          padding: 14px 26px;
          text-decoration: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: bold;
        ">
        Contact Support →
      </a>
    </div>

  </div>

  <!-- Footer -->
  <p style="
    font-size: 12px;
    color: #888;
    text-align: center;
    margin-top: 25px;
  ">
    This is an automated email from Support Ticket System.<br/>
    © ${new Date().getFullYear()} Support Ticket System.
    All rights reserved.
  </p>

</div>
`;

export const sendTicketStatusTemplate = () =>
  TICKET_STATUS_TEMPLATE;

