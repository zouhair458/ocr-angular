import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private apiUrl = 'https://api.ocr.space/parse/image';
  private apiKey = 'K87189417088957';

  constructor(private http: HttpClient) {}

  /**
   * Envoie une image à l'API OCR.Space pour analyse avec la langue spécifiée.
   * @param file - Le fichier image à analyser.
   * @param language - La langue de l'analyse OCR (e.g., 'ara' ou 'fre').
   * @returns Observable avec le résultat de l'analyse.
   */
  analyzeImage(file: File, language: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('apikey', this.apiKey);

    const headers = new HttpHeaders({
      Accept: 'application/json',
    });

    return this.http.post(this.apiUrl, formData, { headers });
  }
}
