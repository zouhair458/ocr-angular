import { Component } from '@angular/core';
import { OcrService } from 'src/app/services/ocr.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent {
  imagePreview: string | null = null; // Preview of the image
  fileName: string | null = null; // File name
  isAnalyzing: boolean = false; // Indicates if analysis is in progress
  analysisResult: any = null; // OCR API analysis result
  private selectedFile: File | null = null; // Selected file
  isCameraOpen: boolean = false; // Indicates if the camera is open
  videoStream: MediaStream | null = null; // Camera video stream

  constructor(private ocrService: OcrService) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.compressImage(file, (compressedFile) => {
        this.selectedFile = compressedFile;
        this.fileName = compressedFile.name;

        // Generate a preview
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(compressedFile);
      });
    }
  }

  analyzeImage(language: string): void {
    if (!this.selectedFile) {
      alert('Please select or capture an image.');
      return;
    }

    this.isAnalyzing = true;
    this.analysisResult = null;

    this.ocrService.analyzeImage(this.selectedFile, language).subscribe(
      (response) => {
        this.isAnalyzing = false;
        if (response.IsErroredOnProcessing) {
          alert(
            "Error during OCR analysis: " +
              (response.ErrorMessage || 'Not specified')
          );
          return;
        }
        this.analysisResult =
          response.ParsedResults[0]?.ParsedText || 'No text detected.';
      },
      (error) => {
        this.isAnalyzing = false;
        console.error('Error during OCR analysis:', error);
        alert('An error occurred during OCR analysis.');
      }
    );
  }

  openCamera(): void {
    this.isCameraOpen = true;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.videoStream = stream;
        const videoElement = document.querySelector('video') as HTMLVideoElement;
        videoElement.srcObject = stream;
        videoElement.play();
      })
      .catch((error) => {
        console.error('Error accessing the camera:', error);
        alert('Unable to access the camera.');
      });
  }

  captureImage(): void {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
      const maxWidth = 800; // Max width for resizing
      const maxHeight = 600; // Max height for resizing
      let width = videoElement.videoWidth;
      let height = videoElement.videoHeight;

      // Maintain aspect ratio while resizing
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(videoElement, 0, 0, width, height);

      // Compress the image and generate a file
      canvas.toBlob(
        (blob) => {
          if (blob) {
            this.compressImage(blob, (compressedFile) => {
              this.selectedFile = compressedFile;

              // Generate a preview for the compressed image
              const reader = new FileReader();
              reader.onload = () => {
                this.imagePreview = reader.result as string;
              };
              reader.readAsDataURL(compressedFile);
            });
          }
        },
        'image/jpeg',
        0.8 // Set compression quality
      );

      this.closeCamera();
    }
  }

  closeCamera(): void {
    this.isCameraOpen = false;
    if (this.videoStream) {
      const tracks = this.videoStream.getTracks();
      tracks.forEach((track) => track.stop());
      this.videoStream = null;
    }
  }

  private compressImage(file: Blob | File, callback: (compressedFile: File) => void): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800; // Max width for resizing
        const maxHeight = 600; // Max height for resizing
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while resizing
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(img, 0, 0, width, height);

          // Compress the image to JPEG format
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], 'compressed-image.jpg', {
                  type: 'image/jpeg',
                });
                callback(compressedFile);
              }
            },
            'image/jpeg',
            0.8 // Compression quality
          );
        }
      };
    };
  }
}
