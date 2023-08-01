import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { SnackbarService } from '../services/snack-bar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  username: string = "";
  password: string = "";

  constructor(private authService: AuthenticationService, private router: Router, private snackBar: SnackbarService) {

  }
  login() {

    if (this.username && this.password) {
      let userDetails = { username: this.username, password: this.password };
      this.authService.checkLogin(userDetails).subscribe(res => {
        let isAdmin = res['isAdmin'];
        if (isAdmin) {
          this.router.navigateByUrl("/admin");
        }
        else {
          this.router.navigateByUrl("/user");
        }
      }
        , err => {

          this.snackBar.showError(err.error.error)
        });
    }
    else {
      this.snackBar.showError("Please fill username and password")
    }
  }

}
