import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    
    if (!req) {
      this.logger.warn('Request object is undefined');
      return next.handle();
    }

    const { method, url, user, body, ip } = req;

    // Only log mutations (POST, PUT, PATCH, DELETE)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap((data) => {
          // Extract entity from URL (e.g., /api/admin/users -> users)
          const urlParts = url.split('?')[0].split('/');
          const entity = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || 'Unknown';
          
          let action = 'UNKNOWN';
          if (method === 'POST') action = 'CREATE';
          if (method === 'PUT' || method === 'PATCH') action = 'UPDATE';
          if (method === 'DELETE') action = 'DELETE';

          // Create audit log entry asynchronously
          this.auditLogService.create({
            userId: user?.id,
            action: `${action}_${entity.toUpperCase()}`,
            entity: entity,
            entityId: data?.id || req.params?.id,
            details: JSON.stringify({ body, response: data }),
            ipAddress: ip,
          }).catch(err => this.logger.error('Failed to create audit log', err));
        }),
      );
    }

    return next.handle();
  }
}
