const mongoose = require('mongoose');

// Mock Mongoose Model Class
const mockInstance = {
    save: jest.fn(),
};

const MockModel = jest.fn(() => mockInstance);

// Static Methods
MockModel.create = jest.fn();
MockModel.findOne = jest.fn();
MockModel.findOneAndUpdate = jest.fn();
MockModel.find = jest.fn();
MockModel.countDocuments = jest.fn();
MockModel.updateMany = jest.fn();

jest.mock('mongoose', () => ({
    model: jest.fn(() => MockModel)
}));

// Mock Model Utils to bypass validation
jest.mock('@/models/utils', () => ({
    modelsFiles: ['Client'] // Allow Client model
}));

const clientController = require('../../../src/controllers/appControllers/clientController');

describe('Client Controller - CRUD (Shared Factory)', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: {}, body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Create', () => {
        it('should create a new client', async () => {
            req.body = { name: 'Test Client', email: 'test@example.com' };
            mockInstance.save.mockResolvedValue({ _id: '123', ...req.body });

            await clientController.create(req, res);

            // Verify the constructor was called with the body
            expect(MockModel).toHaveBeenCalledWith(expect.objectContaining(req.body));
            expect(mockInstance.save).toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                result: expect.objectContaining({ name: 'Test Client' })
            }));
        });
    });

    describe('Read', () => {
        it('should return result if found', async () => {
            req.params.id = '123';
            const mockResult = { _id: '123', name: 'Test Client' };
            MockModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockResult)
            });

            await clientController.read(req, res);

            expect(MockModel.findOne).toHaveBeenCalledWith({ _id: '123', removed: false });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ result: mockResult }));
        });

        it('should return 404 if not found', async () => {
            req.params.id = 'missing';
            MockModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });

            await clientController.read(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('Update', () => {
        it('should update and return new document', async () => {
            req.params.id = '123';
            req.body = { name: 'Updated Name' };

            MockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: '123', name: 'Updated Name' })
            });

            await clientController.update(req, res);

            expect(MockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: '123', removed: false },
                req.body,
                { new: true, runValidators: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Delete', () => {
        it('should soft delete the client', async () => {
            req.params.id = '123';

            MockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: '123', removed: true })
            });

            await clientController.delete(req, res);

            // Implementation: (filter, updates, options)
            expect(MockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: '123' },            // NO removed: false in implementation
                { $set: { removed: true } },
                { new: true }              // implementation passes { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('List (Paginated)', () => {
        it('should return paginated list', async () => {
            req.query = { page: 1, items: 10 };

            const mockResults = [{ _id: '1' }];
            MockModel.find.mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockResults)
            });
            MockModel.countDocuments.mockResolvedValue(1);

            await clientController.list(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                result: mockResults,
                pagination: expect.objectContaining({ count: 1 })
            }));
        });
    });
});
