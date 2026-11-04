const paymentService = require("../service/paymentService");

const createPaymentLink = async (req, res) => {
    try {
        const bookingId = req.params.id;
        if (!bookingId || bookingId === 'undefined') {
            return res.status(400).json({ message: 'Booking ID is missing or invalid' });
        }
        const paymentLink = await paymentService.createPaymentLink(bookingId);
        return res.status(200).json(paymentLink);
    } catch (error) {
        const status = error && error.status ? error.status : 500;
        const message = typeof error?.message === 'string' ? error.message : (error || 'Failed to create payment link');
        if (status === 404) return res.status(404).json({ message });
        if (status === 502) return res.status(502).json({ message });
        return res.status(status).json({ message });
    }
}

const updatePaymentInformation = async (req, res) => {
    try {
        const result = await paymentService.updatePaymentInformation(req.query);
        return res.status(200).json({ ...result, status: true });
    } catch (error) {
        const message = typeof error?.message === 'string' ? error.message : 'Failed to update payment information';
        const status = Number.isInteger(error?.status) ? error.status : 500;
        return res.status(status).json({ message });
    }
}

module.exports = {
    createPaymentLink,
    updatePaymentInformation
}