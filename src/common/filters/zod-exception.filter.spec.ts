import { HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ZodExceptionFilter } from './zod-exception.filter';

describe('ZodExceptionFilter', () => {
  let filter: ZodExceptionFilter;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    filter = new ZodExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRequest = { url: '/test' };
    mockResponse = { status: mockStatus };
  });

  it('should format ZodError with 400 status', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['name'],
        message: 'Required',
      },
    ]);
    const host = {
      switchToHttp: () => ({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    };

    filter.catch(zodError, host as any);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Required',
      data: {
        error: 'Validation Error',
        path: '/test',
        timestamp: expect.any(String),
      },
    });
  });

  it('should join multiple Zod issues', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['name'],
        message: 'Name is required',
      },
      {
        code: 'invalid_type',
        expected: 'number',
        path: ['age'],
        message: 'Age is required',
      },
    ]);
    const host = {
      switchToHttp: () => ({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    };

    filter.catch(zodError, host as any);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Name is required, Age is required',
      }),
    );
  });
});
