import { TestBed } from '@angular/core/testing';

import { CustominterceptorService } from './custominterceptor.service';

describe('CustominterceptorService', () => {
  let service: CustominterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustominterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
