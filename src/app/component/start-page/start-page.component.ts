import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RoleWithPermissions } from '../../modals/roles';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.css']
})
export class StartPageComponent implements OnInit {
  isLoggedIn:boolean = false;
  role:RoleWithPermissions |null = null;
  constructor(private router: Router,private auth:AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    if(this.isLoggedIn == true){
      this.role = this.auth.getRole();
      
    }
  }
navigateToGuest() {
  this.router.navigate(['/landing-page']);
}
navigateToLogin(){
  if(this.role == null){
    this.router.navigate(['/login']);
  }else if(this.role.roleName == 'Admin'){
    this.router.navigate(['/dashboard']);
  }else{
    this.router.navigate(['/reguserlandingpage'])
  }
  
}
}
