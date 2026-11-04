const razorpay = require("../config/razorpayClient");
const Booking = require("../models/Booking");

// Generate Payment Link
const createPaymentLink = async (bookingId) => {
    try {
        const booking = await Booking.findById(bookingId).populate('event').populate('user');
        if (!booking) {
            throw new Error('Booking not found');
        }

        const event = booking.event || {};
        const user = booking.user || {};

        // Determine amount: prefer ticket price if available, else event.price, else 0
        const ticketPrice = event.tickets && event.tickets.length ? (event.tickets[0].price || 0) : (event.price || 0);
        const amountPaise = Math.round((ticketPrice || 0) * 100);

        const phone = (booking.user && booking.user.phone) || '';

        const paymentLinkRequest = {
            amount: amountPaise,
            currency: 'INR',
            customer: {
                name: user.name || 'Guest',
                contact: phone,
                email: user.email || '',
            },
            notify: { sms: true, email: true },
            reminder_enable: true,
            callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-confirmation`,
            // include booking id for reference so the frontend callback can identify the booking
            reference_id: String(bookingId),
            callback_method: 'get',
            description: `Payment for booking ${bookingId} - ${event.title || ''}`,
        };

        const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);
        const paymentLinkId = paymentLink.id;
        const payment_link_url = paymentLink.short_url;
        return { paymentLinkId, payment_link_url };
    } catch (error) {
        console.error('Razorpay payment error:', error);
        if (error && error.response) {
            console.error('Razorpay error response:', error.response);
        }

        // Extract meaningful message
        let msg = 'Failed to create payment link';
        if (error && typeof error === 'object') {
            if (error.error && error.error.description) msg = error.error.description;
            else if (error.description) msg = error.description;
            else if (error.message) msg = error.message;
        } else if (typeof error === 'string') {
            msg = error;
        }

        // If it's an authentication error from Razorpay, return a distinct status
        if (msg.toLowerCase().includes('auth') || msg.toLowerCase().includes('authentication')) {
            // throw an object controller can inspect
            throw { status: 502, message: 'Payment provider authentication failed. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' };
        }

        throw { status: 500, message: msg };
    }
};

// Update Payment Status
const updatePaymentInformation = async(reqData) => {
    
    const paymentId = reqData.payment_id;
    const orderId = reqData.order_id;
    
    try {
        const booking = await Booking.findById(orderId).populate('event').populate('user');
        if (!booking) throw new Error('Booking not found');

        const payment = await razorpay.payments.fetch(paymentId);

        if (payment && payment.status === "captured") {
            booking.paymentDetails = booking.paymentDetails || {};
            booking.paymentDetails.paymentId = paymentId;
            booking.paymentDetails.status = "Paid";
            booking.status = "Confirmed";
            await booking.save();
        }

        // Return fully populated booking so frontend can render ticket details clearly
        const updatedBooking = await Booking.findById(orderId).populate('event').populate('user');
        const resData = { message: "Your booking is confirmed", success: true, booking: updatedBooking };
        return resData;
    } catch (error) {
        console.error('Error updating payment information:', error);
        let msg = 'Failed to update payment information';
        if (error && typeof error === 'object') msg = error.message || msg;
        else if (typeof error === 'string') msg = error;
        throw { status: 500, message: msg };
    }

}

module.exports={
    createPaymentLink,
    updatePaymentInformation
}