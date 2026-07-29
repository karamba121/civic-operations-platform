import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';
import { SidebarService } from '../../../services/sidebar.service';

interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  badge?: string;
  toggleKey?: string;
  children?: MenuItem[];
  activePages?: string[];
  new?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar-one',
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './sidebar-one.component.html',
  styleUrl: './sidebar-one.component.css'
})
export class SidebarOneComponent {
  selected = 'Dashboard';
  subSelected = '';
  page = '';

  isExpanded$;
  isMobileOpen$;

  menuGroups: MenuGroup[] = [
    {
      title: 'MENU',
      items: [
        {
          label: 'Dashboard',
          icon: 'dashboard',
          toggleKey: 'Dashboard',
          activePages: ['ecommerce', 'analytics', 'marketing', 'crm', 'stocks', 'saas', 'logistics', 'ai', 'sales'],
          children: [
            { label: 'Ecommerce', route: '#', activePages: ['ecommerce'] },
            { label: 'Analytics', route: '#', activePages: ['analytics'] },
            { label: 'Marketing', route: '#', activePages: ['marketing'] },
            {
              label: 'CRM',
              toggleKey: 'CRM',
              activePages: ['crm', 'crmProductDev', 'crmFinance', 'crmHR', 'crmSupplyChain'],
              children: [
                { label: 'Inventory Management', route: '#', activePages: ['inventoryManagement'] },
                { label: 'Product Development', route: '#', activePages: ['productDevelopment'] },
                { label: 'Finance', route: '#', activePages: ['finance'] },
                { label: 'Human Resources', route: '#', activePages: ['humanResources'] },
                { label: 'Supply Chain', route: '#', activePages: ['supplyChain'] },
              ]
            },
            { label: 'Stocks', route: '#',new :true },
            { label: 'SaaS', route: '#', activePages: ['saas'] },
            { label: 'Logistics', route: '#', activePages: ['logistics'] },
            { label: 'AI', route: '#', activePages: ['ai'] },
          ]
        },
        {
          label: 'AI Assistant',
          icon: 'ai',
          toggleKey: 'AI',
          activePages: ['textGenerator', 'imageGenerator', 'codeGenerator', 'videoGenerator'],
          children: [
            { label: 'Text Generator', route: '#', activePages: ['textGenerator'] },
            { label: 'Image Generator', route: '#', activePages: ['imageGenerator'] },
            { label: 'Code Generator', route: '#', activePages: ['codeGenerator'] },
            { label: 'Video Generator', route: '#', activePages: ['videoGenerator'] },
          ]
        },
        {
          label: 'E-commerce',
          icon: 'ecommerce',
          toggleKey: 'E-commerce',
          activePages: ['products-list', 'add-product', 'billing', 'invoices', 'single-invoice', 'create-invoice', 'transactions', 'single-transaction'],
          children: [
            { label: 'Products', route: '#', activePages: ['products-list'] },
            { label: 'Add Product', route: '#', activePages: ['add-product'] },
            { label: 'Billing', route: '#', activePages: ['billing'] },
            {
              label: 'Invoices',
              toggleKey: 'Invoices',
              activePages: ['invoices', 'single-invoice', 'create-invoice'],
              children: [
                { label: 'Invoices List', route: '#', activePages: ['invoices'] },
                { label: 'Single Invoice', route: '#', activePages: ['single-invoice'] },
                { label: 'Create Invoice', route: '#', activePages: ['create-invoice'] },
              ]
            },
            { label: 'Transactions', route: '#', activePages: ['transactions'] },
            { label: 'Single Transaction', route: '#', activePages: ['single-transaction'] },
          ]
        },
        {
          label: 'Calendar',
          icon: 'calendar',
          route: '#',
          activePages: ['calendar']
        },
        {
          label: 'User Profile',
          icon: 'profile',
          route: '#',
          activePages: ['profile']
        },
        {
          label: 'Task',
          icon: 'task',
          toggleKey: 'Task',
          activePages: ['task-list', 'task-kanban'],
          children: [
            { label: 'List', route: '#', activePages: ['task-list'] },
            { label: 'Kanban', route: '#', activePages: ['task-kanban'] },
          ]
        },
        {
          label: 'Forms',
          icon: 'forms',
          toggleKey: 'Forms',
          activePages: ['form-elements', 'form-layout'],
          children: [
            { label: 'Form Elements', route: '#', activePages: ['form-elements'] },
            { label: 'Form Layout', route: '#', activePages: ['form-layout'] },
          ]
        },
        {
          label: 'Tables',
          icon: 'tables',
          toggleKey: 'Tables',
          activePages: ['basic-tables', 'data-tables'],
          children: [
            { label: 'Basic Tables', route: '#', activePages: ['basic-tables'] },
            { label: 'Data Tables', route: '#', activePages: ['data-tables'] },
          ]
        },
        {
          label: 'Pages',
          icon: 'pages',
          toggleKey: 'Pages',
          activePages: ['file-manager', 'pricing-tables', 'blank', 'error-404', 'error-500', 'error-503', 'success', 'faq', 'coming-soon', 'maintenance'],
          children: [
            { label: 'File Manager', route: '#', activePages: ['file-manager'] },
            { label: 'Pricing Tables', route: '#', activePages: ['pricing-tables'] },
            { label: 'FAQ', route: '#', activePages: ['faq'] },
            { label: 'API Keys', route: '#' },
            { label: 'Integrations', route: '#' },
            { label: 'Blank Page', route: '#', activePages: ['blank'] },
            {
              label: 'Error Pages',
              toggleKey: 'ErrorPages',
              activePages: ['error-404', 'error-500', 'error-503'],
              children: [
                { label: '404 Error', route: '#', activePages: ['error-404'] },
                { label: '500 Error', route: '#', activePages: ['error-500'] },
                { label: '503 Error', route: '#', activePages: ['error-503'] },
              ]
            },
            { label: 'Coming Soon', route: '#', activePages: ['coming-soon'] },
            { label: 'Maintenance', route: '#', activePages: ['maintenance'] },
            { label: 'Success', route: '#', activePages: ['success'] },
          ]
        }
      ]
    }
  ];

  constructor(private sidebarService: SidebarService, private router: Router) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.page = event.urlAfterRedirects.split('/').pop() || '';
    });
    
    this.page = this.router.url.split('/').pop() || '';
  }

  onToggleItem(event: Event, key?: string): void {
    if (key) {
      event.preventDefault();
      this.toggleSelected(key);
    }
  }

  onToggleSubItem(event: Event, key?: string): void {
    if (key) {
      event.preventDefault();
      this.toggleSubSelected(key);
    }
  }

  toggleSelected(menu: string) {
    this.selected = this.selected === menu ? '' : menu;
  }

  toggleSubSelected(submenu: string) {
    this.subSelected = this.subSelected === submenu ? '' : submenu;
  }

  closeMobileMenu() {
    this.sidebarService.setMobileOpen(false);
  }

  isActive(pageName: string) {
    return this.page === pageName;
  }

  isGroupActive(activePages?: string[]) {
    if (!activePages) return false;
    return activePages.some(page => this.isActive(page));
  }
}
