import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  isModeRegister = true;
  isModeResetPassword = false;
  isLoading = false;
  showAlert = false;
  alert = {
    type: 0,
    duration: 0,
    msg: '',
  };
  authForm: FormGroup;
  resetPasswordForm: FormGroup;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      age: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.email, Validators.required]),
      password: new FormControl(null, [Validators.required]),
      height: new FormControl(null, [Validators.required]),
      weight: new FormControl(null, [Validators.required]),
      activity: new FormControl(null, [Validators.required]),
      gender: new FormControl(null, [Validators.required]),
    });

    this.resetPasswordForm = new FormGroup({
      email: new FormControl(null, [Validators.email, Validators.required]),
    });
  }

  onFormSubmit() {
    this.isLoading = true;
    if (!this.authForm.valid && this.isModeRegister) {
      return;
    }
    // let authObs: Observable<AuthResponseData>;

    if (this.isModeRegister) {
      const { name, age, email, password, height, weight, activity, gender } =
        this.authForm.value;
      this.authService
        .onRegister(name, age, email, password, height, weight, activity, gender)
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            this.setAlert('Registered successfully', 2);
            this.switchMode();
          },
          error: (err) => {
            this.handleError(err);
          },
        });
    }
    if (!this.isModeRegister) {
      const { email, password } = this.authForm.value;
      this.authService.login(email, password).subscribe({
        next: (res) => {
          console.log(res);
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.handleError(err);
        },
      });
    }
    this.authForm.reset();
  }

  onForgotPasswordSubmit() {
    console.log('test');
    this.authService
      .resetPassword(this.resetPasswordForm.value.email)
      .subscribe({
        next: (data) => {
          this.setAlert(
            'A link to reset password has been send to your email.',
            2
          );
          // setTimeout(() => {
          //   this.isModeResetPassword = false;
          //   this.resetPasswordForm.reset();
          // }, 4000);
        },
        error: (err) => {
          this.handleError(err);
        },
      });
  }

  
  setAlert(msg: string, type: number, duration?: number) {
    this.alert.msg = msg;
    this.alert.type = type;
    this.alert.duration = duration ? duration : 3500;
    
    this.showAlert = true;
  }

  handleError(err: string) {
    this.setAlert(err, 4);
    console.log(err, 'this is auth error');
    this.isLoading = false;
  }

  forgotPassword() {
    this.isModeResetPassword = !this.isModeResetPassword;
    this.resetPasswordForm.reset();
  }

  switchMode() {
    this.isModeRegister = !this.isModeRegister;
    this.authForm.reset();
  }
}
