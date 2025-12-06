const mongoose = require('mongoose');

// Mock Models
const mockPaymentModel = {
    create: jest.fn(),
    findOneAndUpdate: jest.fn()
};

const mockInvoiceModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
};

jest.mock('mongoose', () => ({
    model: jest.fn((name) => {
        if (name === 'Payment') return mockPaymentModel;
        if (name === 'Invoice') return mockInvoiceModel;
        return {};
    }),
}));

jest.mock('@/controllers/pdfController', () => ({}));
// Use real helpers (assumes moduleNameMapper works) or mock
jest.mock('@/helpers', () => ({
    calculate: {
        multiply: (a, b) => a * b,
        add: (a, b) => a + b,
        sub: (a, b) => a - b
    }
}));

const paymentCreate = require('../../../src/controllers/appControllers/paymentController/create');

describe('Payment Controller - Create', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            admin: { _id: 'admin-id' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should return error if amount is 0', async () => {
        req.body.amount = 0;
        await paymentCreate(req, res);
        expect(res.status).toHaveBeenCalledWith(202);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringMatching(/Minimum Amount/)
        }));
    });

    it('should return error if amount exceeds invoice balance', async () => {
        req.body = { invoice: 'inv-123', amount: 200 };

        // Invoice: Total 100, Paid 0 = Balance 100
        mockInvoiceModel.findOne.mockResolvedValue({
            _id: 'inv-123',
            total: 100,
            discount: 0,
            credit: 0
        });

        await paymentCreate(req, res);

        expect(res.status).toHaveBeenCalledWith(202);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringMatching(/Max Amount/)
        }));
    });

    it('should create payment and update invoice status to paid', async () => {
        req.body = { invoice: 'inv-123', amount: 100 };

        mockInvoiceModel.findOne.mockResolvedValue({
            id: 'inv-123',
            total: 100,
            discount: 0,
            credit: 0
        });

        // Mock Payment Creation
        const mockPayment = { _id: 'pay-123', amount: 100 };
        mockPaymentModel.create.mockResolvedValue(mockPayment);

        mockPaymentModel.findOneAndUpdate.mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockPayment)
        });

        // Mock Invoice Update
        mockInvoiceModel.findOneAndUpdate.mockReturnValue({
            exec: jest.fn().mockResolvedValue({})
        });

        await paymentCreate(req, res);

        // Verify Payment Created
        expect(mockPaymentModel.create).toHaveBeenCalledWith(expect.objectContaining({
            amount: 100,
            createdBy: 'admin-id'
        }));

        // Verify Invoice Updated
        // Status should be 'paid' because credit (0) + amount (100) == total (100)
        expect(mockInvoiceModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ _id: 'inv-123' }),
            expect.objectContaining({
                $inc: { credit: 100 },
                $set: { paymentStatus: 'paid' }
            }),
            expect.anything()
        );

        expect(res.status).toHaveBeenCalledWith(200);
    });
});
