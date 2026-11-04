import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import API from '../config/api';

// This page is the callback endpoint Razorpay redirects to after payment.
// It will call the backend 'update' endpoint so the server can verify the payment
// then redirect the user to /explore (or show an error briefly).

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [statusMsg, setStatusMsg] = useState('Processing payment...');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const payment_id = query.get('razorpay_payment_id');
    const payment_link_id = query.get('razorpay_payment_link_id');
    const payment_link_status = query.get('razorpay_payment_link_status');
    const signature = query.get('razorpay_signature');
    const reference_id = query.get('razorpay_payment_link_reference_id') || query.get('reference_id');

    (async () => {
      try {
        if (!payment_id || !payment_link_id || payment_link_status !== 'paid' || !reference_id) {
          setStatusMsg('Payment was not completed. No ticket has been issued.');
          return;
        }

        const response = await API.get('/payment/update', {
          params: {
            payment_id,
            payment_link_id,
            payment_link_status,
            razorpay_signature: signature,
            order_id: reference_id,
          },
        });
        const data = response.data;

        if (data?.booking && data.booking.status === 'Confirmed' && data.booking.paymentDetails?.status === 'Paid') {
          setBooking(data.booking);
          setStatusMsg('Payment successful — your ticket is confirmed!');
        } else {
          setStatusMsg('Payment could not be verified. No ticket has been issued.');
        }
      } catch (err) {
        console.error('Payment confirmation error', err.response?.data || err);
        setStatusMsg(err.response?.data?.message || 'Payment confirmation failed. No ticket has been issued.');
      }
    })();
  }, [location.search]);

  // Helper to download ticket PDF with QR
  const downloadPdf = () => {
    if (!booking) return;

    const eventTitle = booking.event?.title || 'Event';
    const userName = booking.user?.name || 'Guest';
    const userEmail = booking.user?.email || '';
    const ticketType = booking.ticketType || 'General';
    const quantity = booking.quantity || 1;
    const bookingId = booking._id || '';
    const eventDate = booking.event?.date ? new Date(booking.event.date).toLocaleString() : '';
    const venueParts = [
      booking.event?.location?.venue,
      booking.event?.location?.address,
      booking.event?.location?.city,
      booking.event?.location?.country,
    ].filter(Boolean);
    const venueLine = venueParts.join(', ');

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Eventra Ticket', 20, 20);

    // Box background
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, 28, 180, 120, 3, 3);

    doc.setFontSize(12);
    doc.text(`Event: ${eventTitle}`, 22, 45);
    if (eventDate) doc.text(`Date & Time: ${eventDate}`, 22, 55);
    if (venueLine) doc.text(`Venue: ${venueLine}`, 22, 65);
    doc.text(`Attendee: ${userName}`, 22, 75);
    if (userEmail) doc.text(`Email: ${userEmail}`, 22, 85);
    doc.text(`Ticket Type: ${ticketType}`, 22, 95);
    doc.text(`Quantity: ${quantity} ticket(s)`, 22, 105);
    if (bookingId) doc.text(`Booking ID: ${bookingId}`, 22, 115);

    // QR code if present
    if (booking.qrCode) {
      try {
        doc.addImage(booking.qrCode, 'PNG', 140, 55, 45, 45);
        doc.text('Scan for entry', 140, 108);
      } catch (e) {
        console.warn('Failed to embed QR into PDF', e);
      }
    }

    doc.setFontSize(10);
    doc.text('Please carry a valid ID. Non-transferable.', 20, 160);

    const safeTitle = eventTitle.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    doc.save(`ticket-${safeTitle || 'event'}.pdf`);
  };

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>{statusMsg}</h2>
      {!booking && <p>Return to the event page to retry payment or choose another event.</p>}
      {booking && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontWeight: 600 }}>Booking ID: {booking._id}</p>
          <div style={{ margin: '12px auto' }}>
            <img src={booking.qrCode} alt="Ticket QR" style={{ width: 200, height: 200 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn colorful-button" onClick={downloadPdf}>Download Ticket (PDF)</button>
            <button className="btn colorful-button" onClick={() => navigate('/explore')}>Go to Explore</button>
          </div>
        </div>
      )}
    </div>
  );
}
