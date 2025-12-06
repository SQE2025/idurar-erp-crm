const helpers = require('../../src/helpers');
const fs = require('fs');
const moment = require('moment');

// Mock fs module
jest.mock('fs');

describe('Backend Helper Functions', () => {

    describe('calculate', () => {
        it('should correctly add two numbers', () => {
            expect(helpers.calculate.add(10, 20)).toBe(30);
            expect(helpers.calculate.add(0.1, 0.2)).toBe(0.3); // Currency.js handles float precision
        });

        it('should correctly subtract two numbers', () => {
            expect(helpers.calculate.sub(30, 10)).toBe(20);
        });

        it('should correctly multiply two numbers', () => {
            expect(helpers.calculate.multiply(10, 5)).toBe(50);
        });

        it('should correctly divide two numbers', () => {
            expect(helpers.calculate.divide(50, 5)).toBe(10);
        });
    });

    describe('timeRange', () => {
        it('should generate a range of times with default interval (60m)', () => {
            const start = moment('2023-01-01 10:00');
            const end = moment('2023-01-01 12:00');
            const range = helpers.timeRange(start, end, 'HH:mm', 60);

            expect(range).toHaveLength(2);
            expect(range).toEqual(['10:00', '11:00']);
        });

        it('should respect custom interval and format', () => {
            const start = moment('2023-01-01 10:00');
            const end = moment('2023-01-01 10:30');
            const range = helpers.timeRange(start, end, 'HH:mm', 10);

            // 10:00, 10:10, 10:20 (10:30 is not "before" 10:30, it is equal)
            expect(range).toEqual(['10:00', '10:10', '10:20']);
        });
    });

    describe('icon', () => {
        it('should read svg file if it exists', () => {
            fs.readFileSync.mockReturnValue('<svg>icon</svg>');
            const result = helpers.icon('test-icon');

            expect(fs.readFileSync).toHaveBeenCalledWith('./public/images/icons/test-icon.svg');
            expect(result).toBe('<svg>icon</svg>');
        });

        it('should return null if file does not exist', () => {
            fs.readFileSync.mockImplementation(() => {
                throw new Error('File not found');
            });
            const result = helpers.icon('missing-icon');
            expect(result).toBeNull();
        });
    });

    describe('image', () => {
        it('should read jpg file', () => {
            fs.readFileSync.mockReturnValue('binary-data');
            const result = helpers.image('photo');

            expect(fs.readFileSync).toHaveBeenCalledWith('./public/images/photos/photo.jpg');
            expect(result).toBe('binary-data');
        });
    });

    describe('other exports', () => {
        it('should export siteName', () => {
            expect(helpers.siteName).toBe('Express.js / MongoBD / Rest Api');
        });
    });
});
