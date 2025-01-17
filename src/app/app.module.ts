import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'; // Ajouter HttpClientModule
import { FormsModule } from '@angular/forms';
import { KeycloakService } from './keycloak/keycloak.service';


import { AppComponent } from './app.component';
import { UploadComponent } from './components/upload/upload.component';
import { HttpTokenInterceptor } from './auth/auth.interceptor';


export function kcFactory(kcService: KeycloakService) {
  return () => kcService.init();
}

@NgModule({
  declarations: [AppComponent, UploadComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule], // Importer HttpClientModule
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpTokenInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      deps: [KeycloakService],
      useFactory: kcFactory,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
