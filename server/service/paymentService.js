const razorpay = require("../config/razorpayClient");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

// Generate Payment Link
const createPaymentLink = async (bookingId) => {
    let booking;
    try {
        booking = await Booking.findById(bookingId).populate('event').populate('user');
        if (!booking) {
            throw { status: 404, message: 'Booking not found' };
        }
        if (String(booking.status || '').trim().toLowerCase() !== 'pending') {
            throw {
                status: 400,
                message: `This booking is not awaiting payment (current status: ${booking.status || 'missing'}). Start a new booking if payment was not completed.`,
            };
        }

        const event = booking.event || {};
        const user = booking.user || {};

        if (booking.paymentDetails?.paymentLinkId) {
            const existingLink = await razorpay.paymentLink.fetch(booking.paymentDetails.paymentLinkId);
            if (['created', 'paid'].includes(existingLink.status) && existingLink.short_url) {
                return {
                    paymentLinkId: existingLink.id,
                    payment_link_url: existingLink.short_url,
                };
            }
            booking.paymentDetails.paymentLinkId = '';
            await booking.save();
        }

        const selectedTicket = event.tickets?.find((ticket) => ticket.type === booking.ticketType);
        if (!selectedTicket) {
            throw new Error('The selected ticket type is no longer available.');
        }
        const unitPrice = booking.unitPrice ?? selectedTicket.price ?? 0;
        const amountPaise = Math.round(unitPrice * booking.quantity * 100);
        if (amountPaise < 1) {
            throw new Error('Payment links require a ticket price greater than zero.');
        }

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
        booking.paymentDetails = booking.paymentDetails || {};
        booking.paymentDetails.paymentLinkId = paymentLink.id;
        await booking.save();
        const paymentLinkId = paymentLink.id;
        const payment_link_url = paymentLink.short_url;
        return { paymentLinkId, payment_link_url };
    } catch (error) {
        if (booking?.status === 'Pending' && !booking.paymentDetails?.paymentLinkId) {
            try {
                const cancelled = await Booking.updateOne(
                    { _id: booking._id, status: 'Pending' },
                    { $set: { status: 'Payment Failed' } }
                );
                if (cancelled.modifiedCount) {
                    await Event.updateOne(
                        { _id: booking.event._id, 'tickets.type': booking.ticketType },
                        { $inc: { 'tickets.$.available': booking.quantity } }
                    );
                }
            } catch (cleanupError) {
                console.error('Failed to release unpaid booking inventory:', cleanupError);
            }
        }
        if (error && typeof error === 'object' && error.status) throw error;
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
    const paymentLinkId = reqData.payment_link_id;
    const orderId = reqData.order_id;
    
    try {
        if (!orderId) throw { status: 400, message: 'Missing order_id' };
        if (!paymentId) throw { status: 400, message: 'Missing payment_id' };
        if (!paymentLinkId) throw { status: 400, message: 'Missing payment_link_id' };

        const booking = await Booking.findById(orderId).populate('event').populate('user');
        if (!booking) throw { status: 404, message: 'Booking not found' };
        if (booking.paymentDetails?.paymentLinkId !== paymentLinkId) {
            throw { status: 400, message: 'Payment link does not match this booking' };
        }

        const paymentLink = await razorpay.paymentLink.fetch(paymentLinkId);
        if (String(paymentLink.reference_id) !== String(booking._id) || paymentLink.status !== 'paid') {
            throw { status: 402, message: 'Payment has not been completed for this booking' };
        }
        const payment = await razorpay.payments.fetch(paymentId);
        if (payment.payment_link_id !== paymentLinkId || payment.status !== 'captured') {
            throw { status: 402, message: 'Payment has not been captured for this booking' };
        }

        const ticket = booking.event?.tickets?.find((item) => item.type === booking.ticketType);
        if (!ticket) {
            throw { status: 400, message: 'The booked ticket type could not be verified' };
        }
        const unitPrice = booking.unitPrice ?? ticket.price ?? 0;
        const expectedAmount = Math.round(unitPrice * booking.quantity * 100);
        if (payment.amount !== expectedAmount || payment.currency !== 'INR') {
            throw { status: 400, message: 'Payment amount does not match this booking' };
        }

        booking.paymentDetails.paymentId = paymentId;
        booking.paymentDetails.status = "Paid";
        booking.status = "Confirmed";
        await booking.save();

        // Return fully populated booking so frontend can render ticket details clearly
        const updatedBooking = await Booking.findById(orderId).populate('event').populate('user');
        const resData = { message: "Your booking is confirmed", success: true, booking: updatedBooking };
        return resData;
    } catch (error) {
        console.error('Error updating payment information:', error);
        if (error && typeof error === 'object' && error.status) throw error;
        const msg = typeof error?.message === 'string' ? error.message : 'Failed to update payment information';
        throw { status: 500, message: msg };
    }

}

module.exports={
    createPaymentLink,
    updatePaymentInformation
}