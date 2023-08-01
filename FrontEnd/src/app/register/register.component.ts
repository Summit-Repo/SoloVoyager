import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SnackbarService } from '../services/snack-bar.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  username: string = "";
  password: string = "";
  repeatPassword: string = "";

  constructor(private authenticationService: AuthenticationService, private router: Router, private snackBar: SnackbarService) { }

  register(username: any, password: any, repeatPassword: any) {
    if (password !== repeatPassword) { this.snackBar.showError("Password not matched"); return; }
    this.authenticationService.register(username, password).subscribe(res => {
      this.snackBar.showSuccess('User registered successfully!')

    }
      , err => {

        this.snackBar.showError(err.error.error)
      });
  }
}
