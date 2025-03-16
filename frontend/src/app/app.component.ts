import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Customer Care';
  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      //hard senderId setter through url param
      const senderId = params['senderId'] || 'operator1';
      localStorage.setItem('senderId', senderId);
      console.log(`App initialized with senderId: ${senderId}`);
    });
  }
}
