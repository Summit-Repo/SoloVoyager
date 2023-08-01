import { Component } from '@angular/core';
import { PostStoryService } from '../services/post-story.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../services/snack-bar.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  unresolvedConcerns: any[] = []
  postItems: any[] = [];
  isConcernPage: boolean = true
  isManageUsers: boolean = false
  searchUsername: any
  isback: boolean = false
  concern_id: any;
  user = { id: "", username: "", isActive: false, isAdmin: false }




  constructor(private postStoryService: PostStoryService, private router: Router, private snackBar: SnackbarService) { }

  ngOnInit(): void {
    this.fetchUnresolvedConcerns()
  }

  Logout() {
    sessionStorage.removeItem('token')
    this.router.navigate(['/login']);
  }

  generateheaders() {
    const token = sessionStorage.getItem('token');

    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    else {
      console.error('Token not found in session storage. Please log in.');
      return false
    }
  }

  fetchUnresolvedConcerns() {
    this.postStoryService.getUnresolvedConcerns(this.generateheaders()).subscribe(
      (data: any) => {
        if (data && data.concerns) {
          this.unresolvedConcerns = data.concerns;
        }
      },
      (error) => {
        console.error('Error fetching unresolved concerns:', error);
      }
    );
  }

  fetchConcernDetails(post_id: any, concern_id: any) {
    this.concern_id = concern_id
    this.postStoryService.getPosts(1, undefined, post_id, this.generateheaders(), undefined)
      .subscribe(
        (response: any) => {
          this.postItems = response.posts.map((post: any) => {
            post.complex_data = JSON.parse(post.complex_data);
            return post;
          });
        },
        (error: any) => {
          console.error('Error fetching posts:', error);
        }
      );
  }

  blockPost(post_id: any, ignore: boolean): void {
    let alert_msg = "Passed!"
    if (ignore == false) { this.concern_id = null; alert_msg = "banned!" }
    this.postStoryService.actionOnPost(undefined, post_id, this.concern_id, this.generateheaders()).subscribe(
      (response: any) => {
        if (response.success) {
          this.snackBar.showSuccess(alert_msg)
          this.fetchUnresolvedConcerns()
          this.postItems = []
        } else {
          this.snackBar.showError('Not able to block Post!')
        }
      },
      (error: any) => {
        console.error('An error occurred:', error);
      }
    );
  }

  onUsernameClick(username: any) {
    this.isManageUsers = true
    this.isConcernPage = false

    this.isback = true
    this.searchUser(username)

  }



  manageConcerns() {
    this.isManageUsers = false
    this.isConcernPage = true
    this.fetchUnresolvedConcerns()
  }

  manageUsers() {
    this.isManageUsers = true
    this.isConcernPage = false
    this.isback = false

  }

  searchUser(username: string): void {

    this.postStoryService.searchUsersByUsername(username, this.generateheaders()).subscribe(
      (response) => {
        if (response.success) {
          if (response.data && response.data.length == 0) { this.snackBar.showError('User not found'); return; }
          this.user = response.data[0]

        } else {
          console.error('Failed to retrieve user search results:', response.message);

        }
      },
      (error) => {
        console.error('An error occurred:', error);

      }
    );
  }

  updateAcountStatus(isActive: boolean) {
    this.user.isActive = isActive
    this.commonUpdateLogic()
  }

  commonUpdateLogic() {
    this.postStoryService.updateUserStatus(parseInt(this.user.id), this.user.isActive, this.user.isAdmin, this.generateheaders()).subscribe(
      (response) => {
        if (response.success) {
          this.snackBar.showSuccess('Status updated')
        }
      },
      (error) => {
        console.error('An error occurred:', error);

      }
    )
  }

  updateAcountType(isAdmin: boolean) {
    this.user.isAdmin = isAdmin
    this.commonUpdateLogic()
  }

  back() {
    this.isManageUsers = false
    this.isConcernPage = true
  }


}
