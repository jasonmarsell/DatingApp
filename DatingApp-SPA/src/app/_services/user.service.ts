import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/pagination';
import { map } from 'rxjs/operators';
import { Message } from '../_models/message';

@Injectable({
  providedIn: 'root'
})
  
export class UserService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }
  
  getUsers(page?: number, itemsPerPage?: number, userParams?: any, likesParam?: any): Observable<PaginatedResult<User[]>> {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();

    // This is query string parameter that we are going to append when we 
    // call the the UsersController.GetUsers([FromQuery]UserParams userParams) endpoint
    let params = new HttpParams();
    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page.toString());
      params = params.append('pageSize', itemsPerPage.toString());
    }

    // These are the same fields we have created in the DatingApp.API.Helpers.UserParams
    // class which is the parameter type in the UsersController.GetUsers([FromQuery]UserParams userParams)
    // endpoint.  The UserParams class uses its default value PageNumber = 1 and
    // PageSize = 10 if 'page' and 'itemsPerPage' are null    
    if (userParams != null) {
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }

    if (likesParam === 'Likers') {
      params = params.append('likers', 'true');
    }

    if (likesParam === 'Likees') {
      params = params.append('likees', 'true');
    }

    return this.http.get<User[]>(this.baseUrl + 'users', {observe: 'response', params}).pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') != null) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })
    );
  }

  getUser(id): Observable<User> {
    return this.http.get<User>(this.baseUrl + 'users/' + id);
  }

  updateUser(id: number, user: User) {
    return this.http.put(this.baseUrl + 'users/' + id, user);
  }

  setMainPhoto(userId: number, photoId: number) {
    return this.http.post(this.baseUrl + 'users/' + userId + '/photos/' + photoId + '/setMain', {});
  }

  deletePhoto(userId: number, photoId: number) {
    return this.http.delete(this.baseUrl + 'users/' + userId + '/photos/' + photoId);
  }

  sendLike(userId: number, recipientUserId: number) {
    return this.http.post(this.baseUrl + 'users/' + userId + '/like/' + recipientUserId, {});
  }

  getMessages(id: number, page?, itemsPerPage?, messageContainer?) {
    const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();

    let params = new HttpParams();

    params = params.append('MessageContainer', messageContainer);

    // These are the same fields we have created in the DatingApp.API.Helpers.UserParams
    // class which is the parameter type in the UsersController.GetUsers([FromQuery]UserParams userParams)
    // endpoint.  The UserParams class uses its default value PageNumber = 1 and
    // PageSize = 10 if 'page' and 'itemsPerPage' are null
    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    // We will now change what we are observing as part of the response
    // By specifying observe: 'response', we will now have access to the full
    // Http response and pass in the query string params.
    // Since we are not getting only the body back we need to do something
    // with the response by using .pipe which is a method that allows us access
    // to the rxjs operators.  The rxjs operator we will be using is the map operator
    // which applies a given project function to each value emitted by the source
    // Observable, and emits the resulting values as an Observable.
    return this.http.get<Message[]>(this.baseUrl + 'users/' + id + '/messages', { observe: 'response', params })
      .pipe(
        map(response => {
          // We are getting the Users[] array from the body of the response
          paginatedResult.result = response.body;
          // We are also getting the pagination information from the response headers
          // The headers returned by the UsersController.GetUsers([FromQuery]UserParams userParams)
          // contains Pagination →{"CurrentPage":1,"ItemsPerPage":10,"TotalItems":14,"TotalPages":2}
          // which is configured the DatingApp.API.Helpers.Extensions.AddPagination method
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
          }

          return paginatedResult;
        })
      );
  }

}
