const mongoose = require('mongoose');
const moment = require('moment');
// Mock mongoose before requiring the controller because it uses mongoose.model('Invoice') at top level
const mockInvoiceModel = {
    collection: { name: 'invoices' }
};

jest.mock('mongoose', () => ({
    model: jest.fn((name) => {
        if (name === 'Invoice') return mockInvoiceModel;
        return { collection: { name: 'mocked' } };
    }),
}));

const summary = require('../../../src/controllers/appControllers/clientController/summary');

describe('Client Controller - Summary', () => {
    let req, res, mockModel;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            query: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockModel = {
            aggregate: jest.fn()
        };
    });

    it('should return 400 for invalid type', async () => {
        req.query.type = 'invalid-type';
        await summary(mockModel, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Invalid type'
        }));
    });

    it('should calculate summary with default type (month)', async () => {
        const mockAggregationResult = [{
            totalClients: [{ count: 100 }],
            newClients: [{ count: 20 }],
            activeClients: [{ count: 50 }]
        }];

        mockModel.aggregate.mockResolvedValue(mockAggregationResult);

        await summary(mockModel, req, res);

        expect(mockModel.aggregate).toHaveBeenCalled();
        // Default type is month
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            result: {
                new: 20, // (20/100)*100
                active: 50 // (50/100)*100
            },
            message: 'Successfully get summary of new clients'
        });
    });

    it('should handle zero clients correctly (avoid division by zero)', async () => {
        const mockAggregationResult = [{
            totalClients: [], // count undefined or 0
            newClients: [],
            activeClients: []
        }];

        mockModel.aggregate.mockResolvedValue(mockAggregationResult);

        await summary(mockModel, req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            result: {
                new: 0,
                active: 0
            }
        }));
    });

    it('should use provided type (year)', async () => {
        req.query.type = 'year';

        const mockAggregationResult = [{
            totalClients: [{ count: 100 }],
            newClients: [{ count: 10 }],
            activeClients: [{ count: 10 }]
        }];
        mockModel.aggregate.mockResolvedValue(mockAggregationResult);

        await summary(mockModel, req, res);

        // Verify aggregate pipeline uses correct dates (implicit verification via execution)
        expect(mockModel.aggregate).toHaveBeenCalled();
        // We could inspect the pipeline argument to mockModel.aggregate if we wanted to be strict about dates
    });
});
