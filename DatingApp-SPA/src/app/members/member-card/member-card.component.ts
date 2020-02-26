import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/_models/user';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() user: User;
  baseUrl = '/';
  
  constructor(private authService: AuthService, private userService: UserService, private alertifyService: AlertifyService) { }

  ngOnInit() {
  }

  sendLike(recipientUserId: number) {
    this.userService.sendLike(this.authService.decodedToken.nameid, recipientUserId).subscribe(data => {
      this.alertifyService.success('You have liked ' + this.user.knownAs);
    }, error => {
      this.alertifyService.error(error);
    });
  }

}
