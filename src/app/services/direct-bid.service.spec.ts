import { TestBed } from '@angular/core/testing';

import { DirectBidService } from './direct-bid.service';

describe('DirectBidService', () => {
  let service: DirectBidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectBidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
