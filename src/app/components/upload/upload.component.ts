import { Component } from '@angular/core';
import { OcrService } from 'src/app/services/ocr.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent {
  imagePreview: string | null = null; // Aperçu de l'image
  fileName: string | null = null; // Nom du fichier
  isAnalyzing: boolean = false; // Indique si l'analyse est en cours
  analysisResult: any = null; // Résultat brut de l'API OCR.Space

  private selectedFile: File | null = null; // Fichier sélectionné

  constructor(private ocrService: OcrService) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file; // Sauvegarde du fichier sélectionné
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  analyzeImage(): void {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner une image.');
      return;
    }

    this.isAnalyzing = true; // Démarrer l'indicateur de chargement
    this.analysisResult = null; // Réinitialiser le résultat précédent

    this.ocrService.analyzeImage(this.selectedFile).subscribe(
      (response) => {
        this.isAnalyzing = false;

        // Vérifiez si l'analyse a échoué
        if (response.IsErroredOnProcessing) {
          alert('Erreur lors de l\'analyse OCR : ' + response.ErrorMessage || 'Non spécifiée');
          return;
        }

        // Analyse réussie : sauvegarder le résultat brut
        this.analysisResult = response.ParsedResults[0]?.ParsedText || 'Aucun texte détecté.';
      },
      (error) => {
        this.isAnalyzing = false;
        console.error('Erreur lors de l\'analyse OCR :', error);
        alert('Une erreur est survenue lors de l\'analyse OCR.');
      }
    );
  }

  clearImage(): void {
    this.imagePreview = null;
    this.fileName = null;
    this.selectedFile = null;
    this.analysisResult = null;
  }
}
