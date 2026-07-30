import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import { AccessApi } from './data-access/access.api';
import { TenantMembership, TenantRole } from './data-access/access.model';
import { MembersAdminComponent } from './members-admin.component';

describe(MembersAdminComponent.name, () => {
  let fixture: ComponentFixture<MembersAdminComponent>;
  let listMembers: jasmine.Spy;
  let setMemberRole: jasmine.Spy;

  beforeEach(async () => {
    listMembers = jasmine.createSpy('listMembers').and.returnValue(
      of([
        {
          userId: '33333333-3333-3333-3333-333333333333',
          role: 'Administrator',
          permissions: [
            'access.manage',
            'attachments.read',
            'attachments.write',
          ],
          updatedAtUtc: '2026-07-30T01:00:00Z',
        },
      ]),
    );
    setMemberRole = jasmine
      .createSpy('setMemberRole')
      .and.callFake((userId: string, role: TenantRole) =>
        of({
          userId,
          role,
          permissions:
            role === 'Administrator'
              ? ['access.manage', 'attachments.read', 'attachments.write']
              : role === 'Operator'
                ? ['attachments.read', 'attachments.write']
                : ['attachments.read'],
          updatedAtUtc: '2026-07-30T02:00:00Z',
        } satisfies TenantMembership),
      );

    await TestBed.configureTestingModule({
      imports: [MembersAdminComponent],
      providers: [
        {
          provide: AccessApi,
          useValue: { listMembers, setMemberRole },
        },
      ],
    }).compileComponents();
  });

  it('renders roles and permissions for tenant members', () => {
    fixture = TestBed.createComponent(MembersAdminComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Usuário 33333333');
    expect(text).toContain('Você');
    expect(text).toContain('Gerenciar acessos');
    expect(listMembers).toHaveBeenCalled();
  });

  it('adds a member with the selected role', () => {
    fixture = TestBed.createComponent(MembersAdminComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.newUserId = '22222222-2222-2222-2222-222222222222';
    component.newRole = 'Operator';

    component.submitMember(new Event('submit'));

    expect(setMemberRole).toHaveBeenCalledWith(
      '22222222-2222-2222-2222-222222222222',
      'Operator',
    );
    expect(component.members?.some((member) => member.role === 'Operator'))
      .toBeTrue();
    expect(component.successMessage).toContain('operador');
  });

  it('explains when the actor cannot manage tenant access', () => {
    listMembers.and.returnValue(
      throwError(
        () =>
          new CivicOpsApiError(403, {
            title: 'Permissão insuficiente',
          }),
      ),
    );
    fixture = TestBed.createComponent(MembersAdminComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage).toContain(
      'não possui permissão',
    );
  });
});
