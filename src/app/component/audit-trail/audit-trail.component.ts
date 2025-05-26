import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuditLogService } from '../../services/audittrailservice';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { PrettyJsonPipe } from '../../pipes/pretty-json.pipe';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule, NgxPaginationModule, FormsModule, PrettyJsonPipe],
  templateUrl: './audit-trail.component.html',
  styleUrl: './audit-trail.component.css'
})
export class AuditTrailComponent implements OnInit {
  auditLogs: any[] = [];
  filteredLogs: any[] = [];
  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: string = 'asc';

  page: number = 1;
  itemsPerPage: number = 7;
  selectedBeforeChange: any;
  selectedAfterChange: any;

  constructor(private auditTrailService: AuditLogService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.loadAuditLogs();
  }
  roleMap: { [key: number]: string } = {
    1: 'User',
    2: 'Admin',
    3: 'Supplier'
  };
  sortAuditLogs(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredLogs.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (valueA == null) return 1;
      if (valueB == null) return -1;

      const result = valueA.toString().localeCompare(valueB.toString(), undefined, { numeric: true });
      return this.sortDirection === 'asc' ? result : -result;
    });
  }
  loadAuditLogs(): void {
    this.auditTrailService.getAllAuditLogs().subscribe({
      next: (data) => {
        this.auditLogs = data;
        this.filterLogs();
      },
      error: (err) => {
        console.error('Error fetching audit logs', err);
      }
    });
  }

  filterLogs(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredLogs = this.auditLogs.filter(log =>
      Object.values(log).some(value =>
        value?.toString().toLowerCase().includes(term)
      )
    );
  }

  

  openModal(content: any, log: any): void {
    this.selectedBeforeChange = log.beforeChange;
    this.selectedAfterChange = log.afterChange;
    this.modalService.open(content, { size: 'xl', centered: true });
  }
}
