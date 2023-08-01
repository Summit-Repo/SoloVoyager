import { Component } from '@angular/core';
import { PostStoryService } from '../services/post-story.service';
import { flatMap } from 'rxjs';
import { Router } from '@angular/router';
import { SnackbarService } from '../services/snack-bar.service';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})


export class UserComponent {
  post: any = {
    title: "",
    place: "",
    days: 0,
    budget: 0,
    details: {
      areas: [],
      food: [],
      activities: [],
      hotels: [],
      detail_story: ""
    },
    isConcern: false
  };


  areaInput: string = '';
  foodInput: string = '';
  activityInput: string = '';
  hotelInput: string = '';
  showCreatePostStoryForm: boolean = false;
  showMyPostStoryForm: boolean = false;
  showAllPostStoryForm: boolean = true;
  postItems: any;
  place: string = ""
  isUpvote = false;
  loggedinUser = ""
  concernText = "";
  isDeleteEnabled = false


  constructor(private postStoryService: PostStoryService, private router: Router, private snackBar: SnackbarService) { }
  headers = {}
  ngOnInit(): void {
    sessionStorage.setItem('isUserPost', 'false')
    this.getAllPostStories(1, undefined, undefined, this.generateheaders(), sessionStorage.getItem('isUserPost'))
    this.snackBar.showSuccess('Stories loaded!')
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

  getAllPostStories(offset: any, place: any, post_id: any, headers: any, isUserPost: any) {
    this.postStoryService.getPosts(offset, place, post_id, headers, isUserPost)
      .subscribe(
        (response: any) => {
          this.postItems = response.posts.map((post: any) => {
            post.complex_data = JSON.parse(post.complex_data);
            return post;
          });
          sessionStorage.setItem("next_offset", response.next_offset)
          sessionStorage.setItem("previous_offset", response.previous_offset)
          this.loggedinUser = response.username
        },
        (error: any) => {
          console.error('Error fetching posts:', error);
        }
      );
  }

  getAllPostByPlace(offset: any, place: any) {

    this.getAllPostStories(offset, place, undefined, this.generateheaders(), sessionStorage.getItem('isUserPost'))
    this.snackBar.showSuccess('Stories filtered by Place!')
  }

  addArea() {
    if (this.areaInput && !this.post.details.areas.includes(this.areaInput)) {
      this.post.details.areas.push(this.areaInput);
      this.areaInput = '';
    }
  }

  addFood() {
    if (this.foodInput && !this.post.details.food.includes(this.foodInput)) {
      this.post.details.food.push(this.foodInput);
      this.foodInput = '';
    }
  }

  addActivity() {
    if (this.activityInput && !this.post.details.activities.includes(this.activityInput)) {
      this.post.details.activities.push(this.activityInput);
      this.activityInput = '';
    }
  }

  addHotel() {
    if (this.hotelInput && !this.post.details.hotels.includes(this.hotelInput)) {
      this.post.details.hotels.push(this.hotelInput);
      this.hotelInput = '';
    }
  }

  submitPost() {
    if (this.post.title == "" || this.post.place == "" || this.post.days == 0 || this.post.budget == 0 || this.post.details.detail_story == "") { this.snackBar.showError("Title, Place, Days, Budget, Detail story are mandatory!"); return; }
    this.postStoryService.postStory(this.post, this.generateheaders()).subscribe(
      (response) => {
        this.clearForm()
        this.snackBar.showSuccess('Story posted successfully!')
      },
      (error) => {
        this.snackBar.showError('Story posting failed!')
        console.error('API Error:', error);
      }
    );
  }

  clearForm() {
    this.post = {
      title: "",
      place: "",
      days: 0,
      budget: 0,
      details: {
        areas: [],
        food: [],
        activities: [],
        hotels: [],
        detail_story: ""
      },
      isConcern: false
    };
  }


  showCreatePostStory() {
    this.place = ""
    this.showCreatePostStoryForm = true;
    this.showAllPostStoryForm = false;
  }

  showMyPostStory() {
    this.showCreatePostStoryForm = false;
    this.showAllPostStoryForm = true;
    this.place = ""
    this.isDeleteEnabled = true
    sessionStorage.setItem('isUserPost', 'true')
    this.getAllPostStories(1, undefined, undefined, this.generateheaders(), sessionStorage.getItem('isUserPost'))
    this.snackBar.showSuccess('My Stories loaded!')
  }

  showAllPostStory() {
    this.showAllPostStoryForm = true;
    this.showCreatePostStoryForm = false;
    this.place = ""
    this.isDeleteEnabled = false
    sessionStorage.setItem('isUserPost', 'false')
    this.getAllPostStories(1, undefined, undefined, this.generateheaders(), sessionStorage.getItem('isUserPost'))
    this.snackBar.showSuccess('Stories loaded!')
  }

  ClearSearchFilter() {
    this.place = ""
    this.getAllPostStories(1, undefined, undefined, this.generateheaders(), sessionStorage.getItem('isUserPost'))
    this.snackBar.showSuccess('Place filter cleared!')
  }

  NextOffset() {
    if (sessionStorage.getItem("next_offset") == "0") { this.snackBar.showError("No new record found!") }
    else {
      this.getAllPostStories(sessionStorage.getItem("next_offset"), undefined, undefined, this.generateheaders(), sessionStorage.getItem('isUserPost'))
    }
  }

  PreviousOffset() {
    if (sessionStorage.getItem('previous_offset') == "-4") {
      this.snackBar.showError("No Previous record found!")
    }
    else {
      this.getAllPostStories(sessionStorage.getItem("previous_offset"), undefined, undefined, this.generateheaders(), sessionStorage.getItem('isUserPost'))
    }
  }


  Logout() {
    sessionStorage.removeItem('token')
    this.router.navigate(['/login']);
  }

  upvoteClick(post_id: any, isUpvote: any) {

    const postToUpdate = this.postItems.find((post: any) => post.post_id === post_id);
    if (isUpvote == 0) {
      if (postToUpdate) {
        postToUpdate.upvote += 1
        postToUpdate.user_vote = 1
      }
    }
    else {
      if (postToUpdate) {
        postToUpdate.upvote -= 1
        postToUpdate.user_vote = 0
      }
    }
    this.postStoryService.increaseVote(post_id, this.generateheaders()).subscribe(
      (response) => {
        const voteWasIncreased = response;
        if (voteWasIncreased) {
          console.log('Vote increased successfully');
        } else {
          console.log('Vote was not increased');
        }
      }, (error) => {
        console.error('Error while increasing vote:', error);
      }
    )
  }

  raiseConcern(post_id: any) {
    const concernPost = this.postItems.find((post: any) => post.post_id === post_id);
    concernPost.isConcern = !concernPost.isConcern
  }

  submitConcern(post_id: any, concern_text: any) {
    if (concern_text == "") { this.snackBar.showError('No Text found!'); return; }
    this.postStoryService.postConcern(post_id, concern_text, this.generateheaders()).subscribe(
      (response) => {
        const textSubmitted = response;
        if (textSubmitted) {
          this.concernText = ""
          this.snackBar.showSuccess('Concern submitted successfully');
        } else {
          this.snackBar.showError('Concern was not submitted');
        }
      }, (error) => {
        console.error('Error while submitting:', error);
      }
    )
    const concernPost = this.postItems.find((post: any) => post.post_id === post_id);
    concernPost.isConcern = !concernPost.isConcern
  }

  removeArea(area: string) {
    const index = this.post.details.areas.indexOf(area);
    if (index !== -1) {
      this.post.details.areas.splice(index, 1);
    }
  }

  removeFood(food: string) {
    const index = this.post.details.food.indexOf(food);
    if (index !== -1) {
      this.post.details.food.splice(index, 1);
    }
  }

  removeActivity(activity: string) {
    const index = this.post.details.activities.indexOf(activity);
    if (index !== -1) {
      this.post.details.activities.splice(index, 1);
    }
  }

  removeHotel(hotel: string) {
    const index = this.post.details.hotels.indexOf(hotel);
    if (index !== -1) {
      this.post.details.hotels.splice(index, 1);
    }
  }

  delete_post(post_id: any) {
    const result = window.confirm('Are you sure you want to delete this post?');
    if (result) {
      this.postStoryService.deletePost(post_id, this.generateheaders()).subscribe(
        (response) => {
          sessionStorage.setItem('isUserPost', 'true')
          this.getAllPostStories(1, undefined, undefined, this.generateheaders(), sessionStorage.getItem('isUserPost'))
          this.snackBar.showSuccess('Post Deleted Successfully!')
        }, (error) => {
          this.snackBar.showError('Deleting post failed!')
          console.error('Error while submitting:', error);
        }
      )
    }



  }

}
