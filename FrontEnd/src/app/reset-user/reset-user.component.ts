import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../services/snack-bar.service';

@Component({
  selector: 'app-reset-user',
  templateUrl: './reset-user.component.html',
  styleUrls: ['./reset-user.component.scss']
})
export class ResetUserComponent {

  username: string = "";
  password: string = "";
  newPassword: string = "";
  confirmPassword: string = "";

  constructor(private authenticationService: AuthenticationService, private router: Router, private snackBar: SnackbarService) { }

  reset(username: any, password: any, newPassword: any, confirmPassword: any) {
    if (newPassword !== confirmPassword) { this.snackBar.showError("New Password not matched"); return; }
    this.authenticationService.reset(username, password, newPassword).subscribe(res => {
      this.snackBar.showSuccess('Password reset successfully!')

    }
      , err => {

        this.snackBar.showError(err.error.error)
      });


  }
}
