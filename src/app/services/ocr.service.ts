import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private apiUrl = 'https://api.ocr.space/parse/image'; // URL de l'API OCR.Space
  private apiKey = 'K87189417088957'; // Remplacez par votre clé API OCR.Space

  constructor(private http: HttpClient) {}

  /**
   * Envoie une image à l'API OCR.Space pour analyse.
   * @param file - Le fichier image à analyser.
   * @returns Observable avec le résultat de l'analyse.
   */
  analyzeImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', 'fre'); // Définit la langue comme français
    formData.append('apikey', this.apiKey);

    const headers = new HttpHeaders({
      'Accept': 'application/json',
    });

    return this.http.post(this.apiUrl, formData, { headers });
  }
}
