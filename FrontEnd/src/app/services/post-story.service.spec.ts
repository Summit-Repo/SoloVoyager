import { TestBed } from '@angular/core/testing';

import { PostStoryService } from './post-story.service';

describe('PostStoryService', () => {
  let service: PostStoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostStoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
