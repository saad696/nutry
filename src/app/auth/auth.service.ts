import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { User } from './user.model';

export interface AuthResponseData {
  user: {
    email: string;
    name: string;
    userFBId: string;
    age: number;
    height: number;
    weight: number;
    activity: number;
    gender: string;
    macros: {
      tdee: number;
      protein: number;
      carbs: number;
      fats: number;
      toGain: number;
      toLoss: number;
    };
    FBTokenExpiresIn: string;
    FBTokenId: string;
  };
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //@ts-ignore
  user = new BehaviorSubject<User>(null);
  token: string;
  private tokenTimer: any;

  constructor(private http: HttpClient) {}

  onRegister(
    name: string,
    age: number,
    email: string,
    password: string,
    height: number,
    weight: number,
    activity: number,
    gender: string
  ) {
    return this.http
      .put('http://localhost:8080/auth/signup', {
        email,
        name,
        password,
        age,
        height,
        weight,
        activity,
        gender,
      })
      .pipe(catchError(this.handleError));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>('http://localhost:8080/auth/login', {
        email,
        password,
      })
      .pipe(
        catchError(this.handleError),
        tap((data) => {
          this.handleAuth(
            data.user.email,
            data.user.userFBId,
            data.user.FBTokenId,
            data.user.FBTokenExpiresIn
          );
        })
      );
  }

  logout() {
    //@ts-ignore
    this.user.next(null);
    localStorage.removeItem('user');
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
    this.tokenTimer = null;
  }

  autoLogin() {
    const userData: {
      email: string;
      userFBId: string;
      FBTokenId: string;
      FBTokenExpiresIn: string;
      //@ts-ignore
    } = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      return;
    }
    console.log(userData, 'insdie autoLogin 1');
    const loadedUser = new User(
      userData.email,
      userData.userFBId,
      userData.FBTokenId,
      new Date(userData.FBTokenExpiresIn)
    );
    console.log(loadedUser, 'insdie autoLogin 2');

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const duration =
        new Date(userData.FBTokenExpiresIn).getTime() - new Date().getTime();
      this.autoLogout(duration);
    }
  }

  resetPassword(email: string) {
    return this.http
      .post('http://localhost:8080/auth/reset-password', { email })
      .pipe(catchError(this.handleError));
  }

  autoLogout(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private handleAuth(
    email: string,
    userId: string,
    token: string,
    tokenExpiry: any
  ) {
    const expirationDate = new Date(new Date().getTime() + +tokenExpiry * 1000);
    const user = new User(email, userId, token, expirationDate);
    console.log(user, '------------------------');
    this.user.next(user);
    this.autoLogout(tokenExpiry * 1000);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMsg = 'Ooops something went wrong';
    if (!error.error || !error.error.message) {
      return throwError(() => errorMsg);
    }
    switch (error.error.message) {
      case 'EMAIL_EXISTS':
        errorMsg = 'User with this email already exists!';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMsg = 'Too many attempts please trye again later!';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMsg = 'Invalid email!';
        break;
      case 'INVALID_PASSWORD':
        errorMsg = 'Invalid password!';
        break;
      case 'INVALID_EMAIL':
        errorMsg = 'Invalid email!';
        break;
      default:
        errorMsg = 'Ooops something went wrong';
    }
    console.log(errorMsg);
    return throwError(() => errorMsg);
  }
}
