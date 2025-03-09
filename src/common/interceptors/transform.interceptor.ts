import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Handle pagination data if it exists
        let responseData = data;
        let meta = undefined;

        // Check if the response has pagination data
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          responseData = data.items;
          meta = data.meta;
        }

        return {
          success: true,
          data: responseData,
          meta,
        };
      }),
    );
  }
} 