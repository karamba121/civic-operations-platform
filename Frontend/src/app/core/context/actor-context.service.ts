import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ActorContextService {
  readonly tenantId = environment.provisionalContext.tenantId;
  readonly userId = environment.provisionalContext.userId;
  readonly tenantName = environment.provisionalContext.tenantName;
  readonly userName = environment.provisionalContext.userName;
}
