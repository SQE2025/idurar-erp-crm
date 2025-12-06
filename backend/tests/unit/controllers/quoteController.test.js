const mongoose = require('mongoose');

// Mock Models
const mockQuoteModel = {
    save: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
};

const mockInvoiceModel = {
    create: jest.fn(),
};

jest.mock('mongoose', () => ({
    model: jest.fn((name) => {
        if (name === 'Quote') return mockQuoteModel;
        if (name === 'Invoice') return mockInvoiceModel;
        return {};
    }),
}));

// Mock constructor for new Quote/Invoice
const MockConstructor = jest.fn();
MockConstructor.prototype.save = jest.fn();

// We need to handle "new Model()" calls in the code.
// The code uses: const Model = mongoose.model('Quote'); new Model(...)
// So our mock model function must return a constructor.

const MockModelConstructor = jest.fn(function (payload) {
    this.save = jest.fn().mockResolvedValue({ _id: 'new-id', ...payload });
    Object.assign(this, payload);
});
// Attach static methods
MockModelConstructor.findOne = jest.fn();
MockModelConstructor.findOneAndUpdate = jest.fn();

// We need a specific mock for Invoice too if new Invoice() is called
const MockInvoiceConstructor = jest.fn(function (payload) {
    this.save = jest.fn().mockResolvedValue({ _id: 'new-invoice-id', ...payload });
    Object.assign(this, payload);
});
MockInvoiceConstructor.increaseBySettingKey = jest.fn();

// Update mongoose mock to return the constructors
jest.mock('mongoose', () => ({
    model: jest.fn((name) => {
        if (name === 'Quote') return MockModelConstructor;
        if (name === 'Invoice') return MockInvoiceConstructor;
        return jest.fn();
    }),
}));


jest.mock('@/controllers/pdfController', () => ({}));
jest.mock('@/middlewares/settings', () => ({
    increaseBySettingKey: jest.fn()
}));
jest.mock('@/helpers', () => ({
    calculate: {
        multiply: (a, b) => a * b,
        add: (a, b) => a + b,
        sub: (a, b) => a - b
    }
}));

const quoteCreate = require('../../../src/controllers/appControllers/quoteController/create');
const quoteConvert = require('../../../src/controllers/appControllers/quoteController/convertQuoteToInvoice');

describe('Quote Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: {}, body: {}, admin: { _id: 'admin-id' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Create', () => {
        it('should create a quote', async () => {
            req.body = {
                items: [{ itemName: 'Item 1', quantity: 1, price: 50 }],
                taxRate: 0
            };

            // Mock update call for PDF
            MockModelConstructor.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({})
            });

            await quoteCreate(req, res);

            // Verify validation and calculation
            expect(MockModelConstructor).toHaveBeenCalledWith(expect.objectContaining({
                subTotal: 50,
                total: 50
            }));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Quote created successfully'
            }));
        });
    });

    describe('Convert to Invoice', () => {
        it('should return upgrade message', async () => {
            req.params.id = 'quote-123';

            await quoteConvert(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: expect.stringMatching(/Premium/)
            }));
        });
    });
});
