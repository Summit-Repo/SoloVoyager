import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) { }

  showSuccess(message: string, duration: number = 3000) {
    const config: MatSnackBarConfig = {
      duration: duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success']
    };

    this.snackBar.open(message, 'X', config);
  }

  showError(message: string, duration: number = 3000) {
    const config: MatSnackBarConfig = {
      duration: duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error']
    };

    this.snackBar.open(message, 'X', config);
  }


}
