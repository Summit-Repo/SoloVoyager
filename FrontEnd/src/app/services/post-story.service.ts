import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class PostStoryService {
  private post_story_url = 'post/post_story';
  private fetchPost = 'post/fetch';
  private vote = 'post/vote';
  private concern = 'post/concern'
  private concerns_list = 'post/concerns'
  private post_action = 'post/post-action'
  private searchuser = 'auth/searchuser'
  private updateUser = "post/users/"
  private delete_post = "post/delete_post"

  constructor(private http: HttpClient) { }

  postStory(storyData: any, headers?: any): Observable<any> {
    const httpHeaders = headers || new HttpHeaders();
    return this.http.post(environment.baseUrl + this.post_story_url, storyData, { headers: httpHeaders });
  }

  getPosts(offset: number, place?: string, post_id?: number, headers?: any, isUserPost?: any): Observable<any> {

    const params: any = {
      offset: offset.toString()
    };

    if (place) {
      params.place = place;
    }

    if (post_id) {
      params.post_id = post_id.toString();
    }

    if (isUserPost) {
      params.isUserPost = isUserPost.toString();
    }
    return this.http.get<any>(environment.baseUrl + this.fetchPost, { headers, params });
  }

  increaseVote(post_id: number, headers?: any): Observable<any> {
    const voteData = { post_id };
    return this.http.post<any>(environment.baseUrl + this.vote, voteData, { headers });
  }

  postConcern(postId: number, concernText: string, headers?: any): Observable<any> {
    const body = {
      post_id: postId,
      concern_text: concernText
    };

    return this.http.post<any>(environment.baseUrl + this.concern, body, { headers });
  }


  getUnresolvedConcerns(headers?: any): Observable<any> {
    return this.http.get<any>(environment.baseUrl + this.concerns_list, { headers });
  }


  actionOnPost(user_id?: any, post_id?: any, concern_id?: any, headers?: any): Observable<any> {
    const body = { 'user_id': user_id, 'post_id': post_id, 'concern_id': concern_id };

    return this.http.post<any>(environment.baseUrl + this.post_action, body, { headers });
  }

  searchUsersByUsername(username: any, headers: any): Observable<any> {

    const params = new HttpParams().set('username', username);

    return this.http.get<any>(environment.baseUrl + this.searchuser, { headers, params });
  }

  updateUserStatus(user_id: number, is_active: boolean, is_admin: boolean, headers: any): Observable<any> {

    const data = {
      is_active: is_active,
      is_admin: is_admin
    };

    return this.http.put<any>(environment.baseUrl + this.updateUser + user_id, data, { headers });
  }

  deletePost(post_id: number, headers?: any): Observable<any> {
    const deletePost = { post_id };
    return this.http.post<any>(environment.baseUrl + this.delete_post, deletePost, { headers });
  }


}
