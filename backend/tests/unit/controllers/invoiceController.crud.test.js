const mongoose = require('mongoose');

// Mock Models
const mockInvoiceModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    updateMany: jest.fn(),
};

const mockPaymentModel = {
    updateMany: jest.fn(),
};

jest.mock('mongoose', () => ({
    model: jest.fn((name) => {
        if (name === 'Invoice') return mockInvoiceModel;
        if (name === 'Payment') return mockPaymentModel;
        return {};
    }),
}));

jest.mock('@/controllers/pdfController', () => ({})); // Mock PDF controller
// Use real helpers (assumes moduleNameMapper works) or mock
jest.mock('@/helpers', () => ({
    calculate: {
        multiply: (a, b) => a * b,
        add: (a, b) => a + b,
        sub: (a, b) => a - b
    }
}));

const invoiceRead = require('../../../src/controllers/appControllers/invoiceController/read');
const invoiceUpdate = require('../../../src/controllers/appControllers/invoiceController/update');
const invoiceRemove = require('../../../src/controllers/appControllers/invoiceController/remove');
const invoiceList = require('../../../src/controllers/appControllers/invoiceController/paginatedList');

describe('Invoice Controller - CRUD', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: {}, body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Read', () => {
        it('should return 404 if invoice not found', async () => {
            req.params.id = 'missing-id';
            mockInvoiceModel.findOne.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null)
                })
            });

            await invoiceRead(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 200 and result if found', async () => {
            const mockResult = { _id: '123' };
            mockInvoiceModel.findOne.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockResult)
                })
            });

            await invoiceRead(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ result: mockResult }));
        });
    });

    describe('Update', () => {
        it('should calculate new totals and update', async () => {
            req.params.id = '123';
            req.body = {
                items: [{ itemName: 'Test Item', quantity: 1, price: 100, total: 100 }], // Total 100
                taxRate: 10, // Tax 10, Grand Total 110
                date: '2023-01-01',
                expiredDate: '2023-02-01',
                client: 'client-id', // Schema requirement
                number: 1, // Schema requirement
                year: 2023, // Schema requirement
                status: 'pending' // Schema requirement
            };

            // Mock previous invoice fetch (for credit check)
            mockInvoiceModel.findOne.mockResolvedValue({ credit: 0 });

            // Mock update call
            mockInvoiceModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: '123', total: 110 })
            });

            await invoiceUpdate(req, res);

            // Verify validation passed. We inspect the call arguments to findOneAndUpdate
            // Call 0 args: [ filter, params, options ]
            // We check that the params object contains our calculated totals

            expect(mockInvoiceModel.findOneAndUpdate).toHaveBeenCalled();
            const updateArgs = mockInvoiceModel.findOneAndUpdate.mock.calls[0];
            const updatePayload = updateArgs[1]; // The second argument is the update body

            // subTotal = 1 * 100 = 100
            expect(updatePayload).toEqual(expect.objectContaining({
                subTotal: 100
            }));

            // taxTotal = 100 * (10 / 100) = 10
            expect(updatePayload).toEqual(expect.objectContaining({
                taxTotal: 10
            }));

            // total = 100 + 10 = 110
            expect(updatePayload).toEqual(expect.objectContaining({
                total: 110
            }));

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Remove (Soft Delete)', () => {
        it('should soft delete invoice and related payments', async () => {
            req.params.id = '123';

            mockInvoiceModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: '123' })
            });

            await invoiceRemove(req, res);

            // Check Invoice Soft Delete
            expect(mockInvoiceModel.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: '123', removed: false },
                { $set: { removed: true } }
            );

            // Check Related Payments Soft Delete
            expect(mockPaymentModel.updateMany).toHaveBeenCalledWith(
                { invoice: '123' },
                { $set: { removed: true } }
            );

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Paginated List', () => {
        it('should return paginated results', async () => {
            req.query = { page: 1, items: 10 };

            const mockResults = [{ _id: 1 }, { _id: 2 }];
            const mockCount = 2;

            // Mock Find Chain
            const mockFindChain = {
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockResults)
            };
            mockInvoiceModel.find.mockReturnValue(mockFindChain);
            mockInvoiceModel.countDocuments.mockResolvedValue(mockCount);

            await invoiceList(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                result: mockResults,
                pagination: expect.objectContaining({ count: 2, page: 1 })
            }));
        });
    });
});
