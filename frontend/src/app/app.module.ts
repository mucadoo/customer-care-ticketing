import { importProvidersFrom, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { TicketsListComponent } from './tickets-list/tickets-list.component';
import { TicketComponent } from './ticket/ticket.component';
import { TicketsService } from './api/tickets.service';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSelectModule } from "@angular/material/select";
import { TicketNotFoundComponent } from './ticket-not-found/ticket-not-found.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BulkReplyComponent} from "./bulk-reply/bulk-reply.component";
import {JobNotificationComponent} from "./job-notification/job-notification.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatBadgeModule} from "@angular/material/badge";
import {MatMenuModule} from "@angular/material/menu";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {SharedModule} from "./shared/shared.module";
import {MatTooltipModule} from "@angular/material/tooltip";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TicketsListComponent,
    TicketComponent,
    TicketNotFoundComponent,
    BulkReplyComponent,
    JobNotificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatListModule,
    MatToolbarModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDialogModule,
    MatCheckboxModule,
    FormsModule,
    MatBadgeModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    SharedModule,
    MatTooltipModule
  ],
  providers: [
    importProvidersFrom(HttpClientModule),
    TicketsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
