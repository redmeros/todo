import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auth-callback-component',
  imports: [],
  templateUrl: './auth-callback-component.html',
  styleUrl: './auth-callback-component.scss'
})
export class AuthCallbackComponent implements OnInit, OnDestroy {

  private route: ActivatedRoute;
  private http: HttpClient

  private subs$ = new Subject<void>();

  constructor() {
    this.route = inject(ActivatedRoute);
    this.http = inject(HttpClient);
  }

  ngOnDestroy(): void {
    this.subs$.next();
    this.subs$.complete();
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        concatMap(params => {
          const code = params['code'];
          if (code) {
            return this.http.post("http://localhost:3000/api/dropbox/exchange", { code });
          }
          throw "Wrong response from dropbox"
        }),
        takeUntil(this.subs$))
      .subscribe(token => {
        const dbToken = token as DropboxToken
        localStorage.setItem("DROPBOX_ACCESS_TOKEN_DATA", JSON.stringify(dbToken));
        localStorage.setItem("DROPBOX_ACCESS_TOKEN", dbToken.access_token);
        localStorage.setItem("DROPBOX_REFRESH_TOKEN", dbToken.refresh_token);
        window.location.href = "http://localhost:4200"
      })
  }
}

export interface DropboxToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  uid: string;
  account_id: string;
}
