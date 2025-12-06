const mongoose = require('mongoose');
const createAuthMiddleware = require('../../../src/controllers/middlewaresControllers/createAuthMiddleware');

// Mock Models
const mockUserModel = {
    findOne: jest.fn()
};
const mockUserPasswordModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
};

jest.mock('mongoose', () => ({
    model: jest.fn((name) => {
        if (name === 'Admin') return mockUserModel;
        if (name === 'AdminPassword') return mockUserPasswordModel;
        return {};
    }),
}));

// Mock internal auth modules
jest.mock('../../../src/controllers/middlewaresControllers/createAuthMiddleware/authUser', () => jest.fn());
const authUser = require('../../../src/controllers/middlewaresControllers/createAuthMiddleware/authUser');

describe('Auth Controller (Admin)', () => {
    let authController;
    let req, res;

    beforeAll(() => {
        authController = createAuthMiddleware('Admin');
    });

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            admin: { _id: 'admin-id' },
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Login', () => {
        it('should return 409 if validation fails', async () => {
            req.body = { email: 'invalid-email', password: '123' };
            await authController.login(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('should return 404 if user not found', async () => {
            req.body = { email: 'admin@demo.com', password: '123' };
            mockUserModel.findOne.mockResolvedValue(null);

            await authController.login(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should call authUser if credentials valid', async () => {
            req.body = { email: 'admin@demo.com', password: '123' };
            const mockUser = { _id: 'u1', enabled: true };
            const mockPassword = { user: 'u1', password: 'hashed' };

            mockUserModel.findOne.mockResolvedValue(mockUser);
            mockUserPasswordModel.findOne.mockResolvedValue(mockPassword);

            await authController.login(req, res);

            expect(authUser).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                expect.objectContaining({
                    user: mockUser,
                    databasePassword: mockPassword,
                    password: '123'
                })
            );
        });
    });

    describe('Logout', () => {
        it('should remove token from sessions', async () => {
            req.headers['authorization'] = 'Bearer token123';

            mockUserPasswordModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({})
            });

            await authController.logout(req, res);

            expect(mockUserPasswordModel.findOneAndUpdate).toHaveBeenCalledWith(
                { user: 'admin-id' },
                { $pull: { loggedSessions: 'token123' } },
                { new: true }
            );
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });
});
