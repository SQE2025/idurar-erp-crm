const mongoose = require('mongoose');

// Mock mongoose
const mockSave = jest.fn();
const mockFindOneAndUpdate = jest.fn();
const mockInvoiceInstance = {
    _id: 'mock-invoice-id',
    save: mockSave
};

const mockModel = jest.fn(() => mockInvoiceInstance);
mockModel.findOneAndUpdate = mockFindOneAndUpdate;

jest.mock('mongoose', () => ({
    model: jest.fn(() => mockModel)
}));

// Mock middlewares
jest.mock('@/middlewares/settings', () => ({
    increaseBySettingKey: jest.fn()
}));

// Use real helpers (assumes moduleNameMapper works) or mock if preferred.
// Here we mock to isolate unit logic.
jest.mock('@/helpers', () => ({
    calculate: {
        multiply: (a, b) => a * b,
        add: (a, b) => a + b,
        sub: (a, b) => a - b
    }
}));

const invoiceCreate = require('../../../src/controllers/appControllers/invoiceController/create');

describe('Invoice Controller - Create', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset mock implementations
        mockSave.mockResolvedValue({ _id: 'mock-invoice-id' });
        mockFindOneAndUpdate.mockReturnValue({
            exec: jest.fn().mockResolvedValue({ _id: 'mock-invoice-id', pdf: 'invoice-mock-invoice-id.pdf' })
        });

        req = {
            body: {},
            admin: { _id: 'admin-id' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should return 400 if validation fails', async () => {
        req.body = {}; // Missing required fields
        await invoiceCreate(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false
        }));
    });

    it('should create invoice and calculate totals correctly', async () => {
        req.body = {
            client: 'client-id',
            number: 101,
            year: 2023,
            status: 'pending',
            expiredDate: '2023-01-31',
            date: '2023-01-01',
            taxRate: 10,
            items: [
                {
                    itemName: 'Item 1',
                    quantity: 2,
                    price: 100,
                    total: 200 // Joi requires this, even though controller recalculates it? 
                    // Wait, Joi schema has total: required(). 
                    // So we must provide it in request, but controller overwrites it.
                }
            ]
        };

        await invoiceCreate(req, res);

        // Verify calculations
        // Subtotal = 2 * 100 = 200
        // Tax = 200 * 0.10 = 20
        // Total = 220

        // Check what was passed to Model constructor
        expect(mockModel).toHaveBeenCalledWith(expect.objectContaining({
            subTotal: 200,
            taxTotal: 20,
            total: 220,
            items: expect.arrayContaining([
                expect.objectContaining({ total: 200 })
            ])
        }));

        // Verify DB calls
        expect(mockSave).toHaveBeenCalled();
        expect(mockFindOneAndUpdate).toHaveBeenCalled(); // for PDF update

        // Verify Response
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
