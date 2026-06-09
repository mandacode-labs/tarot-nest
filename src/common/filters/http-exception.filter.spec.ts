import { HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRequest = { url: '/test' };
    mockResponse = { status: mockStatus };
  });

  it('should format HttpException correctly', () => {
    const exception = new HttpException('Test error', HttpStatus.NOT_FOUND);
    const host = {
      switchToHttp: () => ({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    };

    filter.catch(exception, host as any);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Test error',
      data: {
        error: 'HttpException',
        path: '/test',
        timestamp: expect.any(String),
      },
    });
  });

  it('should handle BadRequestException', () => {
    const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    const host = {
      switchToHttp: () => ({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    };

    filter.catch(exception, host as any);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Bad request',
      data: {
        error: 'HttpException',
        path: '/test',
        timestamp: expect.any(String),
      },
    });
  });
});
